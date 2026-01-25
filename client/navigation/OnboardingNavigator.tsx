import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "@/screens/WelcomeScreen";
import PDPLConsentScreen from "@/screens/PDPLConsentScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLanguage } from "@/contexts/LanguageContext";

export type OnboardingStackParamList = {
  Welcome: undefined;
  PDPLConsent: undefined;
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
    </Stack.Navigator>
  );
}
