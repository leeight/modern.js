const fs = require('fs');
const path = require('path');
const { $ } = require('zx');
const JSON5 = require('json5');

const kProjectRoot = path.resolve(__dirname, '../../');

const { projects } = JSON5.parse(
  fs.readFileSync(`${kProjectRoot}/rush.json`, 'utf8'),
);
const e2ePackages = projects
  .filter(v => {
    const { packageName } = v;
    if (packageName === '@integration-test/shared') {
      return false;
    }

    if (
      packageName.startsWith('@integration-test/') &&
      !packageName.includes('fixtures')
    ) {
      return true;
    }
    return false;
  })
  .map(v => v.packageName);

const args = [];
e2ePackages.forEach(v => {
  args.push('-o');
  args.push(v);
});

$`node ../../common/scripts/install-run-rush.js test -p 1 -v ${args}`;
