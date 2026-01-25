import React, { useState, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { BodyMap } from "@/components/BodyMap";
import { Card } from "@/components/Card";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser, Message, Symptom } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius, Shadows } from "@/constants/theme";

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user, addMessage, addSymptom } = useUser();
  
  const [messageText, setMessageText] = useState("");
  const [selectedOrgan, setSelectedOrgan] = useState<string | undefined>();
  const [showSymptomLogger, setShowSymptomLogger] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chatUnlocked = user.instructionsReviewed;

  const handleSendMessage = () => {
    if (messageText.trim() && chatUnlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addMessage({
        id: "",
        text: messageText.trim(),
        sender: "patient",
        timestamp: new Date().toISOString(),
      });
      setMessageText("");
      
      setTimeout(() => {
        addMessage({
          id: "",
          text: language === "ar" 
            ? "شكراً لرسالتك. سيقوم الطبيب بالرد قريباً." 
            : "Thank you for your message. The doctor will respond soon.",
          sender: "doctor",
          timestamp: new Date().toISOString(),
        });
      }, 1000);
    }
  };

  const handleOrganPress = (organ: string) => {
    setSelectedOrgan(organ);
    setShowSymptomLogger(true);
  };

  const handleLogSymptom = (severity: number, description: string) => {
    if (selectedOrgan) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addSymptom({
        id: "",
        organ: selectedOrgan,
        severity,
        description,
        date: new Date().toISOString(),
      });
      setShowSymptomLogger(false);
      setSelectedOrgan(undefined);
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
          ]}
        >
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
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: Spacing.lg,
          paddingHorizontal: Spacing.lg,
        }}
        ListHeaderComponent={
          <View>
            <Disclaimer />
            
            <Animated.View 
              entering={FadeInDown.delay(100).duration(500)}
              style={styles.bodyMapSection}
            >
              <ThemedText type="h4" style={{ marginBottom: Spacing.md, textAlign: "center" }}>
                {t("symptomLogger")}
              </ThemedText>
              <ThemedText 
                type="small" 
                style={{ color: theme.textSecondary, textAlign: "center", marginBottom: Spacing.lg }}
              >
                {t("tapOrgan")}
              </ThemedText>
              <BodyMap onOrganPress={handleOrganPress} selectedOrgan={selectedOrgan} />
            </Animated.View>

            {!chatUnlocked ? (
              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <Card style={[styles.lockedCard, { borderColor: SaleemColors.warning }]}>
                  <Feather name="lock" size={24} color={SaleemColors.warning} />
                  <ThemedText type="body" style={{ textAlign: "center", marginTop: Spacing.sm }}>
                    {t("reviewInstructions")}
                  </ThemedText>
                </Card>
              </Animated.View>
            ) : user.messages.length === 0 ? (
              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                <View style={styles.emptyChat}>
                  <Feather name="message-circle" size={48} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                    {language === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
                  </ThemedText>
                </View>
              </Animated.View>
            ) : (
              <ThemedText type="h4" style={{ marginTop: Spacing.xl, marginBottom: Spacing.md }}>
                {t("chatRoom")}
              </ThemedText>
            )}
          </View>
        }
        onContentSizeChange={() => {
          if (user.messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      {showSymptomLogger && selectedOrgan ? (
        <SymptomLoggerModal
          organ={selectedOrgan}
          onClose={() => {
            setShowSymptomLogger(false);
            setSelectedOrgan(undefined);
          }}
          onSubmit={handleLogSymptom}
          theme={theme}
          language={language}
          isRTL={isRTL}
          t={t}
        />
      ) : null}

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
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.text, textAlign: isRTL ? "right" : "left" },
            ]}
            placeholder={t("typeMessage")}
            placeholderTextColor={theme.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            editable={chatUnlocked}
            multiline
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!chatUnlocked || !messageText.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: SaleemColors.accent, opacity: chatUnlocked && messageText.trim() ? 1 : 0.5 },
            ]}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function SymptomLoggerModal({ 
  organ, 
  onClose, 
  onSubmit,
  theme,
  language,
  isRTL,
  t,
}: {
  organ: string;
  onClose: () => void;
  onSubmit: (severity: number, description: string) => void;
  theme: any;
  language: string;
  isRTL: boolean;
  t: (key: string) => string;
}) {
  const [severity, setSeverity] = useState(5);
  const [description, setDescription] = useState("");

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      style={[styles.symptomModal, { backgroundColor: theme.cardBackground }, Shadows.large]}
    >
      <View style={[styles.symptomHeader, isRTL && { flexDirection: "row-reverse" }]}>
        <ThemedText type="h4">{organ.charAt(0).toUpperCase() + organ.slice(1)}</ThemedText>
        <Pressable onPress={onClose}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
      </View>
      
      <View style={styles.severityContainer}>
        <ThemedText type="body" style={{ marginBottom: Spacing.sm }}>
          {t("severity")}: {severity}/10
        </ThemedText>
        <View style={styles.severityButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <Pressable
              key={num}
              onPress={() => setSeverity(num)}
              style={[
                styles.severityButton,
                {
                  backgroundColor: severity >= num 
                    ? (num <= 3 ? SaleemColors.accent : num <= 6 ? SaleemColors.warning : SaleemColors.error)
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <ThemedText 
                type="caption" 
                style={{ color: severity >= num ? "#FFFFFF" : theme.text }}
              >
                {num}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
      
      <TextInput
        style={[
          styles.descriptionInput,
          { 
            backgroundColor: theme.backgroundSecondary, 
            color: theme.text,
            textAlign: isRTL ? "right" : "left",
          },
        ]}
        placeholder={language === "ar" ? "صف الأعراض..." : "Describe symptoms..."}
        placeholderTextColor={theme.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />
      
      <Pressable
        onPress={() => onSubmit(severity, description)}
        style={[styles.submitButton, { backgroundColor: SaleemColors.accent }]}
      >
        <ThemedText type="button" style={{ color: "#FFFFFF" }}>
          {t("submitSymptom")}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bodyMapSection: {
    marginVertical: Spacing.xl,
  },
  lockedCard: {
    alignItems: "center",
    padding: Spacing.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    marginTop: Spacing.xl,
  },
  emptyChat: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
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
  symptomModal: {
    position: "absolute",
    bottom: 120,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  symptomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  severityContainer: {
    marginBottom: Spacing.lg,
  },
  severityButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  severityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInput: {
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: Spacing.lg,
  },
  submitButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
