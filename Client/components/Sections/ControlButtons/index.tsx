import React, { FC, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Dialog, Portal, useTheme } from "react-native-paper";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import useLocalStateStore from "@/stores/localStateStore";

export interface ControlButtonsProps {}

const ControlButtons: FC<ControlButtonsProps> = (props) => {
  const { controls, setControl, mode , setMode } = useLocalStateStore((s) => s);
  const [changeModeConfirm, setChangeModeConfirm] = useState(false);
  const theme = useTheme();
  return (
    <SafeAreaView
      onTouchEnd={(event) => {
        if (mode === "AUTO") {
          setChangeModeConfirm(true);
          return;
        }
      }}
      style={{
        opacity: mode === "AUTO" ? 0.5 : 1,
      }}
    >
      <View
        style={{
          pointerEvents: mode === "AUTO" ? "none" : undefined,
        }}
      >
        <Text style={{ width: "100%", textAlign: "center" }}>
          ControlButtons
        </Text>
        <View
          style={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 16,
          }}
        >
          <Button
            onPress={() => setControl("pump", !controls.pump)}
            buttonColor={
              controls.pump ? theme.colors.primary : theme.colors.surfaceVariant
            }
            mode={"contained"}
          >
            <MaterialDesignIcons size={32} name={"pump"} />
          </Button>
          <Button
            onPress={() => setControl("fanSpeed1", !controls.fanSpeed1)}
            buttonColor={
              controls.fanSpeed1
                ? theme.colors.primary
                : theme.colors.surfaceVariant
            }
            mode={"contained"}
          >
            <MaterialDesignIcons size={32} name={"fan"} />
          </Button>
          <Button
            onPress={() => setControl("fanSpeed2", !controls.fanSpeed2)}
            buttonColor={
              controls.fanSpeed2
                ? theme.colors.primary
                : theme.colors.surfaceVariant
            }
            mode={"contained"}
          >
            <MaterialDesignIcons size={32} name={"fan-chevron-up"} />
          </Button>
        </View>
      </View>

      <Portal>
        <Dialog
          visible={changeModeConfirm}
          onDismiss={() => setChangeModeConfirm(false)}
        >
          <Dialog.Title>Changing Mode!</Dialog.Title>
          <Dialog.Content>
            <Text>Do you wish to change the mode from auto to manual ?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              style={{paddingInline:12}}
              buttonColor={theme.colors.secondary}
              mode={"contained"}
              onPress={() => setChangeModeConfirm(false)}
            >
              No, keep auto.
            </Button>
            <Button
              style={{paddingInline:16}}
              buttonColor={theme.colors.primary}
              mode={"contained"}
              onPress={() => {
                setChangeModeConfirm(false);
                setMode("MANUAL");
              }}
            >
              Yes
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

export default ControlButtons;
