// acClient.ts

import { getIp, getToken } from "./storage";

async function request<D = any>(method: string, endpoint: string, body?: any) {
  const ip = await getIp();
  const token = await getToken();

  if (!ip) {
    throw new Error("Controller not configured");
  }

  const response = await fetch(`http://${ip}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Client-Token": token ?? "",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(err=>{
    console.error(err.message);
    console.log("response error" , err);
    throw err;
  });

  if (!response.ok) {
    console.log("respoonse not ok");
    throw new Error(`HTTP ${response.status}`);
  }
  console.log("RESPONSE OK");
  return (await response.json()) as D;
}

export interface StatusResponse {
  activeTimers: any[];
  currentTemp: any;
  fan1: boolean;
  fan2: boolean;
  fanSpeed: number;
  manualFanSpeed: number;
  manualPump: boolean;
  mode: string;
  ok: boolean;
  pump: boolean;
  pumpWarmupRemainingSec: number;
  sensorOk: boolean;
  systemOn: boolean;
  targetTemp: number;
  timeSynced: boolean;
  uptimeSec: number;
  utcNow: number;
  veryHotDelta: number;
  wifi: {
    ip: string;
    ssid: string;
  };
}

export interface HistoryResponse {
  count: number;
  items: {
    iso: string;
    temp: number;
    ts: number;
  }[];
  ok: boolean;
  sensorOk: boolean;
}



export const api = {
  getStatus: () => request<StatusResponse>("GET", "/api/v1/status"),

  setMode: (mode: "auto" | "manual") =>
    request("POST", "/api/v1/mode", { mode }),

  setTargetTemp: (temp: number) =>
    request("POST", "/api/v1/target-temp", {
      targetTemp: temp,
    }),

  setManual: (pump: boolean, fanSpeed: 0 | 1 | 2) =>
    request("POST", "/api/v1/manual", {
      pump,
      fan1: fanSpeed === 1,
      fan2: fanSpeed === 2,
    }),

  getHistory: () =>
    request<HistoryResponse>("GET", "/api/v1/history"),

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
