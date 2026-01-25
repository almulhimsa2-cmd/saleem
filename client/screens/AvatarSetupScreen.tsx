import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Avatar } from "@/components/Avatar";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";
import { Spacing, SaleemColors, BorderRadius } from "@/constants/theme";
import { OnboardingStackParamList } from "@/navigation/OnboardingNavigator";

type AvatarSetupScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, "AvatarSetup">;
};

export default function AvatarSetupScreen({ navigation }: AvatarSetupScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, updateUser } = useUser();
  
  const [height, setHeight] = useState(user.height || 170);
  const [weight, setWeight] = useState(user.weight || 70);

  const handleContinue = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateUser({ height, weight });
    navigation.navigate("MedicineCabinet");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <ThemedText type="h2" style={[styles.title, isRTL && { textAlign: "right" }]}>
            {t("createHealthHero")}
          </ThemedText>
          <ThemedText 
            type="body" 
            style={[styles.subtitle, { color: theme.textSecondary }, isRTL && { textAlign: "right" }]}
          >
            {t("avatarSetupSubtitle")}
          </ThemedText>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.delay(200).duration(600)}
          style={styles.avatarContainer}
        >
          <Avatar height={height} weight={weight} size="large" showBadges={false} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.sliderContainer, { backgroundColor: theme.cardBackground }]}
        >
          <View style={[styles.sliderHeader, isRTL && { flexDirection: "row-reverse" }]}>
            <ThemedText type="h4">{t("height")}</ThemedText>
            <ThemedText type="h3" style={{ color: SaleemColors.accent }}>
              {Math.round(height)} {t("cm")}
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={120}
            maximumValue={220}
            value={height}
            onValueChange={setHeight}
            minimumTrackTintColor={SaleemColors.accent}
            maximumTrackTintColor={theme.backgroundSecondary}
            thumbTintColor={SaleemColors.accent}
          />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400).duration(500)}
          style={[styles.sliderContainer, { backgroundColor: theme.cardBackground }]}
        >
          <View style={[styles.sliderHeader, isRTL && { flexDirection: "row-reverse" }]}>
            <ThemedText type="h4">{t("weight")}</ThemedText>
            <ThemedText type="h3" style={{ color: SaleemColors.accent }}>
              {Math.round(weight)} {t("kg")}
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={200}
            value={weight}
            onValueChange={setWeight}
            minimumTrackTintColor={SaleemColors.accent}
            maximumTrackTintColor={theme.backgroundSecondary}
            thumbTintColor={SaleemColors.accent}
          />
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          onPress={handleContinue}
          variant="primary"
          size="large"
          testID="button-continue"
        >
          {t("next")}
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
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  sliderContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});
