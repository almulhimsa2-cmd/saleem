import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, StyleSheet, FlatList, TextInput, Pressable, Modal, ScrollView,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderType: string;
  text: string;
  messageType: string;
  read: boolean;
  createdAt: string;
}

export default function DoctorChatScreen({ route, navigation }: any) {
  const { chatId, chatName, patientId } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: chatName || (language === "ar" ? "محادثة" : "Chat"),
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: Spacing.sm }}>
          <Pressable onPress={() => { loadNotes(); setShowNotesModal(true); }} testID="button-notes">
            <Feather name="edit-3" size={22} color={theme.text} />
          </Pressable>
          <Pressable onPress={() => setShowBlockModal(true)} testID="button-block-menu">
            <Feather name="more-vertical" size={22} color={theme.text} />
          </Pressable>
        </View>
      ),
    });
  }, [chatName, language, theme]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/chats/${chatId}/messages`, baseUrl).href, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [chatId, user]);

  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = messageText.trim();
    setMessageText("");

    const tempMsg: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      senderId: user.id,
      senderType: "doctor",
      text,
      messageType: "text",
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const baseUrl = getApiUrl();
      await fetch(new URL(`/api/chats/${chatId}/messages`, baseUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ text, messageType: "text" }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const loadNotes = async () => {
    if (!user || !patientId) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/doctors/notes/${patientId}`, baseUrl).href, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || "");
      }
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  };

  const saveNotes = async () => {
    if (!user || !patientId) return;
    setSavingNotes(true);
    try {
      const baseUrl = getApiUrl();
      await fetch(new URL(`/api/doctors/notes/${patientId}`, baseUrl).href, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ notes }),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowNotesModal(false);
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleBlock = async () => {
    if (!user || !patientId) return;
    try {
      const baseUrl = getApiUrl();
      await fetch(new URL(`/api/doctors/block/${patientId}`, baseUrl).href, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setShowBlockModal(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error blocking patient:", error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderType === "doctor";
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <View
          style={[
            styles.messageBubble,
            { backgroundColor: isMine ? SaleemColors.primary : theme.cardBackground, alignSelf: isMine ? "flex-end" : "flex-start" },
          ]}
        >
          {!isMine ? (
            <View style={styles.senderLabel}>
              <Feather name="user" size={12} color={SaleemColors.accent} />
              <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
                {language === "ar" ? "العميل" : "Client"}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText type="body" style={{ color: isMine ? "#FFFFFF" : theme.text }}>{item.text}</ThemedText>
          <ThemedText
            type="caption"
            style={{ color: isMine ? "rgba(255,255,255,0.7)" : theme.textSecondary, marginTop: Spacing.xs, textAlign: "right" }}
          >
            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </ThemedText>
        </View>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyChat}>
      <Feather name="message-circle" size={48} color={theme.textSecondary} />
      <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
        {language === "ar" ? "ابدأ المحادثة مع العميل" : "Start the conversation with client"}
      </ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        inverted={messages.length > 0}
        data={messages.toReversed()}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          flexGrow: messages.length === 0 ? 1 : undefined,
        }}
      />

      <View
        style={[styles.inputContainer, { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.sm, borderTopColor: theme.border }]}
      >
        <View style={[styles.inputRow, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text, textAlign: isRTL ? "right" : "left" }]}
            placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
            placeholderTextColor={theme.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            testID="input-message"
          />
          <Pressable
            onPress={handleSend}
            disabled={!messageText.trim()}
            style={[styles.sendButton, { backgroundColor: SaleemColors.accent, opacity: messageText.trim() ? 1 : 0.5 }]}
            testID="button-send"
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <Modal visible={showNotesModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowNotesModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowNotesModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>{language === "ar" ? "إلغاء" : "Cancel"}</ThemedText>
            </Pressable>
            <ThemedText type="h4">{language === "ar" ? "ملاحظات العميل" : "Client Notes"}</ThemedText>
            <View style={{ width: 60 }} />
          </View>
          <View style={styles.modalContent}>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
              {language === "ar" ? "ملاحظات خاصة (لا يراها العميل)" : "Private notes (client cannot see these)"}
            </ThemedText>
            <TextInput
              style={[styles.notesInput, { backgroundColor: theme.cardBackground, color: theme.text, textAlign: isRTL ? "right" : "left" }]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder={language === "ar" ? "اكتب ملاحظاتك هنا..." : "Write your notes here..."}
              placeholderTextColor={theme.textSecondary}
              textAlignVertical="top"
            />
            <Button onPress={saveNotes} variant="primary" size="large" loading={savingNotes} style={{ marginTop: Spacing.lg }}>
              {language === "ar" ? "حفظ الملاحظات" : "Save Notes"}
            </Button>
          </View>
        </View>
      </Modal>

      <Modal visible={showBlockModal} animationType="fade" transparent onRequestClose={() => setShowBlockModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowBlockModal(false)}>
          <View style={[styles.blockMenu, { backgroundColor: theme.cardBackground }]}>
            <Pressable onPress={handleBlock} style={styles.blockOption} testID="button-block">
              <Feather name="slash" size={20} color={SaleemColors.error} />
              <ThemedText type="body" style={{ color: SaleemColors.error }}>
                {language === "ar" ? "حظر العميل" : "Block Client"}
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageBubble: { maxWidth: "80%", padding: Spacing.md, borderRadius: BorderRadius.sm, marginBottom: Spacing.sm },
  senderLabel: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginBottom: Spacing.xs },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: Spacing["5xl"] },
  inputContainer: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, borderTopWidth: 1 },
  inputRow: { flexDirection: "row", alignItems: "flex-end", borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  input: { flex: 1, fontSize: 16, maxHeight: 100, paddingVertical: Spacing.xs },
  sendButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  modalContent: { flex: 1, padding: Spacing.xl },
  notesInput: { flex: 1, borderRadius: BorderRadius.sm, padding: Spacing.lg, fontSize: 16, minHeight: 200 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  blockMenu: { borderRadius: BorderRadius.sm, padding: Spacing.sm, width: "100%", maxWidth: 300 },
  blockOption: { flexDirection: "row", alignItems: "center", gap: Spacing.md, padding: Spacing.lg },
});
