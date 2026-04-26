import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  increment: (by = 1) => set((s) => ({ unreadCount: s.unreadCount + by })),
}));

export default useNotificationStore;
