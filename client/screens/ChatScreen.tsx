import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, StyleSheet, FlatList, TextInput, Pressable,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
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

export default function ChatScreen({ route, navigation }: any) {
  const { chatId, chatName } = route.params;
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: chatName || (language === "ar" ? "محادثة" : "Chat"),
    });
  }, [chatName, language]);

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
      senderType: user.type,
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ text, messageType: "text" }),
      });
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === user?.id;
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isMine ? SaleemColors.primary : theme.cardBackground,
              alignSelf: isMine ? "flex-end" : "flex-start",
            },
          ]}
        >
          {!isMine ? (
            <View style={styles.senderLabel}>
              <Feather name={item.senderType === "doctor" ? "briefcase" : "user"} size={12} color={SaleemColors.accent} />
              <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
                {item.senderType === "doctor"
                  ? (language === "ar" ? "المختص" : "Professional")
                  : (language === "ar" ? "العميل" : "Client")}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText type="body" style={{ color: isMine ? "#FFFFFF" : theme.text }}>
            {item.text}
          </ThemedText>
          <View style={styles.timeRow}>
            <ThemedText
              type="caption"
              style={{ color: isMine ? "rgba(255,255,255,0.7)" : theme.textSecondary }}
            >
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </ThemedText>
            {isMine ? (
              <Feather
                name={item.read ? "check-circle" : "check"}
                size={12}
                color={item.read ? SaleemColors.accent : "rgba(255,255,255,0.5)"}
                style={{ marginLeft: 4 }}
              />
            ) : null}
          </View>
        </View>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyChat}>
      <Feather name="message-circle" size={48} color={theme.textSecondary} />
      <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
        {language === "ar" ? "ابدأ المحادثة" : "Start the conversation"}
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
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.sm,
            borderTopColor: theme.border,
          },
        ]}
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
            style={[
              styles.sendButton,
              { backgroundColor: SaleemColors.accent, opacity: messageText.trim() ? 1 : 0.5 },
            ]}
            testID="button-send"
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  senderLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    justifyContent: "flex-end",
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
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
});
