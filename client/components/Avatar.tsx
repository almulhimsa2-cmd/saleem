import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Svg, { Path, Circle, Ellipse } from "react-native-svg";

import { useTheme } from "@/hooks/useTheme";
import { SaleemColors, Spacing, BorderRadius } from "@/constants/theme";
import { HealthBadge } from "@/contexts/UserContext";

interface AvatarProps {
  height: number;
  weight: number;
  badges?: HealthBadge[];
  size?: "small" | "medium" | "large";
  showBadges?: boolean;
}

const getBMIScale = (height: number, weight: number): number => {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  if (bmi < 18.5) return 0.85;
  if (bmi < 25) return 1;
  if (bmi < 30) return 1.1;
  return 1.2;
};

const getHeightScale = (height: number): number => {
  if (height < 150) return 0.85;
  if (height < 170) return 0.95;
  if (height < 190) return 1.05;
  return 1.15;
};

export function Avatar({ height, weight, badges = [], size = "medium", showBadges = true }: AvatarProps) {
  const { theme, isDark } = useTheme();
  
  const bmiScale = getBMIScale(height, weight);
  const heightScale = getHeightScale(height);
  
  const getDimensions = () => {
    switch (size) {
      case "small":
        return { width: 80, height: 120 };
      case "medium":
        return { width: 140, height: 200 };
      case "large":
        return { width: 200, height: 280 };
      default:
        return { width: 140, height: 200 };
    }
  };
  
  const dims = getDimensions();
  const bodyColor = isDark ? "#4A5568" : SaleemColors.primary;
  const accentColor = SaleemColors.accent;

  const organPositions: { [key: string]: { x: number; y: number } } = {
    brain: { x: 0.5, y: 0.1 },
    eyes: { x: 0.5, y: 0.12 },
    ears: { x: 0.35, y: 0.13 },
    nose: { x: 0.5, y: 0.14 },
    thyroid: { x: 0.5, y: 0.22 },
    heart: { x: 0.45, y: 0.35 },
    lungs: { x: 0.55, y: 0.33 },
    stomach: { x: 0.48, y: 0.45 },
    liver: { x: 0.4, y: 0.42 },
    pancreas: { x: 0.52, y: 0.48 },
    kidneys: { x: 0.55, y: 0.5 },
    intestines: { x: 0.5, y: 0.55 },
    joints: { x: 0.3, y: 0.6 },
    bones: { x: 0.7, y: 0.6 },
    muscles: { x: 0.35, y: 0.55 },
    blood: { x: 0.5, y: 0.4 },
    immune: { x: 0.6, y: 0.38 },
    skin: { x: 0.7, y: 0.3 },
  };

  return (
    <View style={[styles.container, { width: dims.width, height: dims.height }]}>
      <View style={[styles.glowOuter, { backgroundColor: accentColor + "20" }]} />
      <Svg
        width={dims.width}
        height={dims.height}
        viewBox="0 0 100 150"
        style={{ transform: [{ scaleX: bmiScale }, { scaleY: heightScale }] }}
      >
        <Circle cx="50" cy="20" r="15" fill={bodyColor} />
        <Ellipse cx="50" cy="60" rx={18 * bmiScale} ry="25" fill={bodyColor} />
        <Path
          d={`M32 85 L38 130 L44 130 L50 90 L56 130 L62 130 L68 85`}
          fill={bodyColor}
        />
        <Path
          d={`M32 45 L15 75 L20 77 L35 55`}
          fill={bodyColor}
        />
        <Path
          d={`M68 45 L85 75 L80 77 L65 55`}
          fill={bodyColor}
        />
        <Circle cx="45" cy="17" r="2" fill="#FFFFFF" opacity={0.8} />
        <Circle cx="55" cy="17" r="2" fill="#FFFFFF" opacity={0.8} />
      </Svg>
      
      {showBadges && badges.length > 0 ? (
        <View style={styles.badgesContainer}>
          {badges.slice(0, 5).map((badge, index) => {
            const position = organPositions[badge.organ] || { x: 0.5, y: 0.5 };
            return (
              <View
                key={badge.id}
                style={[
                  styles.badge,
                  {
                    left: position.x * dims.width - 10,
                    top: position.y * dims.height - 10,
                    backgroundColor: accentColor,
                  },
                ]}
              >
                <Feather name={badge.icon as any} size={12} color="#FFFFFF" />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowOuter: {
    position: "absolute",
    width: "120%",
    height: "120%",
    borderRadius: 100,
    opacity: 0.5,
  },
  badgesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
