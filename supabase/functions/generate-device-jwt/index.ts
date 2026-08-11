import { serve } from "https://deno.land/std/http/server.ts";

// Função auxiliar para base64url
function base64urlEncode(str: string) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Função para gerar HMAC SHA-256 usando Web Crypto
async function signHS256(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return base64urlEncode(binary);
}

// Função para gerar JWT manualmente
async function generateJWT(payload: Record<string, unknown>, secret: string) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signature = await signHS256(
    `${encodedHeader}.${encodedPayload}`,
    secret
  );
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Headers de CORS
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Authorization, Content-Type, x-client-info, apikey",
};

serve(async (req) => {
  console.log("=== Nova requisição ===", req.method, req.url);

  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    console.log("Body recebido:", body);
    const { device_id, user_id } = body;

    if (!device_id || !user_id)
      throw new Error("device_id e user_id obrigatórios");

    const secret = Deno.env.get("JWT_SECRET");
    if (!secret) throw new Error("JWT_SECRET não definido");

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 dias

    const token = await generateJWT(
      {
        sub: user_id,
        role: "authenticated",
        "https://hasura.io/jwt/claims": {
          userId: user_id,
          deviceId: device_id,
          x_allowed_roles: ["authenticated"],
          x_default_role: "authenticated",
        },
        exp,
      },
      secret
    );

    console.log(
      "JWT gerado para device_id:",
      device_id,
      "user_id:",
      user_id
    );

    return new Response(JSON.stringify({ jwt: token }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Erro na Edge Function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
