import os
import re

workflow_path = ".github/workflows/ios-build.yml"
with open(workflow_path, "r") as f:
    content = f.read()

# Replace the eas submit step to continue-on-error so we still upload the artifact if it fails
content = content.replace(
    '      - name: Submit to TestFlight\n        run: eas submit --platform ios --path build.ipa --non-interactive',
    '      - name: Submit to TestFlight\n        continue-on-error: true\n        run: eas submit --platform ios --path build.ipa --non-interactive'
)

# Add artifact upload step after submit
artifact_step = """
      - name: Upload IPA Artifact
        uses: actions/upload-artifact@v4
        with:
          name: NGNflow-iOS-App
          path: build.ipa
          retention-days: 5
"""

content = content.replace(
    '      - name: Dump Xcode Logs',
    artifact_step.lstrip('\n') + '\n      - name: Dump Xcode Logs'
)

with open(workflow_path, "w") as f:
    f.write(content)
