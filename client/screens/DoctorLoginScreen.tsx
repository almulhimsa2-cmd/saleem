import React, { useState } from "react";
import { View, StyleSheet, TextInput, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { DoctorStackParamList } from "@/navigation/DoctorNavigator";

type DoctorLoginScreenProps = {
  navigation: NativeStackNavigationProp<DoctorStackParamList, "DoctorLogin">;
};

export default function DoctorLoginScreen({ navigation }: DoctorLoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");

  const handleLogin = () => {
    if (name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("DoctorDashboard", { 
        doctorName: name.trim(), 
        specialty: specialty.trim() || "General" 
      });
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : [SaleemColors.primary, "#1A365D"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <Animated.View 
        entering={FadeInDown.delay(100).duration(600)}
        style={styles.header}
      >
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h1" style={styles.title}>
          {language === "ar" ? "بوابة الطبيب" : "Doctor Portal"}
        </ThemedText>
        <ThemedText type="body" style={styles.subtitle}>
          Saleem سليم
        </ThemedText>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200).duration(600)}
        style={[styles.formCard, { backgroundColor: theme.cardBackground }]}
      >
        <ThemedText type="h3" style={[styles.formTitle, { color: theme.text }]}>
          {language === "ar" ? "تسجيل الدخول" : "Sign In"}
        </ThemedText>
        
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "اسم الطبيب" : "Doctor Name"}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.backgroundSecondary, 
                color: theme.text,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={language === "ar" ? "د. أحمد" : "Dr. Smith"}
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "التخصص (اختياري)" : "Specialty (Optional)"}
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              { 
                backgroundColor: theme.backgroundSecondary, 
                color: theme.text,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
            placeholder={language === "ar" ? "طب عام" : "General Medicine"}
            placeholderTextColor={theme.textSecondary}
            value={specialty}
            onChangeText={setSpecialty}
          />
        </View>
        
        <Button
          onPress={handleLogin}
          variant="primary"
          size="large"
          disabled={!name.trim()}
          style={{ marginTop: Spacing.lg }}
        >
          {language === "ar" ? "دخول" : "Enter"}
        </Button>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  title: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xs,
  },
  formCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginTop: Spacing.sm,
  },
});
