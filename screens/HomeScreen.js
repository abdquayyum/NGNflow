import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { Bell, EyeOff, Eye, Download, Send, ArrowRightLeft, PlusCircle } from 'lucide-react-native';
import useStore from '../store/useStore';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

const ASSETS = [
  { symbol: 'NGN', name: 'Nigerian Naira', isFiat: true, logo: 'https://cdn.countryflags.com/thumbs/nigeria/flag-round-250.png' },
  { symbol: 'USDT', name: 'Tether', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'BTC', name: 'Bitcoin', isFiat: false, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', isFiat: false, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' }
];

export default function HomeScreen({ navigation }) {
  const balances = useStore(state => state.balances);
  const user = useStore(state => state.user);
  const fetchUserData = useStore(state => state.fetchUserData);
  const token = useStore(state => state.token);
  const rates = useStore(state => state.rates);
  const marketData = useStore(state => state.marketData);
  const fetchMarketData = useStore(state => state.fetchMarketData);
  
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const formatNGN = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserData(token);
    await fetchMarketData();
    setRefreshing(false);
  }, [token]);

  React.useEffect(() => {
    fetchMarketData();
    registerForPushNotificationsAsync().then(token => {
      if (token && user && user.push_token !== token) {
        useStore.getState().updatePushToken(token);
      }
    });
  }, [user?.id]);

  const totalNgnBalance = (balances.NGN || 0) + ((balances.USDT || 0) * rates.USDT) + ((balances.BTC || 0) * rates.BTC) + ((balances.ETH || 0) * rates.ETH);
  const isZeroBalance = totalNgnBalance === 0;

  return (
    <ScrollView 
      className="flex-1 bg-black px-5 py-6"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
    >
      <View className="flex-row justify-between items-center mb-8">
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-emerald-500 mr-3 items-center justify-center shadow-lg shadow-emerald-500/20 overflow-hidden">
             <Text className="text-white font-bold text-lg">{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <View>
            <Text className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mb-0.5">Welcome back</Text>
            <Text className="text-lg text-white font-bold">{user?.full_name || 'User'}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 rounded-full bg-neutral-900 items-center justify-center border border-neutral-800">
          <Bell color="#fff" size={20} />
          {!isZeroBalance && <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-neutral-900" />}
        </TouchableOpacity>
      </View>

      <View className="p-7 rounded-[2rem] bg-emerald-700 mb-8 overflow-hidden shadow-2xl shadow-emerald-900/20">
        <Image 
          source={{ uri: 'https://www.transparenttextures.com/patterns/stardust.png' }} 
          className="absolute inset-0 w-full h-full opacity-40" 
          resizeMode="repeat"
        />
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-bold text-emerald-100 uppercase tracking-widest z-10">Total Balance</Text>
          <TouchableOpacity onPress={() => setShowBalance(!showBalance)} className="p-1 z-10">
            {showBalance ? <EyeOff color="#fff" size={20} /> : <Eye color="#fff" size={20} />}
          </TouchableOpacity>
        </View>
        <Text className="text-[42px] font-extrabold text-white mb-8 tracking-tight z-10">
          {showBalance ? formatNGN(totalNgnBalance) : '••••••••'}
        </Text>
        
        {isZeroBalance ? (
          <TouchableOpacity onPress={() => navigation.navigate('Receive')} className="w-full bg-emerald-500 py-4 rounded-2xl items-center justify-center flex-row shadow-lg shadow-emerald-500/30  z-10">
            <PlusCircle color="#fff" size={20} strokeWidth={2.5} className="mr-2" />
            <Text className="text-white font-bold text-base tracking-wide">Fund Wallet to Start</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row space-x-3 z-10">
            <TouchableOpacity onPress={() => navigation.navigate('Receive')} className="flex-1 bg-neutral-900/80 py-3.5 rounded-2xl items-center justify-center mr-2 border border-white/5 ">
              <Download color="#fff" size={20} strokeWidth={2.5} />
              <Text className="text-white text-xs font-bold mt-1.5 tracking-wide">Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Transfer')} className="flex-1 bg-emerald-500 py-3.5 rounded-2xl items-center justify-center mx-2 shadow-lg shadow-emerald-500/30 ">
              <Send color="#fff" size={20} strokeWidth={2.5} />
              <Text className="text-white text-xs font-bold mt-1.5 tracking-wide">Send</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Swap', { initialAsset: 'USDT' })} className="flex-1 bg-neutral-900/80 py-3.5 rounded-2xl items-center justify-center ml-2 border border-white/5 ">
              <ArrowRightLeft color="#fff" size={20} strokeWidth={2.5} />
              <Text className="text-white text-xs font-bold mt-1.5 tracking-wide">Swap</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="mb-12">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-lg text-white font-bold">Your Assets</Text>
        </View>
        
        {ASSETS.map(asset => {
          const change = !asset.isFiat && marketData[asset.symbol] ? marketData[asset.symbol].change24h : 0;
          const isPositive = change >= 0;
          
          return (
            <TouchableOpacity 
              key={asset.symbol} 
              onPress={() => navigation.navigate(asset.isFiat ? 'Receive' : 'Swap', { initialAsset: asset.symbol })} 
              className="flex-row justify-between items-center p-4 bg-neutral-900 rounded-[1.5rem] border border-neutral-800 mb-3"
            >
              <View className="flex-row items-center">
                <Image source={{ uri: asset.logo }} className="w-12 h-12 rounded-full mr-4 bg-white" />
                <View>
                  <Text className="text-white font-bold text-base">{asset.name}</Text>
                  <Text className="text-neutral-400 text-sm mt-0.5 font-medium">{balances[asset.symbol]?.toLocaleString(undefined, {maximumFractionDigits: 4})} {asset.symbol}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white font-bold text-base">{formatNGN((balances[asset.symbol] || 0) * (rates[asset.symbol] || 1))}</Text>
                {!asset.isFiat && (
                  <Text className={`text-xs font-bold mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{change?.toFixed(2) || '0.00'}%
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
