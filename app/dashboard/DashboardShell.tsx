"use client";

import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { Sidebar } from "@/components/dashboard/SideBar";
import { useState } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop

  return (
    <div className="flex h-full min-h-screen bg-gray-200 dark:bg-gray-900">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div
        className={`flex-1 flex flex-col transition-all ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <MobileHeader
          onOpen={() => setSidebarOpen(true)}
          onToggleDesktop={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="p-6 pt-20 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
