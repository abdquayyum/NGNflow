import os
import re

workflow_path = ".github/workflows/ios-build.yml"
with open(workflow_path, "r") as f:
    content = f.read()

# Replace the build step to include --output build.ipa
content = content.replace(
    'run: EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build --platform ios --local --non-interactive',
    'run: EAS_LOCAL_BUILD_SKIP_CLEANUP=1 EAS_NO_VCS=1 eas build --platform ios --local --non-interactive --output build.ipa'
)

# Add the submit step right before the Dump Xcode Logs step
submit_step = """
      - name: Submit to TestFlight
        run: eas submit --platform ios --path build.ipa --non-interactive
"""

content = content.replace(
    '      - name: Dump Xcode Logs',
    submit_step.lstrip('\n') + '\n      - name: Dump Xcode Logs'
)

with open(workflow_path, "w") as f:
    f.write(content)
