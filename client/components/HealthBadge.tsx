import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { SaleemColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "@/contexts/LanguageContext";
import { HealthCondition } from "@/data/healthConditions";

interface HealthBadgeProps {
  condition: HealthCondition;
  selected?: boolean;
  onPress?: () => void;
  size?: "small" | "medium";
}

export function HealthBadgeItem({ 
  condition, 
  selected = false, 
  onPress,
  size = "medium",
}: HealthBadgeProps) {
  const { theme, isDark } = useTheme();
  const { language } = useLanguage();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const isSmall = size === "small";

  return (
    <Pressable 
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: selected ? SaleemColors.accent + "20" : theme.backgroundSecondary,
          borderColor: selected ? SaleemColors.accent : "transparent",
          borderWidth: selected ? 2 : 0,
          paddingVertical: isSmall ? Spacing.xs : Spacing.sm,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: selected ? SaleemColors.accent : SaleemColors.primary + "20",
            width: isSmall ? 24 : 32,
            height: isSmall ? 24 : 32,
          },
        ]}
      >
        <Feather
          name={condition.icon as any}
          size={isSmall ? 12 : 16}
          color={selected ? "#FFFFFF" : SaleemColors.primary}
        />
      </View>
      <ThemedText 
        type={isSmall ? "caption" : "small"}
        style={[
          styles.label,
          selected && { color: SaleemColors.accent, fontWeight: "600" },
        ]}
        numberOfLines={1}
      >
        {language === "ar" ? condition.nameAr : condition.name}
      </ThemedText>
      {selected ? (
        <Feather name="check" size={16} color={SaleemColors.accent} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  iconContainer: {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
  },
});
