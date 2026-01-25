import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser, Message } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius, Shadows } from "@/constants/theme";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user, addMessage, updateUser } = useUser();
  
  const [messageText, setMessageText] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [clinicCodeInput, setClinicCodeInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const hasClinicCode = !!user.clinicCode;

  useEffect(() => {
    if (!hasClinicCode) {
      setShowCodeModal(true);
    }
  }, [hasClinicCode]);

  const handleJoinClinic = () => {
    if (clinicCodeInput.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateUser({ clinicCode: clinicCodeInput.trim().toUpperCase() });
      setShowCodeModal(false);
      setClinicCodeInput("");
      
      setTimeout(() => {
        addMessage({
          id: "",
          text: language === "ar" 
            ? "مرحباً بك! أنا طبيبك. كيف يمكنني مساعدتك اليوم؟" 
            : "Welcome! I'm your doctor. How can I help you today?",
          sender: "doctor",
          timestamp: new Date().toISOString(),
        });
      }, 500);
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() && hasClinicCode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addMessage({
        id: "",
        text: messageText.trim(),
        sender: "patient",
        timestamp: new Date().toISOString(),
      });
      setMessageText("");
      
      setTimeout(() => {
        const responses = language === "ar" ? [
          "شكراً لرسالتك. سأراجعها وأرد عليك قريباً.",
          "تلقيت رسالتك. هل يمكنك تقديم المزيد من التفاصيل؟",
          "فهمت. سأتابع معك خلال موعدنا القادم.",
        ] : [
          "Thank you for your message. I'll review it and get back to you soon.",
          "I've received your message. Can you provide more details?",
          "Understood. I'll follow up with you during our next appointment.",
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage({
          id: "",
          text: randomResponse,
          sender: "doctor",
          timestamp: new Date().toISOString(),
        });
      }, 1500);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isPatient = item.sender === "patient";
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isPatient ? SaleemColors.primary : theme.cardBackground,
              alignSelf: isPatient ? "flex-end" : "flex-start",
            },
            Shadows.small,
          ]}
        >
          {!isPatient ? (
            <View style={styles.doctorLabel}>
              <Feather name="user" size={12} color={SaleemColors.accent} />
              <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
                {language === "ar" ? "الطبيب" : "Doctor"}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText 
            type="body" 
            style={{ color: isPatient ? "#FFFFFF" : theme.text }}
          >
            {item.text}
          </ThemedText>
          <ThemedText 
            type="caption" 
            style={{ 
              color: isPatient ? "rgba(255,255,255,0.7)" : theme.textSecondary,
              marginTop: Spacing.xs,
              textAlign: isPatient ? "right" : "left",
            }}
          >
            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </ThemedText>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        ref={flatListRef}
        data={user.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: Spacing.lg,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.lg }}>
            <Disclaimer />
            
            {hasClinicCode ? (
              <Animated.View 
                entering={FadeInDown.delay(100).duration(500)}
                style={[styles.clinicHeader, { backgroundColor: SaleemColors.accent + "15" }]}
              >
                <Feather name="shield" size={20} color={SaleemColors.accent} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="small" style={{ color: SaleemColors.accent }}>
                    {language === "ar" ? "متصل بالعيادة" : "Connected to Clinic"}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {language === "ar" ? `رمز: ${user.clinicCode}` : `Code: ${user.clinicCode}`}
                  </ThemedText>
                </View>
                <Pressable 
                  onPress={() => setShowCodeModal(true)}
                  style={styles.changeButton}
                >
                  <ThemedText type="caption" style={{ color: SaleemColors.primary }}>
                    {language === "ar" ? "تغيير" : "Change"}
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          hasClinicCode ? (
            <View style={styles.emptyChat}>
              <Feather name="message-circle" size={48} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
                {language === "ar" ? "ابدأ محادثة مع طبيبك" : "Start a conversation with your doctor"}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.emptyChat}>
              <View style={[styles.lockIcon, { backgroundColor: SaleemColors.warning + "20" }]}>
                <Feather name="lock" size={32} color={SaleemColors.warning} />
              </View>
              <ThemedText type="h4" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
                {language === "ar" ? "أدخل رمز الطبيب" : "Enter Doctor Code"}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                {language === "ar" 
                  ? "احصل على رمز العيادة من طبيبك لبدء المحادثة" 
                  : "Get the clinic code from your doctor to start chatting"}
              </ThemedText>
              <Button
                onPress={() => setShowCodeModal(true)}
                variant="primary"
                style={{ marginTop: Spacing.xl }}
              >
                {language === "ar" ? "إدخال الرمز" : "Enter Code"}
              </Button>
            </View>
          )
        }
        onContentSizeChange={() => {
          if (user.messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      {hasClinicCode ? (
        <View 
          style={[
            styles.inputContainer, 
            { 
              backgroundColor: theme.backgroundRoot,
              paddingBottom: tabBarHeight + Spacing.sm,
              borderTopColor: theme.border,
            },
          ]}
        >
          <View 
            style={[
              styles.inputRow,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                { color: theme.text, textAlign: isRTL ? "right" : "left" },
              ]}
              placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
              placeholderTextColor={theme.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <Pressable
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
              style={[
                styles.sendButton,
                { backgroundColor: SaleemColors.accent, opacity: messageText.trim() ? 1 : 0.5 },
              ]}
            >
              <Feather name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal
        visible={showCodeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => hasClinicCode && setShowCodeModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            {hasClinicCode ? (
              <Pressable onPress={() => setShowCodeModal(false)}>
                <ThemedText type="button" style={{ color: theme.textSecondary }}>
                  {t("cancel")}
                </ThemedText>
              </Pressable>
            ) : (
              <View />
            )}
            <ThemedText type="h4">{t("clinicCode")}</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.codeIconContainer}>
              <Feather name="key" size={48} color={SaleemColors.primary} />
            </View>
            
            <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.xl }}>
              {language === "ar" ? "أدخل رمز العيادة" : "Enter Clinic Code"}
            </ThemedText>
            
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
              {language === "ar" 
                ? "احصل على هذا الرمز من طبيبك أو العيادة" 
                : "Get this code from your doctor or clinic"}
            </ThemedText>
            
            <TextInput
              style={[
                styles.codeInput,
                { 
                  backgroundColor: theme.cardBackground, 
                  color: theme.text,
                  borderColor: clinicCodeInput ? SaleemColors.accent : theme.border,
                },
              ]}
              placeholder="ABC123"
              placeholderTextColor={theme.textSecondary}
              value={clinicCodeInput}
              onChangeText={(text) => setClinicCodeInput(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
            />
            
            <Button
              onPress={handleJoinClinic}
              variant="primary"
              size="large"
              disabled={!clinicCodeInput.trim()}
              style={{ marginTop: Spacing.xl }}
            >
              {t("joinClinic")}
            </Button>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  clinicHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  changeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  doctorLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  codeIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: SaleemColors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  codeInput: {
    width: "100%",
    height: 60,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 4,
    marginTop: Spacing.xl,
    borderWidth: 2,
  },
});
