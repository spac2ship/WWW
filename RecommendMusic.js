import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';

const RecommendMusic = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState([]);
  const { params } = useRoute();
  const { temperature, weatherCondition } = params;

  const clientId = 'c9b04da697ed40f6a398402fe786acd9';
  const clientSecret = '3d07783dda594c8ba1d4c192d3394431';

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
          params: {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
          },
        });
        const accessToken = response.data.access_token;
        setAccessToken(accessToken);
        const weatherParams = getParamsFromWeatherAndTemperature(weatherCondition, temperature);
        fetchRecommendations(accessToken, weatherParams);
      } catch (error) {
        console.error('Error fetching access token:', error.response?.data || error.message);
      }
    };

    fetchAccessToken();
  }, [temperature, weatherCondition]);

  const fetchRecommendations = async (accessToken, params) => {
    try {
      const response = await axios.get('https://api.spotify.com/v1/recommendations', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          ...params,
          seed_genres: params.seed_genres.join(','), 
          limit: 10,
        },
      });
      setRecommendationsData(response.data.tracks);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => Linking.openURL(item.external_urls.spotify)}>
      <View style={styles.musicCard}>
        <Image
          source={{ uri: item.album.images[0]?.url }}
          style={styles.songImage}
        />
        <View style={styles.songDetails}>
          <Text style={styles.songTitle}>{item.name}</Text>
          <Text style={styles.songSubtitle}>{item.artists.map(artist => artist.name).join(', ')}</Text>
          <Text style={styles.songAlbum}>{item.album.name}</Text>
        </View>
        <View style={styles.musicControls}>
          <FontAwesome name="play-circle" size={24} color="#ffffff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const getWeatherDescription = (condition) => {
    switch (condition) {
      case 'Clear':
        return '맑음';
      case 'Rain':
        return '비';
      case 'Clouds':
        return '구름';
      case 'Snow':
        return '눈';
      default:
        return '알 수 없음';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.weatherText}>{`현재 온도: ${temperature}°C, 날씨: ${getWeatherDescription(weatherCondition)}`}</Text>
      <FlatList
        data={recommendationsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  listContent: {
    paddingBottom: 16,
  },
  musicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  },
  songAlbum: {
    color: '#999999',
    fontSize: 12,
  },
  musicControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default RecommendMusic;