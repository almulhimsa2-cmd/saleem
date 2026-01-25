import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { deleteAllData, updateUser } = useUser();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const handleLanguageToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(language === "ar" ? "en" : "ar");
  };

  const handleDeleteData = () => {
    if (deleteInput === "DELETE") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      deleteAllData();
      setShowDeleteConfirm(false);
      setDeleteInput("");
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateUser({ onboardingComplete: false, pdplConsent: false });
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle,
    onPress,
    rightElement,
    danger = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingRow,
        { backgroundColor: theme.cardBackground },
        isRTL && { flexDirection: "row-reverse" },
      ]}
    >
      <View 
        style={[
          styles.settingIcon, 
          { backgroundColor: danger ? SaleemColors.error + "20" : SaleemColors.primary + "20" },
        ]}
      >
        <Feather 
          name={icon as any} 
          size={20} 
          color={danger ? SaleemColors.error : SaleemColors.primary} 
        />
      </View>
      <View style={[styles.settingInfo, isRTL && { alignItems: "flex-end" }]}>
        <ThemedText 
          type="body" 
          style={danger ? { color: SaleemColors.error } : undefined}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement || (
        <Feather 
          name={isRTL ? "chevron-left" : "chevron-right"} 
          size={20} 
          color={theme.textSecondary} 
        />
      )}
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Disclaimer />
      
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <ThemedText 
          type="caption" 
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {language === "ar" ? "التفضيلات" : "PREFERENCES"}
        </ThemedText>
        
        <SettingRow
          icon="globe"
          title={t("language")}
          subtitle={language === "ar" ? "العربية" : "English"}
          onPress={handleLanguageToggle}
          rightElement={
            <View style={styles.languageToggle}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {language === "ar" ? "EN" : "عربي"}
              </ThemedText>
              <Feather name="refresh-cw" size={16} color={SaleemColors.accent} />
            </View>
          }
        />
        
        <SettingRow
          icon="bell"
          title={t("notifications")}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <ThemedText 
          type="caption" 
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {language === "ar" ? "الأمان" : "SECURITY"}
        </ThemedText>
        
        <SettingRow
          icon="shield"
          title={t("privacySecurity")}
        />
        
        <SettingRow
          icon="key"
          title={t("clinicCode")}
          subtitle={language === "ar" ? "أدخل رمز العيادة" : "Enter your clinic code"}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <ThemedText 
          type="caption" 
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {language === "ar" ? "الحساب" : "ACCOUNT"}
        </ThemedText>
        
        <SettingRow
          icon="log-out"
          title={t("logout")}
          onPress={handleLogout}
        />
        
        <SettingRow
          icon="trash-2"
          title={t("deleteMyData")}
          danger
          onPress={() => setShowDeleteConfirm(true)}
        />
      </Animated.View>

      {showDeleteConfirm ? (
        <Animated.View 
          entering={FadeInDown.duration(300)}
          style={[styles.deleteConfirm, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText type="h4" style={{ color: SaleemColors.error, marginBottom: Spacing.md }}>
            {language === "ar" ? "تحذير: هذا الإجراء لا يمكن التراجع عنه" : "Warning: This action cannot be undone"}
          </ThemedText>
          
          <ThemedText type="body" style={{ marginBottom: Spacing.lg }}>
            {t("deleteConfirmation")}
          </ThemedText>
          
          <TextInput
            style={[
              styles.deleteInput,
              { 
                backgroundColor: theme.backgroundSecondary, 
                color: theme.text,
                borderColor: deleteInput === "DELETE" ? SaleemColors.error : theme.border,
              },
            ]}
            placeholder="DELETE"
            placeholderTextColor={theme.textSecondary}
            value={deleteInput}
            onChangeText={setDeleteInput}
            autoCapitalize="characters"
          />
          
          <View style={styles.deleteButtons}>
            <Pressable 
              onPress={() => {
                setShowDeleteConfirm(false);
                setDeleteInput("");
              }}
              style={styles.cancelButton}
            >
              <ThemedText type="button" style={{ color: theme.textSecondary }}>
                {t("cancel")}
              </ThemedText>
            </Pressable>
            <Button
              onPress={handleDeleteData}
              variant="danger"
              disabled={deleteInput !== "DELETE"}
            >
              {t("delete")}
            </Button>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Saleem v1.0.0
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {language === "ar" ? "صُنع بعناية في المملكة العربية السعودية" : "Made with care in Saudi Arabia"}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingInfo: {
    flex: 1,
  },
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  deleteConfirm: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
  },
  deleteInput: {
    height: 48,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 2,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  deleteButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  footer: {
    marginTop: Spacing["3xl"],
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
});
