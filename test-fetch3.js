const url = "https://script.google.com/macros/s/AKfycbwXzcQYNlnBXD8Efkp1i9wwU10cLXQzVX2vHPxJSgCpbBoCxGJkXoH0Ji65UIe8S-HJpg/exec?action=checkPhone&phone=2487953028";
fetch(url, { redirect: "follow" })
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
