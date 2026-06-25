// useTemperatureHistory.ts

import { api } from "../api/acClient";
import useSWR from "swr";

export function useTemperatureHistory() {
  const { mutate, data, isLoading } = useSWR(
    "/api/v1/history",
    api.getHistory,
    {
      refreshInterval: 6000,
    },
  );

  return {
    mutate,
    history: data,
    isLoading,
  };
}
