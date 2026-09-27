const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withPackageSwiftFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // Inject a Ruby script at the end of post_install to fix the Package.swift path with an ABSOLUTE path
      const fixScript = `
  # Fix React-GeneratedCode SPM path for EAS local builds
  package_swift = File.join(__dir__, 'build/generated/ios/Package.swift')
  if File.exist?(package_swift)
    text = File.read(package_swift)
    absolute_rn_path = File.expand_path('../node_modules/react-native', __dir__)
    text = text.gsub(/path:\\s*"[^"]*node_modules\\/react-native"/, "path: \\"#{absolute_rn_path}\\"")
    File.write(package_swift, text)
    puts "✅ Fixed React-GeneratedCode path to absolute: #{absolute_rn_path}"
  end
`;

      if (podfile.includes('post_install do |installer|')) {
        podfile = podfile.replace(
          /post_install do \|installer\|([\s\S]*?)end\n/g,
          (match, p1) => {
            if (p1.includes('Fix React-GeneratedCode SPM path')) {
              return match; // Already injected
            }
            return `post_install do |installer|${p1}${fixScript}end\n`;
          }
        );
      }

      fs.writeFileSync(podfilePath, podfile);
      return config;
    },
  ]);
};
