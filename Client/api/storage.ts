
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  IP: "ac_ip",
  TOKEN: "ac_token",
};

export const saveIp = (ip: string) => AsyncStorage.setItem(KEYS.IP, ip);

export const getIp = () => AsyncStorage.getItem(KEYS.IP);

export const saveToken = (token: string) =>
  AsyncStorage.setItem(KEYS.TOKEN, token);

export const getToken = () => AsyncStorage.getItem(KEYS.TOKEN);
