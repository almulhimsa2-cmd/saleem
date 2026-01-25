import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SaleemColors } from "@/constants/theme";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProgressStreakProps {
  days: number;
}

export function ProgressStreak({ days }: ProgressStreakProps) {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const isCompleted = i < (days % 7);
    return isCompleted;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.header, isRTL && { flexDirection: "row-reverse" }]}>
        <Animated.View style={[styles.fireContainer, animatedStyle]}>
          <Feather name="zap" size={24} color={SaleemColors.accent} />
        </Animated.View>
        <View style={styles.textContainer}>
          <ThemedText type="h3" style={{ color: SaleemColors.accent }}>
            {days}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {t("days")} {t("progressStreak")}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.weekContainer}>
        {weekDays.map((completed, index) => (
          <View
            key={index}
            style={[
              styles.dayDot,
              {
                backgroundColor: completed ? SaleemColors.accent : theme.backgroundSecondary,
              },
            ]}
          >
            {completed ? (
              <Feather name="check" size={12} color="#FFFFFF" />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  fireContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: SaleemColors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
