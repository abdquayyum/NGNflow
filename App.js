import React from 'react';
import { View, StatusBar } from 'react-native';

import { AppState, AppStateStatus, Text, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Lock } from 'lucide-react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Wallet, CreditCard, ArrowRightLeft, Send, History, User } from 'lucide-react-native';
import useStore from './store/useStore';

import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import SwapScreen from './screens/SwapScreen';
import CardsScreen from './screens/CardsScreen';
import TransferScreen from './screens/TransferScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ReceiveScreen from './screens/ReceiveScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


function BiometricLocker({ children }) {
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [hasBiometrics, setHasBiometrics] = React.useState(null); // null = checking
  const isAuthenticating = React.useRef(false);
  const wentToBackground = React.useRef(false);

  const authenticate = React.useCallback(async () => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;

    try {
      const hw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hw && enrolled) {
        setHasBiometrics(true);
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock NGNflow',
          fallbackLabel: 'Use Passcode',
          disableDeviceFallback: false,
          cancelLabel: 'Cancel',
        });
        if (result.success) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } else {
        // No biometrics enrolled or available on this device
        setHasBiometrics(false);
        setIsUnlocked(true);
      }
    } catch (error) {
      console.warn('Biometric Error:', error);
      setIsUnlocked(true);
    } finally {
      isAuthenticating.current = false;
      wentToBackground.current = false;
    }
  }, []);

  React.useEffect(() => {
    // Authenticate once on initial load
    authenticate();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // User genuinely went away from the app
        wentToBackground.current = true;
      } else if (nextAppState === 'active' && wentToBackground.current && !isAuthenticating.current) {
        // User returned from background
        setIsUnlocked(false);
        authenticate();
      }
    });

    return () => subscription.remove();
  }, [authenticate]);

  if (hasBiometrics === null) {
    return <View className="flex-1 bg-black" />; // Loading state
  }

  if (!isUnlocked && hasBiometrics) {
    return (
      <View className="flex-1 bg-[#09090B] justify-center items-center px-6">
        <View className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
          <Lock color="#10b981" size={32} />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">App Locked</Text>
        <Text className="text-neutral-400 text-center mb-10">Use Face ID or Touch ID to securely unlock your NGNflow account.</Text>
        <TouchableOpacity onPress={authenticate} className="bg-emerald-500 w-full h-14 rounded-2xl items-center justify-center">
          <Text className="text-black font-bold text-lg">Unlock Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#262626', height: 85, paddingBottom: 30, paddingTop: 10 },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#525252',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 4 }
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({color}) => <Wallet color={color} size={24} /> }} />
      <Tab.Screen name="Cards" component={CardsScreen} options={{ tabBarIcon: ({color}) => <CreditCard color={color} size={24} /> }} />
      <Tab.Screen name="Swap" component={SwapScreen} options={{ tabBarIcon: ({color}) => <ArrowRightLeft color={color} size={24} /> }} />
      <Tab.Screen name="Transfer" component={TransferScreen} options={{ tabBarIcon: ({color}) => <Send color={color} size={24} /> }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: ({color}) => <History color={color} size={24} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({color}) => <User color={color} size={24} /> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const token = useStore(state => state.token);
  const isAuthenticated = !!token;

  return (
    <SafeAreaProvider className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        {!isAuthenticated ? (
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
          </Stack.Navigator>
        ) : (
          <BiometricLocker>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Receive" component={ReceiveScreen} options={{ presentation: 'modal' }} />
            </Stack.Navigator>
          </BiometricLocker>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
