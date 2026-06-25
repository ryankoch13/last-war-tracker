import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";

import { colors } from "../theme/colors";

type Props = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "danger";
};

export function AppButton({
  title,
  variant = "primary",
  style,
  ...props
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...props}
    >
      <Text
        style={[styles.text, variant === "secondary" && styles.secondaryText]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  pressed: {
    opacity: 0.75,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryText: {
    color: colors.primaryDark,
  },
});
