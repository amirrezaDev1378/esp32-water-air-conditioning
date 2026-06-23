import React, {FC} from "react";
import {Text} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export interface ModesProps {}

const Modes: FC<ModesProps> = (props) => {

    return (<SafeAreaView>
        <Text style={{width: "100%", textAlign: "center"}}>
            Modes
        </Text>
    </SafeAreaView>);
};

export default Modes;
