"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Monitor,
  LayoutGrid,
  Upload,
  Tv,
  Activity,
  Moon,
  Sun,
  LogOut,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useTheme } from "next-themes";

const menuItems = [
  {
    id: "overview",
    icon: LayoutGrid,
    label: "Visão Geral",
    href: "/dashboard",
  },
  { id: "clients", icon: Users, label: "Clientes", href: "/dashboard/clients" },
  {
    id: "playlists",
    icon: Monitor,
    label: "Playlists",
    href: "/dashboard/playlists",
  },
  { id: "media", icon: Upload, label: "Mídias", href: "/dashboard/media" },
  { id: "screens", icon: Tv, label: "Telas", href: "/dashboard/screens" },
  { id: "logs", icon: Activity, label: "Logs", href: "/dashboard/logs" },
];

export function Sidebar() {
  const router = useRouter();
  const icondark = "/icons/icons/logoquadrada3.png";
  const iconwhite = "/icons/icons/logoquadrada2.png";
  const { theme, setTheme, resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
  const { signOut } = useAuth();
  const pathname = usePathname();
  const handleSignOut = async () => {
    await signOut();
    router.push("/"); // redireciona para a página de login
  };
  return (
    <aside className="w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <Image
              src={currentTheme === "light" ? iconwhite : icondark}
              alt="JP Mídia Logo"
              width={40}
              height={40}
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#111827] dark:text-white">
              JP Mídia
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const basePath = "/dashboard";

          const subPath =
            pathname === basePath ? "" : pathname.replace(`${basePath}/`, "");

          const isActive =
            item.id === "overview"
              ? subPath === ""
              : subPath.startsWith(item.id);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        >
          {resolvedTheme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
          <span className="font-medium">
            {" "}
            {theme === "light" ? "Modo Escuro" : "Modo Claro"}
          </span>
        </button>
        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
