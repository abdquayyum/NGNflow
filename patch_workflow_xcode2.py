import os

workflow_path = ".github/workflows/ios-build.yml"
with open(workflow_path, "r") as f:
    content = f.read()

content = content.replace(
    'sudo xcode-select -s /Applications/Xcode_26.6.app',
    'sudo xcode-select -s /Applications/Xcode_26.6.app/Contents/Developer'
)

with open(workflow_path, "w") as f:
    f.write(content)
