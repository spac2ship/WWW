import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, firestore } from './firebaseConfig'; 
import { sendPasswordResetEmail } from 'firebase/auth';

const ChangePasswordScreen2 = ({ route, navigation }) => {
  const { email } = route.params;

  const handleSendPasswordResetEmail = async () => {
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
      <Text style={styles.infoText}>{`비밀번호 재설정을 위해 ${email}로 이메일을 보내겠습니다.`}</Text>

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
  infoText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
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
