import os
import re

cxx_dir = "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx"
swift_dir = "node_modules/expo-modules-jsi/apple/Sources"

# 1. Rename namespace in C++ files
for root, _, files in os.walk(cxx_dir):
    for file in files:
        if file.endswith((".h", ".cpp")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # replace `namespace expo {` -> `namespace expo_jsi {`
            content = content.replace("namespace expo {", "namespace expo_jsi {")
            # replace `} // namespace expo` -> `} // namespace expo_jsi`
            content = content.replace("} // namespace expo", "} // namespace expo_jsi")
            # replace `expo::` -> `expo_jsi::`
            content = content.replace("expo::", "expo_jsi::")
            
            with open(filepath, 'w') as f:
                f.write(content)

# 2. Fix Swift files
for root, _, files in os.walk(swift_dir):
    for file in files:
        if file.endswith(".swift"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # Fix weak let -> weak var
            content = content.replace("weak let ", "weak var ")

            # Replace `ExpoModulesJSI_Cxx.expo.` -> `expo_jsi.`
            content = content.replace("ExpoModulesJSI_Cxx.expo.", "expo_jsi.")
            
            # Replace `expo.` -> `expo_jsi.` (just in case)
            # Match `expo.` that is not preceded by a word character or dot
            content = re.sub(r'(?<![a-zA-Z0-9_.\-])expo\.', 'expo_jsi.', content)
            
            # Fix module visibility for C++ types
            content = content.replace("internal import ExpoModulesJSI_Cxx", "public import ExpoModulesJSI_Cxx")
            
            # Fix JavaScriptPromise.swift longLivedState
            if "JavaScriptPromise.swift" in filepath:
                content = content.replace(
                    "private let longLivedState = LongLivedState()",
                    "private let longLivedState: LongLivedState"
                )
                content = content.replace(
                    "public init(_ runtime: JavaScriptRuntime, _ object: consuming JavaScriptObject) throws {\n    self.runtime = runtime",
                    "public init(_ runtime: JavaScriptRuntime, _ object: consuming JavaScriptObject) throws {\n    self.longLivedState = LongLivedState()\n    self.runtime = runtime"
                )
                content = content.replace(
                    "public init(_ runtime: JavaScriptRuntime) throws {\n    self.runtime = runtime",
                    "public init(_ runtime: JavaScriptRuntime) throws {\n    self.longLivedState = LongLivedState()\n    self.runtime = runtime"
                )

            # Fix regex literal in JavaScriptRuntime.swift
            if "JavaScriptRuntime.swift" in filepath:
                content = content.replace(
                    "/^[a-zA-Z_$][a-zA-Z0-9_$]*$/",
                    'try! Regex("^[a-zA-Z_$][a-zA-Z0-9_$]*$")'
                )

            with open(filepath, 'w') as f:
                f.write(content)
