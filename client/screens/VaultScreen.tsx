import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, Image, Modal, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import Animated, { FadeIn } from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, SaleemColors, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface VaultFile {
  id: string;
  patientId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();

  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState<"lab" | "radiology">("lab");
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!user) return;
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/vault", baseUrl).href, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching vault files:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchFiles();
    }, [fetchFiles])
  );

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: selectedType === "lab" ? ["application/pdf", "image/*"] : ["image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setUploading(true);
        const file = result.assets[0];
        const baseUrl = getApiUrl();

        const formData = new FormData();
        formData.append("type", selectedType);
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        } as any);

        const res = await fetch(new URL("/api/vault/upload", baseUrl).href, {
          method: "POST",
          headers: { Authorization: `Bearer ${user!.token}` },
          body: formData,
        });

        if (res.ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setShowUploadModal(false);
          fetchFiles();
        }
        setUploading(false);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!user) return;
    try {
      const baseUrl = getApiUrl();
      await fetch(new URL(`/api/vault/${fileId}`, baseUrl).href, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const renderFileItem = ({ item }: { item: VaultFile }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={[styles.fileItem, { backgroundColor: theme.cardBackground }]}>
        <View style={[styles.fileIcon, { backgroundColor: item.type === "lab" ? SaleemColors.primary + "20" : SaleemColors.accent + "20" }]}>
          <Feather
            name={item.type === "lab" ? "file-text" : "image"}
            size={24}
            color={item.type === "lab" ? SaleemColors.primary : SaleemColors.accent}
          />
        </View>
        <View style={[styles.fileInfo, isRTL && { alignItems: "flex-end" }]}>
          <ThemedText type="body" numberOfLines={1}>{item.fileName}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {new Date(item.uploadedAt).toLocaleDateString()} {" "}
            {item.type === "lab" ? t("labResults") : t("radiology")}
          </ThemedText>
        </View>
        <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color={SaleemColors.error} />
        </Pressable>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={SaleemColors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={files}
        keyExtractor={(item) => item.id}
        renderItem={renderFileItem}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListHeaderComponent={
          <View style={{ marginBottom: Spacing.lg }}>
            <Disclaimer />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="folder" size={64} color={theme.textSecondary} />
            <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>{t("noFiles")}</ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>{t("noFilesSubtitle")}</ThemedText>
          </View>
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: SaleemColors.accent, bottom: tabBarHeight + Spacing.lg }]}
        onPress={() => setShowUploadModal(true)}
        testID="button-upload"
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal visible={showUploadModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowUploadModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowUploadModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>{t("cancel")}</ThemedText>
            </Pressable>
            <ThemedText type="h4">{t("uploadFile")}</ThemedText>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalContent}>
            <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
              {language === "ar" ? "نوع الملف" : "File Type"}
            </ThemedText>
            <View style={styles.typeSelector}>
              <Pressable
                style={[styles.typeButton, selectedType === "lab" && { backgroundColor: SaleemColors.primary, borderColor: SaleemColors.primary }, { borderColor: theme.border }]}
                onPress={() => setSelectedType("lab")}
              >
                <Feather name="file-text" size={24} color={selectedType === "lab" ? "#FFFFFF" : theme.text} />
                <ThemedText type="button" style={selectedType === "lab" ? { color: "#FFFFFF" } : undefined}>{t("labResults")}</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.typeButton, selectedType === "radiology" && { backgroundColor: SaleemColors.accent, borderColor: SaleemColors.accent }, { borderColor: theme.border }]}
                onPress={() => setSelectedType("radiology")}
              >
                <Feather name="image" size={24} color={selectedType === "radiology" ? "#FFFFFF" : theme.text} />
                <ThemedText type="button" style={selectedType === "radiology" ? { color: "#FFFFFF" } : undefined}>{t("radiology")}</ThemedText>
              </Pressable>
            </View>

            <Button onPress={handleUpload} variant="primary" size="large" loading={uploading} style={{ marginTop: Spacing.lg }}>
              {language === "ar" ? "اختر ملف ورفعه" : "Choose & Upload File"}
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyState: { alignItems: "center", paddingVertical: Spacing["5xl"], paddingHorizontal: Spacing.xl },
  fileItem: { flexDirection: "row", alignItems: "center", padding: Spacing.md, borderRadius: BorderRadius.xs, marginBottom: Spacing.sm, gap: Spacing.md },
  fileIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  fileInfo: { flex: 1 },
  deleteButton: { padding: Spacing.sm },
  fab: { position: "absolute", right: Spacing.xl, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  modalContent: { padding: Spacing.xl },
  typeSelector: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.xl },
  typeButton: { flex: 1, alignItems: "center", padding: Spacing.lg, borderRadius: BorderRadius.sm, borderWidth: 2, gap: Spacing.sm },
});
