(function (global) {
  'use strict';

  const sources = [
    '/vendor/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
    'https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  ];
  let enginePromise = null;

  function currentEngine() {
    return global.jspdf && global.jspdf.jsPDF;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => reject(new Error(`Timed out loading ${src}`)), 12000);
      script.src = src;
      script.async = true;
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); reject(new Error(`Could not load ${src}`)); };
      document.head.appendChild(script);
    });
  }

  async function ensureEngine(onStatus) {
    if (currentEngine()) return currentEngine();
    if (enginePromise) return enginePromise;
    enginePromise = (async () => {
      if (onStatus) onStatus('Loading PDF engine…');
      for (const src of sources) {
        try {
          await loadScript(src);
          if (currentEngine()) return currentEngine();
        } catch (error) {
          // Try the next trusted source. The local copy is first so normal use
          // does not depend on a third-party CDN.
        }
      }
      throw new Error('PDF engine could not load. Check your connection and tap the PDF button to retry.');
    })();
    try {
      return await enginePromise;
    } catch (error) {
      enginePromise = null;
      throw error;
    }
  }

  function download(file) {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function shareOrDownload(file, details) {
    const payload = { files: [file], title: details && details.title, text: details && details.text };
    let canShare = false;
    try {
      canShare = Boolean(navigator.share && navigator.canShare && navigator.canShare({ files: [file] }));
    } catch (error) {
      canShare = false;
    }
    if (canShare) {
      try {
        await navigator.share(payload);
        return 'shared';
      } catch (error) {
        if (error && error.name === 'AbortError') return 'cancelled';
      }
    }
    download(file);
    return 'downloaded';
  }

  global.SlipSyncPDF = { ensureEngine, shareOrDownload };
})(window);
