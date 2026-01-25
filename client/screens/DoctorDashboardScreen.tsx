import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, SaleemColors, BorderRadius, Shadows } from "@/constants/theme";
import { DoctorStackParamList } from "@/navigation/DoctorNavigator";

type DoctorDashboardScreenProps = {
  navigation: NativeStackNavigationProp<DoctorStackParamList, "DoctorDashboard">;
  route: RouteProp<DoctorStackParamList, "DoctorDashboard">;
};

interface Patient {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  notes?: string;
}

const generateClinicCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function DoctorDashboardScreen({ navigation, route }: DoctorDashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { doctorName, specialty } = route.params;
  
  const [clinicCode, setClinicCode] = useState("");
  const [customCodeInput, setCustomCodeInput] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      name: language === "ar" ? "محمد أحمد" : "Mohammed Ahmed",
      lastMessage: language === "ar" ? "شكراً دكتور" : "Thank you doctor",
      timestamp: "10:30 AM",
      unread: 2,
      notes: "",
    },
    {
      id: "2",
      name: language === "ar" ? "سارة علي" : "Sara Ali",
      lastMessage: language === "ar" ? "متى الموعد القادم؟" : "When is the next appointment?",
      timestamp: "Yesterday",
      unread: 0,
      notes: "",
    },
    {
      id: "3",
      name: language === "ar" ? "خالد محمود" : "Khaled Mahmoud",
      lastMessage: language === "ar" ? "هل أحتاج فحوصات إضافية؟" : "Do I need additional tests?",
      timestamp: "2 days ago",
      unread: 1,
      notes: "",
    },
  ]);

  useEffect(() => {
    setClinicCode(generateClinicCode());
  }, []);

  const handleGenerateCode = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newCode = generateClinicCode();
    setClinicCode(newCode);
    setCustomCodeInput("");
  };

  const handleSetCustomCode = () => {
    if (customCodeInput.trim().length >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setClinicCode(customCodeInput.trim().toUpperCase());
      setCustomCodeInput("");
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(clinicCode);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.replace("DoctorLogin");
  };

  const handleOpenNotes = (patient: Patient) => {
    setSelectedPatient(patient);
    setNotesInput(patient.notes || "");
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (selectedPatient) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPatients((prev) =>
        prev.map((p) =>
          p.id === selectedPatient.id ? { ...p, notes: notesInput } : p
        )
      );
      setShowNotesModal(false);
      setSelectedPatient(null);
      setNotesInput("");
    }
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={[styles.patientCard, { backgroundColor: theme.cardBackground }, Shadows.small]}>
        <Pressable
          style={styles.patientMainContent}
          onPress={() => navigation.navigate("DoctorChat", { patientName: item.name, patientId: item.id })}
        >
          <View style={[styles.avatar, { backgroundColor: SaleemColors.primary + "20" }]}>
            <ThemedText type="h4" style={{ color: SaleemColors.primary }}>
              {item.name.charAt(0)}
            </ThemedText>
          </View>
          
          <View style={[styles.patientInfo, isRTL && { alignItems: "flex-end" }]}>
            <ThemedText type="body" numberOfLines={1}>{item.name}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
              {item.lastMessage}
            </ThemedText>
            {item.notes ? (
              <View style={styles.notesIndicator}>
                <Feather name="file-text" size={10} color={SaleemColors.accent} />
                <ThemedText type="caption" style={{ color: SaleemColors.accent, fontSize: 10 }} numberOfLines={1}>
                  {language === "ar" ? "ملاحظات" : "Notes"}
                </ThemedText>
              </View>
            ) : null}
          </View>
          
          <View style={styles.patientMeta}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {item.timestamp}
            </ThemedText>
            {item.unread > 0 ? (
              <View style={[styles.unreadBadge, { backgroundColor: SaleemColors.accent }]}>
                <ThemedText type="caption" style={{ color: "#FFFFFF" }}>
                  {item.unread}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Pressable>
        
        <Pressable
          style={[styles.notesButton, { backgroundColor: item.notes ? SaleemColors.accent + "20" : theme.backgroundSecondary }]}
          onPress={() => handleOpenNotes(item)}
        >
          <Feather name="edit-3" size={16} color={item.notes ? SaleemColors.accent : theme.textSecondary} />
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg, backgroundColor: SaleemColors.primary }]}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <ThemedText type="h2" style={{ color: "#FFFFFF" }}>
              {language === "ar" ? `مرحباً، د. ${doctorName}` : `Hello, Dr. ${doctorName}`}
            </ThemedText>
            <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)" }}>
              {specialty}
            </ThemedText>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              style={[styles.codeButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={() => setShowCodeModal(true)}
              testID="button-clinic-code"
              accessibilityLabel="Clinic Code"
            >
              <Feather name="key" size={20} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={[styles.codeButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              onPress={handleLogout}
              testID="button-logout"
              accessibilityLabel="Logout"
            >
              <Feather name="log-out" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
        
        <Pressable
          style={[styles.codeCard, { backgroundColor: "rgba(255,255,255,0.15)" }]}
          onPress={() => setShowCodeModal(true)}
        >
          <View style={styles.codeLeft}>
            <ThemedText type="caption" style={{ color: "rgba(255,255,255,0.8)" }}>
              {language === "ar" ? "رمز العيادة" : "Clinic Code"}
            </ThemedText>
            <ThemedText type="h3" style={{ color: "#FFFFFF", letterSpacing: 2 }}>
              {clinicCode}
            </ThemedText>
          </View>
          <Pressable onPress={handleCopyCode} style={styles.copyButton}>
            <Feather name="copy" size={20} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id}
        renderItem={renderPatient}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.lg }}>
            <Disclaimer />
            <ThemedText type="h4" style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>
              {language === "ar" ? "المرضى" : "Patients"} ({patients.length})
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
              {language === "ar" ? "لا يوجد مرضى بعد" : "No patients yet"}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {language === "ar" ? "شارك رمز العيادة مع مرضاك" : "Share your clinic code with patients"}
            </ThemedText>
          </View>
        }
      />

      <Modal
        visible={showCodeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCodeModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowCodeModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>
                {language === "ar" ? "إغلاق" : "Close"}
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">{language === "ar" ? "رمز العيادة" : "Clinic Code"}</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={[styles.codeDisplay, { backgroundColor: SaleemColors.primary }]}>
              <ThemedText type="caption" style={{ color: "rgba(255,255,255,0.8)" }}>
                {language === "ar" ? "رمزك الحالي" : "Your Current Code"}
              </ThemedText>
              <ThemedText type="h1" style={{ color: "#FFFFFF", letterSpacing: 6, marginTop: Spacing.md }}>
                {clinicCode}
              </ThemedText>
            </View>
            
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.xl }}>
              {language === "ar" 
                ? "شارك هذا الرمز مع مرضاك للسماح لهم بالتواصل معك" 
                : "Share this code with your patients to allow them to chat with you"}
            </ThemedText>
            
            <View style={styles.modalButtons}>
              <Button
                onPress={handleCopyCode}
                variant="primary"
                size="large"
                style={{ flex: 1 }}
              >
                <Feather name="copy" size={18} color="#FFFFFF" />
                {"  "}
                {language === "ar" ? "نسخ الرمز" : "Copy Code"}
              </Button>
            </View>

            <View style={[styles.customCodeSection, { borderTopColor: theme.border }]}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                {language === "ar" ? "أو أدخل رمزاً مخصصاً" : "Or enter a custom code"}
              </ThemedText>
              
              <View style={styles.customCodeRow}>
                <TextInput
                  style={[
                    styles.customCodeInput,
                    { 
                      backgroundColor: theme.backgroundSecondary, 
                      color: theme.text,
                      borderColor: customCodeInput.length >= 3 ? SaleemColors.accent : theme.border,
                    },
                  ]}
                  placeholder={language === "ar" ? "رمز مخصص (3+ أحرف)" : "Custom code (3+ chars)"}
                  placeholderTextColor={theme.textSecondary}
                  value={customCodeInput}
                  onChangeText={(text) => setCustomCodeInput(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <Pressable
                  onPress={handleSetCustomCode}
                  disabled={customCodeInput.trim().length < 3}
                  style={[
                    styles.setCodeButton,
                    { 
                      backgroundColor: customCodeInput.trim().length >= 3 
                        ? SaleemColors.accent 
                        : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <Feather 
                    name="check" 
                    size={20} 
                    color={customCodeInput.trim().length >= 3 ? "#FFFFFF" : theme.textSecondary} 
                  />
                </Pressable>
              </View>
            </View>
            
            <Pressable onPress={handleGenerateCode} style={styles.regenerateButton}>
              <Feather name="refresh-cw" size={16} color={SaleemColors.primary} />
              <ThemedText type="button" style={{ color: SaleemColors.primary }}>
                {language === "ar" ? "إنشاء رمز عشوائي" : "Generate Random Code"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowNotesModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">
              {language === "ar" ? "ملاحظات المريض" : "Patient Notes"}
            </ThemedText>
            <Pressable onPress={handleSaveNotes}>
              <ThemedText type="button" style={{ color: SaleemColors.accent }}>
                {language === "ar" ? "حفظ" : "Save"}
              </ThemedText>
            </Pressable>
          </View>
          
          <View style={styles.notesModalContent}>
            {selectedPatient ? (
              <>
                <View style={styles.patientHeader}>
                  <View style={[styles.avatar, { backgroundColor: SaleemColors.primary + "20" }]}>
                    <ThemedText type="h4" style={{ color: SaleemColors.primary }}>
                      {selectedPatient.name.charAt(0)}
                    </ThemedText>
                  </View>
                  <ThemedText type="h3">{selectedPatient.name}</ThemedText>
                </View>
                
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                  {language === "ar" ? "اكتب ملاحظاتك عن هذا المريض" : "Write your notes about this patient"}
                </ThemedText>
                
                <TextInput
                  style={[
                    styles.notesTextArea,
                    { 
                      backgroundColor: theme.cardBackground, 
                      color: theme.text,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                  placeholder={language === "ar" ? "ملاحظات طبية، تاريخ المرض، تعليمات خاصة..." : "Medical notes, history, special instructions..."}
                  placeholderTextColor={theme.textSecondary}
                  value={notesInput}
                  onChangeText={setNotesInput}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  headerButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  codeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  codeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  codeLeft: {
    flex: 1,
  },
  copyButton: {
    padding: Spacing.sm,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  patientMainContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  notesButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notesIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  patientInfo: {
    flex: 1,
  },
  patientMeta: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
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
    padding: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  codeDisplay: {
    width: "100%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: Spacing.xl,
    width: "100%",
    gap: Spacing.md,
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  customCodeSection: {
    width: "100%",
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    alignItems: "center",
  },
  customCodeRow: {
    flexDirection: "row",
    width: "100%",
    gap: Spacing.sm,
  },
  customCodeInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 2,
    borderWidth: 2,
  },
  setCodeButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  notesModalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  notesTextArea: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
  },
});
