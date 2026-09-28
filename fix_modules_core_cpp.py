import os
import subprocess

core_dir = "node_modules/expo-modules-core"

# 1. Patch EventEmitter.h
event_emitter_path = os.path.join(core_dir, "common/cpp/EventEmitter.h")
with open(event_emitter_path, "r") as f:
    content = f.read()

content = content.replace(
    "using NativeStateBase = expo::NativeState;",
    "using NativeStateBase = expo_jsi::NativeState;"
)

with open(event_emitter_path, "w") as f:
    f.write(content)

# Generate patch
subprocess.run("npx patch-package expo-modules-core", shell=True)
