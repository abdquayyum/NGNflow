import os
import subprocess

rn_pods_path = "node_modules/react-native/scripts/react_native_pods.rb"
with open(rn_pods_path, "r") as f:
    content = f.read()

injection = """
  # [PATCH] Forcefully disable BUILD_LIBRARY_FOR_DISTRIBUTION to avoid Swift 6 interface compiler bugs
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'NO'
    end
  end

  print_cocoapods_deprecation_message
"""

content = content.replace("  print_cocoapods_deprecation_message", injection)

with open(rn_pods_path, "w") as f:
    f.write(content)

subprocess.run("npx patch-package react-native", shell=True)
