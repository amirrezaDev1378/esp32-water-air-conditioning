import { createStore } from "zustand";
import { useStore } from "zustand/react";

export type LocalStateStoreType = {
  mode: "MANUAL" | "AUTO";
  setMode: (mode: LocalStateStoreType["mode"]) => void;

  temperature: number | null;
  setTemperature: (temperature: LocalStateStoreType["temperature"]) => void;
  controls: {
    pump: boolean;
    fanSpeed1: boolean;
    fanSpeed2: boolean;
  };

  setControl: (
    control: keyof LocalStateStoreType["controls"],
    val: boolean,
  ) => void;
};

export const localStateStore = createStore<LocalStateStoreType>(
  (setState, getState) => ({
    mode: "MANUAL",
    setMode: (mode) => setState({ mode }),
    temperature: 26,
    setTemperature: (temperature) => setState({ temperature }),
    controls: {
      pump: false,
      fanSpeed1: false,
      fanSpeed2: false,
    },
    setControl: (key, val) => {
      const state = getState();
      setState({ ...state, controls: { ...state.controls, [key]: val } });
    },
  }),
);

const useLocalStateStore = <T>(
  selector: (store: LocalStateStoreType) => T,
): T => {
  return useStore(localStateStore, selector);
};

export default useLocalStateStore;
