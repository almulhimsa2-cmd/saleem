import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Disclaimer } from "@/components/Disclaimer";
import { ProgressStreak } from "@/components/ProgressStreak";
import { InstructionCard } from "@/components/InstructionCard";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Spacing, SaleemColors } from "@/constants/theme";
import { sampleInstructions, Instruction } from "@/data/instructions";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user, markInstructionsReviewed } = useUser();
  
  const [instructions, setInstructions] = useState<Instruction[]>(sampleInstructions);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const today = new Date().toISOString().split("T")[0];
      if (user.lastActiveDate !== today) {
        setInstructions(sampleInstructions.map((i) => ({ ...i, completed: false })));
      }
    }, [user.lastActiveDate])
  );

  const handleInstructionComplete = (id: string) => {
    setInstructions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: true } : i))
    );
    const allCompleted = instructions.every((i) => i.id === id || i.completed);
    if (allCompleted) {
      markInstructionsReviewed();
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const completedCount = instructions.filter((i) => i.completed).length;
  const progress = (completedCount / instructions.length) * 100;

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={instructions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View>
          <Animated.View entering={FadeIn.duration(400)}>
            <Disclaimer />
          </Animated.View>
          
          <Animated.View 
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.avatarSection}
          >
            <Avatar
              height={user.height}
              weight={user.weight}
              badges={user.badges}
              size="large"
            />
            <ThemedText type="h3" style={styles.welcomeText}>
              {language === "ar" ? "مرحباً بك" : "Welcome back"}
            </ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Card style={styles.progressCard}>
              <View style={[styles.progressHeader, isRTL && { flexDirection: "row-reverse" }]}>
                <ThemedText type="h4">{t("activeQuest")}</ThemedText>
                <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
                  {completedCount}/{instructions.length}
                </ThemedText>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progress}%`,
                      backgroundColor: SaleemColors.accent,
                    },
                  ]} 
                />
              </View>
            </Card>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <ProgressStreak days={user.streakDays} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <ThemedText 
              type="h4" 
              style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}
            >
              {t("todayInstructions")}
            </ThemedText>
          </Animated.View>
        </View>
      }
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(500 + index * 100).duration(400)}>
          <InstructionCard
            instruction={item}
            completed={item.completed}
            onComplete={() => handleInstructionComplete(item.id)}
          />
        </Animated.View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  welcomeText: {
    marginTop: Spacing.lg,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
