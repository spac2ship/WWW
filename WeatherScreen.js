import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View, ActivityIndicator, Image, ImageBackground, Button, TouchableOpacity } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { auth } from './firebaseConfig'; 
import MapView from 'react-native-maps';


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const API_KEY = "44c0751c1b2e8f343c1fe73749f1aac2";

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
export default function WeatherScreen({ navigation }) {
  const [city, setCity] = useState("Loading...");
  const [region, setRegion] = useState("");
  const [list, setList] = useState([]);
  const [ok, setOk] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [temperature, setTemperature] = useState(0);
  const [temperatureYesterday, setTemperatureYesterday] = useState(0);
  const [temperatureChange, setTemperatureChange] = useState("");
  const [windSpeed, setWindSpeed] = useState(0);
  const [feelsLike, setFeelsLike] = useState(0);
  const [airQuality, setAirQuality] = useState(null);
  const [airQualityIcon, setAirQualityIcon] = useState(null);

  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef();
  
  useEffect(() => {
    getLocation();
  }, ); //배열 없애면 리렌더링 될 때마다 실행됨

  useEffect(() => {
    if (temperature !== "" && temperatureYesterday !== "") {
      const temperatureDifference = temperature - temperatureYesterday;
      const temperatureChangeText = temperatureDifference > 0 ? `어제보다 ${Math.abs(temperatureDifference)}° 높습니다` : `어제보다 ${Math.abs(temperatureDifference)}° 낮습니다`;
      setTemperatureChange(temperatureChangeText);
    }
  }, [temperature, temperatureYesterday]);

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
  // const getClothes = (temp) => {

  // }

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) throw new Error("위치 권한이 거부되었습니다. 설정에서 허용해주세요.");
      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const plocation = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
      setCity(plocation[0].city);
      setRegion(plocation[0].region);
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lang=kr&lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const json = await response.json();
      setList(json.list);
      setTemperature(parseInt(json.list[0].main.temp));
      setTemperatureYesterday(parseInt(json.list[8].main.temp));
      setWindSpeed(json.list[0].wind.speed);
      setFeelsLike(parseInt(json.list[0].main.feels_like));
      //setClothes(parseInt(json.list[0].main.temp));
      setOk(true);  // 위치 정보를 성공적으로 가져왔을 때 설정

      //미세먼지 api
      const airPollutionResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`);
      const airPollutionJson = await airPollutionResponse.json();
      const pm2_5 = airPollutionJson.list[0].components.pm2_5;
      const airQuality = getAirQuality(pm2_5); //미세먼지 등급
      const airQualityIcon = getAirQualityIcon(pm2_5); //미세먼지 아이콘
      setAirQuality(airQuality);
      setAirQualityIcon(airQualityIcon);

      
    } catch (error) {
      console.error("위치 정보를 가져오는 중 오류가 발생했습니다:", error.message);
      setOk(false);
    }
  };

  useEffect(() => {
    const setCurrentBackgroundImage = () => {
      const currentTime = new Date().getHours();

      if (currentTime >= 6 && currentTime < 18) {
        setBackgroundImage(require('./assets/morning.jpg')); //낮일 때
      } else {
        setBackgroundImage(require('./assets/evening.png')); // 밤일 때
      }
    };
    setCurrentBackgroundImage();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login'); 
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <ImageBackground source={backgroundImage} style={styles.container}>
    <StatusBar style='#EF8F6E' /> 
    <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
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
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.regionName}>{region}</Text>
        <Button
          title="Music"
          onPress={() => navigation.navigate('Music')}
          color="black"
        />
      </View>
      {/* <MapView style={styles.map} onRegionChange={onRegionChange}></MapView> */}
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
        <Text style={styles.infoTextBold}>옷차림</Text>
        <Image source={require('./assets/WelcomeIcon-2.png')} style={{ width: 29, height: 29, marginTop: 5 }} />
        <Text style={styles.infoTextBold}>가디건</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTextBold}>체감온도</Text>
        <Fontisto name="thermometer" size={24} color="white" />
        <Text style={styles.infoTextBold}>{feelsLike.toFixed(1)}°</Text>
      </View>
    </View>
    <ScrollView style={styles.footer} horizontal showsHorizontalScrollIndicator={false}>
      {list.slice(1, 7).map((weather, index) => {
        const time = new Date(weather.dt * 1000).getHours();
        const temp = weather.main.temp.toFixed(1);
        const description = weather.weather[0].description;
        return (
          <View style={styles.article} key={index}>
            <Text style={styles.articleText}>{`${time}시`}</Text>
            <Fontisto name={icons[weather.weather[0].main]} size={24} color="white" />
            <Text style={styles.articleText}>{`${temp}°`}</Text>
            <Text style={styles.articleText}>{description}</Text>
          </View>
        );
      })}
    </ScrollView>
  </ImageBackground>  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    color: "white",
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
    marginTop: 150, // Added margin top for better spacing
    paddingHorizontal: 10,
  },
  infoBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 35,
    width: 70,
    height: 110,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
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
  footer: {
    position: 'absolute',
    bottom: 20,
    width: '80%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  article: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  articleText: {
    color: 'white',
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  map: {
    width: '100%',
    height: '100%'
  }
});