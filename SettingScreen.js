import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, Icon } from 'react-native-elements';

const SettingScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
          <Icon name="arrow-back" color="#fff" />
        </TouchableOpacity>
        {/* <TouchableOpacity>
          <Icon name="settings" color="#fff" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.username}>OO님</Text>
        <Text style={styles.subText}>안녕하세요 OO님</Text>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingCardHeader}>
          <Text style={styles.settingTitle}>알람 설정 시간</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Alarm')} >
            <Icon name="alarm" color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingOptions}>
          <Text style={styles.settingOption}>시간</Text>
          <Text style={styles.settingOption}>지역</Text>
          <Text style={styles.settingOption}>반복 구간</Text>
          <Text style={styles.settingOption}>ON / OFF</Text>
        </View>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingCardHeader}>
          <Text style={styles.settingTitle}>개인 정보 설정</Text>
          <TouchableOpacity>
            <Icon name="security" color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.settingOptions}>
          <Text style={styles.settingOption}>비밀번호 설정</Text>
          <Text style={styles.settingOption}>자주 가는 지역 설정</Text>
          <Text style={styles.settingOption}>차량 탈퇴</Text>
        </View>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackText}>문제나 개선 사항이 있습니까?</Text>
        <TouchableOpacity style={styles.feedbackButton}>
          <Text style={styles.feedbackButtonText}>Send Feedback</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subText: {
    color: '#ddd',
    fontSize: 14,
  },
  settingCard: {
    backgroundColor: '#84C187',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  settingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingOptions: {
    marginLeft: 10,
  },
  settingOption: {
    fontSize: 14,
    marginBottom: 5,
  },
  feedbackSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  feedbackButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingScreen;