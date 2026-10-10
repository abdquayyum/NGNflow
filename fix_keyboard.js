const fs = require('fs');

const files = ['screens/AuthScreen.js', 'screens/SettingsScreen.js', 'screens/SwapScreen.js'];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Fix KeyboardAvoidingView behavior and offset for all screens
    // Remove explicit hardcoded offsets
    content = content.replace(/behavior="padding"/g, "behavior={Platform.OS === 'ios' ? 'padding' : undefined}");
    content = content.replace(/keyboardVerticalOffset=\{[\s\S]*?\}/g, "");
    
    // AuthScreen specific fixes (removing the spacer flex: 1 that squishes content)
    if (file.includes('AuthScreen.js')) {
        content = content.replace(/\{.*?Top Dynamic Spacer.*?\}.*?<View style=\{\{ flex: 1 \}\} \/>/s, "");
        content = content.replace(/\{.*?Bottom Dynamic Spacer.*?\}.*?<View style=\{\{ flex: 1 \}\} \/>/s, "<View className=\"h-10\" />");
    }

    fs.writeFileSync(file, content);
});

console.log("Keyboard UI bugs fixed on all 3 screens.");
