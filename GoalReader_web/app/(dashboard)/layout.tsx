'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import DashboardSidebar from '@/components/DashboardSidebar';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { width, isCollapsed, isDragging } = useSidebar();

  return (
    <div
      style={{
        ['--sidebar-width' as any]: `${width}px`,
      }}
      className="min-h-screen bg-[#050b14] text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950"
    >
      {/* Desktop Dashboard Sidebar - Fixed, Resizable & Collapsible */}
      <DashboardSidebar />

      {/* Main Dashboard Area - Dynamically offsets based on sidebar width & collapse state */}
      <div
        style={{
          paddingLeft: isCollapsed ? '0px' : undefined,
          transition: isDragging
            ? 'none'
            : 'padding-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`flex flex-col min-h-screen w-full ${
          isCollapsed ? 'pl-0' : 'pl-0 lg:[padding-left:var(--sidebar-width)]'
        }`}
      >
        {/* Top Header Bar */}
        <Navbar />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}

