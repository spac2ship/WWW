import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const value = await AsyncStorage.getItem('alreadyLaunched');
      if (value === null) {
        await AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
        navigation.replace('Login'); // 첫 실행이 아니면 바로 LoginScreen으로 이동
      }
    };

    checkFirstLaunch();
  }, [navigation]);

  const images = [
    require('./assets/WelcomeIcon-1.png'),
    require('./assets/WelcomeIcon-2.png'),
    require('./assets/WelcomeIcon-3.png')
  ];

  const titleTexts = [
    'WWW',
    '날씨 정보',
    '맞춤 추천'
  ];

  const subtitleTexts = [
    '앱에 오신것을 환영합니다',
    '옷 고민 끝! 추천 외투를 입고 나가보세요',
    '비 내리는 날,센치한 음악이 필요한 날\n여러분의 취향에 맞춰 추천해 드립니다'
  ];

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    scrollViewRef.current.scrollTo({ x: width * index, animated: true });
  };

  if (isFirstLaunch === null) {
    return null; // 로딩 상태일 때 아무 것도 렌더링하지 않음
  } else if (isFirstLaunch === true) {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
        >
          {images.map((imageSrc, index) => (
            <View key={index} style={[styles.slide, { backgroundColor: '#003366' }]}>
              <Image source={imageSrc} style={styles.image} />
              <Text style={styles.titleText}>{titleTexts[index]}</Text>
              <Text style={styles.subtitleText}>{subtitleTexts[index]}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => index < 2 ? handleSlideChange(index + 1) : navigation.replace('Login')}
              >
                <Text style={styles.buttonText}>{index < 2 ? '다음' : '시작'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        <View style={styles.indicatorContainer}>
          {images.map((_, idx) => (
            <View key={idx} style={[styles.indicator, { backgroundColor: idx === currentSlide ? '#007AFF' : 'white' }]} />
          ))}
        </View>
      </View>
    );
  } else {
    return null; // 첫 실행이 아닌 경우 이미 네비게이션으로 전환했으므로 아무 것도 렌더링하지 않음
  }
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  slide: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: '100%',
  },
  titleText: {
    fontSize: 36,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 60, // 인디케이터와 버튼 사이의 간격을 위해 수정
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 120, // 인디케이터 위치를 버튼 위로 올림
    width: '100%',
  },
  indicator: {
    height: 10,
    width: 10,
    backgroundColor: 'white',
    margin: 5,
    borderRadius: 5,
  },
});

export default WelcomeScreen;