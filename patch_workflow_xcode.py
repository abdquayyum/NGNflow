import os
import re

workflow_path = ".github/workflows/ios-build.yml"
with open(workflow_path, "r") as f:
    content = f.read()

# Add xcode-select step before the build step
xcode_step = """
      - name: Force Xcode 26.6
        run: sudo xcode-select -s /Applications/Xcode_26.6.app
"""

content = content.replace(
    '      - name: Build for iOS (Local on Runner)',
    xcode_step.lstrip('\n') + '\n      - name: Build for iOS (Local on Runner)'
)

with open(workflow_path, "w") as f:
    f.write(content)
