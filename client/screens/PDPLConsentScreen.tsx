import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";

type PDPLConsentScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "PDPLConsent">;
};

export default function PDPLConsentScreen({ navigation }: PDPLConsentScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { updateUser } = useUser();
  const [accepted, setAccepted] = useState(false);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccepted(!accepted);
  };

  const handleAccept = () => {
    if (accepted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateUser({ pdplConsent: true, onboardingComplete: true });
    }
  };

  const points = [
    t("pdplPoint1"),
    t("pdplPoint2"),
    t("pdplPoint3"),
    t("pdplPoint4"),
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/consent-shield.png")}
              style={styles.shieldImage}
              resizeMode="contain"
            />
          </View>

          <ThemedText type="h2" style={[styles.title, isRTL && { textAlign: "right" }]}>
            {t("pdplTitle")}
          </ThemedText>
          <ThemedText 
            type="body" 
            style={[styles.subtitle, { color: theme.textSecondary }, isRTL && { textAlign: "right" }]}
          >
            {t("pdplSubtitle")}
          </ThemedText>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.descriptionContainer, { backgroundColor: theme.backgroundSecondary }]}
        >
          <ThemedText type="body" style={[styles.description, isRTL && { textAlign: "right" }]}>
            {t("pdplDescription")}
          </ThemedText>
          
          {points.map((point, index) => (
            <View 
              key={index} 
              style={[styles.pointRow, isRTL && { flexDirection: "row-reverse" }]}
            >
              <View style={[styles.pointIcon, { backgroundColor: SaleemColors.accent }]}>
                <Feather name="check" size={14} color="#FFFFFF" />
              </View>
              <ThemedText type="body" style={[styles.pointText, isRTL && { textAlign: "right" }]}>
                {point}
              </ThemedText>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Pressable 
            onPress={handleToggle}
            style={[
              styles.checkboxRow,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: accepted ? SaleemColors.accent : "transparent",
                  borderColor: accepted ? SaleemColors.accent : theme.textSecondary,
                },
              ]}
            >
              {accepted ? (
                <Feather name="check" size={16} color="#FFFFFF" />
              ) : null}
            </View>
            <ThemedText 
              type="small" 
              style={[styles.checkboxLabel, isRTL && { textAlign: "right" }]}
            >
              {t("pdplConsent")}
            </ThemedText>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          onPress={handleAccept}
          variant="primary"
          size="large"
          disabled={!accepted}
          testID="button-accept"
        >
          {t("iAccept")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  shieldImage: {
    width: 120,
    height: 120,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  descriptionContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  description: {
    marginBottom: Spacing.lg,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  pointIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pointText: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxLabel: {
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});
