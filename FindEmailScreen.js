import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { database } from './firebaseConfig';
import { ref, query, orderByChild, equalTo, get } from 'firebase/database';

const FindEmailScreen = ({ navigation }) => {
  const [name, setName] = useState('');

  const handleFindEmail = async () => {
    if (!name) {
      Alert.alert("Error", "이름을 입력해주세요.");
      return;
    }

    try {
      console.log("Checking if name is registered in Realtime Database:", name);
      const usersRef = ref(database, 'users');
      const q = query(usersRef, orderByChild('name'), equalTo(name));
      const snapshot = await get(q);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        const foundEmail = Object.values(userData)[0].email; // 첫 번째 일치하는 사용자의 이메일을 가져옴
        Alert.alert("Success", `해당 이름으로 등록된 이메일은 ${foundEmail} 입니다.`, [
          { text: "OK", onPress: () => navigation.navigate('ChangePassword2', { email: foundEmail }) }
        ]);
      } else {
        Alert.alert("Error", "해당 이름으로 등록된 계정이 없습니다.");
      }
    } catch (error) {
      console.error("Error finding email in Realtime Database:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디(이메일) 찾기</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="이름을 입력해주세요"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleFindEmail}>
        <Text style={styles.buttonText}>이메일 찾기</Text>
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

export default FindEmailScreen;