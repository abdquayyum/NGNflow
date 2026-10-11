import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';

import useStore from '../store/useStore';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const scrollViewRef = useRef(null);

  const { login, register, loading, error, clearError, init } = useStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error);
      clearError();
    }
  }, [error]);

  const handleSubmit = () => {
    if (!email || !password || (!isLogin && !fullName)) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (isLogin) {
      login(email, password);
    } else {
      register(email, password, fullName);
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 130, animated: true });
    }, 100);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? -25 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 60
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-6 mt-4">
            <Image
              source={require('../assets/icon.png')}
              style={{ width: 68, height: 68, borderRadius: 20 }}
              className="mb-3 shadow-lg shadow-emerald-500/30"
            />
            <Text className="text-3xl font-extrabold text-white tracking-tight">NGNflow</Text>
            <Text className="text-neutral-400 mt-1 text-center text-xs font-medium tracking-wide uppercase">Premium Crypto & Fiat</Text>
          </View>

          <View className="bg-neutral-900 p-6 rounded-[2rem] border border-neutral-800 shadow-2xl">
            <Text className="text-2xl font-bold text-white mb-5">
              {isLogin ? 'Welcome back' : 'Create account'}
            </Text>

            {!isLogin && (
              <View className="mb-4">
                <Text className="text-neutral-400 text-xs uppercase font-bold mb-2 ml-1">Legal Full Name</Text>
                <View className="flex-row items-center bg-neutral-950 rounded-2xl border border-neutral-800 px-4 h-14">
                  <TextInput
                    scrollEnabled={false}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={handleInputFocus}
                    className="flex-1 text-white font-medium text-base h-full"
                    placeholderTextColor="#737373"
                    placeholder="Enter full name"
                    style={{ includeFontPadding: false, paddingVertical: 0 }}
                  />
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-neutral-400 text-xs uppercase font-bold mb-2 ml-1">Email Address</Text>
              <View className="flex-row items-center bg-neutral-950 rounded-2xl border border-neutral-800 px-4 h-14">
                <TextInput
                  scrollEnabled={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={handleInputFocus}
                  className="flex-1 text-white font-medium text-base h-full"
                  placeholderTextColor="#737373"
                  placeholder="Enter email address"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ includeFontPadding: false, paddingVertical: 0 }}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-neutral-400 text-xs uppercase font-bold mb-2 ml-1">Password</Text>
              <View className="flex-row items-center bg-neutral-950 rounded-2xl border border-neutral-800 px-4 h-14">
                <TextInput
                  scrollEnabled={false}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={handleInputFocus}
                  secureTextEntry
                  className="flex-1 text-white font-medium text-base h-full"
                  placeholderTextColor="#737373"
                  placeholder="Enter password"
                  style={{ includeFontPadding: false, paddingVertical: 0 }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              className="bg-emerald-500 h-14 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg tracking-wide">
                  {isLogin ? 'Sign In' : 'Continue'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              className="mt-5 items-center p-2"
            >
              <Text className="text-neutral-400 text-sm font-medium">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text className="text-emerald-400 font-bold">{isLogin ? 'Sign up' : 'Sign in'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}