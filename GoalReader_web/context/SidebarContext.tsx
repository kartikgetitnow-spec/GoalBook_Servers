'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DEFAULT_WIDTH = 288;
const MIN_WIDTH = 220;
const MAX_WIDTH = 460;
const COLLAPSE_THRESHOLD = 150;

interface SidebarContextType {
  width: number;
  isCollapsed: boolean;
  isDragging: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  resetWidth: () => void;
  startResizing: (e: React.MouseEvent) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = useState<number>(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Load saved sidebar width and state from localStorage
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('goalbook_sidebar_width');
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setWidth(parsed);
        }
      }

      const savedCollapsed = localStorage.getItem('goalbook_sidebar_collapsed');
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true');
      }
    } catch (e) {
      console.error('Failed to load sidebar settings:', e);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('goalbook_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const openSidebar = useCallback(() => {
    setIsCollapsed(false);
    try {
      localStorage.setItem('goalbook_sidebar_collapsed', 'false');
    } catch (e) {}
  }, []);

  const closeSidebar = useCallback(() => {
    setIsCollapsed(true);
    try {
      localStorage.setItem('goalbook_sidebar_collapsed', 'true');
    } catch (e) {}
  }, []);

  const resetWidth = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
    setIsCollapsed(false);
    try {
      localStorage.setItem('goalbook_sidebar_width', String(DEFAULT_WIDTH));
      localStorage.setItem('goalbook_sidebar_collapsed', 'false');
    } catch (e) {}
  }, []);

  const setSidebarWidth = useCallback((newWidth: number) => {
    const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    setWidth(clamped);
    try {
      localStorage.setItem('goalbook_sidebar_width', String(clamped));
    } catch (e) {}
  }, []);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        // Prevent default browser bookmark shortcut
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Drag-to-resize handlers
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = moveEvent.clientX;

      if (newWidth < COLLAPSE_THRESHOLD) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        setWidth(clamped);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Persist finalized values
      setWidth((currWidth) => {
        try {
          localStorage.setItem('goalbook_sidebar_width', String(currWidth));
        } catch (e) {}
        return currWidth;
      });
      setIsCollapsed((currCollapsed) => {
        try {
          localStorage.setItem('goalbook_sidebar_collapsed', String(currCollapsed));
        } catch (e) {}
        return currCollapsed;
      });
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        width,
        isCollapsed,
        isDragging,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        setSidebarWidth,
        resetWidth,
        startResizing,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
