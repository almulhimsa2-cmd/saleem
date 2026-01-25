import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "@/screens/WelcomeScreen";
import PDPLConsentScreen from "@/screens/PDPLConsentScreen";
import AvatarSetupScreen from "@/screens/AvatarSetupScreen";
import MedicineCabinetScreen from "@/screens/MedicineCabinetScreen";
import HealthBadgesScreen from "@/screens/HealthBadgesScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLanguage } from "@/contexts/LanguageContext";

export type OnboardingStackParamList = {
  Welcome: undefined;
  PDPLConsent: undefined;
  AvatarSetup: undefined;
  MedicineCabinet: undefined;
  HealthBadges: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  const screenOptions = useScreenOptions();
  const { t } = useLanguage();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PDPLConsent"
        component={PDPLConsentScreen}
        options={{
          headerTitle: t("pdplTitle"),
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="AvatarSetup"
        component={AvatarSetupScreen}
        options={{
          headerTitle: t("createHealthHero"),
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="MedicineCabinet"
        component={MedicineCabinetScreen}
        options={{
          headerTitle: t("medicineCabinet"),
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="HealthBadges"
        component={HealthBadgesScreen}
        options={{
          headerTitle: t("healthBadges"),
          headerBackTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
