# SlipSync tests

Run the fast regression suite with Node 24 or newer:

```powershell
node --test tests/app-regressions.test.js tests/pdf-support.test.js tests/shift-regressions.test.js
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

## Export and sharing coverage

| Screen | Action | Expected output | Automated coverage |
| --- | --- | --- | --- |
| Home | Month report PDF | Itemised monthly PDF with totals and available receipt images | Real Chrome PDF bytes, text, pages, and image objects |
| Home | Export CSV | Monthly purchase ledger | Real Chrome downloaded CSV content |
| Curator | Share PDF statement | Client/preparer statement with float, spend, balance, items, and available receipt images | Real Chrome PDF bytes and native `File` share payload |
| Curator | Send text via WhatsApp/email | Text summary only; never presented as a PDF attachment | Intercepted WhatsApp navigation; no message sent |
| Road | Share claim pack PDF | Allowance or reimbursement totals, items, logbook, and available receipt images | Real Chrome allowance and reimbursement PDFs |
| Road | SARS logbook CSV | Trip ledger | Source/unit coverage; browser CSV plumbing shared with Home |
| Road | Send claim text via WhatsApp/email | Text summary only; points to the PDF action for the file | Intercepted shared sender logic; no message sent |
| Shift | Share shift summary PDF | Today's totals, table detail, photo appendix, and missing-photo notice | Real Chrome multi-photo and missing-photo PDFs |
| Shift | Export backup | Existing JSON backup of Shift records | Existing source path; not changed by the PDF repair |

`pdf-support.test.js` covers native file sharing, user cancellation, genuine share failure/download recovery, repeated engine requests, and sequential local/CDN loading. The real-browser suite also blocks every remote script and confirms the vendored PDF engine still loads.
