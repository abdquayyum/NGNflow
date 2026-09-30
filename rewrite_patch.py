import re

with open('patches/expo-modules-core+57.0.19.patch', 'r') as f:
    patch = f.read()

# Remove the broken @MainActor protocol patch
patch = re.sub(r'''diff --git a/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift b/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift.*?internal protocol AnyExpoSwiftUIHostingView.*?getProps\(\) -> ExpoSwiftUI\.ViewProps\n \}\n''', '', patch, flags=re.DOTALL)

# Now, add @preconcurrency to the protocol conformance of HostingView in the original file
# Wait, I didn't patch HostingView's definition in the CURRENT patch because it wasn't modified!
