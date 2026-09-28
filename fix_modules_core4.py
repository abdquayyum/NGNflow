import os
import subprocess

core_dir = "node_modules/expo-modules-core"

# 1. Patch SwiftUIVirtualView.swift
swiftui_path = os.path.join(core_dir, "ios/Core/Views/SwiftUI/SwiftUIVirtualView.swift")
with open(swiftui_path, "r") as f:
    content = f.read()

content = content.replace(
    "SwiftUIVirtualViewObjCDev, @MainActor ExpoSwiftUIView {",
    "SwiftUIVirtualViewObjCDev, ExpoSwiftUIView {"
)
content = content.replace(
    "extension ExpoSwiftUI.SwiftUIVirtualViewDev: @MainActor ExpoSwiftUI.ViewWrapper {",
    "@MainActor\nextension ExpoSwiftUI.SwiftUIVirtualViewDev: ExpoSwiftUI.ViewWrapper {"
)

with open(swiftui_path, "w") as f:
    f.write(content)


# 2. Patch URLAuthenticationChallengeForwardSender.swift
sender_path = os.path.join(core_dir, "ios/DevTools/URLAuthenticationChallengeForwardSender.swift")
with open(sender_path, "r") as f:
    content = f.read()

content = content.replace(
    "let completionHandler: (URLSession.AuthChallengeDisposition, URLCredential?) -> Void",
    "let completionHandler: @Sendable (URLSession.AuthChallengeDisposition, URLCredential?) -> Void"
)
content = content.replace(
    "init(completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void)",
    "init(completionHandler: @escaping @Sendable (URLSession.AuthChallengeDisposition, URLCredential?) -> Void)"
)

with open(sender_path, "w") as f:
    f.write(content)


# 3. Patch URLSessionSessionDelegateProxy.swift
proxy_path = os.path.join(core_dir, "ios/DevTools/URLSessionSessionDelegateProxy.swift")
with open(proxy_path, "r") as f:
    content = f.read()

content = content.replace(
    "public final class URLSessionSessionDelegateProxy: NSObject, URLSessionDataDelegate {",
    "public final class URLSessionSessionDelegateProxy: NSObject, URLSessionDataDelegate, @unchecked Sendable {"
)

with open(proxy_path, "w") as f:
    f.write(content)

# 4. Generate patch
subprocess.run("npx patch-package expo-modules-core", shell=True)
