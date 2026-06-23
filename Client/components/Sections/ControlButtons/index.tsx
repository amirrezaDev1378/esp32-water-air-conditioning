import React, {FC} from "react";
import {Text} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export interface ControlButtonsProps {}

const ControlButtons: FC<ControlButtonsProps> = (props) => {

    return (<SafeAreaView>
        <Text style={{width: "100%", textAlign: "center"}}>
            ControlButtons
        </Text>
    </SafeAreaView>);
};

export default ControlButtons;
