import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  const displayName = user?.fullName || user?.nameEn || user?.email || "";
  const displayNameAr = user?.nameAr;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <Card style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.avatarCircle, { backgroundColor: SaleemColors.primary + "15" }]}>
            <Feather name="user" size={48} color={SaleemColors.primary} />
          </View>

          <ThemedText type="h2" style={styles.name}>
            {displayName}
          </ThemedText>
          {displayNameAr ? (
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {displayNameAr}
            </ThemedText>
          ) : null}

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Feather name="mail" size={18} color={SaleemColors.accent} />
              <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
                {user?.email}
              </ThemedText>
            </View>
            {user?.phone ? (
              <View style={styles.infoRow}>
                <Feather name="phone" size={18} color={SaleemColors.accent} />
                <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
                  {user.phone}
                </ThemedText>
              </View>
            ) : null}
            {user?.type === "doctor" && user.specialization ? (
              <View style={styles.infoRow}>
                <Feather name="briefcase" size={18} color={SaleemColors.accent} />
                <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
                  {user.specialization}
                </ThemedText>
              </View>
            ) : null}
            {user?.type === "doctor" && user.clinicCode ? (
              <View style={styles.infoRow}>
                <Feather name="hash" size={18} color={SaleemColors.accent} />
                <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
                  {language === "ar" ? "كود العيادة: " : "Clinic Code: "}{user.clinicCode}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <Card style={[styles.emergencyCard, { backgroundColor: SaleemColors.error + "10" }]}>
          <View style={styles.emergencyHeader}>
            <Feather name="alert-triangle" size={24} color={SaleemColors.error} />
            <ThemedText type="h3" style={{ color: SaleemColors.error, flex: 1 }}>
              {language === "ar" ? "تنبيه الطوارئ" : "Emergency Alert"}
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.text, marginTop: Spacing.sm }}>
            {language === "ar"
              ? "هذا التطبيق ليس لحالات الطوارئ الطبية.\nفي حالة الطوارئ، اتصل برقم 997 فوراً."
              : "This app is NOT for medical emergencies.\nIn an emergency, call 997 immediately."}
          </ThemedText>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Linking.openURL("tel:997").catch(() => {});
              }
            }}
            style={[styles.emergencyBtn, { backgroundColor: SaleemColors.error }]}
            testID="button-call-997"
          >
            <Feather name="phone-call" size={18} color="#FFF" />
            <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
              {language === "ar" ? "اتصل 997" : "Call 997"}
            </ThemedText>
          </Pressable>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl },
  profileCard: { padding: Spacing.xl, alignItems: "center" },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  name: { textAlign: "center", marginBottom: Spacing.sm },
  infoGrid: { width: "100%", marginTop: Spacing.lg, gap: Spacing.md },
  infoRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  emergencyCard: { padding: Spacing.xl, marginTop: Spacing.xl, borderWidth: 1, borderColor: SaleemColors.error + "30", borderRadius: BorderRadius.md },
  emergencyHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  emergencyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.sm, marginTop: Spacing.lg },
});
