const fs = require('fs');

let content = fs.readFileSync('screens/HomeScreen.js', 'utf8');

// 1. Add ChevronRight import
content = content.replace("import { Bell, EyeOff, Eye, Download, Send, ArrowRightLeft, PlusCircle } from 'lucide-react-native';", "import { Bell, EyeOff, Eye, Download, Send, ArrowRightLeft, PlusCircle, ChevronRight } from 'lucide-react-native';");

// 2. Inject KYC Banner
const bannerCode = `
      {/* Header Section */}
      <View className="flex-row justify-between items-center mb-10 mt-4">
        <View className="flex-1">
          <Text className="text-neutral-500 font-semibold text-xs tracking-widest uppercase mb-1">Overview</Text>
          <Text className="text-2xl text-white font-bold tracking-tight">{user?.full_name || 'Portfolio'}</Text>
        </View>

        <View className="flex-row items-center space-x-3">
          <TouchableOpacity onPress={() => Alert.alert('Notifications', 'You have no new notifications right now.')} className="w-11 h-11 rounded-full bg-neutral-900 border border-neutral-800 items-center justify-center relative">
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

      {user?.kyc_status !== 'tier1' && (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl mb-8 flex-row items-center">
          <View className="flex-1">
            <Text className="text-amber-500 font-bold mb-1 text-sm">Action Required: Verify Identity</Text>
            <Text className="text-amber-500/80 text-xs leading-5 pr-4">You must complete KYC verification to unlock Naira deposits and withdrawals.</Text>
          </View>
          <ChevronRight color="#f59e0b" size={20} />
        </TouchableOpacity>
      )}
`;

content = content.replace(/\{\/\* Header Section \*\/\}.*?<\/View>\s*<\/View>/s, bannerCode);

fs.writeFileSync('screens/HomeScreen.js', content);
console.log("KYC Banner patched into HomeScreen!");
