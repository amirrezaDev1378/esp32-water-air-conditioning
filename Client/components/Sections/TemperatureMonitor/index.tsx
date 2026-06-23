import React, {FC} from "react";
import {Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Button} from "react-native-paper";

export interface TemperatureMonitorProps {}

const TemperatureMonitor: FC<TemperatureMonitorProps> = (props) => {

    return (<SafeAreaView>
        <Text style={{width: "100%", textAlign: "center"}}>
            Temperature Monitor
        </Text>

    </SafeAreaView>);
};

export default TemperatureMonitor;
