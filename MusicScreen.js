import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as Location from 'expo-location';
// import { StatusBar } from 'expo-status-bar';

const API_KEY = "89d6921b329def955505e2b2a43767f3";

export default function MusicScreen({ navigation }) {
  const [temperature, setTemperature] = useState('');
  const [sctemperature, setSentence] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [list, setList] = useState([]);

  //날씨에 따른 문구
  const getSentence = (temp) => {
    if (temp <= 0) return ", 쌀쌀하니 따뜻하게 입고가세요😊";
    if (temp <= 10) return ", 거센 추위는 갔지만 아직 추우니 따뜻히 입고 가세요😊";
    if (temp <= 20) return ", 날씨가 선선하니 가디건 하나 걸치고 가세요😄";
    if (temp <= 30) return ", 날씨가 제법 더우니 가볍게 입으셔도 될 것 같네요😊";
    return ", 많이 더우니까 시원하게 입고가세요😊";
  };

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('위치 허용이 되지 않았습니다.');
        return;
      }

      const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const plocation = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });
      setCity(plocation[0].city);
      setRegion(plocation[0].region);

      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lang=kr&lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      const json = await response.json();
      setList(json.list);
      const temp = parseInt(json.list[0].main.temp);
      const sctemp = getSentence(temp);
      setSentence(sctemp);
      setTemperature(temp); // 실제 온도 값을 설정
    } catch (error) {
      console.error("위치 정보를 가져오는 중 오류가 발생했습니다:", error.message);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
          <Ionicons name="arrow-back" size={24} style={styles.icon}  />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
          <Entypo name="menu" size={24} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <Text style={styles.username}>OO님</Text>
        <Text style={styles.subText}>추천 목록</Text>
        <Text style={styles.subText}>날씨 : <Text style={{ color: 'red', fontWeight: 'bold' }}> {temperature}°C</Text></Text>
        <Text style={styles.subText}>{sctemperature}</Text>
        <Image 
          source={require('./assets/music.jpg')} 
          style={styles.profileImage}
        />
      </View>
      <View style={styles.recommendationSection}>
        <Text style={styles.recommendationText}><Entypo name="spotify-with-circle" size={23} color="green"/>  AI 노래 추천</Text>
        <View style={styles.musicCard}>
          <Image 
            source={require('./assets/music.jpg')}
            style={styles.songImage}
          />
          <View style={styles.songDetails}>
            <Text style={styles.songTitle}>비 오는 날 듣기 좋은 노래</Text>
            <Text style={styles.songSubtitle}>노래 제목</Text>
          </View>
          <View style={styles.musicControls}>
            <TouchableOpacity>
              <FontAwesome name="play-circle" size={24} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity><FontAwesome name="stop-circle" size={24} style={styles.icon} /></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E335A',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'left',
    marginTop: 20,
    marginBottom: 20,
  },
  icon: {
    marginTop: 20,
    color: '#ffffff',
    marginRight: 5,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  profileImage: {
    width: '100%',
    height: 380,
    borderRadius: 20,
    marginTop: 10,
  },
  recommendationSection: {
    backgroundColor: '#D79490',
    borderRadius: 10,
    padding: 10,
  },
  recommendationText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  musicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songSubtitle: {
    color: '#999999',
    fontSize: 12,
    fontWeight: 'normal',
  },
  musicControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
