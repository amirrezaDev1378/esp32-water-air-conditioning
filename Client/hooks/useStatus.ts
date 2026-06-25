// useStatus.ts

 import { api } from "@/api/acClient";
import useSWR from "swr";
import { localStateStore } from "@/stores/localStateStore";

export function useStatus() {

  const { data, error, isLoading, mutate } = useSWR(
    "/api/v1/status",
    api.getStatus,
    {
      refreshInterval: 1000,
      onSuccess: (data) => {
        if (!data) return;
        localStateStore.setState((prev) => ({
          ...prev,
          mode: data.mode === "auto" ? "AUTO" : "MANUAL",
          controls:{
            pump:data.pump,
            fanSpeed1:data.fan1,
            fanSpeed2:data.fan2,
          },
          temperature: data.targetTemp || prev.temperature
        }));
      },
    },
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
  };
}
