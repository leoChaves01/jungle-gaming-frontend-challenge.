import fs from 'node:fs';
const colors = [
  ['#d7b692', '#586d4b', '#ead5b3'],
  ['#b4bad7', '#776b9b', '#e0d8bd'],
  ['#e9cc9f', '#a04d39', '#f4ddbd'],
  ['#d8b452', '#77562b', '#f4d27c'],
  ['#a6c4bf', '#3d7773', '#d7e6d4'],
  ['#c5b5d6', '#614e79', '#c8a3bb'],
  ['#e7bfb1', '#b16d67', '#f4e5cc'],
  ['#b5c7a3', '#4e6950', '#d7d9a2'],
];
colors.forEach(([bg, coat, skin], i) => {
  fs.writeFileSync(
    `public/art/${i + 1}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><pattern id="p" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 36L36 0" stroke="#fff" opacity=".06"/></pattern><linearGradient id="g" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="${coat}"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><rect width="600" height="600" fill="url(#p)"/><circle cx="300" cy="260" r="210" fill="${bg}" opacity=".45"/><path d="M100 600Q115 420 230 415H375Q500 430 515 600" fill="${coat}" stroke="#282a23" stroke-width="9"/><path d="M244 390V457L300 507L360 454V386" fill="${skin}" stroke="#282a23" stroke-width="8"/><ellipse cx="190" cy="280" rx="43" ry="57" fill="${skin}" stroke="#282a23" stroke-width="9"/><ellipse cx="414" cy="280" rx="43" ry="57" fill="${skin}" stroke="#282a23" stroke-width="9"/><path d="M197 285V200Q195 112 304 110Q413 110 412 212V320Q408 421 310 430Q210 420 197 335Z" fill="${skin}" stroke="#282a23" stroke-width="9"/><path d="M194 230Q195 122 294 123Q380 112 410 207L375 185L346 202L315 180L270 199L228 192Z" fill="${coat}"/><path d="M220 255Q248 235 278 253M328 253Q358 237 383 258" fill="none" stroke="#282a23" stroke-width="13" stroke-linecap="round"/><ellipse cx="253" cy="276" rx="13" ry="20" fill="#282a23"/><ellipse cx="355" cy="276" rx="13" ry="20" fill="#282a23"/><path d="M294 278L282 324Q302 338 323 325" fill="none" stroke="#8b7157" stroke-width="8" stroke-linecap="round"/><path d="M250 368Q304 ${i % 2 ? 390 : 362} 363 358" fill="none" stroke="#282a23" stroke-width="9" stroke-linecap="round"/><path d="M221 444L274 512L246 559L198 466M378 444L326 512L355 559L404 467" fill="none" stroke="#282a23" stroke-width="8"/><path d="M301 510V600" stroke="#282a23" stroke-width="6"/>${i % 2 ? '<path d="M205 252H286L280 304H220ZM320 252H400L385 304H330ZM285 263H322" fill="#282a23" stroke="#282a23" stroke-width="9"/><path d="M226 262L249 291M342 262L365 291" stroke="#ffffff" opacity=".25" stroke-width="9"/>' : ''}<circle cx="436" cy="310" r="12" fill="none" stroke="#f0bf58" stroke-width="7"/><text x="30" y="558" fill="#fff" opacity=".65" font-family="monospace" font-size="13" letter-spacing="3">GREENMINT / GENESIS 00${i + 1}</text></svg>`,
  );
});
