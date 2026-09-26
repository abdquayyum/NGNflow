#!/bin/bash

echo "Running EAS Pre-build hook..."

# 1. First, disable Swift Strict Concurrency for all CocoaPods in the Podfile
sed -i '' 's/post_install do |installer|/post_install do |installer|\n    installer.pods_project.targets.each do |target|\n      target.build_configurations.each do |config|\n        config.build_settings["SWIFT_STRICT_CONCURRENCY"] = "minimal"\n        config.build_settings["SWIFT_COMPILATION_MODE"] = "wholemodule"\n      end\n    end/g' ios/Podfile

# 2. Re-run pod install to apply the new Podfile changes
cd ios
pod install
cd ..

echo "Pre-build hook complete."
