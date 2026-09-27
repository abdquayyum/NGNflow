const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withPackageSwiftFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');
      
      const fixScript = `
  # FIX SPM PATH
  package_swift = File.join(__dir__, 'build/generated/ios/Package.swift')
  if File.exist?(package_swift)
    text = File.read(package_swift)
    text = text.gsub(/path:\\s*"[^"]*node_modules\\/react-native"/, 'path: "../../../../node_modules/react-native"')
    File.write(package_swift, text)
  end
`;

      if (!podfile.includes('# FIX SPM PATH')) {
        podfile = podfile.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|\n${fixScript}`
        );
        fs.writeFileSync(podfilePath, podfile);
      }
      return config;
    },
  ]);
};
