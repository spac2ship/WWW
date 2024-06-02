import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {useState, useEffect } from 'react';
import { firebase } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig'; 
import * as Notifications from 'expo-notifications';

import WelcomeScreen from './WelcomeScreen'; // 처음 화면 연결
import LoginScreen from './LoginScreen'; // 첫 로그인 화면 연결
import SecondLoginScreen from './SecondLoginScreen'; // 로그인화면 연결
import WeatherScreen from './WeatherScreen'; // 메인 날씨 화면 연결
import SignupScreen from './SignUpScreen';  // 회원가입 화면 연결
import MusicScreen from './MusicScreen'; // 음악 화면 연결
import SettingScreen from './SettingScreen'; // 세팅 화면 연결
import AlarmScreen  from './AlarmScreen'; // 알림 설정 화면
import ChangePasswordScreen from './ChangePasswordScreen'; // 비밀번호 찾기 화면
import ChangePasswordScreen2 from './ChangePasswordScreen2';  // 비밀번호 찾기 화면 2
import FindEmailScreen from './FindEmailScreen';  // 이메일 찾기(id 찾기) 화면

const Stack = createStackNavigator();

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

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
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown:false}}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}} />
        <Stack.Screen name="SecondLogin" component={SecondLoginScreen} options={{headerShown:false}} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown:false}} />
        <Stack.Screen name="Music" component={MusicScreen} options={{headerShown:false}} />
        <Stack.Screen name="Setting" component={SettingScreen} options={{headerShown:false}} />
        <Stack.Screen name="Weather" component={WeatherScreen} options={{headerShown:false}} />
        <Stack.Screen name="Alarm" component={AlarmScreen} options={{headerShown:false}}/>
        <Stack.Screen name="FindEmail" component={FindEmailScreen} options={{headerShown:false}}/>
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{headerShown:false}}/>
        <Stack.Screen name="ChangePassword2" component={ChangePasswordScreen2} options={{headerShown:false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;