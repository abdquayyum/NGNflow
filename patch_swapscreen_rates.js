const fs = require('fs');

let content = fs.readFileSync('screens/SwapScreen.js', 'utf8');

const ratePatch = `
  const initialSymbol = route.params?.initialAsset || 'USDT';
  const initialAssetObj = ASSETS.find(a => a.symbol === initialSymbol) || ASSETS[1];

  useEffect(() => {
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
    getLiveRates();
  }, []);
`;

content = content.replace("  const initialSymbol = route.params?.initialAsset || 'USDT';\n  const initialAssetObj = ASSETS.find(a => a.symbol === initialSymbol) || ASSETS[1];", ratePatch);

fs.writeFileSync('screens/SwapScreen.js', content);
console.log("SwapScreen patched!");
