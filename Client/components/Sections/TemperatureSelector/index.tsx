import React, {FC} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Button} from "react-native-paper";
import useLocalStateStore from "@/stores/localStateStore";

export interface TemperatureSelectorProps {}

const TemperatureSelector: FC<TemperatureSelectorProps> = (props) => {
    const {temperature, setTemperature} = useLocalStateStore(s => s);
    const changeTemperature = (operator: "decrees" | "increase") => () => {
        if (!temperature) return;
        const newTemperature = operator === "decrees" ? temperature - 1 : temperature + 1;
        setTemperature(newTemperature);
    };
    return (<SafeAreaView>
        <Text style={{width: "100%", textAlign: "center"}}>
            Temperature Selector
        </Text>
        <View style={{display: "flex", alignItems: "center", flexDirection: "row", justifyContent: "space-between"}}>
            <TouchableOpacity>

                <Button onPress={changeTemperature("decrees")}>
                    <Text style={{fontSize: 48}}>
                        -
                    </Text>
                </Button>
            </TouchableOpacity>
            <View>
                <Text style={{fontSize: 32}}>
                    {temperature} C
                </Text>
            </View>
            <TouchableOpacity>

                <Button onPress={changeTemperature("increase")}>

                    <Text style={{fontSize: 48}}>

                        +
                    </Text>
                </Button>
            </TouchableOpacity>
        </View>
    </SafeAreaView>);
};

export default TemperatureSelector;
