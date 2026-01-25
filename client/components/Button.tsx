import React, { ReactNode } from "react";
import { StyleSheet, Pressable, ViewStyle, StyleProp, ActivityIndicator } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, SaleemColors } from "@/constants/theme";

interface ButtonProps {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  testID?: string;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
  energyThreshold: 0.001,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  onPress,
  children,
  style,
  disabled = false,
  variant = "primary",
  size = "medium",
  loading = false,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, springConfig);
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, springConfig);
    }
  };

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return SaleemColors.primary;
      case "secondary":
        return SaleemColors.accent;
      case "outline":
        return "transparent";
      case "danger":
        return SaleemColors.error;
      default:
        return SaleemColors.primary;
    }
  };

  const getTextColor = () => {
    if (variant === "outline") {
      return theme.primary;
    }
    return "#FFFFFF";
  };

  const getBorderStyle = () => {
    if (variant === "outline") {
      return {
        borderWidth: 2,
        borderColor: theme.primary,
      };
    }
    return {};
  };

  const getHeight = () => {
    switch (size) {
      case "small":
        return 40;
      case "medium":
        return Spacing.buttonHeight;
      case "large":
        return 60;
      default:
        return Spacing.buttonHeight;
    }
  };

  const getPadding = () => {
    switch (size) {
      case "small":
        return Spacing.md;
      case "medium":
        return Spacing.lg;
      case "large":
        return Spacing.xl;
      default:
        return Spacing.lg;
    }
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          paddingHorizontal: getPadding(),
          opacity: disabled ? 0.5 : 1,
        },
        getBorderStyle(),
        style,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText
          type="button"
          style={[styles.buttonText, { color: getTextColor() }]}
        >
          {children}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: {
    fontWeight: "600",
  },
});
