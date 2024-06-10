import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { database } from './firebaseConfig'; // 경로를 실제 파일 위치에 맞게 수정하세요
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ref, push, onValue, query, orderByChild, equalTo } from 'firebase/database';

const FeedbackScreen = ({ navigation }) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 사용자 로그인 시 사용자 UID로 피드백 목록 가져오기
        const feedbackRef = query(ref(database, 'feedbacks'), orderByChild('uid'), equalTo(user.uid));
        onValue(feedbackRef, (snapshot) => {
          const data = snapshot.val();
          const feedbackArray = data ? Object.keys(data).map(key => data[key]) : [];
          setFeedbackList(feedbackArray);
          
          // 사용자가 이미 피드백을 제출했는지 확인
          const userFeedback = feedbackArray.find(feedback => feedback.uid === user.uid);
          setHasSubmitted(!!userFeedback);
        });
      } else {
        // 사용자 로그아웃 시 피드백 목록 초기화
        setFeedbackList([]);
        setHasSubmitted(false);
      }
    });

    // 컴포넌트 언마운트 시 구독 해제
    return () => unsubscribe();
  }, [auth]);

  const handleSendFeedback = () => {
    if (feedback.trim()) {
      if (hasSubmitted) {
        Alert.alert('이미 피드백을 제출하셨습니다.');
        return;
      }

      const newFeedback = {
        uid: user ? user.uid : 'anonymous', // 사용자 UID
        email: user ? user.email : 'anonymous@domain.com', // 사용자 이메일 또는 익명 이메일
        feedback: feedback.trim(),
        timestamp: new Date().toISOString()
      };

      // Firebase에 피드백 저장
      const feedbackRef = ref(database, 'feedbacks');
      push(feedbackRef, newFeedback)
        .then(() => {
          setFeedbackList((prevFeedbackList) => [...prevFeedbackList, newFeedback]);
          setFeedback('');
          setHasSubmitted(true);
          Alert.alert('피드백이 전송되었습니다.');
        })
        .catch((error) => {
          console.error('Error writing to database: ', error);
          Alert.alert('피드백 전송에 실패했습니다.');
        });
    } else {
      Alert.alert('피드백을 입력해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>피드백 보내기</Text>
      <TextInput
        style={styles.input}
        placeholder="피드백을 입력해주세요"
        placeholderTextColor="#ccc"
        multiline
        value={feedback}
        onChangeText={setFeedback}
        editable={!hasSubmitted} // 이미 제출한 경우 입력 비활성화
      />
      <TouchableOpacity style={styles.button} onPress={handleSendFeedback} disabled={hasSubmitted}>
        <Text style={styles.buttonText}>{hasSubmitted ? '제출 완료' : '제출'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.listButton]}
        onPress={() => navigation.navigate('FeedbackList')}
      >
        <Text style={styles.buttonText}>목록</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 200,
    borderColor: '#84C187',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  listButton: {
    backgroundColor: '#84C187',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default FeedbackScreen;