import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from './firebaseConfig'; 
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const reauthenticate = async (currentPassword) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return reauthenticateWithCredential(user, credential);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "새 비밀번호가 일치하지 않습니다.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        
        await reauthenticate(currentPassword);
       
        await updatePassword(user, newPassword);
        Alert.alert("Success", "비밀번호가 성공적으로 변경되었습니다.");
        navigation.navigate('SecondLogin'); 
      } catch (error) {
        console.error("Error changing password:", error);
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 변경</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="현재 비밀번호"
          placeholderTextColor="#ccc"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호"
          placeholderTextColor="#ccc"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="새 비밀번호 확인"
          placeholderTextColor="#ccc"
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>비밀번호 변경</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003366',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  input: {
    height: 40,
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ChangePasswordScreen;