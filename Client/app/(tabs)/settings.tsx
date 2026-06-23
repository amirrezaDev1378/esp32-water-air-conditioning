import {Button, StyleSheet, TextInput} from "react-native";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import {ThemedText} from "@/components/ui/themed-text";
import {ThemedView} from "@/components/ui/themed-view";
import {IconSymbol} from "@/components/ui/icon-symbol";
import {Fonts} from "@/constants/theme";

export default function TabTwoScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{light: "#D0D0D0", dark: "#353636"}}
            headerImage={
                <IconSymbol
                    size={310}
                    color="#808080"
                    name="chevron.left.forwardslash.chevron.right"
                    style={styles.headerImage}
                />
            }>
            <ThemedView style={styles.titleContainer}>
                <ThemedText
                    type="title"
                    style={{
                        fontFamily: Fonts.rounded,
                    }}>
                    Settings.
                </ThemedText>
            </ThemedView>
            <ThemedText>Your client settings to use the unit.</ThemedText>

            <ThemedText>
                Client Secret:
            </ThemedText>
            <TextInput
                placeholder={"Client Secret"}
            />

            <ThemedText>
                Admin Secret:
            </ThemedText>
            <TextInput
                placeholder={"Admin Secret"}
            />

            <Button title={'Save & Reload.'} />
        </ParallaxScrollView>
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
