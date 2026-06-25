// useController.ts

import { api } from "../api/acClient";
import { useStatus } from "./useStatus";

export function useController() {
  const { data , isLoading, refresh } = useStatus();

  const setMode = async (mode: "auto" | "manual") => {
    await api.setMode(mode);
    await refresh();
  };

  const setTargetTemp = async (temp: number) => {
    await api.setTargetTemp(temp);
    await refresh();
  };

  const togglePump = async () => {
    await api.setManual(!data?.manualPump, data?.manualFanSpeed! as 1).then(r=>r.json());

    await refresh();
  };

  const setManualFanSpeed = async (speed: 0 | 1 | 2) => {
    const res = await api.setManual(data?.manualPump!, speed).then(r=>r);
    await refresh();
  };

  return {
    data,
    isLoading,

    refresh,

    setMode,

    setTargetTemp,

    togglePump,

    setManualFanSpeed,
  };
}
