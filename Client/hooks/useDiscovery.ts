// useDiscovery.ts

import { useState } from "react";
import { saveIp } from "../api/storage";
import { Discover_Errors, discoverController } from "../api/discovery";


export function useDiscovery() {
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<Discover_Errors | null>(null);
  const discover = async (ip?: string) => {
    setSearching(true);
    setError(null);
    try {
      const controller = await discoverController(ip);
      if (controller.status === "success") {
        await saveIp(controller.ip!);
        return controller;
      }
      setError(controller.error!)
      return controller;
    } finally {
      setSearching(false);
    }
  };

  return {
    discover,
    searching,
    error,
  };
}
