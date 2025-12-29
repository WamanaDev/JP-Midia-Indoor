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
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useTheme } from "next-themes";

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

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
  { id: "medias", icon: Upload, label: "Mídias", href: "/dashboard/medias" },
  { id: "screens", icon: Tv, label: "Telas", href: "/dashboard/screens" },
  { id: "logs", icon: Activity, label: "Logs", href: "/dashboard/logs" },
];

export function Sidebar({ open, collapsed, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();

  if (!resolvedTheme) {
    return null;
  }

  const icondark = "/icons/Icons/logoquadrada.png";
  const iconwhite = "/icons/Icons/logoquadrada2.png";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const basePath = "/dashboard";
  const subPath =
    pathname === basePath ? "" : pathname.replace(`${basePath}/`, "");

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-0 bg-black/50 z-40"
        />
      )}

      <aside
        className={`
    fixed z-50 h-full bg-white dark:bg-gray-800 light:bg-white border-r
    border-gray-200 dark:border-gray-800 flex flex-col
    transition-all duration-300
    ${collapsed ? "md:w-20" : "md:w-64"}
    w-64
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {resolvedTheme && (
              <Image
                src={resolvedTheme === "dark" ? icondark : iconwhite}
                alt="JP Mídia Logo"
                width={40}
                height={40}
              />
            )}
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-[#111827] dark:text-white">
                  JP Mídia
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Dashboard
                </p>
              </div>
            )}
          </div>

          {/* Close (mobile) */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-600 dark:text-gray-400"
            aria-label="Fechar menu"
          >
            <X />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.id === "overview"
                ? subPath === ""
                : subPath.startsWith(item.id);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
    ${
      isActive
        ? "bg-linear-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-lg"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
    }
  `}
              >
                <Icon className="w-5 h-5 shrink-0" />

                {!collapsed && (
                  <span className="font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* Tooltip desktop colapsado */}
                {collapsed && (
                  <span
                    className="
        absolute left-full ml-3 px-3 py-1 rounded-md text-sm
        bg-gray-900 text-white whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition
        hidden md:block z-50
      "
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {resolvedTheme && (
            <button
              onClick={() =>
                setTheme(resolvedTheme === "light" ? "dark" : "light")
              }
              className="cursor-pointer group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {resolvedTheme === "light" ? <Moon /> : <Sun />}
              {!collapsed && (
                <span className="font-medium">
                  {resolvedTheme === "light" ? "Modo Escuro" : "Modo Claro"}
                </span>
              )}
              {collapsed && (
                <span
                  className="
        absolute left-full ml-3 px-3 py-1 rounded-md text-sm
        bg-gray-900 text-white whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition
        hidden md:block
      "
                >
                  {resolvedTheme === "light" ? "Modo Escuro" : "Modo Claro"}
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="cursor-pointer group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Sair</span>}
            {collapsed && (
              <span
                className="
        absolute left-full ml-3 px-3 py-1 rounded-md text-sm
        bg-red-50 dark:bg-red-900 text-gray-800 dark:text-white whitespace-nowrap
        opacity-0 group-hover:opacity-100 transition
        hidden md:block
      "
              >
                Sair
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
