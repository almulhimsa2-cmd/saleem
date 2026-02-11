import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";

export default function PatientLoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError(language === "ar" ? "الرجاء إدخال البريد وكلمة المرور" : "Please enter email and password");
      return;
    }
    setLoading(true);
    const result = await login("patient", email.trim(), password);
    setLoading(false);
    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Login failed");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : ["#F8F9FA", "#E2E8F0"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: SaleemColors.accent + "20" }]}>
            <Feather name="user" size={40} color={SaleemColors.accent} />
          </View>
          <ThemedText type="h2" style={{ textAlign: "center", marginTop: Spacing.lg }}>
            {language === "ar" ? "تسجيل دخول المريض" : "Patient Login"}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.form, { backgroundColor: theme.cardBackground }]}>
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={SaleemColors.error} />
              <ThemedText type="small" style={{ color: SaleemColors.error, flex: 1 }}>{error}</ThemedText>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "البريد الإلكتروني" : "Email"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              placeholder={language === "ar" ? "patient@email.com" : "patient@email.com"}
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="input-email"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "كلمة المرور" : "Password"}
            </ThemedText>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
                placeholder="********"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="input-password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Button onPress={handleLogin} variant="primary" size="large" loading={loading} testID="button-login">
            {language === "ar" ? "تسجيل الدخول" : "Sign In"}
          </Button>

          <Pressable onPress={() => navigation.navigate("PatientRegister")} style={styles.linkRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}
            </ThemedText>
            <ThemedText type="link" style={{ color: SaleemColors.accent }}>
              {language === "ar" ? " إنشاء حساب" : " Sign Up"}
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing["3xl"], flexGrow: 1, justifyContent: "center" },
  backBtn: { position: "absolute", top: Spacing.lg, left: 0, padding: Spacing.sm, zIndex: 10 },
  header: { alignItems: "center", marginBottom: Spacing.xl },
  iconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  form: { padding: Spacing.xl, borderRadius: BorderRadius.md },
  errorBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, backgroundColor: SaleemColors.error + "15", borderRadius: BorderRadius.xs, marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  input: { height: 52, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16, marginTop: Spacing.sm },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: "absolute", right: Spacing.md, top: Spacing.sm, height: 52, justifyContent: "center" },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl },
});
