import { Button, StyleSheet, TextInput } from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Fonts } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Settings.
        </ThemedText>
      </ThemedView>
      <ThemedText>Your client settings to use the unit.</ThemedText>

      <ThemedText>Client Secret:</ThemedText>
      <TextInput placeholder={"Client Secret"} />

      <ThemedText>Admin Secret:</ThemedText>
      <TextInput placeholder={"Admin Secret"} />

      <Button title={"Save & Reload."} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
