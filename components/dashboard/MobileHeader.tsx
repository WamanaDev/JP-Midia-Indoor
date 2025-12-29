"use client";

import { Menu } from "lucide-react";

interface Props {
  onOpen: () => void;
  onToggleDesktop: () => void;
}

export function MobileHeader({ onOpen, onToggleDesktop }: Props) {
  return (
    <header
      className="
    fixed inset-x-0 top-0 h-14 p-4 border-b
    border-gray-200 dark:border-gray-900
    bg-white dark:bg-gray-800
    md:static md:h-auto
  "
    >
      {/* Mobile */}
      <button className="md:hidden cursor-pointer" onClick={onOpen}>
        <Menu />
      </button>
      {/* Desktop */}
      <button
        className="hidden md:block cursor-pointer"
        onClick={onToggleDesktop}
      >
        <Menu />
      </button>
    </header>
  );
}
