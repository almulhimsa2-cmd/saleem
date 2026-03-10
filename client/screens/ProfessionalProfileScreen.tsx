import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';

export default function ProfessionalProfileScreen({ route }: any) {
  const [customCode, setCustomCode] = useState('ABC123');
  const [isEditing, setIsEditing] = useState(false);

  const handleChangeCode = async () => {
    const regex = /^[A-Z]{3}\d{3}$/;
    if (!regex.test(customCode.toUpperCase())) {
      Alert.alert('Invalid', 'Format: 3 letters + 3 numbers (e.g., ABC123)');
      return;
    }
    Alert.alert('Success', `Your code is now: ${customCode.toUpperCase()}`);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Professional Profile</Text>

      {/* Current Code */}
      <View style={styles.codeSection}>
        <Text style={styles.label}>Your Professional Code</Text>
        <Text style={styles.currentCode}>{customCode}</Text>
        <Text style={styles.hint}>
          Clients use this code to connect with you
        </Text>
      </View>

      {/* Edit Code Button */}
      {!isEditing ? (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.editBtnText}>Change Your Code</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.editSection}>
          <Text style={styles.label}>New Code (ABC123 format)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., ABC123"
            value={customCode}
            onChangeText={(text) => setCustomCode(text.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, styles.saveBtn]}
              onPress={handleChangeCode}
            >
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style