import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProcedureDTO } from "@epms/shared";

interface RecentProceduresState {
  items: ProcedureDTO[];
  remember: (procedure: ProcedureDTO) => void;
}

export const useRecentProceduresStore = create<RecentProceduresState>()(
  persist(
    (set) => ({
      items: [],
      remember: (procedure) => set((state) => ({
        items: [procedure, ...state.items.filter((item) => item._id !== procedure._id)].slice(0, 6),
      })),
    }),
    { name: "epms-recent-procedures" }
  )
);
