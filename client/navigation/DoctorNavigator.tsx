import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DoctorLoginScreen from "@/screens/DoctorLoginScreen";
import DoctorDashboardScreen from "@/screens/DoctorDashboardScreen";
import DoctorChatScreen from "@/screens/DoctorChatScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useLanguage } from "@/contexts/LanguageContext";
import { SaleemColors } from "@/constants/theme";

export type DoctorStackParamList = {
  DoctorLogin: undefined;
  DoctorDashboard: { doctorName: string; specialty: string };
  DoctorChat: { patientName: string; patientId: string };
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });
  const { language } = useLanguage();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DoctorLogin"
        component={DoctorLoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DoctorDashboard"
        component={DoctorDashboardScreen}
        options={{ 
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DoctorChat"
        component={DoctorChatScreen}
        options={{
          headerTitle: language === "ar" ? "محادثة" : "Chat",
          headerBackTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
