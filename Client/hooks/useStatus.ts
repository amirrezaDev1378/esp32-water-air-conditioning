// useStatus.ts

import { useEffect, useState } from "react";
import { api } from "@/api/acClient";

export function useStatus() {
  const [status, setStatus] = useState<any>();
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await api.getStatus();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  };
  console.log({status});
  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, 3000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    loading,
    refresh,
  };
}
