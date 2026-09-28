import os
import subprocess

core_dir = "node_modules/expo-modules-core"

# 1. Patch ViewDefinition.swift
file_path = os.path.join(core_dir, "ios/Core/Views/ViewDefinition.swift")
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("extension UIView: @MainActor AnyArgument {", "extension UIView: AnyArgument {")

with open(file_path, "w") as f:
    f.write(content)

# 2. Generate patch
subprocess.run("npx patch-package expo-modules-core", shell=True)
