import os

root_dir = "node_modules/expo-modules-jsi/apple/Sources"

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # 1. Replace `weak let` with `weak var`
    content = content.replace("weak let ", "weak var ")

    # 2. Replace `expo.` with `ExpoModulesJSI_Cxx.expo.`
    # We must be careful not to replace things like `__ObjC.expo` or `import expo` (if any).
    # ` expo.` -> ` ExpoModulesJSI_Cxx.expo.`
    # `(expo.` -> `(ExpoModulesJSI_Cxx.expo.`
    # `= expo.` -> `= ExpoModulesJSI_Cxx.expo.`
    import re
    # Match `expo.` that is not preceded by a word character or dot
    content = re.sub(r'(?<![a-zA-Z0-9_.\-])expo\.', 'ExpoModulesJSI_Cxx.expo.', content)

    # 3. Fix JavaScriptPromise.swift
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

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".swift"):
            process_file(os.path.join(root, file))
