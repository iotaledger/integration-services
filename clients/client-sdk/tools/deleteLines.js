const fs = require('fs');

// Reads modules.md file and cuts of the first few lines till '### Type aliases'
var data = fs.readFileSync('./temp-docs/modules.md', {encoding:'utf8'});
data = data.split('### Type Aliases')[1]
fs.writeFileSync('./temp-docs/Types.md', data)
