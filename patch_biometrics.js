const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');

const importsToAdd = `
import { AppState, AppStateStatus, Text, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Lock } from 'lucide-react-native';
`;

content = content.replace("import { View, StatusBar } from 'react-native';", "import { View, StatusBar } from 'react-native';\n" + importsToAdd);

const biometricLocker = `
function BiometricLocker({ children }) {
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [hasBiometrics, setHasBiometrics] = React.useState(null); // null = checking
  const appState = React.useRef(AppState.currentState);

  const authenticate = async () => {
    try {
      const hw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hw && enrolled) {
        setHasBiometrics(true);
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock NGNflow',
          fallbackLabel: 'Use Passcode',
        });
        if (result.success) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } else {
        // No biometrics enrolled or available on this device
        setHasBiometrics(false);
        setIsUnlocked(true);
      }
    } catch (error) {
      console.warn('Biometric Error:', error);
      setIsUnlocked(true);
    }
  };

  React.useEffect(() => {
    authenticate();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground!
        setIsUnlocked(false);
        authenticate();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  if (hasBiometrics === null) {
    return <View className="flex-1 bg-black" />; // Loading state
  }

  if (!isUnlocked && hasBiometrics) {
    return (
      <View className="flex-1 bg-[#09090B] justify-center items-center px-6">
        <View className="w-20 h-20 bg-emerald-500/10 rounded-full items-center justify-center mb-6">
          <Lock color="#10b981" size={32} />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">App Locked</Text>
        <Text className="text-neutral-400 text-center mb-10">Use Face ID or Touch ID to securely unlock your NGNflow account.</Text>
        <TouchableOpacity onPress={authenticate} className="bg-emerald-500 w-full h-14 rounded-2xl items-center justify-center">
          <Text className="text-black font-bold text-lg">Unlock Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}
`;

// Insert BiometricLocker before MainTabs
content = content.replace("function MainTabs() {", biometricLocker + "\nfunction MainTabs() {");

// Wrap the authenticated stack in BiometricLocker
const oldAuthStack = `
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Receive" component={ReceiveScreen} options={{ presentation: 'modal' }} />
            </>
`;

const newAuthStack = `
            <>
              <Stack.Screen name="MainTabs">
                {props => (
                  <BiometricLocker>
                    <MainTabs {...props} />
                  </BiometricLocker>
                )}
              </Stack.Screen>
              <Stack.Screen name="Receive">
                {props => (
                  <BiometricLocker>
                    <ReceiveScreen {...props} />
                  </BiometricLocker>
                )}
              </Stack.Screen>
            </>
`;

content = content.replace(oldAuthStack.trim(), newAuthStack.trim());

fs.writeFileSync('App.js', content);
console.log("Biometric Locker patched into App.js!");
