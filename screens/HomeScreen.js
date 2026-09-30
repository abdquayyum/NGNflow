import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { Bell, EyeOff, Eye, Download, Send, ArrowRightLeft, PlusCircle } from 'lucide-react-native';
import useStore from '../store/useStore';
import { registerForPushNotificationsAsync } from '../utils/pushNotifications';

const ASSETS = [
  { symbol: 'NGN', name: 'Nigerian Naira', isFiat: true, logo: 'https://cdn.countryflags.com/thumbs/nigeria/flag-round-250.png' },
  { symbol: 'USDT_ERC20', name: 'Tether (ERC20)', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'USDT_TRC20', name: 'Tether (TRC20)', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'TRX', name: 'Tron', isFiat: false, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
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
      className="flex-1 bg-[#09090B] px-6 py-6 pt-12"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
    >
      {/* Header Section */}
      <View className="flex-row justify-between items-center mb-10 mt-4">
        <View className="flex-1">
          <Text className="text-neutral-500 font-semibold text-xs tracking-widest uppercase mb-1">Overview</Text>
          <Text className="text-2xl text-white font-bold tracking-tight">{user?.full_name || 'Portfolio'}</Text>
        </View>

        <View className="flex-row items-center space-x-3">
          <TouchableOpacity className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 items-center justify-center relative">
            <Bell color="#a3a3a3" size={20} />
            {!isZeroBalance && <View className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-900" />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <View className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center overflow-hidden">
              <Text className="text-emerald-400 font-bold text-lg">{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Balance Section */}
      <View className="items-center mb-10">
        <TouchableOpacity
          onPress={() => setShowBalance(!showBalance)}
          className="flex-row items-center bg-neutral-900/60 px-4 py-2 rounded-full border border-neutral-800/60 mb-5"
        >
          <Text className="text-neutral-400 text-xs font-bold uppercase tracking-widest mr-2">Total Balance</Text>
          {showBalance ? <EyeOff color="#9ca3af" size={14} /> : <Eye color="#9ca3af" size={14} />}
        </TouchableOpacity>

        <Text className="text-[48px] font-black text-white tracking-tighter mb-2">
          {showBalance ? formatNGN(totalNgnBalance) : '••••••••'}
        </Text>
      </View>

      {/* Quick Actions (Unified Pill Design) */}
      <View className="mb-12">
        {isZeroBalance ? (
          <TouchableOpacity onPress={() => navigation.navigate('Receive')} className="w-full bg-emerald-500 py-4 rounded-full items-center justify-center flex-row shadow-lg shadow-emerald-500/20">
            <PlusCircle color="#fff" size={20} strokeWidth={2.5} className="mr-2" />
            <Text className="text-white font-bold text-base tracking-wide">Fund Wallet to Start</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row bg-neutral-900/50 p-2 rounded-[2rem] border border-neutral-800/50">
            <TouchableOpacity onPress={() => navigation.navigate('Receive')} className="flex-1 flex-row bg-transparent py-3.5 items-center justify-center rounded-[1.5rem]">
              <Download color="#10b981" size={18} strokeWidth={2.5} className="mr-2" />
              <Text className="text-white text-sm font-semibold tracking-wide">Receive</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Transfer')} className="flex-1 flex-row bg-emerald-500 py-3.5 items-center justify-center rounded-[1.5rem] shadow-sm shadow-emerald-500/20">
              <Send color="#fff" size={18} strokeWidth={2.5} className="mr-2" />
              <Text className="text-white text-sm font-semibold tracking-wide">Send</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Swap', { initialAsset: 'USDT' })} className="flex-1 flex-row bg-transparent py-3.5 items-center justify-center rounded-[1.5rem]">
              <ArrowRightLeft color="#10b981" size={18} strokeWidth={2.5} className="mr-2" />
              <Text className="text-white text-sm font-semibold tracking-wide">Swap</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Assets List */}
      <View className="mb-12">
        <Text className="text-xl text-white font-semibold tracking-tight mb-5">Your Assets</Text>

        <View className="space-y-3">
          {ASSETS.map(asset => {
            const change = !asset.isFiat && marketData[asset.symbol] ? marketData[asset.symbol].change24h : 0;
            const isPositive = change >= 0;

            return (
              <TouchableOpacity
                key={asset.symbol}
                onPress={() => navigation.navigate(asset.isFiat ? 'Receive' : 'Swap', { initialAsset: asset.symbol })}
                className="flex-row justify-between items-center p-4 bg-white/[0.02] rounded-[1.5rem] border border-white/5"
              >
                <View className="flex-row items-center">
                  <Image source={{ uri: asset.logo }} className="w-11 h-11 rounded-full mr-4 bg-white/10" />
                  <View>
                    <Text className="text-white font-bold text-base">{asset.name}</Text>
                    <Text className="text-neutral-500 text-xs mt-1 font-medium">
                      {balances[asset.symbol]?.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white font-bold text-base tracking-tight">
                    {formatNGN((balances[asset.symbol] || 0) * (rates[asset.symbol] || 1))}
                  </Text>
                  {!asset.isFiat && (
                    <View className={`mt-1 px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                      <Text className={`text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{change?.toFixed(2) || '0.00'}%
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}