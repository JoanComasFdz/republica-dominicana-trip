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

const plain = readFileSync(inPath);
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
console.log(`Wrote ${outPath} (${(payload.length / 1024).toFixed(0)} KB encrypted payload)`);
