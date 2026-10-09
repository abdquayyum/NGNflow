import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal, TextInput, Switch, Linking, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Shield, Bell, Key, LogOut, ChevronRight, HelpCircle, X, Check, Mail, Globe, ChevronDown } from 'lucide-react-native';
import useStore from '../store/useStore';
import axios from 'axios';

const API_URL = 'http://156.232.88.218:8001/api/v1';


const DropdownField = ({ label, value, options, onSelect }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <View className="mb-6">
      <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">{label}</Text>
      <TouchableOpacity 
        onPress={() => setOpen(!open)}
        className="bg-neutral-900 flex-row justify-between items-center p-4 rounded-2xl border border-neutral-800"
      >
        <Text className={value ? "text-white" : "text-neutral-500"}>{value || `Select ${label}`}</Text>
        <ChevronDown color="#737373" size={20} />
      </TouchableOpacity>
      {open && (
        <View className="mt-2 w-full bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
          {options.map((opt, i) => (
            <TouchableOpacity 
              key={i} 
              onPress={() => { onSelect(opt); setOpen(false); }}
              className={`p-4 ${i !== options.length - 1 ? 'border-b border-neutral-800' : ''}`}
            >
              <Text className="text-white">{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function SettingsScreen() {
  const { user, token, logout, fetchUserData } = useStore();
  const [activeModal, setActiveModal] = useState(null); // 'profile', 'kyc', 'password', 'notifications', 'help'
  const [loading, setLoading] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');

  // KYC State
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [title, setTitle] = useState(user?.title || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [bvn, setBvn] = useState(user?.bvn || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password State
  const [newPassword, setNewPassword] = useState('');

  // Notifications State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() }
    ]);
  };

  const saveProfile = async () => {
    if (!fullName) return Alert.alert('Error', 'Full name cannot be empty');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/update-profile`, { full_name: fullName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUserData(token);
      setActiveModal(null);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  const saveKYC = async () => {
    if (!fullName || !dob || !title || !gender || !bvn || !phone) return Alert.alert('Error', 'Please fill all KYC fields');
    if (bvn.length !== 11) return Alert.alert('Error', 'BVN must be exactly 11 digits');
    
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('234')) formattedPhone = '0' + formattedPhone.slice(3);
    if (formattedPhone.length !== 11) return Alert.alert('Error', 'Phone must be a valid 11-digit Nigerian number (e.g. 080...)');
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/kyc`, { 
        full_name: fullName, 
        date_of_birth: dob, 
        title, 
        gender, 
        bvn, 
        phone: formattedPhone 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUserData(token);
      setActiveModal(null);
      Alert.alert('KYC Verified', 'Your Identity was successfully verified and your Virtual Account is now live!');
    } catch (e) {
      Alert.alert('KYC Verification Failed', e.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  const savePassword = async () => {
    if (newPassword.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/user/update-password`, { new_password: newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveModal(null);
      setNewPassword('');
      Alert.alert('Success', 'Password updated successfully');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.detail || e.message);
    } finally { setLoading(false); }
  };

  const SettingRow = ({ icon: Icon, titleText, subtitle, isDestructive, onPress }) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center p-4 bg-neutral-900 border-b border-neutral-800">
      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isDestructive ? 'bg-red-500/10' : 'bg-neutral-800'}`}>
        <Icon color={isDestructive ? "#ef4444" : "#a3a3a3"} size={20} />
      </View>
      <View className="flex-1">
        <Text className={`font-semibold text-base ${isDestructive ? 'text-red-500' : 'text-white'}`}>{titleText}</Text>
        {subtitle && <Text className="text-neutral-500 text-xs mt-0.5">{subtitle}</Text>}
      </View>
      {!isDestructive && <ChevronRight color="#525252" size={20} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-5 py-4 border-b border-neutral-900">
        <Text className="text-2xl font-bold text-white">Settings</Text>
      </View>
      <ScrollView className="flex-1">
        <View className="p-6 items-center border-b border-neutral-900">
          <View className="w-20 h-20 bg-emerald-500 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl font-bold text-white">{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <Text className="text-xl font-bold text-white mb-1">{user?.full_name || 'User'}</Text>
          <Text className="text-neutral-400">{user?.email}</Text>
          <View className={`mt-4 px-3 py-1 rounded-full border ${user?.kyc_status === 'tier1' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-yellow-500/20 border-yellow-500/30'}`}>
            <Text className={`text-xs font-bold uppercase ${user?.kyc_status === 'tier1' ? 'text-emerald-400' : 'text-yellow-400'}`}>
              {user?.kyc_status === 'tier1' ? 'KYC Level 1 Verified' : 'KYC Pending'}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-xs font-bold text-neutral-500 uppercase px-5 mb-2">Account</Text>
          <View className="border-t border-neutral-800">
            <SettingRow icon={User} titleText="Personal Information" subtitle="Update your profile details" onPress={() => { setFullName(user?.full_name || ''); setActiveModal('profile'); }} />
            <SettingRow icon={Shield} titleText="Identity Verification (KYC)" subtitle="Upgrade your limits" onPress={() => { setDob(user?.date_of_birth || ''); setTitle(user?.title || ''); setGender(user?.gender || ''); setBvn(user?.bvn || ''); setActiveModal('kyc'); }} />
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-xs font-bold text-neutral-500 uppercase px-5 mb-2">Security & Preferences</Text>
          <View className="border-t border-neutral-800">
            <SettingRow icon={Key} titleText="Change Password" onPress={() => { setNewPassword(''); setActiveModal('password'); }} />
            <SettingRow icon={Bell} titleText="Notifications" subtitle="Push and email alerts" onPress={() => setActiveModal('notifications')} />
            <SettingRow icon={HelpCircle} titleText="Help & Support" onPress={() => setActiveModal('help')} />
          </View>
        </View>

        <View className="mt-8 mb-12 border-t border-b border-neutral-800">
          <SettingRow icon={LogOut} titleText="Log Out" isDestructive onPress={handleLogout} />
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={activeModal === 'profile'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-neutral-950">
          <View className="flex-row items-center justify-between p-5 border-b border-neutral-900">
            <Text className="text-xl font-bold text-white">Personal Information</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-neutral-900 rounded-full">
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} className="flex-1">
          <View className="p-5 flex-1">
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">Full Name</Text>
            <TextInput  value={fullName} onChangeText={setFullName} className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 mb-6" placeholderTextColor="#737373" placeholder="Enter your full name" />
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">Email Address (Read Only)</Text>
            <TextInput  value={user?.email || ''} editable={false} className="bg-neutral-900/50 text-neutral-500 p-4 rounded-2xl border border-neutral-800 mb-6" />
          </View>
          <View className="p-5 border-t border-neutral-900 bg-neutral-950">
            <TouchableOpacity onPress={saveProfile} disabled={loading} className="bg-emerald-500 h-14 rounded-2xl items-center justify-center">
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* KYC Modal */}
      <Modal visible={activeModal === 'kyc'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-neutral-950">
          <View className="flex-row items-center justify-between p-5 border-b border-neutral-900">
            <Text className="text-xl font-bold text-white">Identity Verification</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-neutral-900 rounded-full">
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} className="flex-1">
          <ScrollView className="p-5 flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
            <Text className="text-neutral-400 mb-6 leading-5">To unlock higher transaction limits and virtual cards, please provide your personal identity details.</Text>
            
            <DropdownField 
              label="Title" 
              value={title} 
              options={["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", "Rev"]} 
              onSelect={setTitle} 
            />
            
            <DropdownField 
              label="Gender" 
              value={gender} 
              options={["Male", "Female"]} 
              onSelect={setGender} 
            />
            
            
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">Legal Full Name (Must match BVN exactly)</Text>
            <TextInput value={fullName} onChangeText={setFullName} className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 mb-6" placeholderTextColor="#737373" placeholder="First Last" />
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">Registered Phone Number</Text>
            <TextInput value={phone} onChangeText={setPhone} className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 mb-6" placeholderTextColor="#737373" placeholder="080..." keyboardType="phone-pad" />
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">Bank Verification Number (BVN)</Text>
            <TextInput value={bvn} onChangeText={setBvn} className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 mb-6" placeholderTextColor="#737373" placeholder="11-digit BVN" keyboardType="numeric" maxLength={11} />
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">Date of Birth (YYYY-MM-DD)</Text>
            <TextInput  value={dob} onChangeText={setDob} className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 mb-6" placeholderTextColor="#737373" placeholder="1990-01-01" keyboardType="numeric" />
          </ScrollView>
          <View className="p-5 border-t border-neutral-900 bg-neutral-950">
            <TouchableOpacity onPress={saveKYC} disabled={loading} className="bg-emerald-500 h-14 rounded-2xl items-center justify-center">
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Submit KYC</Text>}
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Password Modal */}
      <Modal visible={activeModal === 'password'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-neutral-950">
          <View className="flex-row items-center justify-between p-5 border-b border-neutral-900">
            <Text className="text-xl font-bold text-white">Change Password</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-neutral-900 rounded-full">
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} className="flex-1">
          <View className="p-5 flex-1">
            <Text className="text-neutral-400 text-xs font-bold mb-2 uppercase">New Password</Text>
            <TextInput  value={newPassword} onChangeText={setNewPassword} secureTextEntry className="bg-neutral-900 text-white p-4 rounded-2xl border border-neutral-800 mb-6" placeholderTextColor="#737373" placeholder="Enter new password" />
          </View>
          <View className="p-5 border-t border-neutral-900 bg-neutral-950">
            <TouchableOpacity onPress={savePassword} disabled={loading || newPassword.length < 6} className={`h-14 rounded-2xl items-center justify-center ${newPassword.length < 6 ? 'bg-neutral-800' : 'bg-emerald-500'}`}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text className={`font-bold text-lg ${newPassword.length < 6 ? 'text-neutral-500' : 'text-white'}`}>Update Password</Text>}
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-neutral-950">
          <View className="flex-row items-center justify-between p-5 border-b border-neutral-900">
            <Text className="text-xl font-bold text-white">Notifications</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-neutral-900 rounded-full">
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
          <View className="p-5 flex-1">
            <View className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden mb-6">
              <View className="flex-row items-center justify-between p-4 border-b border-neutral-800">
                <View>
                  <Text className="text-white font-bold text-base mb-1">Push Notifications</Text>
                  <Text className="text-neutral-400 text-xs">Receive alerts for deposits and withdrawals</Text>
                </View>
                <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: '#3f3f46', true: '#10b981' }} thumbColor="#fff" />
              </View>
              <View className="flex-row items-center justify-between p-4">
                <View>
                  <Text className="text-white font-bold text-base mb-1">Email Updates</Text>
                  <Text className="text-neutral-400 text-xs">Account security and feature updates</Text>
                </View>
                <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: '#3f3f46', true: '#10b981' }} thumbColor="#fff" />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Help Modal */}
      <Modal visible={activeModal === 'help'} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-neutral-950">
          <View className="flex-row items-center justify-between p-5 border-b border-neutral-900">
            <Text className="text-xl font-bold text-white">Help & Support</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)} className="p-2 bg-neutral-900 rounded-full">
              <X color="#fff" size={20} />
            </TouchableOpacity>
          </View>
          <ScrollView className="p-5 flex-1">
            <TouchableOpacity onPress={() => Linking.openURL('mailto:support@ngnflow.app')} className="flex-row items-center bg-neutral-900 p-5 rounded-2xl border border-neutral-800 mb-4">
              <Mail color="#10b981" size={24} className="mr-4" />
              <View>
                <Text className="text-white font-bold text-lg mb-1">Email Support</Text>
                <Text className="text-neutral-400 text-sm">support@ngnflow.app</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://ngnflow.app/faq')} className="flex-row items-center bg-neutral-900 p-5 rounded-2xl border border-neutral-800 mb-4">
              <Globe color="#3b82f6" size={24} className="mr-4" />
              <View>
                <Text className="text-white font-bold text-lg mb-1">Help Center & FAQ</Text>
                <Text className="text-neutral-400 text-sm">Read our guides and policies</Text>
              </View>
            </TouchableOpacity>
            
            <View className="mt-8 items-center">
              <Text className="text-neutral-600 text-xs font-bold mb-1">NGNflow Version 1.0.0 (Build 42)</Text>
              <Text className="text-neutral-600 text-xs">© 2026 NGNflow Inc. All rights reserved.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
