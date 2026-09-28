import os
import subprocess

core_dir = "node_modules/expo-modules-core"

# 1. Patch SwiftUIHostingView.swift
hosting_path = os.path.join(core_dir, "ios/Core/Views/SwiftUI/SwiftUIHostingView.swift")
with open(hosting_path, "r") as f:
    content = f.read()

content = content.replace(
    "ExpoView, @MainActor AnyExpoSwiftUIHostingView {",
    "ExpoView, AnyExpoSwiftUIHostingView {"
)

with open(hosting_path, "w") as f:
    f.write(content)

# 2. Patch SwiftUIVirtualView.swift for PRODUCTION builds
virtual_path = os.path.join(core_dir, "ios/Core/Views/SwiftUI/SwiftUIVirtualView.swift")
with open(virtual_path, "r") as f:
    content = f.read()

content = content.replace(
    "SwiftUIVirtualViewObjC, @MainActor ExpoSwiftUIView {",
    "SwiftUIVirtualViewObjC, ExpoSwiftUIView {"
)
content = content.replace(
    "extension ExpoSwiftUI.SwiftUIVirtualView: @MainActor ExpoSwiftUI.ViewWrapper {",
    "@MainActor\nextension ExpoSwiftUI.SwiftUIVirtualView: ExpoSwiftUI.ViewWrapper {"
)

with open(virtual_path, "w") as f:
    f.write(content)

# 3. Generate patch
subprocess.run("npx patch-package expo-modules-core", shell=True)
