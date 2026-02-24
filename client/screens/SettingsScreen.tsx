import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, Modal, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";

const TERMS_EN = `Terms & Conditions - Saleem

1. Service Description
Saleem is a professional messaging application designed for secure communication between professionals (doctors, consultants, etc.) and their clients. This app is NOT a telemedicine service and does NOT provide medical diagnosis.

2. User Responsibilities
- Users must provide accurate information during registration
- Users must not share offensive, illegal, or harmful content
- Users are responsible for maintaining the security of their accounts
- Professional users must maintain valid licenses for their profession

3. Privacy & Data Protection
- We comply with Saudi Arabia's Personal Data Protection Law (PDPL)
- Personal data is stored securely and encrypted
- Users can request deletion of their data at any time
- We do not sell or share personal data with third parties

4. Limitations
- This app is for follow-up communication only
- NOT for medical emergencies - call 997 for emergencies
- We are not responsible for professional advice given through the app
- Service availability is not guaranteed

5. Governing Law
These terms are governed by the laws of the Kingdom of Saudi Arabia.

6. Contact
For questions about these terms, contact support@saleem.app`;

const TERMS_AR = `الشروط والأحكام - سليم

1. وصف الخدمة
سليم هو تطبيق مراسلة احترافي مصمم للتواصل الآمن بين المختصين (أطباء، مستشارين، إلخ) وعملائهم. هذا التطبيق ليس خدمة طب عن بُعد ولا يقدم تشخيصاً طبياً.

2. مسؤوليات المستخدم
- يجب على المستخدمين تقديم معلومات دقيقة عند التسجيل
- يجب عدم مشاركة محتوى مسيء أو غير قانوني أو ضار
- المستخدمون مسؤولون عن الحفاظ على أمان حساباتهم
- يجب على المختصين الحفاظ على تراخيص سارية المفعول

3. الخصوصية وحماية البيانات
- نلتزم بنظام حماية البيانات الشخصية السعودي (PDPL)
- يتم تخزين البيانات الشخصية بشكل آمن ومشفر
- يمكن للمستخدمين طلب حذف بياناتهم في أي وقت
- لا نبيع أو نشارك البيانات الشخصية مع أطراف ثالثة

4. القيود
- هذا التطبيق للتواصل التابع فقط
- ليس لحالات الطوارئ الطبية - اتصل 997 للطوارئ
- لسنا مسؤولين عن النصائح المهنية المقدمة عبر التطبيق
- لا نضمن توفر الخدمة

5. القانون الحاكم
تخضع هذه الشروط لقوانين المملكة العربية السعودية.

6. التواصل
للأسئلة حول هذه الشروط، تواصل عبر support@saleem.app`;

const PRIVACY_EN = `Privacy Policy - Saleem

1. Data Collection
We collect the following information:
- Name, email, phone number
- Profession and specialization (for professionals)
- Messages sent through the platform
- Usage analytics

2. Data Usage
Your data is used to:
- Provide messaging services
- Verify professional credentials
- Improve our services
- Send important notifications

3. Data Storage
- All data is stored on secure servers
- Messages are encrypted in transit
- We retain data only as long as necessary

4. Your Rights (Under Saudi PDPL)
You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and all data
- Export your data
- Withdraw consent

5. Data Sharing
We do NOT share your data with third parties except:
- When required by Saudi law
- To protect the safety of users
- With your explicit consent

6. Contact
Data Protection Officer: privacy@saleem.app`;

const PRIVACY_AR = `سياسة الخصوصية - سليم

1. جمع البيانات
نجمع المعلومات التالية:
- الاسم، البريد الإلكتروني، رقم الهاتف
- المهنة والتخصص (للمختصين)
- الرسائل المرسلة عبر المنصة
- تحليلات الاستخدام

2. استخدام البيانات
تُستخدم بياناتك من أجل:
- تقديم خدمات المراسلة
- التحقق من المؤهلات المهنية
- تحسين خدماتنا
- إرسال إشعارات مهمة

3. تخزين البيانات
- جميع البيانات مخزنة على خوادم آمنة
- الرسائل مشفرة أثناء النقل
- نحتفظ بالبيانات فقط طالما كان ذلك ضرورياً

4. حقوقك (بموجب نظام PDPL السعودي)
لديك الحق في:
- الوصول إلى بياناتك الشخصية
- تصحيح البيانات غير الدقيقة
- حذف حسابك وجميع بياناتك
- تصدير بياناتك
- سحب الموافقة

5. مشاركة البيانات
لا نشارك بياناتك مع أطراف ثالثة إلا:
- عند الطلب بموجب القانون السعودي
- لحماية سلامة المستخدمين
- بموافقتك الصريحة

6. التواصل
مسؤول حماية البيانات: privacy@saleem.app`;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { language, isRTL, setLanguage } = useLanguage();
  const { logout } = useAuth();

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
  };

  const renderLegalModal = (visible: boolean, onClose: () => void, title: string, contentEn: string, contentAr: string) => (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">{title}</ThemedText>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
            <ThemedText type="body" style={{ lineHeight: 24 }}>
              {language === "ar" ? contentAr : contentEn}
            </ThemedText>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: headerHeight + Spacing.xl, paddingBottom: tabBarHeight + Spacing.xl },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(600)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {language === "ar" ? "اللغة" : "Language"}
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Pressable
            onPress={() => {
              setLanguage("en");
              Haptics.selectionAsync();
            }}
            style={[styles.langBtn, language === "en" && { backgroundColor: SaleemColors.primary + "15", borderColor: SaleemColors.primary }]}
            testID="button-lang-en"
          >
            <ThemedText type="body" style={[language === "en" && { color: SaleemColors.primary, fontWeight: "700" }]}>
              English
            </ThemedText>
            {language === "en" ? <Feather name="check" size={20} color={SaleemColors.primary} /> : null}
          </Pressable>
          <Pressable
            onPress={() => {
              setLanguage("ar");
              Haptics.selectionAsync();
            }}
            style={[styles.langBtn, language === "ar" && { backgroundColor: SaleemColors.primary + "15", borderColor: SaleemColors.primary }]}
            testID="button-lang-ar"
          >
            <ThemedText type="body" style={[language === "ar" && { color: SaleemColors.primary, fontWeight: "700" }]}>
              العربية
            </ThemedText>
            {language === "ar" ? <Feather name="check" size={20} color={SaleemColors.primary} /> : null}
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {language === "ar" ? "قانوني" : "Legal"}
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Pressable onPress={() => setShowTerms(true)} style={styles.menuItem} testID="button-terms">
            <Feather name="file-text" size={20} color={SaleemColors.primary} />
            <ThemedText type="body" style={{ flex: 1 }}>
              {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
            </ThemedText>
            <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={theme.textSecondary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable onPress={() => setShowPrivacy(true)} style={styles.menuItem} testID="button-privacy">
            <Feather name="shield" size={20} color={SaleemColors.primary} />
            <ThemedText type="body" style={{ flex: 1 }}>
              {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </ThemedText>
            <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(600)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {language === "ar" ? "السلامة والطوارئ" : "Safety & Emergency"}
        </ThemedText>
        <View style={[styles.emergencyCard, { backgroundColor: SaleemColors.error + "10", borderColor: SaleemColors.error + "30" }]}>
          <View style={styles.emergencyHeader}>
            <Feather name="alert-triangle" size={22} color={SaleemColors.error} />
            <ThemedText type="body" style={{ color: SaleemColors.error, fontWeight: "700", flex: 1 }}>
              {language === "ar" ? "تنبيه الطوارئ" : "Emergency Alert"}
            </ThemedText>
          </View>
          <ThemedText type="body" style={{ color: theme.text, marginTop: Spacing.sm, lineHeight: 22 }}>
            {language === "ar"
              ? "هذا التطبيق ليس لحالات الطوارئ الطبية.\n\nفي حالة الطوارئ الطبية:\n1. اتصل برقم 997 فوراً\n2. توجه للمستشفى الأقرب\n3. لا تعتمد على هذا التطبيق\n\nهذا تطبيق مراسلة احترافي للمتابعة فقط."
              : "This app is NOT for medical emergencies.\n\nIn a medical emergency:\n1. Call 997 immediately\n2. Go to the nearest hospital\n3. Do NOT rely on this app\n\nThis is a professional messaging tool for follow-up communication only."}
          </ThemedText>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Linking.openURL("tel:997").catch(() => {});
              }
            }}
            style={[styles.emergencyBtn, { backgroundColor: SaleemColors.error }]}
            testID="button-emergency-call"
          >
            <Feather name="phone-call" size={18} color="#FFF" />
            <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
              {language === "ar" ? "اتصل 997" : "Call 997"}
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(600)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          {language === "ar" ? "الحساب" : "Account"}
        </ThemedText>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Pressable onPress={handleLogout} style={styles.menuItem} testID="button-logout">
            <Feather name="log-out" size={20} color={SaleemColors.error} />
            <ThemedText type="body" style={{ color: SaleemColors.error, flex: 1 }}>
              {language === "ar" ? "تسجيل الخروج" : "Logout"}
            </ThemedText>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Pressable onPress={() => setShowDeleteConfirm(true)} style={styles.menuItem} testID="button-delete-account">
            <Feather name="trash-2" size={20} color={SaleemColors.error} />
            <ThemedText type="body" style={{ color: SaleemColors.error, flex: 1 }}>
              {language === "ar" ? "حذف الحساب" : "Delete Account"}
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>

      {renderLegalModal(showTerms, () => setShowTerms(false), language === "ar" ? "الشروط والأحكام" : "Terms & Conditions", TERMS_EN, TERMS_AR)}
      {renderLegalModal(showPrivacy, () => setShowPrivacy(false), language === "ar" ? "سياسة الخصوصية" : "Privacy Policy", PRIVACY_EN, PRIVACY_AR)}

      <Modal visible={showDeleteConfirm} animationType="fade" transparent onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.deleteModal]}>
            <Feather name="alert-triangle" size={40} color={SaleemColors.error} style={{ alignSelf: "center" }} />
            <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.lg }}>
              {language === "ar" ? "حذف الحساب" : "Delete Account"}
            </ThemedText>
            <ThemedText type="body" style={{ textAlign: "center", color: theme.textSecondary, marginTop: Spacing.sm }}>
              {language === "ar"
                ? "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure? This action cannot be undone."}
            </ThemedText>
            <View style={styles.deleteActions}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={[styles.deleteBtn, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText type="body">{language === "ar" ? "إلغاء" : "Cancel"}</ThemedText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  setShowDeleteConfirm(false);
                  await logout();
                }}
                style={[styles.deleteBtn, { backgroundColor: SaleemColors.error }]}
              >
                <ThemedText type="body" style={{ color: "#FFF" }}>{language === "ar" ? "حذف" : "Delete"}</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl },
  sectionTitle: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  card: { borderRadius: BorderRadius.md, overflow: "hidden" },
  langBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, borderWidth: 1, borderColor: "transparent", borderRadius: BorderRadius.sm, marginBottom: Spacing.xs },
  menuItem: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
  divider: { height: 1, marginHorizontal: Spacing.xl },
  emergencyCard: { padding: Spacing.xl, borderWidth: 1, borderRadius: BorderRadius.md },
  emergencyHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  emergencyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.sm, marginTop: Spacing.lg },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { width: "100%", height: "85%", borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: "rgba(128,128,128,0.2)" },
  closeBtn: { padding: Spacing.xs },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: Spacing.xl },
  deleteModal: { margin: Spacing.xl, padding: Spacing.xl, borderRadius: BorderRadius.md },
  deleteActions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl },
  deleteBtn: { flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.sm, alignItems: "center" },
});
