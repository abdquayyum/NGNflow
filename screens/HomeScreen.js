import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, Alert, Modal, SafeAreaView } from 'react-native';
import { Bell, EyeOff, Eye, Download, Send, ArrowRightLeft, PlusCircle, ChevronRight, AlertTriangle, X, Check } from 'lucide-react-native';
import useStore from '../store/useStore';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '../utils/pushNotifications';

const ASSETS = [
  { symbol: 'NGN', name: 'Nigerian Naira', isFiat: true, logo: 'https://cdn.countryflags.com/thumbs/nigeria/flag-round-250.png' },
  { symbol: 'USDT', name: 'Tether', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'BTC', name: 'Bitcoin', isFiat: false, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', isFiat: false, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'TRX', name: 'Tron', isFiat: false, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
  { symbol: 'BNB', name: 'Binance Coin', isFiat: false, logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { symbol: 'POL', name: 'Polygon', isFiat: false, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' }
];

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

export default function HomeScreen({ navigation }) {
  const balances = useStore(state => state.balances);
  const user = useStore(state => state.user);
  const fetchUserData = useStore(state => state.fetchUserData);
  const token = useStore(state => state.token);
  const rates = useStore(state => state.rates);
  const marketData = useStore(state => state.marketData);
  const fetchMarketData = useStore(state => state.fetchMarketData);

  const notifications = useStore(state => state.notifications);
  const unreadNotificationsCount = useStore(state => state.unreadNotificationsCount);
  const markNotificationAsRead = useStore(state => state.markNotificationAsRead);
  const markAllNotificationsAsRead = useStore(state => state.markAllNotificationsAsRead);
  const clearNotifications = useStore(state => state.clearNotifications);

  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const formatNGN = (amount) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserData(token);
    await fetchMarketData();
    await useStore.getState().loadNotifications();
    setRefreshing(false);
  }, [token]);

  React.useEffect(() => {
    fetchMarketData();
    useStore.getState().loadNotifications();

    registerForPushNotificationsAsync().then(pushToken => {
      if (pushToken && user && user.push_token !== pushToken) {
        useStore.getState().updatePushToken(pushToken);
      }
    });

    const cleanup = setupNotificationListeners(notification => {
      const content = notification.request?.content || {};
      useStore.getState().addNotification({
        id: notification.request?.identifier || Date.now().toString(),
        title: content.title || 'Notification',
        body: content.body || '',
        date: new Date(notification.date || Date.now()).toISOString(),
        read: false,
        data: content.data || {},
      });
    });

    return () => cleanup && cleanup();
  }, [user?.id]);

  const totalNgnBalance = (balances.NGN || 0) + ((balances.USDT || 0) * rates.USDT) + ((balances.BTC || 0) * rates.BTC) + ((balances.ETH || 0) * rates.ETH);
  const isZeroBalance = totalNgnBalance === 0;

  return (
    <>
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
          <TouchableOpacity 
            onPress={() => setShowNotificationsModal(true)} 
            className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 items-center justify-center relative"
          >
            <Bell color={unreadNotificationsCount > 0 ? "#10b981" : "#a3a3a3"} size={20} />
            {unreadNotificationsCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-emerald-500 min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center border-2 border-neutral-950">
                <Text className="text-black font-extrabold text-[10px]">{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <View className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center overflow-hidden">
              <Text className="text-emerald-400 font-bold text-lg">{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Warning Banner: KYC needed for account creation */}
      {user?.kyc_status !== 'tier1' && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings', { openModal: 'kyc' })} 
          className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl mb-8 flex-row items-center shadow-lg shadow-amber-500/5 active:scale-[0.99]"
        >
          <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center mr-3.5 border border-amber-500/30">
            <AlertTriangle color="#f59e0b" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-amber-400 font-bold mb-1 text-sm">Account Not Created</Text>
            <Text className="text-amber-200/80 text-xs leading-5 pr-2">
              KYC is needed for account creation. Complete your identity verification to generate your dedicated bank account.
            </Text>
          </View>
          <ChevronRight color="#f59e0b" size={20} />
        </TouchableOpacity>
      )}


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
            const bal = asset.symbol === 'USDT' ? ((balances['USDT_ERC20'] || 0) + (balances['USDT_TRC20'] || 0) + (balances['USDT_BEP20'] || 0) + (balances['USDT_POLYGON'] || 0)) : (balances[asset.symbol] || 0);
            const rate = asset.symbol === 'USDT' ? (rates['USDT_ERC20'] || 1) : (rates[asset.symbol] || 1);
            
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
                      {bal.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.symbol}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-white font-bold text-base tracking-tight">
                    {formatNGN(bal * rate)}
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

    {/* Real Notifications Modal */}
    <Modal visible={showNotificationsModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-neutral-950">
        <View className="flex-row items-center justify-between p-5 border-b border-neutral-900">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
              <Bell color="#10b981" size={20} />
            </View>
            <View>
              <Text className="text-xl font-bold text-white">Notifications</Text>
              {unreadNotificationsCount > 0 && (
                <Text className="text-emerald-400 text-xs font-semibold">{unreadNotificationsCount} unread</Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center">
            {notifications.length > 0 && (
              <TouchableOpacity onPress={markAllNotificationsAsRead} className="px-3 py-1.5 rounded-xl bg-neutral-900 mr-2 border border-neutral-800">
                <Text className="text-neutral-300 text-xs font-semibold">Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowNotificationsModal(false)} className="p-2 bg-neutral-900 rounded-full">
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View className="items-center justify-center py-28 px-6">
              <View className="w-20 h-20 bg-neutral-900 rounded-full items-center justify-center mb-6 border border-neutral-800">
                <Bell color="#525252" size={32} />
              </View>
              <Text className="text-white text-lg font-bold mb-2">No Notifications Yet</Text>
              <Text className="text-neutral-500 text-center text-xs leading-5">
                Real notifications pushed to your account, such as deposits, swaps, and announcements, will appear here.
              </Text>
            </View>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                onPress={() => markNotificationAsRead(item.id)}
                className={`p-4 rounded-2xl mb-3 border ${item.read ? 'bg-neutral-900/60 border-neutral-800/60' : 'bg-neutral-900 border-emerald-500/30'}`}
              >
                <View className="flex-row justify-between items-start mb-1.5">
                  <View className="flex-row items-center flex-1 mr-2">
                    {!item.read && <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />}
                    <Text className="text-white font-bold text-sm flex-1">{item.title}</Text>
                  </View>
                  <Text className="text-neutral-500 text-[10px]">{formatTime(item.date)}</Text>
                </View>
                <Text className="text-neutral-300 text-xs leading-5">{item.body}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {notifications.length > 0 && (
          <View className="p-5 border-t border-neutral-900 bg-neutral-950">
            <TouchableOpacity onPress={clearNotifications} className="py-2.5 items-center">
              <Text className="text-red-400 font-semibold text-xs">Clear Notification History</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
    </>
  );
}