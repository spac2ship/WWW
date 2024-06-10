import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from './firebaseConfig'; 
import { sendPasswordResetEmail } from 'firebase/auth';

const ChangePasswordScreen2 = ({ route, navigation }) => {
  const { email: initialEmail } = route.params;
  const [email, setEmail] = useState(initialEmail || '');

  const handleSendPasswordResetEmail = async () => {
    if (!email) {
      Alert.alert("Error", "이메일을 입력해주세요.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "비밀번호 재설정 이메일이 전송되었습니다.");
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error sending password reset email:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일을 입력해주세요"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendPasswordResetEmail}>
        <Text style={styles.buttonText}>비밀번호 재설정 이메일 보내기</Text>
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
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
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

export default ChangePasswordScreen2;