import React, {FC} from "react";
import {Text} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export interface TemperatureMonitorProps {}

const TemperatureMonitor: FC<TemperatureMonitorProps> = (props) => {

    return (<SafeAreaView>
        <Text style={{width: "100%", textAlign: "center"}}>
            Temperature Monitor
        </Text>
    </SafeAreaView>);
};

export default TemperatureMonitor;
