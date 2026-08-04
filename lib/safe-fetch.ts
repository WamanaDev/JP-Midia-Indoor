// lib/safe-fetch.ts
//
// fetch() wrapper for endpoints that pull a URL supplied by the client
// (RSS proxies, etc). Blocks the classic SSRF targets: non-https schemes,
// loopback/private/link-local addresses (including the 169.254.169.254
// cloud metadata address), and redirect chains that hop into one of those
// after the initial URL passed validation.
import dns from "node:dns/promises";
import net from "node:net";

export class UnsafeUrlError extends Error {}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier-grade NAT
  if (a === 169 && b === 254) return true; // link-local + cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0 && parts[2] === 0) return true; // 192.0.0.0/24
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking range
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 (ULA)
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("::ffff:")) {
    const mapped = lower.slice("::ffff:".length);
    if (net.isIP(mapped) === 4) return isPrivateIPv4(mapped);
  }
  return false;
}

function isPrivateIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true; // not a valid IP at all — treat as unsafe
}

async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("URL inválida");
  }

  if (url.protocol !== "https:") {
    throw new UnsafeUrlError("Apenas URLs https:// são permitidas");
  }

  const hostname = url.hostname;

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new UnsafeUrlError("Endereço de rede não permitido");
    }
    return url;
  }

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new UnsafeUrlError("Endereço de rede não permitido");
  }

  let records;
  try {
    records = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("Não foi possível resolver o domínio");
  }

  if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) {
    throw new UnsafeUrlError("Endereço de rede não permitido");
  }

  return url;
}

interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
}

export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 8000,
    maxBytes = 5 * 1024 * 1024,
    maxRedirects = 3,
    ...init
  } = options;

  let currentUrl = rawUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const url = await assertSafePublicUrl(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(url, {
        ...init,
        signal: controller.signal,
        redirect: "manual",
      });
    } finally {
      clearTimeout(timeout);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) {
        throw new UnsafeUrlError("Redirecionamento sem destino");
      }
      currentUrl = new URL(location, url).toString();
      continue;
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && Number(contentLength) > maxBytes) {
      throw new UnsafeUrlError("Resposta excede o tamanho máximo permitido");
    }

    return res;
  }

  throw new UnsafeUrlError("Excedeu o número máximo de redirecionamentos");
}
