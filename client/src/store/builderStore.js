import { create } from 'zustand';

// Carries content from other modules (e.g. the ATS checker) into a new resume.
export const usePrefill = create((set) => ({
  prefill: null,
  setPrefill: (prefill) => set({ prefill }),
  clear: () => set({ prefill: null }),
}));
