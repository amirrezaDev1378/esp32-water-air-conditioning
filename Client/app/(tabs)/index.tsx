import { Dimensions, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ui/themed-view";
import TemperatureMonitor from "@/components/Sections/TemperatureMonitor";
import Modes from "@/components/Sections/Modes";
import ControlButtons from "@/components/Sections/ControlButtons";
import TemperatureSelector from "@/components/Sections/TemperatureSelector";
import useLocalStateStore from "@/stores/localStateStore";
import { useStatus } from "@/hooks/useStatus";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const mode = useLocalStateStore((s) => s.mode);
  const { data } = useStatus();
  return (
    <SafeAreaView>
      <ThemedView
        style={{
          height: Dimensions.get("window").height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <TemperatureMonitor />
        <Modes />
        {mode === "AUTO" && <TemperatureSelector />}
        <ControlButtons />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
