const url = 'https://script.google.com/macros/s/AKfycbwXzcQYNlnBXD8Efkp1i9wwU10cLXQzVX2vHPxJSgCpbBoCxGJkXoH0Ji65UIe8S-HJpg/exec?action=checkPhone&phone=1112223333';
fetch(url).then(r => r.json()).then(console.log).catch(console.error);
