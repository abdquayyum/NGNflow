import os
import subprocess

file_path = "node_modules/expo-notifications/ios/ExpoNotifications/Notifications/DateComponentsSerializer.swift"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    'if #available(iOS 26.0, *) {\n      serializedComponents["isRepeatedDay"] = dateComponents.isRepeatedDay ?? false\n    }',
    '// removed isRepeatedDay block'
)

with open(file_path, "w") as f:
    f.write(content)

subprocess.run("npx patch-package expo-notifications", shell=True)
