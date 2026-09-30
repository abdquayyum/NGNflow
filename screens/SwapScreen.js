import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView
} from 'react-native';

import { ArrowDown, ChevronRight, X } from 'lucide-react-native';
import useStore from '../store/useStore';

const ASSETS = [
  { symbol: 'NGN', name: 'Nigerian Naira', isFiat: true, logo: 'https://cdn.countryflags.com/thumbs/nigeria/flag-round-250.png' },
  { symbol: 'USDT_ERC20', name: 'Tether (ERC20)', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'USDT_TRC20', name: 'Tether (TRC20)', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'USDT_BEP20', name: 'Tether (BEP20)', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'USDT_POLYGON', name: 'Tether (Polygon)', isFiat: false, logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
  { symbol: 'BTC', name: 'Bitcoin', isFiat: false, logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
  { symbol: 'ETH', name: 'Ethereum', isFiat: false, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  { symbol: 'TRX', name: 'Tron', isFiat: false, logo: 'https://cryptologos.cc/logos/tron-trx-logo.png' },
  { symbol: 'BNB', name: 'Binance Coin', isFiat: false, logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
  { symbol: 'POL', name: 'Polygon', isFiat: false, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' }
];

const USDT_NETWORKS = ['ERC20', 'TRC20', 'Polygon', 'BEP20'];

export default function SwapScreen({ route, navigation }) {
  const [payAmount, setPayAmount] = useState('');

  const initialSymbol = route.params?.initialAsset || 'USDT';
  const initialAssetObj = ASSETS.find(a => a.symbol === initialSymbol) || ASSETS[1];

  const [payAsset, setPayAsset] = useState(initialAssetObj);
  const [receiveAsset, setReceiveAsset] = useState(ASSETS[0]);
  const [receiveNetwork, setReceiveNetwork] = useState('ERC20');
  const [showSelector, setShowSelector] = useState({ isOpen: false, type: 'pay' });

  const balances = useStore(state => state.balances);

  // Sync selected asset with navigation params dynamically
  React.useEffect(() => {
    if (route.params?.initialAsset) {
      const sym = route.params.initialAsset === 'USDT' ? 'USDT_ERC20' : route.params.initialAsset;
      const found = ASSETS.find(a => a.symbol === sym);
      if (found) setPayAsset(found);
    }
  }, [route.params?.initialAsset]);

  const liveRates = useStore(state => state.rates);
  const { swap, loading, error, clearError } = useStore();

  const fromBalance = balances[payAsset.symbol] || 0;
  const parsedPay = parseFloat(payAmount || 0);

  const payRate = liveRates[payAsset.symbol] || payAsset.rate;
  const receiveRate = liveRates[receiveAsset.symbol] || receiveAsset.rate;

  const receiveAmount = parsedPay * (payRate / receiveRate);
  const isValid = parsedPay > 0 && parsedPay <= fromBalance;

  const handleSwap = async () => {
    if (!isValid) return;
    await swap(payAsset.symbol, receiveAsset.symbol, parsedPay);
    if (!error) {
      Alert.alert('Success', `Swapped ${parsedPay} ${payAsset.symbol} to ${receiveAmount.toFixed(4)} ${receiveAsset.symbol}`);
      setPayAmount('');
    }
  };

  const toggleDirection = () => {
    setPayAsset(receiveAsset);
    setReceiveAsset(payAsset);
    setPayAmount('');
  };

  const openSelector = (type) => setShowSelector({ isOpen: true, type });

  const selectAsset = (asset) => {
    if (showSelector.type === 'pay') {
      if (asset.symbol === receiveAsset.symbol) toggleDirection();
      else setPayAsset(asset);
    } else {
      if (asset.symbol === payAsset.symbol) toggleDirection();
      else setReceiveAsset(asset);
    }
    setShowSelector({ isOpen: false, type: 'pay' });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 24, // Standard padding to clear the immediate top
            paddingBottom: 40 // Breathing room at the bottom
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-2xl font-bold mb-8 text-center text-white">Instant Swap</Text>

          { }
          <View className={`bg-neutral-900 p-6 rounded-[2rem] border ${parsedPay > fromBalance ? 'border-red-500/50' : 'border-neutral-800'} mb-2`}>
            <Text className="text-xs text-neutral-400 font-medium uppercase mb-3">You Pay</Text>
            <View className="flex-row justify-between items-center h-16">
              <TextInput
                scrollEnabled={false}
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="numeric"
                className="flex-1 text-4xl font-bold text-white h-full"
                placeholder="0.00"
                placeholderTextColor="#525252"
                style={{ includeFontPadding: false, paddingVertical: 0 }}
              />
              <TouchableOpacity onPress={() => openSelector('pay')} className="flex-row items-center bg-neutral-950 px-3 py-2 rounded-full border border-neutral-800 ml-4">
                <Image source={{ uri: payAsset.logo }} className="w-5 h-5 rounded-full mr-2 bg-white" />
                <Text className="text-white font-semibold text-sm mr-2">{payAsset.symbol}</Text>
                <ChevronRight color="#525252" size={14} style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className={`text-xs ${parsedPay > fromBalance ? 'text-red-400' : 'text-neutral-500'}`}>
                Balance: {fromBalance.toLocaleString()} {payAsset.symbol}
              </Text>
              <TouchableOpacity onPress={() => setPayAmount(fromBalance.toString())}>
                <Text className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">MAX</Text>
              </TouchableOpacity>
            </View>
          </View>

          { }
          <View className="z-10 items-center -my-4">
            <TouchableOpacity onPress={toggleDirection} className="w-14 h-14 bg-emerald-600 rounded-full items-center justify-center border-4 border-black shadow-xl">
              <ArrowDown color="#fff" size={24} />
            </TouchableOpacity>
          </View>

          { }
          <View className="bg-neutral-900 p-6 rounded-[2rem] border border-neutral-800 mt-2">
            <Text className="text-xs text-neutral-400 font-medium uppercase mb-3">You Receive</Text>
            <View className="flex-row justify-between items-center h-16">
              <Text className="flex-1 text-4xl font-bold text-emerald-400 h-full" style={{ includeFontPadding: false, paddingVertical: 0, textAlignVertical: 'center' }} numberOfLines={1}>
                {receiveAmount ? receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0.00'}
              </Text>
              <TouchableOpacity onPress={() => openSelector('receive')} className="flex-row items-center bg-neutral-950 px-3 py-2 rounded-full border border-neutral-800 ml-4">
                <Image source={{ uri: receiveAsset.logo }} className="w-5 h-5 rounded-full mr-2 bg-white" />
                <Text className="text-white font-semibold text-sm mr-2">{receiveAsset.symbol}</Text>
                <ChevronRight color="#525252" size={14} style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-neutral-500 mt-4">Rate: 1 {payAsset.symbol} ≈ {(payRate / receiveRate).toLocaleString(undefined, { maximumFractionDigits: 4 })} {receiveAsset.symbol}</Text>
          </View>

          { }
          <TouchableOpacity
            onPress={handleSwap} disabled={!isValid || loading}
            className={`p-4 rounded-xl items-center mt-10 ${!isValid ? 'bg-neutral-900 border border-neutral-800' : 'bg-emerald-500'}`}
          >
            {loading ? <ActivityIndicator color="#fff" /> :
              <Text className={`font-bold text-lg ${!isValid ? 'text-neutral-600' : 'text-white'}`}>
                {parsedPay > fromBalance ? 'Insufficient Balance' : 'Confirm Swap'}
              </Text>
            }
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSelector.isOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-neutral-900 rounded-t-[2rem] h-2/3 p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">Select Asset</Text>
              <TouchableOpacity onPress={() => setShowSelector({ isOpen: false })} className="p-2 bg-neutral-800 rounded-full">
                <X color="#9ca3af" size={20} />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1">
              {ASSETS.map(asset => (
                <TouchableOpacity
                  key={asset.symbol} onPress={() => selectAsset(asset)}
                  className="flex-row justify-between items-center p-4 rounded-2xl mb-2 bg-neutral-950 border border-neutral-800/50"
                >
                  <View className="flex-row items-center">
                    <Image source={{ uri: asset.logo }} className="w-10 h-10 rounded-full mr-4 bg-white" />
                    <View>
                      <Text className="text-white font-semibold">{asset.name}</Text>
                      <Text className="text-neutral-500 text-xs">{asset.symbol}</Text>
                    </View>
                  </View>
                  <Text className="text-white font-semibold">{(balances[asset.symbol] || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}