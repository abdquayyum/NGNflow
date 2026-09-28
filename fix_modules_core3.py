import os
import subprocess

core_dir = "node_modules/expo-modules-core"
file_path = os.path.join(core_dir, "ios/ExpoModulesCore.swift")

with open(file_path, "r") as f:
    content = f.read()

if "@_exported import _Concurrency" not in content:
    content = "@_exported import _Concurrency\n" + content

with open(file_path, "w") as f:
    f.write(content)

subprocess.run("npx patch-package expo-modules-core", shell=True)
