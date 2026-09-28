import os
import subprocess

core_dir = "node_modules/expo-modules-core"

# 1. Patch ExpoModulesCore.podspec
podspec_path = os.path.join(core_dir, "ExpoModulesCore.podspec")
with open(podspec_path, "r") as f:
    content = f.read()

content = content.replace(
    "'DEFINES_MODULE' => 'YES',",
    "'DEFINES_MODULE' => 'YES',\n    'BUILD_LIBRARY_FOR_DISTRIBUTION' => 'NO',"
)

with open(podspec_path, "w") as f:
    f.write(content)

# 2. Generate patch
subprocess.run("npx patch-package expo-modules-core", shell=True)
