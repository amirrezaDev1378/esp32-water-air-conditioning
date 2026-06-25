import { Button, StyleSheet, TextInput } from "react-native";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { Fonts } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getIp, getToken, saveIp, saveToken } from "@/api/storage";
import { useRouter } from "expo-router";

export default function TabTwoScreen() {
  const [clientSecret, setClientSecret] = useState("");
  const [deviceIP, setDeviceIP] = useState("");
  const { navigate } = useRouter();

  useEffect(()=>{
    getToken().then(r=>setClientSecret(r || ""))
    getIp().then(r=>setDeviceIP(r || ""))
  },[])
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
      <TextInput
        onChangeText={setClientSecret}
        value={clientSecret}
        placeholder={"Client Secret"}
      />

      <ThemedText>Device IP:</ThemedText>
      <TextInput
        onChangeText={setDeviceIP}
        value={deviceIP}
        placeholder={"Device IP"}
      />

      <ThemedText>Admin Secret:</ThemedText>
      <TextInput placeholder={"Admin Secret"} />

      <Button
        onPress={async () => {
          if (clientSecret) {
            await saveToken(clientSecret);
          }
          if (deviceIP) {
            await saveIp(deviceIP);
          }
            navigate("/(tabs)");
        }}
        title={"Save & Reload."}
      />
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
