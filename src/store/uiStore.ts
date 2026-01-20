import { create } from 'zustand';
import { UI_CONSTANTS } from '../constants';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

/**
 * Safely determines initial sidebar state based on window width
 * Returns true for SSR or when window width >= tablet breakpoint
 */
const getInitialSidebarState = (): boolean => {
  // SSR-safe: return default state if window is not available
  if (typeof window === 'undefined') {
    return true;
  }

  // Check if viewport is wide enough for expanded sidebar
  return window.innerWidth >= UI_CONSTANTS.SIDEBAR_BREAKPOINT;
};

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: getInitialSidebarState(),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
}));
