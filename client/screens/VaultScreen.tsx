import React, { useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Image, Modal, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser, MedicalFile } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius, Shadows } from "@/constants/theme";

export default function VaultScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const { user, addFile, removeFile, toggleFileLock } = useUser();
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState<"lab" | "radiology">("lab");
  const [fileName, setFileName] = useState("");

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: selectedType === "lab" ? "application/pdf" : ["image/*"],
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addFile({
          id: "",
          name: fileName || file.name,
          type: selectedType,
          date: new Date().toISOString().split("T")[0],
          locked: true,
          uri: file.uri,
        });
        setShowUploadModal(false);
        setFileName("");
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  const handleMockUpload = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addFile({
      id: "",
      name: fileName || (selectedType === "lab" ? "Lab Results" : "X-Ray Image"),
      type: selectedType,
      date: new Date().toISOString().split("T")[0],
      locked: true,
    });
    setShowUploadModal(false);
    setFileName("");
  };

  const renderFileItem = ({ item }: { item: MedicalFile }) => (
    <Animated.View entering={FadeIn.duration(300)}>
      <Pressable
        style={[
          styles.fileItem,
          { backgroundColor: theme.cardBackground },
          Shadows.small,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleFileLock(item.id);
        }}
      >
        <View style={[styles.fileIcon, { backgroundColor: item.type === "lab" ? SaleemColors.primary + "20" : SaleemColors.accent + "20" }]}>
          <Feather
            name={item.type === "lab" ? "file-text" : "image"}
            size={24}
            color={item.type === "lab" ? SaleemColors.primary : SaleemColors.accent}
          />
        </View>
        
        <View style={[styles.fileInfo, isRTL && { alignItems: "flex-end" }]}>
          <ThemedText type="body" numberOfLines={1}>{item.name}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {item.date} • {item.type === "lab" ? t("labResults") : t("radiology")}
          </ThemedText>
        </View>
        
        <View style={styles.lockContainer}>
          <Feather
            name={item.locked ? "lock" : "unlock"}
            size={20}
            color={item.locked ? SaleemColors.error : SaleemColors.accent}
          />
          <ThemedText type="caption" style={{ color: item.locked ? SaleemColors.error : SaleemColors.accent }}>
            {item.locked ? t("locked") : t("unlocked")}
          </ThemedText>
        </View>
        
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeFile(item.id);
          }}
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={18} color={SaleemColors.error} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={user.files}
        keyExtractor={(item) => item.id}
        renderItem={renderFileItem}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListHeaderComponent={
          <View>
            <Disclaimer />
            <View style={{ height: Spacing.lg }} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Image
              source={require("../../assets/images/empty-vault.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
              {t("noFiles")}
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
              {t("noFilesSubtitle")}
            </ThemedText>
          </View>
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: SaleemColors.accent }]}
        onPress={() => setShowUploadModal(true)}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowUploadModal(false)}>
              <ThemedText type="button" style={{ color: theme.textSecondary }}>
                {t("cancel")}
              </ThemedText>
            </Pressable>
            <ThemedText type="h4">{t("uploadFile")}</ThemedText>
            <Pressable onPress={handleMockUpload}>
              <ThemedText type="button" style={{ color: SaleemColors.accent }}>
                {t("done")}
              </ThemedText>
            </Pressable>
          </View>
          
          <View style={styles.modalContent}>
            <ThemedText type="body" style={{ marginBottom: Spacing.md }}>
              {language === "ar" ? "نوع الملف" : "File Type"}
            </ThemedText>
            
            <View style={styles.typeSelector}>
              <Pressable
                style={[
                  styles.typeButton,
                  selectedType === "lab" && { backgroundColor: SaleemColors.primary, borderColor: SaleemColors.primary },
                  { borderColor: theme.border },
                ]}
                onPress={() => setSelectedType("lab")}
              >
                <Feather 
                  name="file-text" 
                  size={24} 
                  color={selectedType === "lab" ? "#FFFFFF" : theme.text} 
                />
                <ThemedText 
                  type="button" 
                  style={selectedType === "lab" ? { color: "#FFFFFF" } : undefined}
                >
                  {t("labResults")}
                </ThemedText>
              </Pressable>
              
              <Pressable
                style={[
                  styles.typeButton,
                  selectedType === "radiology" && { backgroundColor: SaleemColors.accent, borderColor: SaleemColors.accent },
                  { borderColor: theme.border },
                ]}
                onPress={() => setSelectedType("radiology")}
              >
                <Feather 
                  name="image" 
                  size={24} 
                  color={selectedType === "radiology" ? "#FFFFFF" : theme.text} 
                />
                <ThemedText 
                  type="button"
                  style={selectedType === "radiology" ? { color: "#FFFFFF" } : undefined}
                >
                  {t("radiology")}
                </ThemedText>
              </Pressable>
            </View>
            
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundSecondary, 
                  color: theme.text,
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              placeholder={language === "ar" ? "اسم الملف (اختياري)" : "File name (optional)"}
              placeholderTextColor={theme.textSecondary}
              value={fileName}
              onChangeText={setFileName}
            />
            
            <Button
              onPress={handleUpload}
              variant="outline"
              style={{ marginTop: Spacing.lg }}
            >
              {language === "ar" ? "اختر ملف" : "Choose File"}
            </Button>
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
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyImage: {
    width: 150,
    height: 150,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  lockContainer: {
    alignItems: "center",
    gap: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.medium,
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
    padding: Spacing.xl,
  },
  typeSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
});
