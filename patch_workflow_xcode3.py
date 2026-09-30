import os

workflow_path = ".github/workflows/ios-build.yml"
with open(workflow_path, "r") as f:
    content = f.read()

# Instead of forcing xcode-select, let's just let EAS handle it, BUT we will set the EXPO_USE_MAC_LATEST environment variable if that helps?
# Or better, we can just use EXPO_NO_TELEMETRY=1 and let eas.json "image": "latest" do its job!
# Wait, let's just remove the xcode-select line entirely. The eas.json "image": "latest" should be enough!
content = content.replace(
    '      - name: Force Xcode 26.6\n        run: sudo xcode-select -s /Applications/Xcode_26.6.app/Contents/Developer\n',
    ''
)

with open(workflow_path, "w") as f:
    f.write(content)
