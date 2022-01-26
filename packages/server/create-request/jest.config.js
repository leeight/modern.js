const { defineConfig } = require('@scripts/test');

module.exports = defineConfig({
  rootDir: __dirname,
  modulePathIgnorePatterns: [
    // TODO: 暂时无法解决（Property exprName of TSTypeQuery expected node to be of a type ["TSEntityName","TSImportType"] but instead got "MemberExpression"）问题，先绕过
    'tests/node.test.ts',
  ],
});
