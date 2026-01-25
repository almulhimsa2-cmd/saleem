import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SaleemColors, Shadows } from "@/constants/theme";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "@/contexts/LanguageContext";
import { Instruction } from "@/data/instructions";

interface InstructionCardProps {
  instruction: Instruction;
  onComplete: () => void;
  completed?: boolean;
}

export function InstructionCard({ instruction, onComplete, completed = false }: InstructionCardProps) {
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!completed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scale.value = withSpring(0.95, {}, () => {
        scale.value = withSpring(1);
      });
      onComplete();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const title = language === "ar" ? instruction.titleAr : instruction.title;
  const description = language === "ar" ? instruction.descriptionAr : instruction.description;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.container,
          {
            backgroundColor: theme.cardBackground,
            borderColor: completed ? SaleemColors.accent : "transparent",
            borderWidth: completed ? 2 : 0,
          },
          Shadows.small,
        ]}
      >
        <View style={[styles.header, isRTL && { flexDirection: "row-reverse" }]}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: completed ? SaleemColors.accent : SaleemColors.primary + "20" },
            ]}
          >
            <Feather
              name={completed ? "check" : "clipboard"}
              size={20}
              color={completed ? "#FFFFFF" : SaleemColors.primary}
            />
          </View>
          <View style={[styles.titleContainer, isRTL && { alignItems: "flex-end" }]}>
            <ThemedText type="h4" numberOfLines={2}>
              {title}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {instruction.source}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText 
          type="body" 
          style={[styles.description, { color: theme.textSecondary }]}
          numberOfLines={3}
        >
          {description}
        </ThemedText>
        
        {!completed ? (
          <View style={[styles.footer, isRTL && { flexDirection: "row-reverse" }]}>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: SaleemColors.accent }}>
              {language === "ar" ? "اضغط للإكمال" : "Tap to complete"}
            </ThemedText>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.xs,
  },
});
