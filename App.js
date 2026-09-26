import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-neutral-950">
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={AuthScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Receive" component={ReceiveScreen} options={{ presentation: 'modal' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
