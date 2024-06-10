import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from './firebaseConfig'; // database 객체 가져오기

import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignUpScreen';
import WeatherScreen from './WeatherScreen';
import SecondLoginScreen from './SecondLoginScreen'; // 올바른 경로로 수정
import MusicScreen from './MusicScreen'; 
import SettingScreen from './SettingScreen'; 
import AlarmScreen from './AlarmScreen';
import ChangePasswordScreen from './ChangePasswordScreen'; 
import ChangePasswordScreen2 from './ChangePasswordScreen2'; 
import FindEmailScreen from './FindEmailScreen'; 
import FeedbackScreen from './FeedbackScreen';
import FeedbackListScreen from './FeedbackListScreen';
import DeleteAccountScreen from './DeleteAccountScreen'; // DeleteAccountScreen import 추가
import GoogleMap from './GoogleMap';
import GoogleMap2 from './GoogleMap2';
import RecommendMusic from './RecommendMusic';

const Stack = createStackNavigator();

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [feedbackList, setFeedbackList] = useState([]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Weather" : "Welcome"}>
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Signup" 
          component={SignupScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SecondLogin" 
          component={SecondLoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Weather" 
          component={WeatherScreen} 
          options={{ headerShown: false }} 
        />
         <Stack.Screen 
          name="Music" 
          component={MusicScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Setting" 
          component={SettingScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ChangePassword2" 
          component={ChangePasswordScreen2} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="FindEmail" 
          component={FindEmailScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Alarm"
          component={AlarmScreen}
          options={{ headerShown: false }}
         />
        <Stack.Screen name="Feedback">
          {props => (
            <FeedbackScreen
              {...props}
              feedbackList={feedbackList}
              setFeedbackList={setFeedbackList}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="FeedbackList">
          {props => (
            <FeedbackListScreen
              {...props}
              feedbackList={feedbackList}
              setFeedbackList={setFeedbackList}
            />
          )}
        </Stack.Screen>
        <Stack.Screen 
          name="DeleteAccount" 
          component={DeleteAccountScreen}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="GoogleMap" 
          component={GoogleMap}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="GoogleMap2" 
          component={GoogleMap2}
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RecommendMusic" 
          component={RecommendMusic}
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;