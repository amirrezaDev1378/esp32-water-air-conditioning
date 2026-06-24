// api/discovery.ts

import { getToken, saveIp } from "@/api/storage";

export enum Discover_Errors {
  DEFAULT_IP_FAILED,
  DISCOVERY_FAILED,
}
const DEFAULT_IP = "192.168.70.85";

export async function discoverController(ip?: string): Promise<{
  status: "success" | "error";
  error: Discover_Errors | null;
  ip: string | null;
}> {
  const target = ip ? ip : DEFAULT_IP;
  const token = await getToken();
  console.log({ token });
  try {
    const res = await fetch(`http://${target}/api/v1/status`, {
      headers: {
        "X-Client-Token": token!,
      },
    });
    const resJson = await res.json();

    console.log({ resText: resJson });
    if (res.ok) {
      await saveIp(target);
      return {
        status: "success",
        error: null,
        ip: target,
      };
    } else {
      throw new Error("Error while trying to fetch ip;");
    }
  } catch (e) {
    console.error(e);
    return {
      ip: null,
      error:
        target === DEFAULT_IP
          ? Discover_Errors.DEFAULT_IP_FAILED
          : Discover_Errors.DISCOVERY_FAILED,
      status: "error",
    };
  }
}
