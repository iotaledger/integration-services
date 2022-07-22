// One file with all types is needed. Because we generate to entry points (browser and node) we get two type declerations for typescript.
// This script combines both to get a single file with all types.
const fs = require('fs');

fs.appendFileSync('./node/index.d.ts', "\nexport * from '../lib/models';");
