import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  increment: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
}));

export default useNotificationStore;
