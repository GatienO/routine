import { Pressable, Text, ViewStyle } from "react-native";
import { colors, radius } from "../mini-theme";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style
}: PrimaryButtonProps) {
  const backgroundColor = variant === "primary"
    ? colors.primary
    : variant === "danger"
      ? "#F7E0DA"
      : colors.primarySoft;

  const color = variant === "primary"
    ? colors.primaryDark
    : variant === "danger"
      ? colors.danger
      : colors.primaryDark;

  return (
    <Pressable aria-disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          minHeight: 56,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
        paddingHorizontal: 22,
        backgroundColor,
        boxShadow: variant === "primary" ? "0 10px 22px rgba(74, 63, 50, 0.10)" : undefined,
        opacity: disabled ? 0.5 : pressed ? 0.82 : 1
      },
        style
      ]}
    >
      <Text
        selectable
        style={{
          color,
          fontSize: 17,
          fontWeight: "700"
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
