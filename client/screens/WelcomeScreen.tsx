import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "Welcome">;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { t, setLanguage, language } = useLanguage();

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
  };

  const handleGetStarted = () => {
    navigation.navigate("PDPLConsent");
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : ["#F8F9FA", "#E2E8F0"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <Animated.View 
        entering={FadeInUp.delay(100).duration(600)}
        style={styles.languageSelector}
      >
        <Pressable
          onPress={() => handleLanguageSelect("ar")}
          style={[
            styles.languageButton,
            language === "ar" && { backgroundColor: SaleemColors.primary },
          ]}
        >
          <ThemedText
            type="button"
            style={[
              styles.languageText,
              language === "ar" && { color: "#FFFFFF" },
            ]}
          >
            العربية
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => handleLanguageSelect("en")}
          style={[
            styles.languageButton,
            language === "en" && { backgroundColor: SaleemColors.primary },
          ]}
        >
          <ThemedText
            type="button"
            style={[
              styles.languageText,
              language === "en" && { color: "#FFFFFF" },
            ]}
          >
            English
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200).duration(600)}
        style={styles.heroContainer}
      >
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/welcome-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.logoContainer}>
          <ThemedText type="h1" style={[styles.title, { color: SaleemColors.primary }]}>
            {t("appName")}
          </ThemedText>
          <ThemedText type="h1" style={[styles.titleArabic, { color: SaleemColors.accent }]}>
            سليم
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.textContainer}
      >
        <ThemedText type="h2" style={styles.welcomeText}>
          {t("welcome")}
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t("welcomeSubtitle")}
        </ThemedText>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(600).duration(600)}
        style={styles.buttonContainer}
      >
        <Button 
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          testID="button-get-started"
        >
          {t("getStarted")}
        </Button>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  languageButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  languageText: {
    fontSize: 16,
  },
  heroContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: 240,
    height: 240,
    marginBottom: Spacing.xl,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
  },
  titleArabic: {
    fontSize: 36,
    fontWeight: "700",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: Spacing["2xl"],
  },
});
