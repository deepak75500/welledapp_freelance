const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'android', 'settings.gradle');

try {
  if (!fs.existsSync(settingsPath)) {
    console.log('patch-android-settings: android/settings.gradle not found, skipping');
    process.exit(0);
  }

  let content = fs.readFileSync(settingsPath, 'utf8');

  if (content.includes('pluginManagement')) {
    console.log('patch-android-settings: pluginManagement block already present, skipping');
    process.exit(0);
  }

  const pluginManagementBlock = `pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}
`;

  content = pluginManagementBlock + '\n' + content;
  fs.writeFileSync(settingsPath, content, 'utf8');
  console.log('patch-android-settings: inserted pluginManagement block into android/settings.gradle');
} catch (err) {
  console.error('patch-android-settings: error', err.message);
  process.exit(0);
}
