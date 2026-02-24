import React, { useState, useRef } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
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

export default function EmailVerificationScreen({ route, navigation }: any) {
  const { email, userType } = route.params;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  const { verifyEmail, resendCode } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = async () => {
    setError("");
    if (code.length !== 6) {
      setError(language === "ar" ? "أدخل الرمز الصحيح (6 أرقام)" : "Enter the 6-digit code");
      return;
    }
    setLoading(true);
    const result = await verifyEmail(email, code);
    setLoading(false);
    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || (language === "ar" ? "رمز غير صحيح" : "Invalid code"));
      if (result.attempts_remaining !== undefined) {
        setAttemptsRemaining(result.attempts_remaining);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendSuccess(false);
    setError("");
    const result = await resendCode(email, userType);
    setResending(false);
    if (result.success) {
      setResendSuccess(true);
      setCode("");
      setAttemptsRemaining(null);
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setError(result.error || (language === "ar" ? "فشل إعادة الإرسال" : "Failed to resend"));
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : ["#F8F9FA", "#E2E8F0"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={theme.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: SaleemColors.accent + "20" }]}>
            <Feather name="mail" size={40} color={SaleemColors.accent} />
          </View>
          <ThemedText type="h2" style={{ textAlign: "center", marginTop: Spacing.lg }}>
            {language === "ar" ? "تحقق من بريدك" : "Verify Your Email"}
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
            {language === "ar"
              ? `أدخل الرمز المرسل إلى:\n${email}`
              : `Enter the code sent to:\n${email}`}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={[styles.form, { backgroundColor: theme.cardBackground }]}>
          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={SaleemColors.error} />
              <ThemedText type="small" style={{ color: SaleemColors.error, flex: 1 }}>{error}</ThemedText>
            </View>
          ) : null}

          {resendSuccess ? (
            <View style={[styles.errorBox, { backgroundColor: SaleemColors.accent + "15" }]}>
              <Feather name="check-circle" size={16} color={SaleemColors.accent} />
              <ThemedText type="small" style={{ color: SaleemColors.accent, flex: 1 }}>
                {language === "ar" ? "تم إعادة إرسال الرمز" : "Code resent successfully"}
              </ThemedText>
            </View>
          ) : null}

          {attemptsRemaining !== null && attemptsRemaining >= 0 ? (
            <ThemedText type="caption" style={{ color: SaleemColors.error, textAlign: "center", marginBottom: Spacing.sm }}>
              {language === "ar" ? `محاولات متبقية: ${attemptsRemaining}` : `Attempts remaining: ${attemptsRemaining}`}
            </ThemedText>
          ) : null}

          <TextInput
            ref={inputRef}
            style={[styles.codeInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            placeholder="000000"
            placeholderTextColor={theme.textSecondary + "60"}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            testID="input-verification-code"
          />

          <Button
            onPress={handleVerify}
            variant="primary"
            size="large"
            loading={loading}
            disabled={code.length !== 6}
            testID="button-verify"
            style={{ marginTop: Spacing.lg }}
          >
            {language === "ar" ? "تحقق" : "Verify"}
          </Button>

          <Pressable onPress={handleResend} disabled={resending} style={styles.resendRow} testID="button-resend">
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "لم تستلم الرمز؟" : "Didn't receive the code?"}
            </ThemedText>
            <ThemedText type="link" style={{ color: SaleemColors.accent, opacity: resending ? 0.5 : 1 }}>
              {resending
                ? (language === "ar" ? " جاري الإرسال..." : " Sending...")
                : (language === "ar" ? " أعد الإرسال" : " Resend")}
            </ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Spacing.xl, justifyContent: "center" },
  backBtn: { position: "absolute", top: Spacing.lg, left: 0, padding: Spacing.sm, zIndex: 10 },
  header: { alignItems: "center", marginBottom: Spacing.xl },
  iconContainer: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  form: { padding: Spacing.xl, borderRadius: BorderRadius.md },
  errorBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, backgroundColor: SaleemColors.error + "15", borderRadius: BorderRadius.xs, marginBottom: Spacing.lg },
  codeInput: { height: 64, borderRadius: BorderRadius.sm, fontSize: 32, letterSpacing: 12, fontWeight: "700" },
  resendRow: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl },
});
