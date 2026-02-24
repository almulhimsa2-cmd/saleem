import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import DoctorNavigator from "@/navigation/DoctorNavigator";
import RoleSelectScreen from "@/screens/RoleSelectScreen";
import PatientLoginScreen from "@/screens/PatientLoginScreen";
import PatientRegisterScreen from "@/screens/PatientRegisterScreen";
import DoctorLoginScreen from "@/screens/DoctorLoginScreen";
import DoctorRegisterScreen from "@/screens/DoctorRegisterScreen";
import EmailVerificationScreen from "@/screens/EmailVerificationScreen";
import ChatScreen from "@/screens/ChatScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SaleemColors } from "@/constants/theme";

export type RootStackParamList = {
  RoleSelect: undefined;
  PatientLogin: undefined;
  PatientRegister: undefined;
  DoctorLogin: undefined;
  DoctorRegister: undefined;
  EmailVerification: { email: string; userType: "patient" | "doctor" };
  MainTabs: undefined;
  DoctorTabs: undefined;
  Chat: { chatId: string; chatName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={SaleemColors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      {user ? (
        user.type === "doctor" ? (
          <>
            <Stack.Screen name="DoctorTabs" component={DoctorNavigator} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerShown: true,
                headerBackTitle: "",
                headerTitle: language === "ar" ? "محادثة" : "Chat",
              }}
            />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
          <Stack.Screen name="PatientLogin" component={PatientLoginScreen} options={{ headerShown: true, headerBackTitle: "", headerTitle: language === "ar" ? "تسجيل الدخول" : "Login" }} />
          <Stack.Screen name="PatientRegister" component={PatientRegisterScreen} options={{ headerShown: true, headerBackTitle: "", headerTitle: language === "ar" ? "تسجيل جديد" : "Register" }} />
          <Stack.Screen name="DoctorLogin" component={DoctorLoginScreen} options={{ headerShown: true, headerBackTitle: "", headerTitle: language === "ar" ? "دخول الطبيب" : "Doctor Login" }} />
          <Stack.Screen name="DoctorRegister" component={DoctorRegisterScreen} options={{ headerShown: true, headerBackTitle: "", headerTitle: language === "ar" ? "تسجيل طبيب" : "Doctor Register" }} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ headerShown: true, headerBackTitle: "", headerTitle: language === "ar" ? "تحقق من البريد" : "Verify Email" }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
