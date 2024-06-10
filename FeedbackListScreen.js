import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { database } from './firebaseConfig'; // 경로를 실제 파일 위치에 맞게 수정하세요
import { getAuth } from 'firebase/auth';
import { ref, onValue, set, remove, query, orderByChild, equalTo } from 'firebase/database';

const FeedbackListScreen = ({ navigation }) => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const feedbackRef = query(ref(database, 'feedbacks'), orderByChild('uid'), equalTo(user.uid));
      const unsubscribe = onValue(feedbackRef, (snapshot) => {
        const data = snapshot.val();
        const feedbackArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setFeedbackList(feedbackArray);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleDeleteFeedback = (id) => {
    const feedbackRef = ref(database, `feedbacks/${id}`);
    remove(feedbackRef)
      .then(() => {
        Alert.alert('삭제되었습니다', '', [{ text: '확인' }]);
      })
      .catch((error) => {
        console.error('Error deleting feedback: ', error);
        Alert.alert('삭제에 실패했습니다.');
      });
  };

  const handleEditFeedback = (index, item) => {
    setEditingIndex(index);
    setEditingText(item.feedback || '');
  };

  const handleSaveFeedback = (id, index) => {
    const feedbackRef = ref(database, `feedbacks/${id}`);
    set(feedbackRef, {
      ...feedbackList[index],
      feedback: editingText,
      timestamp: new Date().toISOString()
    })
      .then(() => {
        setEditingIndex(null);
        setEditingText('');
        Alert.alert('수정되었습니다', '', [{ text: '확인' }]);
      })
      .catch((error) => {
        console.error('Error updating feedback: ', error);
        Alert.alert('수정에 실패했습니다.');
      });
  };

  const renderItem = ({ item, index }) => {
    const isEditing = editingIndex === index;
    const displayText = (item.feedback && item.feedback.length > 100) ? `${item.feedback.substring(0, 100)}...` : item.feedback;

    return (
      <View style={styles.feedbackItem}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editingText}
            onChangeText={setEditingText}
            multiline
          />
        ) : (
          <Text style={styles.feedbackText}>{displayText}</Text>
        )}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity onPress={() => handleSaveFeedback(item.id, index)}>
              <Text style={styles.buttonText}>저장</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handleEditFeedback(index, item)}>
              <Text style={styles.buttonText}>수정</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDeleteFeedback(item.id)}>
            <Text style={styles.buttonText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>피드백 목록</Text>
      <FlatList
        data={feedbackList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
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
  feedbackItem: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  feedbackText: {
    color: '#fff',
  },
  editInput: {
    color: '#fff',
    borderColor: '#84C187',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
});

export default FeedbackListScreen;