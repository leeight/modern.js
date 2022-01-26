require('@rushstack/eslint-config/patch/modern-module-resolution');
// require('./modern-module-resolution.js');


const { defineConfig } = require('@scripts/eslint-config');

module.exports = defineConfig({
   rootDir: __dirname,
});
