/**
 * Application-wide constants
 */

/**
 * Message status update delays (in milliseconds)
 */
export const MESSAGE_STATUS_DELAYS = {
  /** Minimum delay before marking message as delivered */
  DELIVERED_MIN: 500,
  /** Maximum additional random delay for delivered status */
  DELIVERED_RANGE: 1000,
  /** Minimum delay before marking message as read */
  READ_MIN: 1500,
  /** Maximum additional random delay for read status */
  READ_RANGE: 2000,
} as const;

/**
 * UI-related constants
 */
export const UI_CONSTANTS = {
  /** Height of each message item in pixels (for virtualization) */
  MESSAGE_ITEM_HEIGHT: 72,
  /** Scroll threshold for showing "new messages" button */
  SCROLL_THRESHOLD: 200,
  /** Sidebar width when expanded (Tailwind w-80 = 20rem = 320px) */
  SIDEBAR_WIDTH_EXPANDED: 320,
  /** Sidebar width when collapsed (Tailwind w-16 = 4rem = 64px) */
  SIDEBAR_WIDTH_COLLAPSED: 64,
  /** Breakpoint for sidebar auto-collapse (Tailwind md breakpoint) */
  SIDEBAR_BREAKPOINT: 768,
} as const;
