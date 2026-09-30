import os
import re

# We will read the original files from node_modules and directly modify them.

def replace_in_file(filepath, old, new):
    with open(filepath, 'r') as f:
        content = f.read()
    with open(filepath, 'w') as f:
        f.write(content.replace(old, new))

# 1. EventEmitter.swift
replace_in_file('node_modules/expo-modules-core/ios/Core/Events/EventEmitter.swift', 'nonisolated(unsafe) weak let emitter = self', 'nonisolated(unsafe) weak var emitter = self')

# 2. SharedObjectRegistry.swift
replace_in_file('node_modules/expo-modules-core/ios/Core/SharedObjects/SharedObjectRegistry.swift', 'private weak let appContext: AppContext?', 'private weak var appContext: AppContext?')

# 3. URLAuthenticationChallengeForwardSender.swift
replace_in_file('node_modules/expo-modules-core/ios/DevTools/URLAuthenticationChallengeForwardSender.swift', 'let completionHandler: (URLSession.AuthChallengeDisposition, URLCredential?) -> Void', 'let completionHandler: @Sendable (URLSession.AuthChallengeDisposition, URLCredential?) -> Void')
replace_in_file('node_modules/expo-modules-core/ios/DevTools/URLAuthenticationChallengeForwardSender.swift', 'init(completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void)', 'init(completionHandler: @escaping @Sendable (URLSession.AuthChallengeDisposition, URLCredential?) -> Void)')

# 4. URLSessionSessionDelegateProxy.swift
replace_in_file('node_modules/expo-modules-core/ios/DevTools/URLSessionSessionDelegateProxy.swift', 'public final class URLSessionSessionDelegateProxy: NSObject, URLSessionDataDelegate {', 'public final class URLSessionSessionDelegateProxy: NSObject, URLSessionDataDelegate, @unchecked Sendable {')

# 5. ExpoModulesCore.swift
replace_in_file('node_modules/expo-modules-core/ios/ExpoModulesCore.swift', '// Re-export ExpoModulesJSI', '@_exported import _Concurrency\n// Re-export ExpoModulesJSI')

# 6. EventEmitter.h
replace_in_file('node_modules/expo-modules-core/common/cpp/EventEmitter.h', 'using NativeStateBase = expo::NativeState;', 'using NativeStateBase = expo_jsi::NativeState;')

# 7. ExpoModulesCore.podspec
replace_in_file('node_modules/expo-modules-core/ExpoModulesCore.podspec', "'DEFINES_MODULE' => 'YES',", "'DEFINES_MODULE' => 'YES',\n    'BUILD_LIBRARY_FOR_DISTRIBUTION' => 'NO',")

# 8. THE BIG FIX: SwiftUIHostingView.swift
replace_in_file('node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift', 'public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @MainActor AnyExpoSwiftUIHostingView', 'public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @preconcurrency AnyExpoSwiftUIHostingView')

print("All files modified successfully!")
