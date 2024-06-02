import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWeatherData } from './WeatherScreen'; // Ensure this is properly imported

// 푸쉬 알림 함수
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function AlarmScreen({ navigation }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSilentModeEnabled, setIsSilentModeEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(new Date());

  // 음성 설정(무음 아닐시)
  useEffect(() => {
    loadStoredSettings();
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      if (!isSilentModeEnabled) {
        Speech.speak(notification.request.content.body);
      }
    });

    return () => subscription.remove();
  }, [isSilentModeEnabled]);

  // 저장하는 세팅값
  const loadStoredSettings = async () => {
    try {
      const storedTime = await AsyncStorage.getItem('notificationTime');
      const storedEnabled = await AsyncStorage.getItem('isEnabled');
      const storedSilentMode = await AsyncStorage.getItem('isSilentModeEnabled');
      
      if (storedTime !== null) {
        const parsedTime = new Date(storedTime);
        setTime(parsedTime);
      }
      
      if (storedEnabled !== null) {
        setIsEnabled(JSON.parse(storedEnabled));
      }
      
      if (storedSilentMode !== null) {
        setIsSilentModeEnabled(JSON.parse(storedSilentMode));
      }

      if (JSON.parse(storedEnabled)) {
        scheduleNotification(new Date(storedTime));
      }
    } catch (error) {
      console.error('Failed to load stored settings:', error);
    }
  };

  const scheduleNotification = async (time) => {
    const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const weatherData = await getWeatherData(latitude, longitude);

    if (time <= new Date()) {
      time.setDate(time.getDate() + 1); 
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    // 푸쉬 알림 값
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "오늘의 날씨",
        body: `현재 기온은 ${weatherData.main.temp}°이고 ${weatherData.weather[0].description} 예정 입니다.`,
        data: { data: 'weather data' },
      },
      // trigger : repeats: 매일 반복
      trigger: {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      },
    });

    await AsyncStorage.setItem('notificationTime', time.toString());
  };

  const onChangeTime = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);

    if (isEnabled) {
      scheduleNotification(currentTime);
      Alert.alert('알림', `알림 설정이 ${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 로 되셨습니다.`);
    }
  };

  // 알림 받기 토글
  const toggleSwitch = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await AsyncStorage.setItem('isEnabled', JSON.stringify(newValue));
    
    if (newValue) {
      scheduleNotification(time);
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  // 무음 모드 토글 설정
  const toggleSilentModeSwitch = async () => {
    const newValue = !isSilentModeEnabled;
    setIsSilentModeEnabled(newValue);
    await AsyncStorage.setItem('isSilentModeEnabled', JSON.stringify(newValue));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>알림 설정</Text>
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>알림 받기</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.optionContainer}>
        <Text style={styles.label}>시간</Text>
        <Text style={styles.optionValue}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onChangeTime}
        />
      )}
      <TouchableOpacity onPress={() => console.log('Change Location')} style={styles.optionContainer}>
        <Text style={styles.label}>위치</Text>
        <Text style={styles.optionValue}>지정 위치</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Change Condition')} style={styles.optionContainer}>
        <Text style={styles.label}>조건</Text>
        <Text style={styles.optionValue}>매일</Text>
      </TouchableOpacity>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>무음모드</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isSilentModeEnabled ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={toggleSilentModeSwitch}
          value={isSilentModeEnabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginLeft: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionValue: {
    fontSize: 18,
    color: '#007AFF',
  },
});
