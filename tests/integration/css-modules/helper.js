const fs = require('fs');

const kProjectRoot = __dirname;
const x = [];
fs.readdirSync(`${kProjectRoot}/fixtures`).forEach(file => {
  const {
    name: packageName,
  } = require(`${kProjectRoot}/fixtures/${file}/package.json`);
  const projectFolder = `tests/integration/css-modules/fixtures/${file}`;
  x.push({ packageName, projectFolder });
});
// eslint-disable-next-line no-console
console.log(JSON.stringify(x, null, 2));
