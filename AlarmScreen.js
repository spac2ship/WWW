import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, Platform, StyleSheet, Modal, TouchableWithoutFeedback  } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWeatherData } from './WeatherScreen'; 
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect hook

// 푸쉬 알림 함수
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});



export default function AlarmScreen({ route, navigation }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSilentModeEnabled, setIsSilentModeEnabled] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [condition, setCondition] = useState('매일');
  const [showConditionPicker, setShowConditionPicker] = useState(false); // 모달 표시 상태 변수 추가
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [location, setLocation] = useState('null');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationCity, setLocationCity] = useState('');
  const [locationRegion, setLocationRegion] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);


  
  useFocusEffect(
    useCallback(() => {
      loadStoredSettings();
    }, [])
  );

  useEffect(() => {
    const loadLocation = async () => {
      const storedLocation = await AsyncStorage.getItem('selectedLocation');
      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);
        setSelectedLocation(parsedLocation);
        setLocation({
          latitude: parsedLocation.latitude,
          longitude: parsedLocation.longitude
        });
        setLocationCity(parsedLocation.city);
        setLocationRegion(parsedLocation.region);
      }
    };
  
    loadLocation();
  }, []);

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

  // 지역 선택 값 가져오기
  useEffect(() => {
    if (route.params?.alarmLocation) {
      const { latitude, longitude, city, region } = route.params.alarmLocation;
      setLatitude(latitude);
      setLongitude(longitude);
      setLocationCity(city);
      setLocationRegion(region);
    }
  }, [route.params?.alarmLocation]);

  // 저장하는 세팅값
  const loadStoredSettings = async () => {
    try {
      const storedTime = await AsyncStorage.getItem('notificationTime');
      const storedEnabled = await AsyncStorage.getItem('isEnabled');
      const storedSilentMode = await AsyncStorage.getItem('isSilentModeEnabled');
      const storedCondition = await AsyncStorage.getItem('condition');
      const storedLocation = await AsyncStorage.getItem('selectedLocation');
  
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
  
      if (storedCondition !== null) {
        setCondition(storedCondition);
      }
  
      if (storedLocation !== null) {
        const parsedLocation = JSON.parse(storedLocation);
        setSelectedLocation(parsedLocation);
        setLocation({
          latitude: parsedLocation.latitude,
          longitude: parsedLocation.longitude,
        });
        setLocationCity(parsedLocation.city);
        setLocationRegion(parsedLocation.region);
      }
  
      if (JSON.parse(storedEnabled)) {
        scheduleNotification(new Date(storedTime));
      }
    } catch (error) {
      console.error('Failed to load stored settings:', error);
    }
  };

  // 눈 비 확인
  const isSnowOrRain = (weatherData) => {
    return weatherData.weather.some(condition => 
      condition.main === 'Snow' || condition.main === 'Rain'
    );
  };

  const scheduleNotification = async (time) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('위치 권한', '알림을 사용하려면 위치 권한이 필요합니다.');
      return;
    }

    const { latitude, longitude } = location;
    const weatherData = await getWeatherData(latitude, longitude);

    if (time <= new Date()) {
      time.setDate(time.getDate() + 1); 
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const isSnowOrRainDay = isSnowOrRain(weatherData);
    // 눈이나 비가 오는 날인지 확인

    if (condition === '매일' || (condition === '특정한 날에만 받기' && isSnowOrRainDay)) {
      const notificationMessage = `${locationRegion}, ${locationCity}의 현재 기온은 ${weatherData.main.temp}°이고 ${weatherData.weather[0].description} 예정입니다.`;
      // 푸쉬 알림 값
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "오늘의 날씨",
          body: notificationMessage,
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
    }
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

  // 알림 조건 변경 함수
  const handleConditionChange = (newCondition) => {
    setCondition(newCondition);
    AsyncStorage.setItem('condition', newCondition);
    setShowConditionPicker(false); // 모달 닫기
    Alert.alert('조건 변경', `알림 조건이 "${newCondition}" 로 변경되었습니다.`);
  };

  // 위치 변경 함수
  const handleLocationSelected = async (location) => {
    try {
      const { latitude, longitude, city, region } = location;
      await AsyncStorage.setItem('selectedLocation', JSON.stringify(location));
      setSelectedLocation(location);
      setLocation({ latitude, longitude });
      setLocationCity(city);
      setLocationRegion(region);
      setShowLocationPicker(false);
      Alert.alert("알림", "검색 위치로 설정되었습니다.");
    } catch (error) {
      console.error("Error saving location information:", error);
    }
  };
  
  // 현재 위치 함수
  const handleCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location permission is required to use notifications.');
        return;
      }
  
      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
      const city = location[0]?.district || '';
      const region = location[0]?.region || '';
  
      setLocation({ latitude, longitude });
      setLocationCity(city);
      setLocationRegion(region);
      await AsyncStorage.setItem('selectedLocation', JSON.stringify({ latitude, longitude, city, region }));
  
      Alert.alert("알림", "현재 위치로 설정되었습니다.");
    } catch (error) {
      console.error("Error fetching current location:", error);
      Alert.alert("Error", "Error fetching current location.");
    }
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
      {/* <TouchableOpacity onPress={() => console.log('Change Location')} style={styles.optionContainer}> */}
      <TouchableOpacity onPress={() => setShowLocationPicker(true)} style={styles.optionContainer}>
        <Text style={styles.label}>위치</Text>
        <Text style={styles.optionValue}>{selectedLocation ? `${locationCity}, ${locationRegion}` : '현재 위치'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowConditionPicker(true)} style={styles.optionContainer}>
        <Text style={styles.label}>조건</Text>
        <Text style={styles.optionValue}>{condition}</Text>
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
      <Modal
        visible={showLocationPicker}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setShowLocationPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={handleCurrentLocation}
            style={styles.modalOption}
          >
            <Text style={styles.modalOptionText}>현재 위치</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('GoogleMap2', { onLocationSelected: handleLocationSelected })}
            style={styles.modalOption}
          >
            <Text style={styles.modalOptionText}>지역 검색</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        visible={showConditionPicker}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setShowConditionPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => handleConditionChange('매일')} style={styles.modalOption}>
            <Text style={[styles.modalOptionText, condition === '매일' && styles.selectedConditionText]}>매일 받기</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleConditionChange('특정한 날에만 받기')} style={styles.modalOption}>
            <Text style={[styles.modalOptionText, condition === '특정한 날에만 받기' && styles.selectedConditionText]}>특정한 날에만 받기</Text>
            <Text style={styles.explain}>● 눈이나 비가 올 때</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
  },
  modalOption: {
    paddingVertical: 15,
  },
  modalOptionText: {
    fontSize: 19,
    fontWeight: '600'
  },
  selectedConditionText: {
    color: '#007AFF',
  }, 
  explain: {
    fontSize: 15,
    color: '#000000',
    fontWeight: 'normal'
  },
  selectedConditionText: {
    color: '#007AFF',
  },
});
