"use client";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface HeaderProps {
  user: boolean;
}

const navLinks = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#social-proof", label: "Resultados" },
  { href: "#pricing", label: "Preços" },
  { href: "#faq", label: "Dúvidas" },
];

export function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const el = mobileMenuRef.current;
    if (!el) return;

    if (isMenuOpen) {
      gsap.set(el, { display: "flex", height: "auto" });
      const autoHeight = el.offsetHeight;
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: autoHeight, opacity: 1, duration: 0.35, ease: "power2.out" },
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => gsap.set(el, { display: "none" }),
      });
    }
  }, [isMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 ${
        isScrolled
          ? "bg-[#05070D]/85 backdrop-blur-lg border-white/10 py-2"
          : "bg-transparent border-transparent py-4"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              width={36}
              height={36}
              src="/icons/Icons/logoquadrada2.png"
              alt="JP Mídia Indoor"
              className="w-9 h-9 rounded-lg"
            />
            <span className="text-lg font-bold text-white">
              JP Mídia Indoor
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#FACC15] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="px-5 py-2 bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
              >
                Entrar
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div
          ref={mobileMenuRef}
          className="md:hidden overflow-hidden flex-col gap-4 border-t border-white/10 mt-4"
          style={{ display: "none", height: 0, opacity: 0 }}
        >
          <div className="flex flex-col gap-4 pt-4 pb-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}

            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="px-5 py-2 text-center bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white font-semibold rounded-lg"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                onClick={() => setIsMenuOpen(false)}
                className="px-5 py-2 text-center bg-linear-to-r from-[#3B82F6] to-[#1E3A8A] text-white font-semibold rounded-lg"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
