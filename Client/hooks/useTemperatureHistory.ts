// useTemperatureHistory.ts

import { useEffect, useState } from "react";
import { api } from "../api/acClient";

export function useTemperatureHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const result = await api.getHistory().finally(() => setLoading(false));

    setHistory(result.points);
  };

  useEffect(() => {
    load();
  }, []);

  return {
    history,
    refresh: load,
    loading,
  };
}
