import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = 'http://156.232.88.218:8001/api/v1';

const useStore = create((set, get) => ({
  user: null,
  token: null,
  balances: { NGN: 0, ETH: 0, BTC: 0, TRX: 0, USDT_TRON: 0, USDC_ETH: 0 },
  rates: { USDT: 1500, USDT_ERC20: 1500, USDT_TRC20: 1500, USDT_BEP20: 1500, USDT_POLYGON: 1500, BTC: 95000000, ETH: 4500000, TRX: 250, BNB: 850000, POL: 600, NGN: 1 },
  marketData: { BTC: { price: 0, change24h: 0 }, ETH: { price: 0, change24h: 0 }, USDT: { price: 0, change24h: 0 } },
  transactions: [],
  cards: [],
  banks: [],
  loading: false,
  error: null,
  
  init: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        set({ token });
        await get().fetchUserData(token);
      }
    } catch (e) { console.error('Init error', e); }
  },

  fetchUserData: async (token) => {
    try {
      const res = await axios.get(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      const newBalances = { NGN: 0, ETH: 0, BTC: 0, TRX: 0, USDT_TRON: 0, USDC_ETH: 0, USDT: 0 };
      
      // Merge returned balances directly
      if (data.balances) {
        Object.keys(data.balances).forEach(key => {
          newBalances[key] = data.balances[key];
        });
      }
      
      set({ 
        user: data.user, 
        balances: newBalances,
        transactions: data.transactions || []
      });
    } catch (error) {
      console.error('Fetch user data error', error);
      if (error.response?.status === 401) get().logout();
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const formData = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const res = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const token = res.data.access_token;
      await SecureStore.setItemAsync('token', token);
      set({ token });
      await get().fetchUserData(token);
      set({ loading: false });
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
    }
  },

  register: async (email, password, fullName) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/auth/register?email=${email}&password=${password}&full_name=${fullName}`);
      await get().login(email, password);
    } catch (error) { set({ error: error.response?.data?.detail || error.message, loading: false }); }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null, balances: { NGN: 0, ETH: 0, BTC: 0, TRX: 0, USDT_TRON: 0, USDC_ETH: 0 }, transactions: [], cards: [] });
  },

  clearError: () => set({ error: null }),

  swap: async (fromAsset, toAsset, amount) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/crypto/swap?from_currency=${fromAsset}&to_currency=${toAsset}&amount=${amount}`, {}, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      await get().fetchUserData(get().token);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return false;
    }
  },

  fetchCards: async () => {
    try {
      const res = await axios.get(`${API_URL}/cards/my-cards`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      set({ cards: res.data.cards });
    } catch (error) { console.error('Fetch cards error', error); }
  },

  issueCard: async (amount) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/cards/issue?funding_amount=${amount}`, {}, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      await get().fetchCards(); 
      await get().fetchUserData(get().token); 
      set({ loading: false });
      return true;
    } catch (error) { set({ error: error.response?.data?.detail || error.message, loading: false }); return false; }
  },

  updatePushToken: async (token) => {
    try {
      await axios.post(`${API_URL}/user/push-token`, { push_token: token }, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      // Optionally update local user state
      set(state => ({ user: { ...state.user, push_token: token } }));
    } catch (error) { console.log(error); }
  },

  getFiatDepositAccount: async () => {
    try {
      const res = await axios.get(`${API_URL}/fiat/deposit-account`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      return `${res.data.account_number} (${res.data.bank_name})`;
    } catch (error) {
      console.log("Error getting fiat deposit account", error);
      return "";
    }
  },
  getDepositAddress: async (currency, network) => {
    try {
      const res = await axios.get(`${API_URL}/crypto/deposit-address/${currency}?network=${network}`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      return res.data.address;
    } catch (error) {
      console.log('Error getting deposit address', error);
      if (error.response?.status === 401) get().logout();
      return '';
    }
  },

  deleteCard: async (cardId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/cards/delete/${cardId}`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      await get().fetchCards();
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return false;
    }
  },
  
  submitKYC: async (dob, title, gender) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/user/kyc`, { date_of_birth: dob, title, gender }, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      await get().fetchUserData(get().token);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return false;
    }
  },

  fetchRates: async (base, target) => {
    try {
      const res = await axios.get(`${API_URL}/crypto/rates?base_currency=${base}&target_currency=${target}`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      return res.data.rate;
    } catch (error) {
      return null;
    }
  },

  withdrawFiat: async (amount, bankCode, accountNumber) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/fiat/withdraw?amount=${amount}&bank_code=${bankCode}&account_number=${accountNumber}`, {}, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      await get().fetchUserData(get().token);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return false;
    }
  },

  transferCrypto: async (currency, network, address, amount) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/crypto/transfer?currency=${currency}&network=${network}&address=${address}&amount=${amount}`, {}, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      await get().fetchUserData(get().token);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.detail || error.message, loading: false });
      return false;
    }
  },

  fetchBanks: async () => {
    try {
      const res = await axios.get(`${API_URL}/fiat/banks`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      const banksList = res.data.banks || res.data || [];
      set({ banks: banksList });
      return banksList;
    } catch (error) {
      return [];
    }
  },

  fetchMarketData: async () => {
    try {
      const res = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true');
      const data = res.data;
      set({ 
        marketData: {
          BTC: { price: data.bitcoin.usd, change24h: data.bitcoin.usd_24h_change },
          ETH: { price: data.ethereum.usd, change24h: data.ethereum.usd_24h_change },
          USDT: { price: data.tether.usd, change24h: data.tether.usd_24h_change }
        }
      });
    } catch (error) { console.error('Market data error', error); }
  },

  resolveAccount: async (accountNumber, bankCode) => {
    try {
      const res = await axios.get(`${API_URL}/fiat/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: { Authorization: `Bearer ${get().token}` }
      });
      return res.data.account_name;
    } catch (error) {
      throw new Error(error.response?.data?.detail || "Could not verify account");
    }
  },
}));

export default useStore;
