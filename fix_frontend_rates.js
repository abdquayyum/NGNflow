const fs = require('fs');

const swapFile = 'screens/SwapScreen.js';
let content = fs.readFileSync(swapFile, 'utf8');

const oldFetchBlock = `
    const getLiveRates = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,tron,binancecoin,matic-network&vs_currencies=ngn');
        const data = await res.json();
        useStore.setState((state) => ({
          rates: {
            ...state.rates,
            BTC: data.bitcoin?.ngn || state.rates.BTC,
            ETH: data.ethereum?.ngn || state.rates.ETH,
            USDT: data.tether?.ngn || state.rates.USDT,
            USDT_ERC20: data.tether?.ngn || state.rates.USDT_ERC20,
            USDT_TRC20: data.tether?.ngn || state.rates.USDT_TRC20,
            USDT_BEP20: data.tether?.ngn || state.rates.USDT_BEP20,
            USDT_POLYGON: data.tether?.ngn || state.rates.USDT_POLYGON,
            TRX: data.tron?.ngn || state.rates.TRX,
            BNB: data.binancecoin?.ngn || state.rates.BNB,
            POL: data['matic-network']?.ngn || state.rates.POL,
          }
        }));
      } catch (err) {
        console.error("Failed to fetch live rates:", err);
      }
    };
`;

const newFetchBlock = `
    const getLiveRates = async () => {
      try {
        const axios = require('axios');
        // Fetch from our own secure backend, which natively caches CoinGecko and completely bypasses rate-limits
        const res = await axios.get('http://156.232.88.218:8001/api/v1/crypto/rates');
        const backendRates = res.data.rates;
        useStore.setState((state) => ({
          rates: {
            ...state.rates,
            ...backendRates
          }
        }));
      } catch (err) {
        console.error("Failed to fetch unified rates from backend:", err);
      }
    };
`;

content = content.replace(oldFetchBlock.trim(), newFetchBlock.trim());
fs.writeFileSync(swapFile, content);
console.log("Frontend SwapScreen patched to securely fetch rates from the backend.");
