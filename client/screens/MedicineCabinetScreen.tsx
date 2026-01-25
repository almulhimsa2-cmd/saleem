import React, { useState } from "react";
import { View, StyleSheet, TextInput, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { MedicationTypeSelector } from "@/components/MedicationIcon";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser, Medication } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";

type MedicineCabinetScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "MedicineCabinet">;
};

type MedicationType = "pills" | "spray" | "inhaler" | "injection" | "drops" | "cream";

export default function MedicineCabinetScreen({ navigation }: MedicineCabinetScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user, addMedication, removeMedication } = useUser();
  
  const [selectedType, setSelectedType] = useState<MedicationType | undefined>();
  const [medicationName, setMedicationName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMedication = () => {
    if (selectedType && medicationName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addMedication({
        id: "",
        name: medicationName.trim(),
        type: selectedType,
      });
      setMedicationName("");
      setSelectedType(undefined);
      setShowAddForm(false);
    }
  };

  const handleContinue = () => {
    navigation.navigate("HealthBadges");
  };

  const handleSkip = () => {
    navigation.navigate("HealthBadges");
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View 
        style={[
          styles.medicationItem, 
          { backgroundColor: theme.cardBackground },
          isRTL && { flexDirection: "row-reverse" },
        ]}
      >
        <View style={[styles.medicationInfo, isRTL && { alignItems: "flex-end" }]}>
          <ThemedText type="body">{item.name}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {language === "ar" ? 
              (item.type === "pills" ? "حبوب" : 
               item.type === "spray" ? "بخاخ" : 
               item.type === "inhaler" ? "جهاز استنشاق" : 
               item.type === "injection" ? "حقنة" : 
               item.type === "drops" ? "قطرات" : "كريم") 
              : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </ThemedText>
        </View>
        <Pressable 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            removeMedication(item.id);
          }}
          style={styles.removeButton}
        >
          <Feather name="x" size={20} color={SaleemColors.error} />
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={user.medications}
        keyExtractor={(item) => item.id}
        renderItem={renderMedicationItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: Spacing["3xl"],
          },
        ]}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <ThemedText type="h2" style={[styles.title, isRTL && { textAlign: "right" }]}>
              {t("medicineCabinet")}
            </ThemedText>
            <ThemedText 
              type="body" 
              style={[styles.subtitle, { color: theme.textSecondary }, isRTL && { textAlign: "right" }]}
            >
              {t("medicineCabinetSubtitle")}
            </ThemedText>

            {showAddForm ? (
              <View style={[styles.addForm, { backgroundColor: theme.cardBackground }]}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  {t("addMedication")}
                </ThemedText>
                
                <MedicationTypeSelector
                  selectedType={selectedType}
                  onSelect={setSelectedType}
                />
                
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      color: theme.text,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                  placeholder={language === "ar" ? "اسم الدواء" : "Medication name"}
                  placeholderTextColor={theme.textSecondary}
                  value={medicationName}
                  onChangeText={setMedicationName}
                />
                
                <View style={styles.formButtons}>
                  <Pressable 
                    onPress={() => setShowAddForm(false)}
                    style={styles.cancelButton}
                  >
                    <ThemedText type="button" style={{ color: theme.textSecondary }}>
                      {t("cancel")}
                    </ThemedText>
                  </Pressable>
                  <Button
                    onPress={handleAddMedication}
                    variant="secondary"
                    size="small"
                    disabled={!selectedType || !medicationName.trim()}
                  >
                    {t("save")}
                  </Button>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowAddForm(true)}
                style={[styles.addButton, { borderColor: SaleemColors.accent }]}
              >
                <Feather name="plus" size={24} color={SaleemColors.accent} />
                <ThemedText type="button" style={{ color: SaleemColors.accent }}>
                  {t("addMedication")}
                </ThemedText>
              </Pressable>
            )}
          </Animated.View>
        }
        ListEmptyComponent={
          !showAddForm ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={48} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                {t("noMedications")}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {t("tapToAdd")}
              </ThemedText>
            </View>
          ) : null
        }
      />

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.buttonRow}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <ThemedText type="button" style={{ color: theme.textSecondary }}>
              {t("skip")}
            </ThemedText>
          </Pressable>
          <Button
            onPress={handleContinue}
            variant="primary"
            size="medium"
            style={{ flex: 1 }}
            testID="button-continue"
          >
            {t("next")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  addForm: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderStyle: "dashed",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  medicationInfo: {
    flex: 1,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  skipButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
});
