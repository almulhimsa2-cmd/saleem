import React, { useState, useEffect, useCallback } from "react";
import {
  View, StyleSheet, FlatList, Pressable, TextInput, Modal, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface ChatItem {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName?: string;
  patientName?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function MessagesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [clinicCode, setClinicCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [joining, setJoining] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/chats", baseUrl).href, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
      const interval = setInterval(fetchChats, 5000);
      return () => clearInterval(interval);
    }, [fetchChats])
  );

  const handleJoinClinic = async () => {
    if (!clinicCode.trim() || !user) return;
    setCodeError("");
    setJoining(true);
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/chats/join", baseUrl).href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ clinicCode: clinicCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.message || "Invalid code");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowCodeModal(false);
        setClinicCode("");
        fetchChats();
        navigation.navigate("Chat", {
          chatId: data.chat.id,
          chatName: data.doctorName,
        });
      }
    } catch (error) {
      setCodeError(language === "ar" ? "خطأ في الاتصال" : "Connection error");
    } finally {
      setJoining(false);
    }
  };

  const renderChat = ({ item }: { item: ChatItem }) => {
    const name = user?.type === "patient" ? item.doctorName : item.patientName;
    return (
      <Pressable
        onPress={() => navigation.navigate("Chat", { chatId: item.id, chatName: name })}
        style={[styles.chatItem, { backgroundColor: theme.cardBackground }]}
        testID={`chat-item-${item.id}`}
      >
        <View style={[styles.avatar, { backgroundColor: SaleemColors.primary + "20" }]}>
          <Feather
            name={user?.type === "patient" ? "briefcase" : "user"}
            size={24}
            color={SaleemColors.primary}
          />
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <ThemedText type="h4" style={{ flex: 1 }} numberOfLines={1}>
              {name || (language === "ar" ? "غير معروف" : "Unknown")}
            </ThemedText>
            {item.lastMessageAt ? (
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {new Date(item.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.chatFooter}>
            <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }} numberOfLines={1}>
              {item.lastMessage || (language === "ar" ? "ابدأ المحادثة" : "Start chatting")}
            </ThemedText>
            {item.unreadCount > 0 ? (
              <View style={styles.badge}>
                <ThemedText type="caption" style={{ color: "#FFF", fontSize: 11 }}>
                  {item.unreadCount}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={SaleemColors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChat}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.md }}>
            <Disclaimer />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: SaleemColors.accent + "15" }]}>
              <Feather name="message-circle" size={40} color={SaleemColors.accent} />
            </View>
            <ThemedText type="h3" style={{ marginTop: Spacing.xl, textAlign: "center" }}>
              {language === "ar" ? "لا توجد محادثات بعد" : "No Chats Yet"}
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
              {user?.type === "patient"
                ? (language === "ar" ? "أدخل رمز المختص لبدء المحادثة" : "Enter a professional's access code to start chatting")
                : (language === "ar" ? "شارك رمز الدخول مع عملائك" : "Share your access code with clients")}
            </ThemedText>
            {user?.type === "patient" ? (
              <Button
                onPress={() => setShowCodeModal(true)}
                variant="primary"
                style={{ marginTop: Spacing.xl }}
                testID="button-enter-code"
              >
                {language === "ar" ? "إدخال رمز المختص" : "Enter Access Code"}
              </Button>
            ) : null}
          </View>
        }
      />

      {user?.type === "patient" ? (
        <Pressable
          onPress={() => setShowCodeModal(true)}
          style={[styles.fab, { bottom: tabBarHeight + Spacing.lg }]}
          testID="button-new-chat"
        >
          <Feather name="plus" size={24} color="#FFF" />
        </Pressable>
      ) : null}

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
                {language === "ar" ? "إلغاء" : "Cancel"}
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">
              {language === "ar" ? "رمز الدخول" : "Access Code"}
            </ThemedText>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.codeIconContainer, { backgroundColor: SaleemColors.primary + "15" }]}>
              <Feather name="key" size={48} color={SaleemColors.primary} />
            </View>

            <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.xl }}>
              {language === "ar" ? "أدخل رمز الدخول" : "Enter Access Code"}
            </ThemedText>

            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
              {language === "ar"
                ? "احصل على هذا الرمز من المختص"
                : "Get this code from your professional"}
            </ThemedText>

            {codeError ? (
              <View style={[styles.errorBox, { marginTop: Spacing.lg }]}>
                <Feather name="alert-circle" size={16} color={SaleemColors.error} />
                <ThemedText type="small" style={{ color: SaleemColors.error }}>{codeError}</ThemedText>
              </View>
            ) : null}

            <TextInput
              style={[
                styles.codeInput,
                {
                  backgroundColor: theme.cardBackground,
                  color: theme.text,
                  borderColor: clinicCode ? SaleemColors.accent : theme.border,
                },
              ]}
              placeholder="ABC123"
              placeholderTextColor={theme.textSecondary}
              value={clinicCode}
              onChangeText={(t) => setClinicCode(t.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              testID="input-clinic-code"
            />

            <Button
              onPress={handleJoinClinic}
              variant="primary"
              size="large"
              loading={joining}
              disabled={!clinicCode.trim()}
              style={{ marginTop: Spacing.xl, width: "100%" }}
              testID="button-join"
            >
              {language === "ar" ? "انضم" : "Join"}
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  chatItem: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  chatFooter: { flexDirection: "row", alignItems: "center", marginTop: Spacing.xs },
  badge: {
    backgroundColor: SaleemColors.accent,
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 6,
  },
  emptyState: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing["5xl"], paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
  },
  fab: {
    position: "absolute", right: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: SaleemColors.accent,
    alignItems: "center", justifyContent: "center",
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1,
  },
  modalContent: {
    flex: 1, padding: Spacing.xl, alignItems: "center", justifyContent: "center",
  },
  codeIconContainer: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: "center", justifyContent: "center",
  },
  codeInput: {
    width: "100%", height: 60, borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl, fontSize: 24, textAlign: "center",
    letterSpacing: 4, marginTop: Spacing.xl, borderWidth: 2,
  },
  errorBox: {
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: SaleemColors.error + "15",
    borderRadius: BorderRadius.xs,
  },
});
