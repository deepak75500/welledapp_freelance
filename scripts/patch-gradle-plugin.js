const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', '@react-native', 'gradle-plugin', 'build.gradle.kts');

try {
  if (!fs.existsSync(target)) {
    console.log('patch-gradle-plugin: target not found, skipping:', target);
    process.exit(0);
  }

  let content = fs.readFileSync(target, 'utf8');
  const originalImport = 'import org.gradle.configurationcache.extensions.serviceOf';
  const importRegex = /import\s+org\.gradle\.configurationcache\.extensions\.serviceOf\s*/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, '');
    console.log('patch-gradle-plugin: removed serviceOf import');
  }

  // Replace serviceOf<ModuleRegistry>() with services.get(ModuleRegistry::class.java)
  const callRegex = /serviceOf<\s*ModuleRegistry\s*>\s*\(\s*\)/g;
  if (callRegex.test(content)) {
    // Prefer to replace with a safe placeholder; the detailed ModuleRegistry access
    // can fail in hosted build environments. We'll replace usages with a no-op
    // pattern and later remove the testRuntimeOnly block if present.
    content = content.replace(callRegex, '/*MODULE_REGISTRY_SERVICE*/');
    console.log('patch-gradle-plugin: replaced serviceOf<ModuleRegistry>() calls with placeholder');
  }

  // Replace the whole testRuntimeOnly(...) block that references ModuleRegistry with a safe stub
  const testRuntimeRegex = /testRuntimeOnly\(\s*files\([\s\S]*?\)\s*\)\s*\n/gm;
  if (testRuntimeRegex.test(content)) {
    content = content.replace(testRuntimeRegex, 'testRuntimeOnly(files())\n');
    console.log('patch-gradle-plugin: replaced testRuntimeOnly block with safe stub');
  }

  fs.writeFileSync(target, content, 'utf8');
  console.log('patch-gradle-plugin: patched', target);
} catch (err) {
  console.error('patch-gradle-plugin: error', err.message);
  // Don't fail the install/build; this is a best-effort workaround
  process.exit(0);
}
