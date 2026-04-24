import { create } from 'zustand';

const useMessageStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
}));

export default useMessageStore;
