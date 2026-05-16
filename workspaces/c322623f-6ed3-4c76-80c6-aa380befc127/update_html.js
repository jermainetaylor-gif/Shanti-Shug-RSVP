const fs = require('fs');
const appTsx = fs.readFileSync('src/App.tsx', 'utf-8');
const newHtml = fs.readFileSync('new_ui.html', 'utf-8');

const startMarker = 'const INDEX_HTML = `';
const endMarker = '`;\n\nconst CodeViewerBlock';

const startIndex = appTsx.indexOf(startMarker);
const endIndex = appTsx.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newAppTsx = appTsx.substring(0, startIndex + startMarker.length) + newHtml + appTsx.substring(endIndex);
  fs.writeFileSync('src/App.tsx', newAppTsx);
  console.log('Successfully updated App.tsx with new HTML');
} else {
  console.log('Could not find markers');
}
