import os
import subprocess

core_dir = "node_modules/expo-modules-core"

# 1. Patch EventEmitter.swift
emitter_path = os.path.join(core_dir, "ios/Core/Events/EventEmitter.swift")
with open(emitter_path, "r") as f:
    content = f.read()

content = content.replace(
    "nonisolated(unsafe) weak let emitter = self",
    "nonisolated(unsafe) weak var emitter = self"
)

with open(emitter_path, "w") as f:
    f.write(content)

# 2. Patch SharedObjectRegistry.swift
registry_path = os.path.join(core_dir, "ios/Core/SharedObjects/SharedObjectRegistry.swift")
with open(registry_path, "r") as f:
    content = f.read()

content = content.replace(
    "private weak let appContext: AppContext?",
    "private weak var appContext: AppContext?"
)

with open(registry_path, "w") as f:
    f.write(content)

# 3. Generate patch
subprocess.run("npx patch-package expo-modules-core", shell=True)
