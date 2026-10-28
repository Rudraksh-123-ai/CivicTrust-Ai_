import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testFile = path.resolve(__dirname, 'civictrust.test.js');

console.log('====================================================');
console.log(' CivicTrust AI — Automated Test Suite Runner');
console.log('====================================================');

const stream = run({ files: [testFile] }).compose(spec);

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
