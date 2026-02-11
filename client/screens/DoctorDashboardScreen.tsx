import React, { useState, useEffect, useCallback } from "react";
import {
  View, StyleSheet, FlatList, Pressable, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface ChatItem {
  id: string;
  patientId: string;
  patientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  hasNotes: boolean;
}

export default function DoctorDashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { user, logout } = useAuth();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);

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

  const copyCode = async () => {
    if (user?.clinicCode) {
      await Clipboard.setStringAsync(user.clinicCode);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const totalUnread = chats.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="h2">
            {language === "ar" ? "لوحة التحكم" : "Dashboard"}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {user?.nameEn || user?.nameAr || ""}
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={() => navigation.navigate("DoctorProfile")} style={styles.iconBtn} testID="button-profile">
            <Feather name="user" size={22} color={theme.text} />
          </Pressable>
          <Pressable onPress={handleLogout} style={styles.iconBtn} testID="button-logout">
            <Feather name="log-out" size={22} color={SaleemColors.error} />
          </Pressable>
        </View>
      </View>

      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <Pressable onPress={copyCode} style={[styles.codeCard, { backgroundColor: SaleemColors.primary }]}>
          <View>
            <ThemedText type="small" style={{ color: "rgba(255,255,255,0.7)" }}>
              {language === "ar" ? "رمز العيادة" : "Clinic Code"}
            </ThemedText>
            <ThemedText type="h2" style={{ color: "#FFF", letterSpacing: 4 }}>
              {user?.clinicCode || "------"}
            </ThemedText>
          </View>
          <View style={styles.copyBtn}>
            <Feather name={codeCopied ? "check" : "copy"} size={20} color="#FFF" />
            <ThemedText type="caption" style={{ color: "#FFF" }}>
              {codeCopied
                ? (language === "ar" ? "تم النسخ" : "Copied")
                : (language === "ar" ? "نسخ" : "Copy")}
            </ThemedText>
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h2" style={{ color: SaleemColors.accent }}>{chats.length}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "مرضى" : "Patients"}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
          <ThemedText type="h2" style={{ color: SaleemColors.warning }}>{totalUnread}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {language === "ar" ? "غير مقروءة" : "Unread"}
          </ThemedText>
        </View>
      </Animated.View>

      <ThemedText type="h3" style={styles.sectionTitle}>
        {language === "ar" ? "المحادثات" : "Conversations"}
      </ThemedText>

      {loading ? (
        <ActivityIndicator size="large" color={SaleemColors.accent} style={{ marginTop: Spacing.xl }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg, flexGrow: 1 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("DoctorChat", { chatId: item.id, chatName: item.patientName, patientId: item.patientId })}
              style={[styles.chatItem, { backgroundColor: theme.cardBackground }]}
              testID={`chat-item-${item.id}`}
            >
              <View style={[styles.chatAvatar, { backgroundColor: SaleemColors.accent + "20" }]}>
                <Feather name="user" size={24} color={SaleemColors.accent} />
              </View>
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <ThemedText type="h4" style={{ flex: 1 }} numberOfLines={1}>{item.patientName}</ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" }) : ""}
                  </ThemedText>
                </View>
                <View style={styles.chatFooter}>
                  <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }} numberOfLines={1}>
                    {item.lastMessage || (language === "ar" ? "محادثة جديدة" : "New conversation")}
                  </ThemedText>
                  {item.unreadCount > 0 ? (
                    <View style={styles.badge}>
                      <ThemedText type="caption" style={{ color: "#FFF", fontSize: 11 }}>{item.unreadCount}</ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={theme.textSecondary} />
              <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
                {language === "ar" ? "لا توجد محادثات بعد. شارك رمز العيادة مع مرضاك" : "No conversations yet. Share your clinic code with patients"}
              </ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  headerLeft: {},
  headerActions: { flexDirection: "row", gap: Spacing.sm },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  codeCard: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: Spacing.xl, borderRadius: BorderRadius.md, marginBottom: Spacing.lg,
  },
  copyBtn: { alignItems: "center", gap: Spacing.xs },
  statsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.sm, alignItems: "center" },
  sectionTitle: { marginBottom: Spacing.md },
  chatItem: {
    flexDirection: "row", padding: Spacing.lg, borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm, gap: Spacing.md,
  },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  chatFooter: { flexDirection: "row", alignItems: "center", marginTop: Spacing.xs },
  badge: {
    backgroundColor: SaleemColors.accent, minWidth: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 6,
  },
  emptyState: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing["5xl"], paddingHorizontal: Spacing.xl,
  },
});
