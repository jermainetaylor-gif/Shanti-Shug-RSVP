const fs = require('fs');

// Read the current file
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the start of the first `INDEX_HTML` string
const startIndex = content.indexOf('const INDEX_HTML = `<!DOCTYPE html>');

// Find the very last `</html>\`;`
const lastHtmlIndex = content.lastIndexOf('</html>`;');

// If we found them, replace everything in between
if (startIndex !== -1 && lastHtmlIndex !== -1) {
  // Get the end of the last `</html>\`;` string
  const endIndex = lastHtmlIndex + '</html>`;'.length;
  
  // We want to replace it with the new HTML read from modify2.cjs (which contains newHtml) 
  const modify2Content = fs.readFileSync('modify2.cjs', 'utf-8');
  
  // Extract `newHtml` from modify2.cjs
  const startNewHtml = modify2Content.indexOf('const newHtml = `') + 'const newHtml = `'.length;
  const endNewHtml = modify2Content.lastIndexOf('`;\n\nconst startIndex =');
  const newHtml = modify2Content.substring(startNewHtml, endNewHtml);
  
  const finalContent = content.substring(0, startIndex) + 'const INDEX_HTML = `' + newHtml + '`;' + content.substring(endIndex);
  
  fs.writeFileSync('src/App.tsx', finalContent);
  console.log("Successfully replaced!");
} else {
  console.log("Could not find bounds");
}
