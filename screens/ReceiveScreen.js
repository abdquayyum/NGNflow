import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Copy, Globe, ArrowLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import useStore from '../store/useStore';

const ASSETS = [
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'TRX', name: 'Tron' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'POL', name: 'Polygon' },
  { symbol: 'NGN', name: 'Naira' }
];

const NETWORKS = {
  'USDT': ['ERC20', 'TRC20', 'Polygon', 'BEP20'],
  'BTC': ['BTC'],
  'ETH': ['ERC20'],
  'TRX': ['TRC20'],
  'BNB': ['BEP20'],
  'POL': ['Polygon'],
  'NGN': ['Bank Transfer']
};

export default function ReceiveScreen({ navigation }) {
  const [currency, setCurrency] = useState('USDT');
  const [network, setNetwork] = useState('ERC20');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  const getDepositAddress = useStore(state => state.getDepositAddress);
  const getFiatDepositAccount = useStore(state => state.getFiatDepositAccount);
  
  useEffect(() => {
    fetchAddress();
  }, [currency, network]);

  const fetchAddress = async () => {
    if (currency === 'NGN') {
      setLoading(true);
      const addr = await getFiatDepositAccount();
      setAddress(addr);
      setLoading(false);
      return;
    }
    setLoading(true);
    let apiCurrency = currency;
    if (currency === 'USDT') {
        if (network === 'ERC20') apiCurrency = 'USDT_ERC20';
        if (network === 'TRC20') apiCurrency = 'USDT_TRC20';
        if (network === 'Polygon') apiCurrency = 'USDT_POLYGON';
        if (network === 'BEP20') apiCurrency = 'USDT_BEP20';
    }
    
    const addr = await getDepositAddress(apiCurrency, network);
    setAddress(addr);
    setLoading(false);
  };
  
  const copyToClipboard = async () => {
    if (address) {
      await Clipboard.setStringAsync(address);
      Alert.alert('Copied!', 'Address copied to clipboard.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row items-center px-5 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-neutral-900 rounded-full mr-4">
          <ArrowLeft color="#fff" size={20} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-white">Receive Assets</Text>
      </View>
      
      <ScrollView className="flex-1 px-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 mt-4 max-h-16">
          {ASSETS.map(a => (
            <TouchableOpacity 
              key={a.symbol} 
              onPress={() => { setCurrency(a.symbol); setNetwork(NETWORKS[a.symbol][0]); }}
              className={`py-3 px-5 items-center justify-center rounded-xl mx-1 border ${currency === a.symbol ? 'bg-emerald-500/20 border-emerald-500' : 'bg-neutral-900 border-neutral-800'}`}
            >
              <Text className={`font-bold ${currency === a.symbol ? 'text-emerald-500' : 'text-neutral-500'}`}>{a.symbol}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text className="text-xs font-semibold text-neutral-400 mb-3 uppercase">Select Network</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {NETWORKS[currency].map(n => (
            <TouchableOpacity 
              key={n} 
              onPress={() => setNetwork(n)}
              className={`py-2 px-4 rounded-full border flex-row items-center ${network === n ? 'bg-blue-500/20 border-blue-500' : 'bg-neutral-900 border-neutral-800'}`}
            >
              <Globe color={network === n ? '#3b82f6' : '#525252'} size={14} className="mr-2" />
              <Text className={`font-bold text-sm ${network === n ? 'text-blue-500' : 'text-neutral-500'}`}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 items-center mt-4 shadow-2xl">
          <View className="w-56 h-56 bg-white rounded-3xl items-center justify-center mb-8 overflow-hidden">
             {loading || !address ? (
               <ActivityIndicator color="#10b981" size="large" />
             ) : (
               <QRCode 
                 value={address}
                 size={180}
                 backgroundColor="white"
                 color="black"
               />
             )}
          </View>
          
          <Text className="text-xs font-semibold text-neutral-400 mb-2 uppercase text-center">
            {currency === 'NGN' ? 'Your Virtual Account' : `Your ${network} Deposit Address`}
          </Text>
          
          {loading ? <ActivityIndicator color="#10b981" /> : (
            <View className="bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-800 flex-row items-center w-full justify-between">
              <Text className="text-white font-mono text-xs flex-1 mr-4" numberOfLines={1} ellipsizeMode="middle">
                {address || 'Fetching address...'}
              </Text>
              <TouchableOpacity onPress={copyToClipboard} className="p-2 bg-neutral-800 rounded-lg">
                <Copy color="#10b981" size={18} />
              </TouchableOpacity>
            </View>
          )}
          
          {!loading && currency !== 'NGN' && (
             <View className="flex-row items-center mt-6 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
               <Text className="text-red-400 text-[10px] text-center font-medium">
                 Send ONLY {currency} over the {network} network to this address. Sending other assets will result in permanent loss.
               </Text>
             </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
