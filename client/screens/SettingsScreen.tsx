import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, ScrollView, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { MedicationTypeSelector } from "@/components/MedicationIcon";
import { HealthBadgeItem } from "@/components/HealthBadge";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { healthConditions, searchConditions } from "@/data/healthConditions";

type MedicationType = "pills" | "spray" | "inhaler" | "injection" | "drops" | "cream";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language, setLanguage } = useLanguage();
  const { user: localUser, updateUser, addMedication, removeMedication, addBadge, removeBadge, deleteAllData } = useUser();
  const { user: authUser, logout } = useAuth();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedType, setSelectedMedType] = useState<MedicationType | undefined>();
  const [medName, setMedName] = useState("");

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

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  const handleAddMedication = () => {
    if (selectedMedType && medName.trim()) {
      addMedication({
        id: "",
        name: medName.trim(),
        type: selectedMedType,
      });
      setMedName("");
      setSelectedMedType(undefined);
      setShowMedModal(false);
    }
  };

  const filteredConditions = searchQuery.trim() 
    ? searchConditions(searchQuery) 
    : healthConditions.slice(0, 15);

  const isConditionSelected = (id: string) => {
    return localUser.badges.some((b) => b.id === id || b.name === healthConditions.find(c => c.id === id)?.name);
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
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Disclaimer />
      
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <ThemedText 
          type="caption" 
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {language === "ar" ? "الملف الشخصي" : "PROFILE"}
        </ThemedText>
        
        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.profileRow}>
            <ThemedText type="body">{language === "ar" ? "الاسم" : "Name"}</ThemedText>
            <ThemedText type="body" style={{ color: SaleemColors.primary }}>
              {authUser?.nameEn || authUser?.nameAr || localUser.name || "--"}
            </ThemedText>
          </View>
          
          <View style={styles.profileRow}>
            <ThemedText type="body">{t("height")}</ThemedText>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={220}
                value={localUser.height || 170}
                onSlidingComplete={(value) => updateUser({ height: Math.round(value) })}
                minimumTrackTintColor={SaleemColors.accent}
                maximumTrackTintColor={theme.backgroundSecondary}
                thumbTintColor={SaleemColors.accent}
              />
              <ThemedText type="small" style={{ color: SaleemColors.accent, width: 60, textAlign: "right" }}>
                {localUser.height || 170} {t("cm")}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.profileRow}>
            <ThemedText type="body">{t("weight")}</ThemedText>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={30}
                maximumValue={200}
                value={localUser.weight || 70}
                onSlidingComplete={(value) => updateUser({ weight: Math.round(value) })}
                minimumTrackTintColor={SaleemColors.accent}
                maximumTrackTintColor={theme.backgroundSecondary}
                thumbTintColor={SaleemColors.accent}
              />
              <ThemedText type="small" style={{ color: SaleemColors.accent, width: 60, textAlign: "right" }}>
                {localUser.weight || 70} {t("kg")}
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)}>
        <ThemedText 
          type="caption" 
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          {language === "ar" ? "السجل الطبي" : "MEDICAL HISTORY"}
        </ThemedText>
        
        <SettingRow
          icon="heart"
          title={language === "ar" ? "حالاتي الصحية" : "Health Conditions"}
          subtitle={`${localUser.badges.length} ${language === "ar" ? "حالة" : "conditions"}`}
          onPress={() => setShowHealthModal(true)}
        />
        
        <SettingRow
          icon="package"
          title={language === "ar" ? "أدويتي" : "My Medications"}
          subtitle={`${localUser.medications.length} ${language === "ar" ? "دواء" : "medications"}`}
          onPress={() => setShowMedModal(true)}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
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
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(500)}>
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
            {language === "ar" ? "تحذير: لا يمكن التراجع" : "Warning: Cannot be undone"}
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
      </View>

      <Modal
        visible={showHealthModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHealthModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowHealthModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>
                {t("cancel")}
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">{language === "ar" ? "حالاتي الصحية" : "Health Conditions"}</ThemedText>
            <Pressable onPress={() => setShowHealthModal(false)}>
              <ThemedText type="button" style={{ color: SaleemColors.accent }}>
                {t("done")}
              </ThemedText>
            </Pressable>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={[
                styles.searchInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
              placeholder={t("searchConditions")}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            
            <ScrollView style={styles.conditionsList}>
              {filteredConditions.map((condition) => (
                <View key={condition.id} style={{ marginBottom: Spacing.sm }}>
                  <HealthBadgeItem
                    condition={condition}
                    selected={isConditionSelected(condition.id)}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (isConditionSelected(condition.id)) {
                        const badge = localUser.badges.find(b => b.name === condition.name);
                        if (badge) removeBadge(badge.id);
                      } else {
                        addBadge({
                          id: condition.id,
                          name: condition.name,
                          nameAr: condition.nameAr,
                          organ: condition.organ,
                          icon: condition.icon,
                        });
                      }
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMedModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMedModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowMedModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>
                {t("cancel")}
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">{language === "ar" ? "أدويتي" : "My Medications"}</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          
          <View style={styles.modalContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
              {language === "ar" ? "أدويتي الحالية" : "Current Medications"}
            </ThemedText>
            
            {localUser.medications.length > 0 ? (
              <View style={styles.medList}>
                {localUser.medications.map((med) => (
                  <View 
                    key={med.id}
                    style={[styles.medItem, { backgroundColor: theme.cardBackground }]}
                  >
                    <ThemedText type="body">{med.name}</ThemedText>
                    <Pressable onPress={() => removeMedication(med.id)}>
                      <Feather name="x" size={20} color={SaleemColors.error} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
            
            <View style={styles.addMedSection}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                {language === "ar" ? "إضافة دواء جديد" : "Add New Medication"}
              </ThemedText>
              
              <MedicationTypeSelector
                selectedType={selectedMedType}
                onSelect={setSelectedMedType}
              />
              
              <TextInput
                style={[
                  styles.searchInput,
                  { backgroundColor: theme.backgroundSecondary, color: theme.text, marginTop: Spacing.lg },
                ]}
                placeholder={language === "ar" ? "اسم الدواء" : "Medication name"}
                placeholderTextColor={theme.textSecondary}
                value={medName}
                onChangeText={setMedName}
              />
              
              <Button
                onPress={handleAddMedication}
                variant="secondary"
                disabled={!selectedMedType || !medName.trim()}
                style={{ marginTop: Spacing.lg }}
              >
                {t("addMedication")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  profileRow: {
    marginBottom: Spacing.lg,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
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
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  searchInput: {
    height: 48,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  conditionsList: {
    flex: 1,
  },
  medList: {
    marginBottom: Spacing.xl,
  },
  medItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  addMedSection: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
