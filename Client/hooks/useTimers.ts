// useTimers.ts

import { api } from "../api/acClient";
import { useStatus } from "./useStatus";

export function useTimers() {
  const { status, refresh } = useStatus();

  const addTimer = async (when: number, action: string, mode?: string) => {
    await api.addTimer(when, action, mode);

    await refresh();
  };

  const deleteTimer = async (id: number) => {
    await api.deleteTimer(id);
    await refresh();
  };

  return {
    timers: status?.activeTimers ?? [],

    addTimer,
    deleteTimer,
  };
}
