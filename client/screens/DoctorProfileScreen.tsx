import React, { useState } from "react";
import { View, StyleSheet, TextInput, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";

export default function DoctorProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { user, updateProfile } = useAuth();

  const [bio, setBio] = useState(user?.bio || "");
  const [youtubeLink, setYoutubeLink] = useState(user?.youtubeLink || "");
  const [websiteLink, setWebsiteLink] = useState(user?.websiteLink || "");
  const [specialization, setSpecialization] = useState(user?.specialization || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      bio,
      youtubeLink: youtubeLink || null,
      websiteLink: websiteLink || null,
      specialization,
    });
    setSaving(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing["3xl"], paddingHorizontal: Spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Feather name={isRTL ? "arrow-right" : "arrow-left"} size={24} color={theme.text} />
      </Pressable>

      <View style={styles.profileHeader}>
        <View style={[styles.avatarLarge, { backgroundColor: SaleemColors.primary + "20" }]}>
          <Feather name="briefcase" size={40} color={SaleemColors.primary} />
        </View>
        <ThemedText type="h2" style={{ marginTop: Spacing.md }}>{user?.nameEn || ""}</ThemedText>
        {user?.nameAr ? <ThemedText type="h3" style={{ color: theme.textSecondary }}>{user.nameAr}</ThemedText> : null}
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>{user?.email}</ThemedText>
        {user?.verified ? (
          <View style={styles.verifiedBadge}>
            <Feather name="check-circle" size={14} color={SaleemColors.accent} />
            <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
              {language === "ar" ? "تم التحقق" : "Verified"}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Feather name="clock" size={14} color={SaleemColors.warning} />
            <ThemedText type="caption" style={{ color: SaleemColors.warning }}>
              {language === "ar" ? "بانتظار التحقق" : "Verification Pending"}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={[styles.formCard, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "التخصص" : "Specialization"}
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
            value={specialization}
            onChangeText={setSpecialization}
            placeholder={language === "ar" ? "طب عام" : "General Medicine"}
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "نبذة عنك" : "Bio"}
          </ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
            value={bio}
            onChangeText={setBio}
            placeholder={language === "ar" ? "أخبر مرضاك عن نفسك..." : "Tell your patients about yourself..."}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "رابط يوتيوب" : "YouTube Link"}
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            value={youtubeLink}
            onChangeText={setYoutubeLink}
            placeholder="https://youtube.com/@drchannel"
            placeholderTextColor={theme.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "رابط الموقع" : "Website Link"}
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            value={websiteLink}
            onChangeText={setWebsiteLink}
            placeholder="https://example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <Button onPress={handleSave} variant="primary" size="large" loading={saving}>
          {saved
            ? (language === "ar" ? "تم الحفظ" : "Saved!")
            : (language === "ar" ? "حفظ التغييرات" : "Save Changes")}
        </Button>
      </View>

      {user?.licenseNumber ? (
        <View style={[styles.infoCard, { backgroundColor: theme.cardBackground }]}>
          <Feather name="file-text" size={20} color={SaleemColors.primary} />
          <View style={{ flex: 1 }}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "رقم الرخصة" : "License Number"}
            </ThemedText>
            <ThemedText type="body">{user.licenseNumber}</ThemedText>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginBottom: Spacing.lg },
  profileHeader: { alignItems: "center", marginBottom: Spacing.xl },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginTop: Spacing.sm, backgroundColor: SaleemColors.accent + "15", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  pendingBadge: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginTop: Spacing.sm, backgroundColor: SaleemColors.warning + "15", paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  formCard: { padding: Spacing.xl, borderRadius: BorderRadius.md, marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  input: { height: 52, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, fontSize: 16, marginTop: Spacing.sm },
  textArea: { minHeight: 100, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: 16, marginTop: Spacing.sm },
  infoCard: { flexDirection: "row", padding: Spacing.lg, borderRadius: BorderRadius.sm, gap: Spacing.md, alignItems: "center" },
});
