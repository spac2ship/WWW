import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { auth, database } from './firebaseConfig';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, remove } from 'firebase/database';

const DeleteAccountScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');

  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        
        // Realtime Database에서 사용자 데이터 삭제
        const userRef = ref(database, 'users/' + user.uid);
        await remove(userRef);
        
        // Firebase Authentication에서 사용자 계정 삭제
        await deleteUser(user);
        
        Alert.alert("Success", "계정이 성공적으로 삭제되었습니다.");
        navigation.navigate('Login');
      } else {
        Alert.alert("Error", "로그인된 사용자가 없습니다.");
      }
    } catch (error) {
      console.error("Error deleting user: ", error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "잘못된 비밀번호입니다. 다시 시도해주세요.");
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Error", "민감한 작업을 수행하기 전에 다시 로그인해야 합니다.");
      } else {
        Alert.alert("Error", "계정 삭제 중 문제가 발생했습니다.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원 탈퇴</Text>
      <Text style={styles.warningText}>정말로 회원 탈퇴를 하시겠습니까?</Text>
      <TextInput
        style={styles.input}
        placeholder="비밀번호를 입력해주세요"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>회원 탈퇴</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>취소</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 40,
  },
  warningText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
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
    backgroundColor: '#ff4d4d',
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
  cancelButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default DeleteAccountScreen;