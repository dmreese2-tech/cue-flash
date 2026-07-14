# Running Cue Flash automatically on Windows startup

## Option A — node-windows (recommended)

This installs the server as a real Windows service using a plain npm
package — no separate binary to download from a third-party site, no
site-availability risk. It plugs straight into the project you already have.

1. Open an elevated Command Prompt (right-click Command Prompt → **Run as
   administrator**). This matters — node-windows needs admin rights to
   register a service, and will fail silently or with a permissions error
   otherwise.
2. `cd` into your `cue-flash-server` folder.
3. Install dependencies if you haven't already: `npm install` (this now
   also pulls in `node-windows`).
4. Run:

   ```
   node install-service.js
   ```

   You should see `Service installed. Starting it now...` followed by
   `Cue Flash service is running.`

5. Confirm it: open `services.msc`, find **Cue Flash** in the list — it
   should say "Running", startup type "Automatic". It'll now start on every
   boot, before anyone logs in, and restart itself if the process ever dies.

**To uninstall later** (also elevated Command Prompt, from the same
folder):

```
node uninstall-service.js
```

**Logs**: node-windows writes service logs (stdout/stderr/errors) into a
`daemon` folder that appears inside `cue-flash-server` after install —
check there first if the service won't start.

## Option B — Task Scheduler (no extra dependency, requires the account to be logged in)

1. Open **Task Scheduler** → **Create Task** (not "Basic Task" — the extra
   options matter here).
2. **General tab**: name it `Cue Flash`. Check "Run whether user is logged
   on or not" if you want it to also survive a logout, or leave the default
   if this account stays logged in on the booth machine. Check "Run with
   highest privileges" if you hit permission issues.
3. **Triggers tab** → New → **At startup** (or **At log on**, if you chose
   that above).
4. **Actions tab** → New:
   - **Program/script**: `C:\Program Files\nodejs\node.exe`
   - **Add arguments**: `server.js`
   - **Start in**: full path to your `cue-flash-server` folder
5. **Settings tab**: check "If the task fails, restart every" → 1 minute,
   and set restart attempts to something generous (e.g. 10), so it recovers
   from a crash the same way a service would.
6. Save. Test it by rebooting or right-clicking the task → **Run**.

## Either way — confirm it's live

From the same machine, open a browser to:

```
http://localhost:3000/control.html
```

And from another device on the network:

```
http://192.168.1.50:3000/control.html
```

(swap in the real LAN IP). If the connection indicator shows "SERVER OK",
it's running and reachable — iPads and Companion will be able to reach it
too.

## Windows Firewall

First run will likely trigger a Windows Defender Firewall prompt for
Node.js — allow it on **Private networks**. If it doesn't prompt (e.g.
running as a service, which has no interactive prompt), add a rule
manually:

```
netsh advfirewall firewall add rule name="Cue Flash" dir=in action=allow protocol=TCP localport=3000
```

## Keeping the LAN IP stable

Since Companion, the control panel, and the iPads all point at this
machine's IP by address, it's worth giving it a DHCP reservation (or a
static IP) in your router so it doesn't change and break everything after
a reboot.
