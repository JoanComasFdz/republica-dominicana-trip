// Encrypts a self-contained HTML page into a PIN-protected index.html.
//
// The page content is encrypted with AES-256-GCM using a key derived from the PIN
// with PBKDF2-SHA256, so the published file contains no readable trip details.
// Decryption happens in the visitor's browser after they enter the PIN.
//
// Usage:  PIN=123456 node tools/encrypt.mjs <plain.html> [out.html]
// Keep the plain page OUT of the repo (see .gitignore); commit only the output.

import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 600000;
const [, , inPath, outPath = 'index.html'] = process.argv;
const pin = process.env.PIN;
if (!inPath || !pin) {
  console.error('Usage: PIN=<pin> node tools/encrypt.mjs <plain.html> [out.html]');
  process.exit(1);
}

const enc = new TextEncoder();
const b64 = (u8) => Buffer.from(u8).toString('base64');

// Stamp the "Last update" footer with the current Zurich time (dd-mm-yyyy HH:MM:SS).
const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).formatToParts(new Date()).map(x => [x.type, x.value]));
const stamp = `${p.day}-${p.month}-${p.year} ${p.hour}:${p.minute}:${p.second}`;
const footerRe = /(<div class="lastupdate" id="lastupdate">)Last update: [^<]*(<\/div>)/;
let html = readFileSync(inPath, 'utf8');
if (!footerRe.test(html)) {
  console.error('The page has no <div class="lastupdate" id="lastupdate"> footer; add it before encrypting.');
  process.exit(1);
}
html = html.replace(footerRe, `$1Last update: ${stamp}$2`);
if (process.env.STAMP_SOURCE !== '0') writeFileSync(inPath, html); // keep the readable copy in sync
const plain = enc.encode(html);
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
  baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));

const payload = JSON.stringify({ v: 1, it: ITERATIONS, s: b64(salt), iv: b64(iv), c: b64(cipher) });
const tpl = readFileSync(new URL('./lock-template.html', import.meta.url), 'utf8');
writeFileSync(outPath, tpl.replace('__PAYLOAD__', payload));
console.log(`Wrote ${outPath} (${(payload.length / 1024).toFixed(0)} KB encrypted payload), Last update: ${stamp}`);
