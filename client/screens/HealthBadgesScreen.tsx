import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { HealthBadgeItem } from "@/components/HealthBadge";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser, HealthBadge } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";
import { healthConditions, searchConditions } from "@/data/healthConditions";

type HealthBadgesScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "HealthBadges">;
};

export default function HealthBadgesScreen({ navigation }: HealthBadgesScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user, addBadge, removeBadge, updateUser } = useUser();
  
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConditions = useMemo(() => {
    if (!searchQuery.trim()) {
      return healthConditions.slice(0, 20);
    }
    return searchConditions(searchQuery);
  }, [searchQuery]);

  const isSelected = (id: string) => {
    return user.badges.some((b) => b.id === id || b.name === healthConditions.find(c => c.id === id)?.name);
  };

  const handleToggleBadge = (condition: typeof healthConditions[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const existing = user.badges.find((b) => b.name === condition.name);
    if (existing) {
      removeBadge(existing.id);
    } else {
      addBadge({
        id: condition.id,
        name: condition.name,
        nameAr: condition.nameAr,
        organ: condition.organ,
        icon: condition.icon,
      });
    }
  };

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateUser({ onboardingComplete: true });
  };

  const handleSkip = () => {
    updateUser({ onboardingComplete: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredConditions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={{ marginBottom: Spacing.sm }}>
              <HealthBadgeItem
                condition={item}
                selected={isSelected(item.id)}
                onPress={() => handleToggleBadge(item)}
              />
            </View>
          </Animated.View>
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: Spacing["3xl"],
          },
        ]}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <ThemedText type="h2" style={[styles.title, isRTL && { textAlign: "right" }]}>
              {t("healthBadges")}
            </ThemedText>
            <ThemedText 
              type="body" 
              style={[styles.subtitle, { color: theme.textSecondary }, isRTL && { textAlign: "right" }]}
            >
              {t("healthBadgesSubtitle")}
            </ThemedText>

            <View style={styles.avatarContainer}>
              <Avatar 
                height={user.height} 
                weight={user.weight} 
                badges={user.badges}
                size="medium" 
              />
            </View>

            <View 
              style={[
                styles.searchContainer, 
                { backgroundColor: theme.backgroundSecondary },
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Feather name="search" size={20} color={theme.textSecondary} />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: theme.text, textAlign: isRTL ? "right" : "left" },
                ]}
                placeholder={t("searchConditions")}
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </Pressable>
              ) : null}
            </View>

            {user.badges.length > 0 ? (
              <View style={styles.selectedContainer}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                  {t("selectedBadges")} ({user.badges.length})
                </ThemedText>
                <View style={styles.selectedBadges}>
                  {user.badges.map((badge) => (
                    <View 
                      key={badge.id}
                      style={[styles.selectedBadge, { backgroundColor: SaleemColors.accent + "20" }]}
                    >
                      <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
                        {language === "ar" ? badge.nameAr : badge.name}
                      </ThemedText>
                      <Pressable onPress={() => removeBadge(badge.id)}>
                        <Feather name="x" size={14} color={SaleemColors.accent} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </Animated.View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="award" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              {t("noBadgesSelected")}
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.buttonRow}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <ThemedText type="button" style={{ color: theme.textSecondary }}>
              {t("skip")}
            </ThemedText>
          </Pressable>
          <Button
            onPress={handleDone}
            variant="primary"
            size="medium"
            style={{ flex: 1 }}
            testID="button-done"
          >
            {t("done")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  selectedContainer: {
    marginBottom: Spacing.lg,
  },
  selectedBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  skipButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
