import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { PlusCircle, CreditCard, X, Trash2 } from 'lucide-react-native';
import useStore from '../store/useStore';

export default function CardsScreen() {
  const cards = useStore(state => state.cards);
  const balances = useStore(state => state.balances);
  const issueCard = useStore(state => state.issueCard);
  const deleteCard = useStore(state => state.deleteCard);
  const submitKYC = useStore(state => state.submitKYC);
  const fetchCards = useStore(state => state.fetchCards);
  const user = useStore(state => state.user);
  
  const [flippedCards, setFlippedCards] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycDob, setKycDob] = useState('');
  const [kycTitle, setKycTitle] = useState('MR');
  const [kycGender, setKycGender] = useState('M');

  useEffect(() => {
    fetchCards();
  }, []);

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateCardClick = () => {
    if (balances.NGN < 15000) {
      Alert.alert('Insufficient Balance', 'You need at least ₦15,000 to create and fund a Virtual USD Card.');
      return;
    }
    
    if (user?.kyc_status === 'none' || !user?.date_of_birth) {
      setShowKycModal(true);
      return;
    }
    
    executeIssueCard();
  };
  
  const executeIssueCard = async () => {
    setLoading(true);
    const success = await issueCard(10); 
    if (success) {
      Alert.alert('Success', 'Virtual Card created successfully!');
    } else {
      const errorMsg = useStore.getState().error;
      Alert.alert('Card Creation Failed', errorMsg || 'An unknown error occurred.');
    }
    setLoading(false);
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert('Delete Card', 'Are you sure you want to permanently delete this virtual card?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setLoading(true);
        const success = await deleteCard(cardId);
        setLoading(false);
        if (success) {
           Alert.alert('Deleted', 'Virtual card terminated successfully.');
        } else {
           const errorMsg = useStore.getState().error;
           Alert.alert('Delete Failed', errorMsg || 'An unknown error occurred.');
        }
      }}
    ]);
  };
  
  const handleKycSubmit = async () => {
    if (!kycDob || !kycTitle || !kycGender) {
      Alert.alert('Missing Fields', 'Please fill out all KYC fields.');
      return;
    }
    setLoading(true);
    const success = await submitKYC(kycDob, kycTitle, kycGender);
    setLoading(false);
    
    if (success) {
      setShowKycModal(false);
      executeIssueCard();
    } else {
      const errorMsg = useStore.getState().error;
      Alert.alert('KYC Failed', errorMsg || 'An unknown error occurred.');
    }
  };

  return (
    <View className="flex-1 bg-black px-5 justify-center pt-20">
      <Text className="text-2xl font-bold text-center text-white mb-8">Virtual Cards</Text>
      
      {cards.length === 0 ? (
        <View className="flex-1 justify-center items-center -mt-20">
           <View className="w-24 h-24 bg-neutral-900 rounded-full items-center justify-center mb-6">
             <CreditCard color="#525252" size={40} />
           </View>
           <Text className="text-white text-xl font-bold mb-2">No Cards Yet</Text>
           <Text className="text-neutral-400 text-center mb-8 px-8">Create a Virtual USD Visa card to pay for Apple Music, Netflix, and online shopping globally.</Text>
           
           <TouchableOpacity 
             onPress={handleCreateCardClick}
             disabled={loading}
             className="bg-emerald-500 py-4 px-8 rounded-2xl flex-row items-center active:scale-95 transition-transform"
           >
             {loading ? <ActivityIndicator color="#fff" /> : (
               <>
                 <PlusCircle color="#fff" size={20} className="mr-2" />
                 <Text className="text-white font-bold text-base">Create Card ($10)</Text>
               </>
             )}
           </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {cards.map((card, index) => {
            const isFlipped = flippedCards[card.id];
            
            // Format PAN for display if available, else mask
            let displayPan = card.full_pan || card.masked_pan || '4289 0000 0000 0000';
            if (displayPan.length > 16) displayPan = displayPan.substring(0, 16);
            if (displayPan.length === 16) {
               displayPan = displayPan.match(/.{1,4}/g).join(' ');
            }

            return (
            <TouchableOpacity 
              key={card.id || index}
              activeOpacity={0.9} 
              onPress={() => toggleFlip(card.id)}
              className="w-full aspect-[1.586/1] bg-indigo-600 rounded-3xl p-6 justify-between border border-white/20 mb-8 shadow-2xl shadow-indigo-600/30"
            >
              {!isFlipped ? (
                <>
                  <View className="flex-row justify-between items-start">
                    <View className="w-12 h-8 bg-white/20 rounded justify-center items-center">
                      <View className="w-8 h-5 border border-white/50 rounded-sm" />
                    </View>
                    <Text className="font-bold text-2xl italic text-white tracking-widest">VISA</Text>
                  </View>
                  <View>
                    <Text className="text-white/80 text-xs uppercase tracking-widest mb-2">Virtual Debit</Text>
                    <Text className="text-[22px] font-mono tracking-widest text-white">{displayPan}</Text>
                  </View>
                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-[10px] text-white/70 uppercase tracking-widest mb-1">Cardholder Name</Text>
                      <Text className="font-medium text-sm tracking-widest text-white uppercase">{user?.full_name || 'USER'}</Text>
                    </View>
                    <View>
                      <Text className="text-[10px] text-white/70 uppercase tracking-widest mb-1 text-right">Valid Thru</Text>
                      <Text className="font-medium text-sm tracking-widest text-white">{card.expiration || '12/28'}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View className="flex-1 bg-neutral-900 -m-6 rounded-3xl overflow-hidden justify-center items-center">
                  <View className="w-full h-12 bg-black absolute top-6" />
                  <View className="px-6 w-full mt-10">
                    <View className="w-full bg-white h-10 items-end justify-center px-4 rounded-sm mb-6">
                      <Text className="text-black font-mono font-bold text-lg">{card.cvv || '123'}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                      className="bg-red-500/20 border border-red-500/50 py-3 rounded-xl flex-row justify-center items-center mb-4"
                    >
                       <Trash2 color="#ef4444" size={18} className="mr-2" />
                       <Text className="text-red-500 font-bold">Delete Card</Text>
                    </TouchableOpacity>

                    <Text className="text-[10px] text-neutral-500 text-center">This card is issued by Spenda Financial.</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          )})}
          
          <TouchableOpacity 
             onPress={handleCreateCardClick}
             disabled={loading}
             className="bg-emerald-500/20 border border-emerald-500 py-4 rounded-2xl flex-row items-center justify-center active:scale-95 transition-transform mb-10"
           >
             {loading ? <ActivityIndicator color="#10b981" /> : (
               <>
                 <PlusCircle color="#10b981" size={20} className="mr-2" />
                 <Text className="text-emerald-500 font-bold text-base">Create Another Card</Text>
               </>
             )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* KYC Modal */}
      <Modal visible={showKycModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-neutral-900 rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">Identity Verification</Text>
              <TouchableOpacity onPress={() => setShowKycModal(false)}>
                <X color="#737373" size={24} />
              </TouchableOpacity>
            </View>
            <Text className="text-neutral-400 mb-6">We need a few more details to issue your USD Virtual Card in compliance with international regulations.</Text>
            
            <View className="mb-4">
              <Text className="text-neutral-400 text-xs uppercase font-bold mb-2 ml-1">Title</Text>
              <View className="flex-row items-center bg-neutral-950 rounded-2xl border border-neutral-800 px-4 py-1 h-14">
                <TextInput  
                  value={kycTitle} onChangeText={setKycTitle}
                  className="flex-1 text-white font-medium text-base p-0 m-0"
                  placeholderTextColor="#737373" placeholder="MR / MRS"
                />
              </View>
            </View>
            
            <View className="mb-4">
              <Text className="text-neutral-400 text-xs uppercase font-bold mb-2 ml-1">Gender</Text>
              <View className="flex-row items-center bg-neutral-950 rounded-2xl border border-neutral-800 px-4 py-1 h-14">
                <TextInput  
                  value={kycGender} onChangeText={setKycGender}
                  className="flex-1 text-white font-medium text-base p-0 m-0"
                  placeholderTextColor="#737373" placeholder="M / F"
                />
              </View>
            </View>
            
            <View className="mb-8">
              <Text className="text-neutral-400 text-xs uppercase font-bold mb-2 ml-1">Date of Birth (YYYY-MM-DD)</Text>
              <View className="flex-row items-center bg-neutral-950 rounded-2xl border border-neutral-800 px-4 py-1 h-14">
                <TextInput  
                  value={kycDob} onChangeText={setKycDob}
                  className="flex-1 text-white font-medium text-base p-0 m-0"
                  placeholderTextColor="#737373" placeholder="1990-01-01"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleKycSubmit} 
              disabled={loading}
              className="bg-emerald-500 h-14 rounded-2xl items-center justify-center mb-8"
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Verify & Create Card</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
