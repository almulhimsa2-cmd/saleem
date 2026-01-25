import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Disclaimer } from "@/components/Disclaimer";
import { HealthBadgeItem } from "@/components/HealthBadge";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { healthConditions } from "@/data/healthConditions";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user } = useUser();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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
        <ThemedText type="h2" style={styles.welcomeText}>
          {language === "ar" ? `مرحباً، ${user.name || ""}` : `Hello, ${user.name || ""}`}
        </ThemedText>
        {user.clinicCode ? (
          <View style={[styles.clinicBadge, { backgroundColor: SaleemColors.accent + "20" }]}>
            <Feather name="check-circle" size={16} color={SaleemColors.accent} />
            <ThemedText type="small" style={{ color: SaleemColors.accent }}>
              {language === "ar" ? "متصل بالعيادة" : "Connected to Clinic"}
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.clinicBadge, { backgroundColor: SaleemColors.warning + "20" }]}>
            <Feather name="alert-circle" size={16} color={SaleemColors.warning} />
            <ThemedText type="small" style={{ color: SaleemColors.warning }}>
              {language === "ar" ? "أدخل رمز الطبيب للدردشة" : "Enter doctor code to chat"}
            </ThemedText>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Card style={styles.profileCard}>
          <View style={[styles.cardHeader, isRTL && { flexDirection: "row-reverse" }]}>
            <ThemedText type="h4">
              {language === "ar" ? "معلوماتي الصحية" : "My Health Profile"}
            </ThemedText>
            <Feather name="user" size={20} color={SaleemColors.primary} />
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {t("height")}
              </ThemedText>
              <ThemedText type="h4">
                {user.height > 0 ? `${user.height} ${t("cm")}` : "--"}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {t("weight")}
              </ThemedText>
              <ThemedText type="h4">
                {user.weight > 0 ? `${user.weight} ${t("kg")}` : "--"}
              </ThemedText>
            </View>
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <ThemedText 
          type="h4" 
          style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}
        >
          {language === "ar" ? "حالاتي الصحية" : "My Health Conditions"}
        </ThemedText>
        
        {user.badges.length > 0 ? (
          <View style={styles.badgesList}>
            {user.badges.map((badge) => (
              <HealthBadgeItem
                key={badge.id}
                condition={{
                  id: badge.id,
                  name: badge.name,
                  nameAr: badge.nameAr,
                  organ: badge.organ,
                  icon: badge.icon,
                  category: "",
                }}
                selected
                size="small"
              />
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBadges, { backgroundColor: theme.cardBackground }]}>
            <Feather name="heart" size={32} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              {language === "ar" ? "لم تُضف حالات صحية بعد" : "No health conditions added yet"}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "يمكنك إضافتها من الإعدادات" : "You can add them from Settings"}
            </ThemedText>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(500)}>
        <ThemedText 
          type="h4" 
          style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}
        >
          {language === "ar" ? "أدويتي" : "My Medications"}
        </ThemedText>
        
        {user.medications.length > 0 ? (
          <View style={styles.medicationsList}>
            {user.medications.map((med) => (
              <View 
                key={med.id}
                style={[styles.medicationItem, { backgroundColor: theme.cardBackground }]}
              >
                <Feather name="circle" size={16} color={SaleemColors.accent} />
                <ThemedText type="body">{med.name}</ThemedText>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBadges, { backgroundColor: theme.cardBackground }]}>
            <Feather name="package" size={32} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              {language === "ar" ? "لم تُضف أدوية بعد" : "No medications added yet"}
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </ScrollView>
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
  clinicBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoItem: {
    alignItems: "center",
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  badgesList: {
    gap: Spacing.sm,
  },
  emptyBadges: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  medicationsList: {
    gap: Spacing.sm,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
});
