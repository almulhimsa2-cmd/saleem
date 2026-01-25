import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Svg, { Path, Circle, Ellipse, G } from "react-native-svg";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/hooks/useTheme";
import { SaleemColors } from "@/constants/theme";
import { ThemedText } from "./ThemedText";

interface BodyMapProps {
  onOrganPress: (organ: string) => void;
  selectedOrgan?: string;
}

const organs = [
  { id: "head", name: "Head", nameAr: "الرأس", cx: 50, cy: 20, r: 15 },
  { id: "throat", name: "Throat", nameAr: "الحلق", cx: 50, cy: 38, r: 5 },
  { id: "chest", name: "Chest", nameAr: "الصدر", cx: 50, cy: 55, r: 12 },
  { id: "stomach", name: "Stomach", nameAr: "المعدة", cx: 50, cy: 75, r: 10 },
  { id: "leftArm", name: "Left Arm", nameAr: "الذراع الأيسر", cx: 25, cy: 60, r: 8 },
  { id: "rightArm", name: "Right Arm", nameAr: "الذراع الأيمن", cx: 75, cy: 60, r: 8 },
  { id: "leftLeg", name: "Left Leg", nameAr: "الساق اليسرى", cx: 40, cy: 115, r: 8 },
  { id: "rightLeg", name: "Right Leg", nameAr: "الساق اليمنى", cx: 60, cy: 115, r: 8 },
];

export function BodyMap({ onOrganPress, selectedOrgan }: BodyMapProps) {
  const { theme, isDark } = useTheme();
  
  const bodyColor = isDark ? "#4A5568" : "#CBD5E0";
  const selectedColor = SaleemColors.accent;
  const hoverColor = SaleemColors.primary + "40";

  const handlePress = (organId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOrganPress(organId);
  };

  return (
    <View style={styles.container}>
      <Svg width={200} height={280} viewBox="0 0 100 140">
        <Circle cx="50" cy="20" r="15" fill={bodyColor} />
        
        <Ellipse cx="50" cy="55" rx="18" ry="22" fill={bodyColor} />
        
        <Path
          d="M32 45 L15 75 L20 78 L35 55"
          fill={bodyColor}
        />
        <Path
          d="M68 45 L85 75 L80 78 L65 55"
          fill={bodyColor}
        />
        
        <Path
          d="M35 77 L38 130 L45 130 L50 85 L55 130 L62 130 L65 77"
          fill={bodyColor}
        />

        {organs.map((organ) => (
          <G key={organ.id}>
            <Circle
              cx={organ.cx}
              cy={organ.cy}
              r={organ.r}
              fill={selectedOrgan === organ.id ? selectedColor : "transparent"}
              opacity={0.5}
              onPress={() => handlePress(organ.id)}
            />
            <Circle
              cx={organ.cx}
              cy={organ.cy}
              r={organ.r}
              fill="transparent"
              stroke={selectedOrgan === organ.id ? selectedColor : "transparent"}
              strokeWidth={2}
              onPress={() => handlePress(organ.id)}
            />
          </G>
        ))}
      </Svg>
      
      <View style={styles.organButtons}>
        {organs.map((organ) => (
          <Pressable
            key={organ.id}
            style={[
              styles.organButton,
              selectedOrgan === organ.id && { backgroundColor: selectedColor + "20" },
            ]}
            onPress={() => handlePress(organ.id)}
          >
            <ThemedText
              type="caption"
              style={[
                styles.organLabel,
                selectedOrgan === organ.id && { color: selectedColor },
              ]}
            >
              {organ.name}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  organButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  organButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  organLabel: {
    fontSize: 12,
  },
});
