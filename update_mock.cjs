const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');
content = content.replace("plusOneAllowed: true", "plusOne: true");
fs.writeFileSync('src/App.tsx', content);
