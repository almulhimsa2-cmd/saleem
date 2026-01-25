import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "Welcome">;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const { t, setLanguage, language, isRTL } = useLanguage();
  const { updateUser } = useUser();
  const [name, setName] = useState("");

  const handleLanguageSelect = (lang: "en" | "ar") => {
    setLanguage(lang);
  };

  const handleGetStarted = () => {
    if (name.trim()) {
      updateUser({ name: name.trim() });
      navigation.navigate("PDPLConsent");
    }
  };

  const handleDoctorMode = () => {
    rootNavigation.navigate("Doctor");
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : ["#F8F9FA", "#E2E8F0"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <Animated.View 
        entering={FadeInUp.delay(100).duration(600)}
        style={styles.topRow}
      >
        <View style={styles.languageSelector}>
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
        </View>
        
        <Pressable
          onPress={handleDoctorMode}
          style={[styles.doctorButton, { backgroundColor: SaleemColors.accent }]}
        >
          <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
            {language === "ar" ? "للأطباء" : "Doctors"}
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
          {language === "ar" ? "تواصل مع طبيبك بسهولة" : "Connect with your doctor easily"}
        </ThemedText>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(500).duration(600)}
        style={styles.inputContainer}
      >
        <ThemedText type="small" style={[styles.inputLabel, { color: theme.textSecondary }]}>
          {language === "ar" ? "الاسم (مطلوب)" : "Your Name (Required)"}
        </ThemedText>
        <TextInput
          style={[
            styles.nameInput,
            {
              backgroundColor: theme.cardBackground,
              color: theme.text,
              textAlign: isRTL ? "right" : "left",
            },
          ]}
          placeholder={language === "ar" ? "أدخل اسمك" : "Enter your name"}
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
        />
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(600).duration(600)}
        style={styles.buttonContainer}
      >
        <Button 
          onPress={handleGetStarted}
          variant="primary"
          size="large"
          disabled={!name.trim()}
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  languageSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  languageButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  languageText: {
    fontSize: 14,
  },
  doctorButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  heroContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: 160,
    height: 160,
    marginBottom: Spacing.lg,
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
    fontSize: 32,
    fontWeight: "700",
  },
  titleArabic: {
    fontSize: 32,
    fontWeight: "700",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    marginBottom: Spacing.sm,
  },
  nameInput: {
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: Spacing["2xl"],
  },
});
