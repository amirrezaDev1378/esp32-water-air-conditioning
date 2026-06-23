import {StyleSheet} from "react-native";
import {ThemedView} from "@/components/ui/themed-view";
import TemperatureMonitor from "@/components/Sections/TemperatureMonitor";
import Modes from "@/components/Sections/Modes";
import ControlButtons from "@/components/Sections/ControlButtons";

export default function HomeScreen() {
    return (
        <ThemedView>
            <TemperatureMonitor/>
            <Modes />
            <ControlButtons />
        </ThemedView>
    );
}

const styles = StyleSheet.create({});
