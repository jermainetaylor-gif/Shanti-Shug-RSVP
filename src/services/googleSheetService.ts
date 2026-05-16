const GAS_URL = "https://script.google.com/macros/s/AKfycbzqSBu-OFAAsu9nN4lSN5e9ZpiprDwk-WZWBV_FJqaWO13EE-X9Y2rPvQ9gxjvUJ_OVzA/exec";

export async function checkPhone(phone: string) {
  const url = `${GAS_URL}?action=checkPhone&phone=${encodeURIComponent(phone)}`;
  const response = await fetch(url);
  return await response.json();
}

export async function submitRSVP(data: any) {
  const url = `${GAS_URL}?action=submitRSVP&data=${encodeURIComponent(JSON.stringify(data))}`;
  const response = await fetch(url);
  return await response.json();
}
