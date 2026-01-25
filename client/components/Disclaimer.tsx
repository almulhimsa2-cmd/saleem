import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SaleemColors } from "@/constants/theme";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "@/contexts/LanguageContext";

export function Disclaimer() {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: SaleemColors.warning + "15" }]}>
      <Feather name="alert-triangle" size={14} color={SaleemColors.warning} />
      <ThemedText 
        type="caption" 
        style={[
          styles.text, 
          { color: SaleemColors.warning },
          isRTL && { textAlign: "right" },
        ]}
      >
        {t("disclaimer")}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
  },
  text: {
    flex: 1,
  },
});
