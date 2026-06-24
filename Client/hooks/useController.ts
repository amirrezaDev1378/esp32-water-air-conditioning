// useController.ts

import { api } from "../api/acClient";
import { useStatus } from "./useStatus";

export function useController() {
  const { status, loading, refresh } = useStatus();

  const setMode = async (mode: "auto" | "manual") => {
    await api.setMode(mode);
    await refresh();
  };

  const setTargetTemp = async (temp: number) => {
    await api.setTargetTemp(temp);
    await refresh();
  };

  const togglePump = async () => {
    await api.setManual(!status.manualPump, status.manualFanSpeed);

    await refresh();
  };

  const setManualFanSpeed = async (speed: 0 | 1 | 2) => {
    await api.setManual(status.manualPump, speed);

    await refresh();
  };

  return {
    status,
    loading,

    refresh,

    setMode,

    setTargetTemp,

    togglePump,

    setManualFanSpeed,
  };
}
