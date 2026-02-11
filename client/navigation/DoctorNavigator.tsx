import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DoctorDashboardScreen from "@/screens/DoctorDashboardScreen";
import DoctorChatScreen from "@/screens/DoctorChatScreen";
import DoctorProfileScreen from "@/screens/DoctorProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLanguage } from "@/contexts/LanguageContext";

export type DoctorStackParamList = {
  DoctorDashboard: undefined;
  DoctorChat: { chatId: string; chatName: string; patientId: string };
  DoctorProfile: undefined;
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });
  const { language } = useLanguage();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorChat"
        component={DoctorChatScreen}
        options={{
          headerTitle: language === "ar" ? "محادثة" : "Chat",
          headerBackTitle: "",
        }}
      />
      <Stack.Screen
        name="DoctorProfile"
        component={DoctorProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
