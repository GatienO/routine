import { TextInput, View } from "react-native";
import { useAppTheme } from "../../../hooks/useAppTheme";
import { radius } from "../mini-theme";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder = "Chercher une activité, un matériel" }: SearchBarProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        minHeight: 48,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 18px rgba(74, 63, 50, 0.06)"
      }}
    >
      <SearchIcon color={colors.textSecondary} />
      <TextInput
        accessibilityLabel="Recherche"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        style={{
          flex: 1,
          color: colors.text,
          fontSize: 14,
          fontWeight: "400",
          minWidth: 0
        }}
      />
    </View>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18 }}>
      <View
        style={{
          width: 11,
          height: 11,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: color,
          position: "absolute",
          top: 1,
          left: 1
        }}
      />
      <View
        style={{
          width: 8,
          height: 2,
          borderRadius: 999,
          backgroundColor: color,
          position: "absolute",
          right: 0,
          bottom: 2,
          transform: [{ rotate: "45deg" }]
        }}
      />
    </View>
  );
}
