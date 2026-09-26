const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withCustomPodfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(file, 'utf-8');
      contents = contents.replace(
        'post_install do |installer|',
        `post_install do |installer|\n    installer.pods_project.targets.each do |target|\n      target.build_configurations.each do |config|\n        config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'\n        config.build_settings['SWIFT_COMPILATION_MODE'] = 'wholemodule'\n      end\n    end`
      );
      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};
