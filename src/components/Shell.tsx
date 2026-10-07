"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export function Shell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-page text-fg">
      <TopBar onOpenMenu={() => setDrawerOpen(true)} />
      <div className="flex min-w-0 flex-1">
        <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}