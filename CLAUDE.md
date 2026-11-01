# CLAUDE.md

Family trip planner for a Christmas holiday in the Dominican Republic, published on GitHub Pages.

## Every update must refresh the "Last update" footer

After **every** change to the planner, the footer at the bottom of the left column must show when it was last updated, in Zurich time:

```
Last update: dd-mm-yyyy HH:MM:SS
```

e.g. `Last update: 01-11-2026 11:15:42`. The footer is `<div class="lastupdate" id="lastupdate">` at the end of the sidebar `<aside>`.

`tools/encrypt.mjs` stamps it automatically (Europe/Zurich time) every time it runs, and also writes the stamp back into the readable source file. So the rule is satisfied as long as every update ends with re-running the encrypt step below. Never hand-edit `index.html`, and never publish without re-encrypting. If the footer element is missing from the source page, the script refuses to run: add it back rather than bypassing the check.

## The page is encrypted — never commit the readable version

- The repo is **public**. `index.html` is the planner encrypted with a PIN (AES-256-GCM, key from PBKDF2-SHA256, 600k iterations); it shows a PIN screen and decrypts in the browser.
- The readable source page (`dr-trip-planner.html`) lives **outside the repo** (the owner keeps it in `Downloads\RepublicaDominicana` on their PC). `.gitignore` blocks `dr-*.html`, `*.plain.html` and `private/` as a safety net. Never commit plaintext, and never put trip details, the PIN or the source page in commits, the README or issues.
- Ask the owner for the PIN; don't store it in the repo.

## How to update

1. Edit the readable source page.
2. Re-encrypt (this also stamps the footer):
   ```
   PIN=<pin> node tools/encrypt.mjs path/to/dr-trip-planner.html index.html
   ```
3. Commit and push `index.html` to `main` (GitHub Pages serves `main` / root).
4. Copy the updated readable source back to the owner's folder so both stay in sync.

## Content conventions

- The family: 2 adults and one child, aged **5** in December 2026. Kids' facilities, height limits for slides (most need 1.10–1.20 m) and kids' club ages matter more than headline slide counts.
- Hotel ratings shown are **Booking.com** scores (blue box, label, review count). Google ratings appear only as a small secondary note in the popup.
- Default travel dates: **19–30 Dec 2026** (Sat → Wed, 11 nights). All Booking.com, Google Flights and Skyscanner links use these dates. Resort price estimates are for a 7-night week (scale ~1.5× for 11 nights); say they are estimates, not quotes.
- Keep facts sourced (Sources tab) and flag anything unverified rather than stating it as fact.
