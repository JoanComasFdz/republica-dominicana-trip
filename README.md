# republica-dominicana-trip
Info for holidays in republica dominicana

The site (`index.html`) is a PIN-protected trip planner: hotels with aquaparks by region, flight options from Zurich, and a Punta Cana vs Samaná comparison.

## How the PIN protection works
The page content is encrypted with AES-256-GCM using a key derived from the PIN (PBKDF2-SHA256, 600,000 iterations). The published `index.html` contains only the encrypted payload and a small unlock form; it is decrypted in the browser after the PIN is entered. The readable page is never committed.

## Updating the page
1. Edit the readable page locally (keep it outside the repo, or in `private/`, which is git-ignored).
2. Re-encrypt it:
   ```
   PIN=<your pin> node tools/encrypt.mjs path/to/dr-trip-planner.html index.html
   ```
3. Commit and push `index.html`. The encrypt step also stamps the "Last update" footer (Zurich time) at the bottom of the left column.

Changing the PIN = re-running step 2 with a new PIN.
