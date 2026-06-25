import React, { FC } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, useTheme } from "react-native-paper";
import useLocalStateStore, {
  LocalStateStoreType,
} from "@/stores/localStateStore";
import { useController } from "@/hooks/useController";

export interface ModesProps {}

const Modes: FC<ModesProps> = (props) => {
  const theme = useTheme();
  const { mode, setMode:_setMode } = useLocalStateStore((store) => store);
  const onModeChange = (newMode: LocalStateStoreType["mode"]) => () => {
    _setMode(newMode);
    setMode(newMode === 'AUTO' ? 'auto' : "manual");
  };
  const {setMode} = useController();
  return (
    <View style={{ width:"100%"  }}>
      <Text style={{ width: "100%", textAlign: "center" }}>App Modes</Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          paddingInline: 24,
          gap: 16,
          justifyContent: "center",
          alignItems:"center",
          marginTop: 16,
          width: "100%",
        }}
      >
        <Button
          mode={"contained"}
          buttonColor={
            mode === "AUTO" ? theme.colors.primary : theme.colors.surfaceVariant
          }
          style={{ flex: 1 }}
          onPress={onModeChange("AUTO")}
        >
          Auto
        </Button>
        <Button
          mode={"contained"}
          buttonColor={
            mode === "MANUAL"
              ? theme.colors.primary
              : theme.colors.surfaceVariant
          }
          style={{ flex: 1 }}
          onPress={onModeChange("MANUAL")}
        >
          Manual
        </Button>
      </View>
    </View>
  );
};

export default Modes;
