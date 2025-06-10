import React, { useState, useEffect, useRef } from 'react';
import { Button, Dimensions, ScrollView, StyleSheet, Text, View, ImageBackground, TouchableOpacity, FlatList, Image, BackHandler, Alert } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { auth, database } from './firebaseConfig';
import { ref, onValue } from 'firebase/database';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "#"; // OpenWeatherAPI KEY

//clothesImages객체에 모든 이미지를 require하여 저장
const clothesImages = {
  "padding.png": require('./assets/padding.png'),
  "jacket.png": require('./assets/jacket.png'),
  "tshirt.png": require('./assets/tshirt.png'),
  "tanktop.png": require('./assets/tanktop.png'),
  "coat.png": require('./assets/coat.png'),
};

const icons = {
  "Thunderstorm": "lightning",
  "Drizzle": "rains",
  "Rain": "rain",
  "Snow": "snowflake",
  "Atmosphere": "cloudy-gusts",
  "Clear": "day-sunny",
  "Clouds": "cloudy",
};
export async function getWeatherData(latitude, longitude) {
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lang=kr&lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
  const json = await response.json();
  return json.list[0]; // 예시로 첫 번째 날씨 데이터를 반환
}

const processWeatherData = (data) => {
  const dailyData = {};

  data.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString('ko-KR', { weekday: 'short' });

    if (!dailyData[day]) {
      dailyData[day] = {
        day: day,
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        description: item.weather[0].description,
        icon: item.weather[0].main,
        pop: item.pop // Assuming pop is available in the item
      };
    } else {
      dailyData[day].temp_max = Math.max(dailyData[day].temp_max, item.main.temp_max);
      dailyData[day].temp_min = Math.min(dailyData[day].temp_min, item.main.temp_min);
    }
  });

  return Object.values(dailyData).slice(0, 5); // Return first 7 days of data
};

// 요일별 강수확률
const renderPrecipitation = ({ item, index }) => {
  return (
    <View style={styles.weatherBox} key={index}>
      <Text style={styles.weatherDay}>{item.day}</Text>
      <Text style={styles.weatherTemp2}>{`${(item.pop * 100).toFixed(0)}%`}</Text>
    </View>
  );
};

// 요일별 날씨
const renderDailyWeather = ({ item, index }) => {
  return (
    <View style={styles.weatherBox} key={index}>
      <Text style={styles.weatherDay}>{item.day}</Text>
      <Fontisto name={icons[item.icon]} size={24} color="white" />
      <Text style={styles.weatherTempMax}>{`${item.temp_max.toFixed(1)}°`}</Text>
      <Text style={styles.weatherTempMin}>{`${item.temp_min.toFixed(1)}°`}</Text>
      <Text style={styles.weatherDescription}>{item.description}</Text>
    </View>
  );
};
export default function WeatherScreen({ navigation, route }) {
  const [city, setCity] = useState("Loading...");
  const [region, setRegion] = useState("");
  const [list, setList] = useState([]);
  const [ok, setOk] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(require('./assets/morning.jpg'));
  const [temperature, setTemperature] = useState(0);
  const [temperatureYesterday, setTemperatureYesterday] = useState(0);
  const [temperatureChange, setTemperatureChange] = useState("");
  const [windSpeed, setWindSpeed] = useState(0);
  const [feelsLike, setFeelsLike] = useState(0);
  const [airQuality, setAirQuality] = useState(null);
  const [airQualityIcon, setAirQualityIcon] = useState(null);
  const [clothes, setClothes] = useState({}); 
  const [processedWeatherData, setProcessedWeatherData] = useState([]);

  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);


  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef();
  
  
  useEffect(() => {
    getLocation();
    fetchClothesData();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress); //이벤트 리스너 등록
    return () => backHandler.remove(); //이벤트 리스너 해제
  }, []); //배열 없애면 리렌더링 될 때마다 실행됨

  
  useEffect(() => {
    if (temperature !== "" && temperatureYesterday !== "") {
      const temperatureDifference = temperature - temperatureYesterday;
      const temperatureChangeText = temperatureDifference > 0 ? `어제보다 ${Math.abs(temperatureDifference)}° 높습니다` : `어제보다 ${Math.abs(temperatureDifference)}° 낮습니다`;
      setTemperatureChange(temperatureChangeText);
    }
  }, [temperature, temperatureYesterday]);


  useEffect(() => {
    // Process the weather data when the component mounts or list updates
    const data = processWeatherData(list);
    setProcessedWeatherData(data);
  }, [list]);


  //핸드폰에서 뒤로가기 했을 때 앱 종료
  const handleBackPress = () => { 
    if (navigation.isFocused()) {
    Alert.alert(
      "앱 종료",
      "앱을 종료하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: () => BackHandler.exitApp() }
      ]);
    return true;
    }
  };

   //앱의 뒤로가기 버튼 눌렀을 때 앱 종료
  const handleBackIconPress = () => {
    if (navigation.isFocused()) {
      Alert.alert(
        "앱 종료",
        "앱을 종료하시겠습니까?",
        [
          { text: "취소", style: "cancel" },
          { text: "확인", onPress: () => BackHandler.exitApp() }
        ]);
      return true;
      }
    };

  //realtime database의 clothes값 불러오기
  const fetchClothesData = () => {
    const clothesRef = ref(database, 'clothes');
    onValue(clothesRef, (snapshot) => {
      const data = snapshot.val();
      setClothes(data);
    });
  };
  //바람세기에 따라 문구 리턴
  const getWindSpeedDescription = (speed) => {
    if (speed <= 1.5) return "바람이 불지 않아요";
    if (speed <= 3.3) return "약한 바람이 불어요";
    if (speed <= 5.5) return "약간 강한 바람이 불어요";
    if (speed <= 8.9) return "강한 바람이 불어요";
    return "매우 강한 바람이 불어요";
  };

  //미세먼지 등급
  const getAirQuality = (pm2_5) => {
    if (pm2_5 <= 30) return "좋음";
    if (pm2_5 <= 50) return "보통";
    if (pm2_5 <= 75) return "나쁨";
    if (pm2_5 <= 150) return "매우 나쁨";
    return "최악";
  };
  //미세먼지 표정
  const getAirQualityIcon = (pm2_5) => {
    if (pm2_5 <= 30) return "smiley";
    if (pm2_5 <= 50) return "slightly-smile";
    if (pm2_5 <= 75) return "frowning";
    if (pm2_5 <= 150) return "mad";
    return "dizzy";
  };
  //온도에 따라서 옷 이미지 리턴
  const getClothesImage = () => {
    if (temperature <= 0) return { image: clothesImages["padding.png"], description: "패딩" };
    if (temperature <= 10) return { image: clothesImages["coat.png"], description: "코트" };
    if (temperature <= 20) return { image: clothesImages["jacket.png"], description: "가디건" };
    if (temperature <= 30) return { image: clothesImages["tshirt.png"], description: "반팔" };
    return { image: clothesImages["tanktop.png"], description: "민소매" };
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) throw new Error("위치 권한이 거부되었습니다. 설정에서 허용해주세요.");
      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
      setCity(location[0].district);
      setRegion(location[0].region);
      fetchWeather(latitude, longitude);
    } catch (error) {
      console.error("위치 정보를 가져오는 중 오류가 발생했습니다:", error.message);
      setOk(false);
    }
  };
  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lang=kr&lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const json = await response.json();
      setList(json.list);
      setTemperature(parseInt(json.list[0].main.temp));
      setTemperatureYesterday(parseInt(json.list[8].main.temp));
      setWindSpeed(json.list[0].wind.speed);
      setFeelsLike(parseInt(json.list[0].main.feels_like));
      setOk(true);

      const airPollutionResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
      const airPollutionJson = await airPollutionResponse.json();
      const pm2_5 = airPollutionJson.list[0].components.pm2_5;
      const airQuality = getAirQuality(pm2_5);
      const airQualityIcon = getAirQualityIcon(pm2_5);
      setAirQuality(airQuality);
      setAirQualityIcon(airQualityIcon);

      const currentTime = new Date().getHours();
      if (currentTime >= 6 && currentTime < 18) {
        setBackgroundImage(require('./assets/morning.jpg'));
      } else {
        setBackgroundImage(require('./assets/evening.png'));
      }
    } catch (error) {
      console.error("날씨 정보를 가져오는 중 오류가 발생했습니다:", error.message);
      setOk(false);
    }
  };
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let savedLocation = await AsyncStorage.getItem('selectedLocation');
        if (route.params && route.params.location) {
          savedLocation = JSON.stringify(route.params.location);
          await AsyncStorage.setItem('selectedLocation', savedLocation);
        }
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          setLocation(location);
          const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`);
          setWeatherData(response.data);
        } else {
          setErrorMsg('지역이 선택되지 않았습니다.');
        }
      } catch (error) {
        setErrorMsg('날씨를 불러오는 중 오류가 발생했습니다.');
      }
    };
    fetchWeather();
  }, [route.params]);
  const loadSelectedLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('selectedLocation');
      if (savedLocation) {
        const { latitude, longitude, city, region } = JSON.parse(savedLocation);
        setCity(city);
        setRegion(region);
        fetchWeather(latitude, longitude);
      } else {
        getLocation();
      }
    } catch (error) {
      console.error("선택한 위치를 불러오는 중 오류가 발생했습니다:", error.message);
      getLocation();
    }
  };

  useEffect(() => {
    loadSelectedLocation();
  }, []);

  useEffect(() => {
    if (location) {
      const { latitude, longitude, city, region } = location;
      setCity(city);
      setRegion(region);
      fetchWeather(latitude, longitude);
    }
  }, [location]);

  // const handleLogout = async () => {
  //   try {
  //     await auth.signOut();
  //     navigation.replace('Login'); 
  //   } catch (error) {
  //     console.error("Error logging out:", error);
  //   }
  // };

  //시간별 날씨
  const renderHourlyWeather = ({ item, index }) => {
    const date = new Date(item.dt * 1000); //날짜 불러옴
    const hour = date.getHours(); //시간
    const temp = item.main.temp.toFixed(1); //온도
    const description = item.weather[0].description; //날씨문구

    return (
      <View style={styles.weatherHourBox} key={index}>
        <Text style={styles.weatherHour}>{`${hour}시`}</Text>
        <Fontisto name={icons[item.weather[0].main]} size={24} color="white" />
        <Text style={styles.weatherTemp}>{`${temp}°`}</Text>
        <Text style={styles.weatherdecription}>{description}</Text>
      </View>
    );
  };




  const handleSlideChange = (index) => {
    setCurrentSlide(index);
    scrollViewRef.current.scrollTo({ x: SCREEN_WIDTH * index, animated: true });
  };

  const handleSetLocation = (location) => {
    setLocation(location);
  };
  const { image: clothesImage, description: clothesDescription } = getClothesImage();
  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
    <StatusBar style='#EF8F6E' /> 
    <TouchableOpacity style={styles.backButton} onPress={handleBackIconPress}>
      <Image source={require('./assets/backicon.png')} style={styles.backIcon} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Setting')}> 
      <Image source={require('./assets/setting.png')} style={styles.settingsIcon} />
    </TouchableOpacity>
    <View style={styles.cityTemperatureContainer}>
      <View style={styles.temperatureContainer}>
        <Text style={styles.temperature}>{temperature.toFixed(1)}°</Text>
        <Text style={styles.temperatureChange}>{temperatureChange}</Text>
      </View>
      <View style={styles.city}>
        <TouchableOpacity onPress={() => navigation.navigate('GoogleMap')}>
          <Text style={styles.regionName}>{region}</Text>
          <Text style={styles.cityName}>{city}</Text>
          </TouchableOpacity>
        <Button
          title="Music"
          onPress={() => navigation.navigate('Music')}
          color="black"
        />
      </View>
    </View>
    <View style={styles.infoContainer}>
    <View style={styles.infoBox}>
      <Text style={styles.infoTextBold}>미세먼지</Text>
      {airQualityIcon && <Fontisto name={airQualityIcon} size={24} color="white" />}
      <Text style={styles.infoTextBold}>{airQuality || "불러오는 중..."}</Text>
    </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTextBold}>바람세기</Text>
        <Fontisto name="wind" size={24} color="white" />
        <Text style={styles.infoTextBold}>{getWindSpeedDescription(windSpeed)}</Text>
      </View>
      <View style={styles.infoBox}>
          <Text style={styles.infoText}>옷차림</Text>
          <Image source={clothesImage} style={styles.clothesImage} />
          <Text style={styles.infoText}>{clothesDescription}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTextBold}>체감온도</Text>
        <Fontisto name="thermometer" size={24} color="white" />
        <Text style={styles.infoTextBold}>{feelsLike.toFixed(1)}°</Text>
      </View>
    </View>

    {/* 슬라이드 적용부분 */}
<FlatList
      data={[{ key: '시간별 날씨' }, { key: '요일별 날씨' }, { key: '강수확률' }]} // 슬라이드 제목 데이터 배열을 지정
      horizontal // 수평 스크롤 가능하도록 설정
      pagingEnabled // 스크롤 시 페이지 단위로 스크롤 되도록 설정
      showsHorizontalScrollIndicator={false} // 수평 스크롤바를 숨김
      onScroll={(event) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH); // 현재 스크롤 위치를 기준으로 슬라이드 인덱스를 계산
        setCurrentSlide(slideIndex); // 현재 슬라이드 인덱스를 상태로 설정
      }}
      scrollEventThrottle={200} // 스크롤 이벤트 발생 빈도를 제어
      contentContainerStyle={styles.scrollViewContent} // FlatList의 내용물 스타일을 지정
      renderItem={({ item, index }) => ( // 각 아이템을 렌더링하는 함수
        <View style={styles.slide}>  
          <Text style={styles.titleText}>{item.key}</Text> 
          {index === 0 && ( // 첫 번째 슬라이드 (시간별 날씨)
            <FlatList
              data={list.slice(0, 8)} // 리스트 데이터의 첫 8개 요소만 사용
              vertical // 수직 스크롤 설정
              keyExtractor={(item, index) => index.toString()} // 각 아이템의 고유 키를 문자열로 변환
              renderItem={renderHourlyWeather} // 각 아이템을 렌더링하는 함수
              showsHorizontalScrollIndicator={false} // 수평 스크롤바를 숨김
              contentContainerStyle={styles.weatherList} // 리스트 내용물 스타일을 지정
            />
          )}
          {index === 1 && ( // 두 번째 슬라이드 (요일별 날씨)
            <FlatList
              data={processedWeatherData} // Processed weather data
              vertical // 수직 스크롤 설정
              keyExtractor={(item, index) => index.toString()} // 각 아이템의 고유 키를 문자열로 변환
              renderItem={renderDailyWeather} // 각 아이템을 렌더링하는 함수
              showsHorizontalScrollIndicator={false} // 수평 스크롤바를 숨김
              contentContainerStyle={styles.weatherList} // 리스트 내용물 스타일을 지정
            />
          )}
          {index === 2 && ( // 세 번째 슬라이드 (강수 확률)
            <FlatList
              vertical // 수직 스크롤 설정
              data={processedWeatherData} // Processed weather data
              renderItem={renderPrecipitation} // 각 아이템을 렌더링하는 함수
              keyExtractor={(item, index) => index.toString()} // 각 아이템의 고유 키를 문자열로 변환
              showsHorizontalScrollIndicator={false} // 수평 스크롤바를 숨김
              contentContainerStyle={styles.weatherList} // 리스트 내용물 스타일을 지정
            />
          )}
        </View>
  )}
/>
<View style={styles.indicatorContainer}>
  <TouchableOpacity onPress={() => handleSlideChange(0)}>
    <View style={[styles.indicator, currentSlide === 0 && styles.activeIndicator]} />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => handleSlideChange(1)}>
    <View style={[styles.indicator, currentSlide === 1 && styles.activeIndicator]} />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => handleSlideChange(2)}>
    <View style={[styles.indicator, currentSlide === 2 && styles.activeIndicator]} />
  </TouchableOpacity>
</View>
  </ImageBackground>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // 전체 컨텐츠를 상하단으로 분배
    alignItems: 'center',
  },
  cityTemperatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    position: 'absolute',
    top: 80,
  },
  temperatureContainer: {
    alignItems: 'flex-start',
  },
  temperature: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  temperatureChange: {
    fontSize: 14,
    color: 'white',
  },
  weatherTempMax: {
    color: '#EB4B44',
    fontSize: 18,
  },
  weatherTempMin: {
    color: '#4B9BEB',
    fontSize: 18,
  },
  weatherDescription: {
    color: 'white',
    fontSize: 13,
  },
  city: {
    alignItems: 'flex-end',
  },
  cityName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
  },
  regionName: {
    fontSize: 25,
    color: "white",
    fontWeight: "300",
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
  },
  backIcon: {
    width: 33,
    height: 33,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '84%',
    paddingVertical: 20,
    marginTop: 500,
    paddingHorizontal: 10,
    //flexGrow: 10
  },
  infoBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 35,
    width: 70,
    height: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  infoText: {
    color: 'white',
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center',
  },
  infoTextBold: {
    color: 'white',
    marginTop: 5,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    justifyContent: 'center', // 스크롤뷰 컨텐츠를 중앙에 배치

  },
  scrollView: {
    flexGrow: 0.8, // 스크롤뷰가 최소한의 높이만 차지하도록 설정
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 35,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  weatherBox: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  weatherHourBox: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  weatherHour: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  weatherDay: {
    color: 'white',
    fontSize: 18,
    marginBottom: 16,
  },
  weatherTemp: {
    color: 'white',
    fontSize: 12,
  },
  weatherTemp2: {
    color: 'white',
    fontSize: 18,
  },
    weatherList: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherdecription: {
    color: 'white',
    fontSize: 13,
  },
  precipitationBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10, // 인디케이터를 더 하단으로 조정
    alignSelf: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    margin: 5,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  clothesImage: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
});
