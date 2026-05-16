const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');
const startIndex = content.indexOf('const INDEX_HTML = `');
const endIndex = content.indexOf('`;', startIndex) + 2;
console.log(content.substring(startIndex, endIndex));
