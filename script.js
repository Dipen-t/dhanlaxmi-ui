const menus = {
  celebration: { title: 'A feast to remember', description: 'A generous Indian spread for your biggest moments.', name: 'The celebration spread', dishes: [['To begin', 'Chaat & welcome bites', 'Papdi chaat, dahi puri, and paneer tikka'], ['At the heart', 'Comforting classics', 'Paneer makhani, dal tadka, and seasonal sabzi'], ['Alongside', 'Fresh breads & biryani', 'Tandoori roti, butter naan, and vegetable dum biryani'], ['A sweet finish', 'A little indulgence', 'Gulab jamun and cardamom shrikhand']] },
  office: { title: 'A lunch worth pausing for', description: 'Balanced, comforting dishes for a productive gathering.', name: 'The working lunch', dishes: [['To begin', 'Fresh & bright', 'Kachumber salad and mint buttermilk'], ['At the heart', 'Everyday favourites', 'Palak paneer, yellow dal, and mixed vegetable sabzi'], ['Alongside', 'Lunch essentials', 'Soft phulkas, steamed rice, and fresh curd'], ['A sweet finish', 'Just the right ending', 'Seasonal fruit and a small serving of rice kheer']] },
  social: { title: 'Little plates, long conversations', description: 'Easy-to-share favourites for a relaxed evening.', name: 'The social table', dishes: [['To begin', 'Pass-around bites', 'Hara bhara kebab, mini samosas, and chutneys'], ['At the heart', 'Made for mingling', 'Paneer tikka skewers and vegetable kathi rolls'], ['Alongside', 'A lively chaat table', 'Pani puri, bhel, and tangy papdi chaat'], ['A sweet finish', 'One more little bite', 'Mini jalebi and pistachio kulfi']] }
};
let currentMenu = 'celebration';
const tabs = [...document.querySelectorAll('[data-menu]')];
function selectMenu(key, moveFocus = false) {
  currentMenu = key;
  const menu = menus[key];
  tabs.forEach(tab => { const active = tab.dataset.menu === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && moveFocus) tab.focus(); });
  document.querySelector('#menu-panel').setAttribute('aria-labelledby', `tab-${key}`);
  document.querySelector('.menu-description h3').textContent = menu.title;
  document.querySelector('.menu-description p').textContent = menu.description;
  document.querySelector('#selected-menu').value = menu.name;
  document.querySelector('#menu-items').replaceChildren(...menu.dishes.map(([course, name, detail]) => {
    const item = document.createElement('div'); item.className = 'menu-item';
    for (const [tag, value] of [['span', course], ['h4', name], ['p', detail]]) { const element = document.createElement(tag); element.textContent = value; item.append(element); }
    return item;
  }));
  document.dispatchEvent(new CustomEvent('menu:changed'));
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMenu(tab.dataset.menu));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = tabs.length - 1;
    if (target !== undefined) { event.preventDefault(); selectMenu(tabs[target].dataset.menu, true); }
  });
});
selectMenu(currentMenu);
const nav = document.querySelector('#navigation');
const navToggle = document.querySelector('.nav-toggle');
function closeNav() { nav.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Open navigation'); }
navToggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); navToggle.setAttribute('aria-expanded', String(open)); navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNav(); });
const dialog = document.querySelector('#event-dialog');
const form = document.querySelector('#event-form');
const result = document.querySelector('#brief-result');
const dateInput = form.elements.date;
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
document.querySelector('#year').textContent = today.getFullYear();
let opener;
document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => {
  opener = button;
  closeNav();
  if (button.dataset.plan) form.elements.occasion.value = button.dataset.plan;
  form.hidden = false; result.hidden = true;
  dialog.showModal();
}));
document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
dialog.addEventListener('close', () => opener?.focus());
let briefUrl;
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const details = Object.fromEntries(new FormData(form));
  const message = `Hello Dhanlaxmi Catering, I would like to enquire about catering for an event.\n\nName: ${details.name}\nEmail: ${details.email}\nOccasion: ${details.occasion}\nGuests: ${details.guests}\nEvent date: ${details.date}\nCity / venue: ${details.venue}\nMenu inspiration: ${details.menu}\n\nPreferences & notes:\n${details.notes || 'None specified'}\n\nPlease let me know about availability, menu options, and pricing.`;
  const brief = `DHANLAXMI CATERING — EVENT ENQUIRY\nContact: +91 80802 00800\nService area: All over Maharashtra\n\n${message}\n\nThis enquiry has not been sent automatically. Contact Dhanlaxmi Catering to confirm availability, ingredients, dietary requirements, service details, and pricing.\n`;
  document.querySelector('#whatsapp-enquiry').href = `https://wa.me/918080200800?text=${encodeURIComponent(message)}`;
  if (briefUrl) URL.revokeObjectURL(briefUrl);
  briefUrl = URL.createObjectURL(new Blob([brief], {type: 'text/plain;charset=utf-8'}));
  document.querySelector('#download-brief').href = briefUrl;
  form.hidden = true; result.hidden = false;
  document.querySelector('#whatsapp-enquiry').focus();
});
document.querySelector('.edit-brief').addEventListener('click', () => { result.hidden = true; form.hidden = false; form.elements.name.focus(); });
window.addEventListener('pagehide', () => { if (briefUrl) URL.revokeObjectURL(briefUrl); });
