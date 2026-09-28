import os
import subprocess

rn_pods_path = "node_modules/react-native/scripts/react_native_pods.rb"
with open(rn_pods_path, "r") as f:
    content = f.read()

old_injection = """  # [PATCH] Forcefully disable BUILD_LIBRARY_FOR_DISTRIBUTION to avoid Swift 6 interface compiler bugs
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'NO'
    end
  end"""

new_injection = """  # [PATCH] Comprehensive Swift 6 Fix: Disable distribution library and strict concurrency
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'NO'
      config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
      config.build_settings['SWIFT_VERSION'] = '5.0'
      config.build_settings['WARNING_CFLAGS'] = '-Wno-everything'
      
      # Also add it to OTHER_SWIFT_FLAGS just in case
      flags = config.build_settings['OTHER_SWIFT_FLAGS'] || ['$(inherited)']
      if flags.is_a?(String)
        flags = flags.split(' ')
      end
      flags << '-strict-concurrency=minimal' unless flags.include?('-strict-concurrency=minimal')
      flags << '-Wno-error' unless flags.include?('-Wno-error')
      config.build_settings['OTHER_SWIFT_FLAGS'] = flags.join(' ')
    end
  end"""

content = content.replace(old_injection, new_injection)

with open(rn_pods_path, "w") as f:
    f.write(content)

subprocess.run("npx patch-package react-native", shell=True)
