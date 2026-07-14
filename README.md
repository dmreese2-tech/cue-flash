# Cue Flash

A LAN message-flash system for cueing a speaker on stage — a control panel
sends a message, and it appears instantly, full-screen, in high-contrast
type on every connected iPad or iPhone. Built for tech theater / live
event booths, and wired to trigger from Bitfocus Companion.

**Live demo:** `https://<you>.github.io/cue-flash-server/` — a status page
that shows whether the demo (running in a GitHub Codespace) is currently
awake, since Codespaces sleep after inactivity and don't wake themselves
back up. If it's asleep, the page points you at the local install below
instead of a dead link. The demo is for trying it out only; for an actual
show, run your own copy locally so it doesn't depend on the internet or on
someone remembering to wake a Codespace.

- **Control panel** — any modern desktop browser.
- **Display client** — Safari on iPad/iPhone, back to iOS 9. Add it to the
  Home Screen for a fullscreen kiosk view with no browser chrome.
- **HTTP API** — one URL a Stream Deck button (via Companion) can hit to
  trigger a flash.

## Download

**Option A — download the ZIP** (no git required): on the GitHub repo
page, click **Code → Download ZIP**, then unzip it wherever you like.

**Option B — clone with git:**

```
git clone https://github.com/<owner>/cue-flash-server.git
cd cue-flash-server
```

## Install & run locally

Requires [Node.js](https://nodejs.org) (any recent LTS version).

```
cd cue-flash-server
npm install
node server.js
```

You'll see:

```
Cue Flash server listening on port 3000
Control panel:  http://<this-machine-ip>:3000/control.html
Display client: http://<this-machine-ip>:3000/display.html
Companion API:  http://<this-machine-ip>:3000/api/flash?message=WRAP+UP&mode=urgent&flash=1
```

Open `http://localhost:3000/control.html` on the same machine to confirm
it's running, then find that machine's LAN IP (`ipconfig` on Windows,
`ifconfig`/`ipconfig getifaddr en0` on Mac/Linux) so other devices on the
network can reach it at `http://<that-ip>:3000/...`.

Nothing needs internet access after `npm install` — it runs entirely on
your local network.

## iPad / iPhone display

1. In Safari, go to `http://<server-ip>:3000/display.html`.
2. Tap Share → **Add to Home Screen**.
3. Launch it from the home screen icon for a fullscreen view with no
   Safari UI. It reconnects automatically if Wi-Fi drops.

Run this on as many devices as you want — they all receive every cue at once.

## Control panel

`http://<server-ip>:3000/control.html` — pick a preset or type a message,
choose DARK/LIGHT/URGENT and STEADY/FLASHING, then **SEND TO SCREEN**.
**CLEAR DISPLAY** blanks every connected display. To reset a display via a
plain URL (e.g. a bookmark), use `http://<server-ip>:3000/api/clear`.

## Bitfocus Companion

Companion can trigger a cue with its built-in HTTP request action — no
custom module needed.

1. Add an action: **Internal → HTTP Requests → Generic HTTP Request**,
   method **GET**.
2. URL:

   ```
   http://<server-ip>:3000/api/flash?message=WRAP+UP&mode=urgent&flash=1
   ```

   - `message` — the text to display (spaces as `+` or `%20`)
   - `mode` — `dark`, `light`, or `urgent`
   - `flash` — `1` for pulsing, `0`/omit for steady
3. Repeat per cue button. To clear: `http://<server-ip>:3000/api/clear`.

The API also accepts POST with a JSON body
(`{"message":"...", "mode":"...", "flash":true}`) if you'd rather not use
query strings.

## Keep it running automatically

- **Windows** — see `WINDOWS-STARTUP.md` for installing it as a service
  (via `node-windows`, no third-party download needed) or a Task
  Scheduler entry.
- **Run the public demo** — see `DEPLOY-GITHUB-CODESPACES.md` for running
  it in a GitHub Codespace with a GitHub Pages status page that honestly
  reports whether the Codespace is currently awake.

## Notes

- Message length is capped at 80 characters to keep it readable at
  full-screen size.
- Locally on a LAN, the API is open by default (no token). The demo
  Codespace is also left open (no token) so visitors can freely try
  flashing between the control panel and display tabs — don't reuse that
  same public Codespace for anything you actually care about.
