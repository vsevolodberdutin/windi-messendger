import { useUIStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({ isSidebarOpen: true });
  });

  describe('initial state', () => {
    it('should have isSidebarOpen initialized', () => {
      const state = useUIStore.getState();

      expect(typeof state.isSidebarOpen).toBe('boolean');
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar from open to closed', () => {
      useUIStore.setState({ isSidebarOpen: true });
      const { toggleSidebar } = useUIStore.getState();

      toggleSidebar();

      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      useUIStore.setState({ isSidebarOpen: false });
      const { toggleSidebar } = useUIStore.getState();

      toggleSidebar();

      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('should toggle sidebar multiple times', () => {
      useUIStore.setState({ isSidebarOpen: true });
      const { toggleSidebar } = useUIStore.getState();

      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);

      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('setSidebarOpen', () => {
    it('should set sidebar to open', () => {
      useUIStore.setState({ isSidebarOpen: false });
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(true);

      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('should set sidebar to closed', () => {
      useUIStore.setState({ isSidebarOpen: true });
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(false);

      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should not change state when setting same value', () => {
      useUIStore.setState({ isSidebarOpen: true });
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(true);

      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });
  });
});
