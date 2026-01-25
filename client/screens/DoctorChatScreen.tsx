import React, { useState, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { Spacing, SaleemColors, BorderRadius, Shadows } from "@/constants/theme";
import { DoctorStackParamList } from "@/navigation/DoctorNavigator";

type DoctorChatScreenProps = {
  navigation: NativeStackNavigationProp<DoctorStackParamList, "DoctorChat">;
  route: RouteProp<DoctorStackParamList, "DoctorChat">;
};

interface Message {
  id: string;
  text: string;
  sender: "patient" | "doctor";
  timestamp: string;
}

export default function DoctorChatScreen({ navigation, route }: DoctorChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { language, isRTL } = useLanguage();
  const { patientName, patientId } = route.params;
  
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: language === "ar" ? "مرحباً دكتور، أحتاج استشارة" : "Hello doctor, I need a consultation",
      sender: "patient",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      text: language === "ar" ? "أهلاً، كيف يمكنني مساعدتك؟" : "Hello, how can I help you?",
      sender: "doctor",
      timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: "3",
      text: language === "ar" ? "لدي صداع متكرر منذ أسبوع" : "I've had recurring headaches for a week",
      sender: "patient",
      timestamp: new Date(Date.now() - 3400000).toISOString(),
    },
  ]);
  const flatListRef = useRef<FlatList>(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: patientName,
    });
  }, [navigation, patientName]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        sender: "doctor",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessageText("");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isDoctor = item.sender === "doctor";
    return (
      <Animated.View entering={FadeIn.duration(200)}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isDoctor ? SaleemColors.primary : theme.cardBackground,
              alignSelf: isDoctor ? "flex-end" : "flex-start",
            },
            Shadows.small,
          ]}
        >
          {!isDoctor ? (
            <View style={styles.senderLabel}>
              <ThemedText type="caption" style={{ color: SaleemColors.accent }}>
                {patientName}
              </ThemedText>
            </View>
          ) : null}
          <ThemedText 
            type="body" 
            style={{ color: isDoctor ? "#FFFFFF" : theme.text }}
          >
            {item.text}
          </ThemedText>
          <ThemedText 
            type="caption" 
            style={{ 
              color: isDoctor ? "rgba(255,255,255,0.7)" : theme.textSecondary,
              marginTop: Spacing.xs,
              textAlign: isDoctor ? "right" : "left",
            }}
          >
            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </ThemedText>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: Spacing.lg,
        }}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      <View 
        style={[
          styles.inputContainer, 
          { 
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.sm,
            borderTopColor: theme.border,
          },
        ]}
      >
        <View 
          style={[
            styles.inputRow,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: theme.text, textAlign: isRTL ? "right" : "left" },
            ]}
            placeholder={language === "ar" ? "اكتب ردك..." : "Type your reply..."}
            placeholderTextColor={theme.textSecondary}
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: SaleemColors.primary, opacity: messageText.trim() ? 1 : 0.5 },
            ]}
          >
            <Feather name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  senderLabel: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
