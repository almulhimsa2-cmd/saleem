import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';

// Sample clients - Replace with actual data from backend
const SAMPLE_CLIENTS = [
  { id: '1', name: 'Ahmed Ali', email: 'ahmed@example.com' },
  { id: '2', name: 'Fatima Hassan', email: 'fatima@example.com' },
  { id: '3', name: 'Mohammed Sara', email: 'mohammed@example.com' },
];

export default function CreateGroupScreen({ navigation }: any) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleToggleMember = (clientId: string) => {
    if (selectedMembers.includes(clientId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== clientId));
    } else {
      setSelectedMembers([...selectedMembers, clientId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Add at least one member');
      return;
    }

    Alert.alert('Success', `Group "${groupName}" created!`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>👥 Create Group</Text>

      {/* Group Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Group Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Pediatrics Team"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="What is this group for?"
          value={groupDescription}
          onChangeText={setGroupDescription}
          multiline
        />
      </View>

      {/* Members */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Add Members ({selectedMembers.length} selected)
        </Text>

        <FlatList
          data={SAMPLE_CLIENTS}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              onPress={() => handleToggleMember(item.id)}
            >
              <View>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberEmail}>{item.email}</Text>
              </View>
              <Text style={styles.checkbox}>
                {selectedMembers.includes(item.id) ? '✅' : '⬜'}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={handleCreateGroup}
      >
        <Text style={styles.createBtnText}>Create Group</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  memberEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  checkbox: {
    fontSize: 18,
  },
  createBtn: {
    backgroundColor: '#7EC972',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});