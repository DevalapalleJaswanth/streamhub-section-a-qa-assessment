const fs = require('node:fs');
const path = require('node:path');

for (const directory of [
  'reports',
  'evidence/screenshots',
  'evidence/traces',
  'evidence/logs',
]) {
  fs.mkdirSync(path.resolve(directory), { recursive: true });
}

module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    requireModule: ['tsx/cjs'],
    require: ['hooks/**/*.ts', 'step-definitions/**/*.ts'],
    format: [
      'progress',
      'html:reports/cucumber.html',
    ],
    formatOptions: {
      snippetInterface: 'async-await',
    },
    publishQuiet: true,
  },
};
