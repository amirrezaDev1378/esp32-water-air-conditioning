import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  ActivityIndicator,
  Button,
  DefaultTheme as DefaultThemePaper,
  PaperProvider,
  Text,
} from "react-native-paper";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { getIp, getToken, saveToken } from "@/api/storage";

import { StyleSheet, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { Discover_Errors } from "@/api/discovery";

export const unstable_settings = {
  anchor: "(tabs)",
};
const DEFAULT_TOKEN = "@#%#@$%^&&%^_fH2S_BRCT#@#$%$#%&^$&DFDS";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [targetIp, setTargetIp] = useState("");
  const [loading, setLoading] = useState(true);
  const { discover, error, searching } = useDiscovery();
  const [controllerIp, setControllerIp] = useState<string | null>(null);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap(ip?: string) {
    setLoading(true);
    const token = await getToken();

    if (!token) {
      await saveToken(DEFAULT_TOKEN);
    }
    try {
      const savedIp = await getIp();

      if (savedIp) {
        setControllerIp(savedIp);
        return;
      }

      const controller = await discover();

      setControllerIp(controller.ip);
    } catch (error) {
      console.log(error);
      setControllerIp(null);
    } finally {
      setLoading(false);
    }
  }

  console.log({ error });

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <PaperProvider theme={DefaultThemePaper}>
          <MainRenderer
            bootstrap={bootstrap}
            controllerIp={controllerIp}
            error={error}
            loading={loading}
            setTargetIp={setTargetIp}
            targetIp={targetIp}
          />
          <StatusBar style="auto" />
      </PaperProvider>
    </ThemeProvider>
  );
}
const MainRenderer = ({
  loading,
  error,
  controllerIp,
  targetIp,
  setTargetIp,
  bootstrap,
}: {
  loading: any;
  error: any;
  controllerIp: any;
  targetIp: any;
  setTargetIp: any;
  bootstrap: any;
}) => {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Looking for controller...</Text>
      </View>
    );
  }

  if (!controllerIp || error) {
    return (
      <View style={styles.center}>
        <Text variant="headlineSmall">Controller Not Found</Text>

        <Text>
          Make sure the AC controller is powered on and connected to WiFi.
        </Text>
        {error === Discover_Errors.DEFAULT_IP_FAILED && (
          <View>
            <Text>
              Failed to discover using the default ip, try adding ip manually:
            </Text>
            <TextInput
              placeholder={"ip"}
              value={targetIp}
              onChangeText={setTargetIp}
            />
          </View>
        )}
        <Button
          onPress={() => {
            // TODO validate ip
            bootstrap(targetIp || undefined);
          }}
        >
          Retry
          {loading && "..."}
        </Button>
      </View>
    );
  }
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
});
