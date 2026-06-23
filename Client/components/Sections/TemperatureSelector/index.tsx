import React, {FC} from "react";
import {Text} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export interface TemperatureSelectorProps {}

const TemperatureSelector: FC<TemperatureSelectorProps> = (props) => {

    return (<SafeAreaView>
        <Text style={{width: "100%", textAlign: "center"}}>
            Temperature Selector
        </Text>
    </SafeAreaView>);
};

export default TemperatureSelector;
