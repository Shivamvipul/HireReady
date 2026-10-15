import { create } from 'zustand';
import { auth } from '../api';
import { setAuthLostHandler } from '../api/client';

export const useAuth = create((set) => ({
  user: null,
  ready: false,
  async init() {
    try { set({ user: await auth.me(), ready: true }); } catch { set({ user: null, ready: true }); }
  },
  async login(b) { const user = await auth.login(b); set({ user }); return user; },
  async register(b) { const user = await auth.register(b); set({ user }); return user; },
  async logout() { try { await auth.logout(); } finally { set({ user: null }); } },
  setUser: (user) => set({ user }),
}));

setAuthLostHandler(() => useAuth.setState({ user: null }));
