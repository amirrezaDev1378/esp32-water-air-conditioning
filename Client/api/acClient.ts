// acClient.ts

import { getIp, getToken } from "./storage";

async function request(method: string, endpoint: string, body?: any) {
  const ip = await getIp();

  if (!ip) {
    throw new Error("Controller not configured");
  }

  const token = await getToken();

  const response = await fetch(`http://${ip}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Client-Token": token ?? "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  getStatus: () => request("GET", "/api/v1/status"),

  setMode: (mode: "auto" | "manual") =>
    request("POST", "/api/v1/mode", { mode }),

  setTargetTemp: (temp: number) =>
    request("POST", "/api/v1/target-temp", {
      targetTemp: temp,
    }),

  setManual: (pump: boolean, fanSpeed: 0 | 1 | 2) =>
    request("POST", "/api/v1/manual", {
      pump,
      fanSpeed,
    }),

  getHistory: () => request("GET", "/api/v1/history"),

  addTimer: (when: number, action: string, mode?: string) =>
    request("POST", "/api/v1/timers", {
      when,
      action,
      mode,
    }),

  deleteTimer: (id: number) => request("DELETE", `/api/v1/timers/${id}`),

  syncTime: (utc: number) =>
    request("POST", "/api/v1/time", {
      utc,
    }),
};
