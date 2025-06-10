import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { auth, database } from './firebaseConfig';
import { ref, onValue, get } from 'firebase/database';
import axios from 'axios';

const API_KEY = "#"; // OpenWeatherAPI KEY

const clothesImages = {
  "padding.png": require('./assets/padding.png'),
  "jacket.png": require('./assets/jacket.png'),
  "tshirt.png": require('./assets/tshirt.png'),
  "tanktop.png": require('./assets/tanktop.png'),
  "coat.png": require('./assets/coat.png'),
};

export default function MusicScreen({ navigation }) {
  const [temperature, setTemperature] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [sctemperature, setSentence] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [list, setList] = useState([]);
  const [username, setUsername] = useState('');
  const [clothes, setClothes] = useState([]);
  const [recommendedSong, setRecommendedSong] = useState(null);

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
      setTemperature(temp);
      setWeatherCondition(json.list[0].weather[0].main);

      fetchSingleRecommendation(temp, json.list[0].weather[0].main);
    } catch (error) {
      console.error("위치 정보를 가져오는 중 오류가 발생했습니다:", error.message);
    }
  };

  const fetchSingleRecommendation = async (temp, weatherCondition) => {
    const clientId = 'c9b04da697ed40f6a398402fe786acd9';
    const clientSecret = '3d07783dda594c8ba1d4c192d3394431';

    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', null, {
        params: {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        },
      });

      const accessToken = response.data.access_token;
      const weatherParams = getParamsFromWeatherAndTemperature(weatherCondition, temp);

      const songResponse = await axios.get('https://api.spotify.com/v1/recommendations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          ...weatherParams,
          seed_genres: weatherParams.seed_genres.join(','), 
          limit: 1,
        },
      });

      setRecommendedSong(songResponse.data.tracks[0]);
    } catch (error) {
      console.error('Error fetching recommendations:', error.response?.data || error.message);
    }
  };

  const getParamsFromWeatherAndTemperature = (weatherCondition, temperature) => {
    let params = {};

    switch (weatherCondition) {
      case 'Clear':
        params = {
          seed_genres: ['pop', 'dance'],
          min_valence: 0.7,
          min_energy: 0.6,
        };
        break;
      case 'Rain':
        params = {
          seed_genres: ['acoustic', 'chill'],
          max_valence: 0.5,
          max_energy: 0.4,
        };
        break;
      case 'Clouds':
        params = {
          seed_genres: ['indie', 'alternative'],
          target_valence: 0.5,
          target_energy: 0.5,
        };
        break;
      default:
        params = {
          seed_genres: ['pop'],
          target_energy: 0.5,
        };
    }

    if (temperature <= 0) {
      params = { ...params, seed_genres: ['classical', 'acoustic'], target_valence: 0.3, target_energy: 0.2 };
    } else if (temperature <= 10) {
      params = { ...params, seed_genres: ['indie', 'alternative'], target_valence: 0.4, target_energy: 0.3 };
    } else if (temperature <= 20) {
      params = { ...params, seed_genres: ['pop', 'rock'], target_valence: 0.6, target_energy: 0.5 };
    } else if (temperature <= 30) {
      params = { ...params, seed_genres: ['pop', 'dance'], target_valence: 0.8, target_energy: 0.7, target_tempo: 120 };
    } else {
      params = { ...params, seed_genres: ['electronic', 'hip-hop'], target_valence: 0.9, target_energy: 0.8 };
    }

    return params;
  };

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUsername(userData.name);
        }
      }
    };
    fetchClothesData();
    fetchUserName();
    getLocation();
  }, []);

  const fetchClothesData = () => {
    const clothesRef = ref(database, 'clothes');
    onValue(clothesRef, (snapshot) => {
      const data = snapshot.val();
      setClothes(data);
    });
  };

  const getClothesImage = () => {
    if (temperature <= 0) return { image: clothesImages["padding.png"], description: "패딩" };
    if (temperature <= 10) return { image: clothesImages["coat.png"], description: "코트" };
    if (temperature <= 20) return { image: clothesImages["jacket.png"], description: "가디건" };
    if (temperature <= 30) return { image: clothesImages["tshirt.png"], description: "반팔" };
    return { image: clothesImages["tanktop.png"], description: "민소매" };
  };

  const { image: clothesImage, description: clothesDescription } = getClothesImage();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
          <Ionicons name="arrow-back" size={24} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Setting')}>
          <Entypo name="menu" size={24} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.subText}>추천 목록</Text>
        <Text style={styles.subText}>날씨 : <Text style={{ color: 'red', fontWeight: 'bold' }}> {temperature}°C</Text></Text>
        <Text style={styles.subText}>{sctemperature}</Text>
        <Text style={styles.subText}>오늘의 옷 추천 : {clothesDescription}</Text>
        <Image 
          source={require('./assets/music.jpg')} 
          style={styles.profileImage}
        />
      </View>
      <View style={styles.recommendationSection}>
        <TouchableOpacity onPress={() => navigation.navigate('RecommendMusic', { temperature, weatherCondition })}>
          <Text style={styles.recommendationText}><Entypo name="spotify-with-circle" size={23} color="green"/>  AI 노래 추천</Text>
        </TouchableOpacity>
        {recommendedSong && (
          <TouchableOpacity onPress={() => Linking.openURL(recommendedSong.external_urls.spotify)}>
            <View style={styles.musicCard}>
              <Image 
                source={{ uri: recommendedSong.album.images[0]?.url }}
                style={styles.songImage}
              />
              <View style={styles.songDetails}>
                <Text style={styles.songTitle}>{recommendedSong.name}</Text>
                <Text style={styles.songSubtitle}>{recommendedSong.artists.map(artist => artist.name).join(', ')}</Text>
              </View>
              <View style={styles.musicControls}>
                <FontAwesome name="play-circle" size={24} style={styles.icon} />
              </View>
            </View>
          </TouchableOpacity>
        )}
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
  clothesImage: {
    width: 55,
    height: 55,
    resizeMode: "contain",
  },
});
