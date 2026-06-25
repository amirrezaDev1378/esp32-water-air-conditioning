import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ui/themed-view";
import TemperatureMonitor from "@/components/Sections/TemperatureMonitor";
import Modes from "@/components/Sections/Modes";
import ControlButtons from "@/components/Sections/ControlButtons";
import TemperatureSelector from "@/components/Sections/TemperatureSelector";
import useLocalStateStore from "@/stores/localStateStore";
import { useStatus } from "@/hooks/useStatus";

export default function HomeScreen() {
  const mode = useLocalStateStore((s) => s.mode);
  const { data } = useStatus();
  return (
    <ThemedView>
      <TemperatureMonitor />
      <Modes />
      {mode === "AUTO" && <TemperatureSelector />}
      <ControlButtons />
    </ThemedView>
  );
}

const styles = StyleSheet.create({});
