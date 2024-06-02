import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from './firebaseConfig';

const SecondLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
    }, [])
  );

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User signed in: ', user);
      Alert.alert('Success', '로그인 성공!', [
        { text: 'OK', onPress: () => navigation.navigate('Weather') }
      ]);
    } catch (error) {
      console.error('Error signing in: ', error);
      Alert.alert('Error', '로그인 실패: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="이메일을 입력해주세요"
        style={styles.input}
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="비밀번호를 입력해주세요"
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => alert('이메일로 로그인')}>
        <Text style={styles.linkText}>이메일로 로그인</Text>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => alert('아이디 저장')}>
          <Text style={styles.linkText}>아이디 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('FindEmail')}>
          <Text style={styles.linkText}>아이디/비밀번호 찾기</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.signupPrompt}>
        아직 회원이 아니신가요?{' '}
        <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>회원가입</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#003366',
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#333',
    color: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  linkText: {
    color: '#007AFF',
    marginVertical: 10,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  signupPrompt: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
  },
  signupLink: {
    color: '#007AFF',
  },
});

export default SecondLoginScreen;
