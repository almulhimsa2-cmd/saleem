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

export default function DoctorRegisterScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  const { registerDoctor } = useAuth();

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const validatePw = (pw: string) => {
    const errs: string[] = [];
    if (pw.length < 8) errs.push(language === "ar" ? "8 أحرف على الأقل" : "At least 8 characters");
    if (!/[A-Z]/.test(pw)) errs.push(language === "ar" ? "حرف كبير واحد" : "1 uppercase letter");
    if (!/[0-9]/.test(pw)) errs.push(language === "ar" ? "رقم واحد" : "1 number");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) errs.push(language === "ar" ? "رمز خاص واحد" : "1 special character");
    setPwErrors(errs);
    return errs.length === 0;
  };

  const handleRegister = async () => {
    setError("");
    if (!nameEn.trim() || !email.trim() || !password) {
      setError(language === "ar" ? "الرجاء تعبئة جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    if (!validatePw(password)) return;
    if (password !== confirmPassword) {
      setError(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    if (!termsConsent) {
      setError(language === "ar" ? "يجب الموافقة على الشروط والأحكام" : "You must agree to Terms & Conditions");
      return;
    }
    if (!privacyConsent) {
      setError(language === "ar" ? "يجب الموافقة على سياسة الخصوصية" : "You must agree to Privacy Policy");
      return;
    }
    setLoading(true);
    const result = await registerDoctor({
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim() || undefined,
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
      specialization: specialization.trim() || "General",
      licenseNumber: licenseNumber.trim() || undefined,
    });
    setLoading(false);
    if (!result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error || "Registration failed");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("EmailVerification", { email: result.email || email.trim(), userType: "doctor" });
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0D1117", "#1A365D"] : [SaleemColors.primary, "#1A365D"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={24} color="#FFF" />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <ThemedText type="h2" style={{ color: "#FFF", textAlign: "center" }}>
            {language === "ar" ? "تسجيل حساب مختص" : "Professional Registration"}
          </ThemedText>
          <ThemedText type="small" style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: Spacing.sm }}>
            {language === "ar" ? "يتطلب التحقق من بيانات الاعتماد المهنية" : "Professional credentials verification required"}
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
              {language === "ar" ? "الاسم بالإنجليزية *" : "Name (English) *"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              placeholder="John Smith"
              placeholderTextColor={theme.textSecondary}
              value={nameEn}
              onChangeText={setNameEn}
              testID="input-name-en"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: "right" }]}
              placeholder="أحمد محمد"
              placeholderTextColor={theme.textSecondary}
              value={nameAr}
              onChangeText={setNameAr}
              testID="input-name-ar"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "البريد الإلكتروني *" : "Email *"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              placeholder="professional@email.com"
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
              {language === "ar" ? "التخصص" : "Specialization"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              placeholder={language === "ar" ? "استشارات عامة" : "General Consulting"}
              placeholderTextColor={theme.textSecondary}
              value={specialization}
              onChangeText={setSpecialization}
              testID="input-specialization"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "رقم الرخصة المهنية" : "Professional License Number"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              placeholder="LIC-XXXXX"
              placeholderTextColor={theme.textSecondary}
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              testID="input-license"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "رقم الهاتف" : "Phone"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              placeholder="+966 5XX XXX XXXX"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              testID="input-phone"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "كلمة المرور *" : "Password *"}
            </ThemedText>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
                placeholder="********"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={(t) => { setPassword(t); validatePw(t); }}
                secureTextEntry={!showPassword}
                testID="input-password"
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
            {pwErrors.length > 0 ? (
              <View style={styles.pwReqs}>
                {pwErrors.map((e, i) => (
                  <ThemedText key={i} type="caption" style={{ color: SaleemColors.error }}>{e}</ThemedText>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "تأكيد كلمة المرور *" : "Confirm Password *"}
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              placeholder="********"
              placeholderTextColor={theme.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              testID="input-confirm-password"
            />
          </View>

          <Pressable onPress={() => setTermsConsent(!termsConsent)} style={styles.consentRow}>
            <View style={[styles.checkbox, termsConsent && { backgroundColor: SaleemColors.accent, borderColor: SaleemColors.accent }]}>
              {termsConsent ? <Feather name="check" size={14} color="#FFF" /> : null}
            </View>
            <ThemedText type="small" style={{ flex: 1, color: theme.textSecondary }}>
              {language === "ar" ? "أوافق على الشروط والأحكام" : "I agree to Terms & Conditions"}
            </ThemedText>
          </Pressable>

          <Pressable onPress={() => setPrivacyConsent(!privacyConsent)} style={styles.consentRow}>
            <View style={[styles.checkbox, privacyConsent && { backgroundColor: SaleemColors.accent, borderColor: SaleemColors.accent }]}>
              {privacyConsent ? <Feather name="check" size={14} color="#FFF" /> : null}
            </View>
            <ThemedText type="small" style={{ flex: 1, color: theme.textSecondary }}>
              {language === "ar" ? "أوافق على سياسة الخصوصية" : "I agree to Privacy Policy"}
            </ThemedText>
          </Pressable>

          <Button onPress={handleRegister} variant="primary" size="large" loading={loading} testID="button-register" style={{ marginTop: Spacing.sm }}>
            {language === "ar" ? "تسجيل" : "Register"}
          </Button>

          <Pressable onPress={() => navigation.goBack()} style={styles.linkRow}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "لديك حساب؟" : "Already registered?"}
            </ThemedText>
            <ThemedText type="link" style={{ color: SaleemColors.accent }}>
              {language === "ar" ? " تسجيل الدخول" : " Sign In"}
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing["3xl"], paddingTop: Spacing["4xl"] },
  backBtn: { position: "absolute", top: Spacing.lg, left: 0, padding: Spacing.sm, zIndex: 10 },
  header: { alignItems: "center", marginBottom: Spacing.xl },
  form: { padding: Spacing.xl, borderRadius: BorderRadius.md },
  errorBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, backgroundColor: SaleemColors.error + "15", borderRadius: BorderRadius.xs, marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.md },
  input: { height: 52, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16, marginTop: Spacing.sm },
  passwordRow: { position: "relative" },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: "absolute", right: Spacing.md, top: Spacing.sm, height: 52, justifyContent: "center" },
  pwReqs: { marginTop: Spacing.xs, gap: 2 },
  consentRow: { flexDirection: "row", gap: Spacing.md, alignItems: "flex-start", marginTop: Spacing.sm },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: "#CCC", alignItems: "center", justifyContent: "center", marginTop: 2 },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: Spacing.xl },
});
