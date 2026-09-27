import { Stack } from "expo-router";
import { ReactNode } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { colors } from "../mini-theme";

type AppScaffoldProps = {
  title: string;
  subtitle?: string;
  icon?: string;
  screenTitle?: string;
  children: ReactNode;
};

export function AppScaffold({ title, subtitle, icon = "\u{1F9F1}", screenTitle, children }: AppScaffoldProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 720 ? 48 : 20;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: "transparent" }}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
      <Stack.Screen options={{ title: screenTitle ?? title, headerShown: false }} />

      <View
        style={{
          width: "100%",
          paddingTop: width >= 720 ? 34 : 28,
          paddingBottom: width >= 720 ? 18 : 14,
          paddingHorizontal: horizontalPadding,
          backgroundColor: "transparent"
        }}
      >
        <View style={{ width: "100%", maxWidth: 1240, alignSelf: "center", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primarySoft,
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <Text selectable={false} style={{ fontSize: 22, lineHeight: 28 }}>
                {icon}
              </Text>
            </View>
            <Text selectable style={{ flex: 1, color: colors.text, fontSize: width >= 720 ? 28 : 24, lineHeight: width >= 720 ? 34 : 30, fontWeight: "700" }}>
              {title}
            </Text>
          </View>

          {subtitle ? (
            <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20, fontWeight: "500" }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View
        style={{
          width: "100%",
          maxWidth: 1240,
          alignSelf: "center",
          paddingHorizontal: horizontalPadding,
          paddingTop: width >= 720 ? 18 : 14,
          gap: 18
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
}
