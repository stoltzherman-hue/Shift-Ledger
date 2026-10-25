# SlipSync tests

Run the fast regression suite with Node 24 or newer:

```powershell
node --test tests/app-regressions.test.js tests/shift-regressions.test.js
```

`browser-runtime.test.js` is an opt-in real-browser suite. It requires:

- a static server for this repository whose extensionless `/app` and `/shift` routes serve `app.html` and `shift.html`;
- an isolated Chrome profile with the DevTools protocol enabled;
- a fresh directory for synthetic downloads.

Set the three variables and run:

```powershell
$env:SLIPSYNC_CDP_URL='http://127.0.0.1:9223'
$env:SLIPSYNC_APP_URL='http://127.0.0.1:4177'
$env:SLIPSYNC_DOWNLOAD_DIR="$env:TEMP\slipsync-browser-downloads"
node --test tests/browser-runtime.test.js
```

The browser test uses fictional records only. It intercepts `window.open`, so no WhatsApp page or message is sent. Each run creates a unique download subdirectory to avoid stale CSV/PDF assertions. Without `SLIPSYNC_CDP_URL`, the browser suite reports as skipped rather than pretending runtime coverage ran.
