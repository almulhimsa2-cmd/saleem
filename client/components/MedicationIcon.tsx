import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { SaleemColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "@/contexts/LanguageContext";

type MedicationType = "pills" | "spray" | "inhaler" | "injection" | "drops" | "cream";

interface MedicationIconProps {
  type: MedicationType;
  selected?: boolean;
  onPress?: () => void;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const medicationConfig: Record<MedicationType, { icon: string; color: string; labelEn: string; labelAr: string }> = {
  pills: { icon: "circle", color: "#E53E3E", labelEn: "Pills", labelAr: "حبوب" },
  spray: { icon: "wind", color: "#3182CE", labelEn: "Spray", labelAr: "بخاخ" },
  inhaler: { icon: "cloud", color: "#805AD5", labelEn: "Inhaler", labelAr: "جهاز استنشاق" },
  injection: { icon: "activity", color: "#DD6B20", labelEn: "Injection", labelAr: "حقنة" },
  drops: { icon: "droplet", color: "#38A169", labelEn: "Drops", labelAr: "قطرات" },
  cream: { icon: "layers", color: "#D69E2E", labelEn: "Cream", labelAr: "كريم" },
};

export function MedicationIcon({ 
  type, 
  selected = false, 
  onPress,
  size = "medium",
  showLabel = true,
}: MedicationIconProps) {
  const { theme, isDark } = useTheme();
  const { language } = useLanguage();
  const config = medicationConfig[type];

  const getDimensions = () => {
    switch (size) {
      case "small":
        return { container: 48, icon: 20 };
      case "medium":
        return { container: 64, icon: 28 };
      case "large":
        return { container: 80, icon: 36 };
      default:
        return { container: 64, icon: 28 };
    }
  };

  const dims = getDimensions();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      style={[
        styles.container,
        { opacity: onPress ? 1 : 0.9 },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            width: dims.container,
            height: dims.container,
            backgroundColor: selected ? config.color : config.color + "20",
            borderColor: config.color,
            borderWidth: selected ? 0 : 2,
          },
        ]}
      >
        <Feather
          name={config.icon as any}
          size={dims.icon}
          color={selected ? "#FFFFFF" : config.color}
        />
      </View>
      {showLabel ? (
        <ThemedText 
          type="caption" 
          style={[
            styles.label,
            selected && { color: config.color, fontWeight: "600" },
          ]}
        >
          {language === "ar" ? config.labelAr : config.labelEn}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export function MedicationTypeSelector({
  selectedType,
  onSelect,
}: {
  selectedType?: MedicationType;
  onSelect: (type: MedicationType) => void;
}) {
  const types: MedicationType[] = ["pills", "spray", "inhaler", "injection", "drops", "cream"];

  return (
    <View style={styles.selectorContainer}>
      {types.map((type) => (
        <MedicationIcon
          key={type}
          type={type}
          selected={selectedType === type}
          onPress={() => onSelect(type)}
          size="medium"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  iconContainer: {
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  selectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.md,
  },
});
