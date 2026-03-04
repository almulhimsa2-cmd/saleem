import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";

export default function RoleSelectScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { language, setLanguage } = useLanguage();

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : ["#F8F9FA", "#E2E8F0"]}
      style={[styles.container, { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl }]}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.langRow}>
        <Pressable
          onPress={() => setLanguage("ar")}
          style={[styles.langBtn, language === "ar" && { backgroundColor: SaleemColors.primary }]}
        >
          <ThemedText type="caption" style={[language === "ar" && { color: "#FFF" }]}>
            العربية
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setLanguage("en")}
          style={[styles.langBtn, language === "en" && { backgroundColor: SaleemColors.primary }]}
        >
          <ThemedText type="caption" style={[language === "en" && { color: "#FFF" }]}>
            English
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h1" style={[styles.title, { color: SaleemColors.primary }]}>
          Saleem
        </ThemedText>
        <ThemedText type="h2" style={[styles.titleAr, { color: SaleemColors.accent }]}>
          سليم
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
          {language === "ar" ? "بوابة التواصل المهني الآمنة" : "Secure Professional Communication Portal"}
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.cardsContainer}>
        <Pressable
          onPress={() => navigation.navigate("PatientLogin")}
          style={[styles.roleCard, { backgroundColor: theme.cardBackground }]}
          testID="button-patient-role"
        >
          <View style={[styles.roleIcon, { backgroundColor: SaleemColors.accent + "20" }]}>
            <Feather name="user" size={32} color={SaleemColors.accent} />
          </View>
          <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
            {language === "ar" ? "أنا عميل" : "I'm a Client"}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.xs }}>
            {language === "ar" ? "تواصل مع المختص" : "Connect with your professional"}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("DoctorLogin")}
          style={[styles.roleCard, { backgroundColor: theme.cardBackground }]}
          testID="button-doctor-role"
        >
          <View style={[styles.roleIcon, { backgroundColor: SaleemColors.primary + "20" }]}>
            <Feather name="briefcase" size={32} color={SaleemColors.primary} />
          </View>
          <ThemedText type="h3" style={{ marginTop: Spacing.md }}>
            {language === "ar" ? "أنا مختص" : "I'm a Professional"}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.xs }}>
            {language === "ar" ? "إدارة عملائك" : "Manage your clients"}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  langRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  langBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  header: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    paddingTop: 30,
    paddingBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 36,
    lineHeight: 46,
  },
  titleAr: {
    fontSize: 32,
    marginTop: -Spacing.sm,
    lineHeight: 42,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.lg,
  },
  roleCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  roleIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
