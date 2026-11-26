(() => {
  const captureNodes = new Set([
    '__figma_capture_toolbar_host__',
    '__figma_h2d_chrome_extension_toolbar__',
    '__figma_capture_cursor_style__',
  ]);
  const captureExtensions = new Set([
    'fkmaohpngenfoccdgceedjkfhkdcohmg',
    'hpfddkbihgmhfbbimeoipehenhijemph',
  ]);
  let previousHash = '';
  let notice;

  function blockCapture() {
    if (notice?.isConnected) return;
    const focused = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.dataset.captureNotice = '';
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-labelledby', 'capture-attribution');

    const author = document.createElement('p');
    author.id = 'capture-attribution';
    author.textContent = 'sergey buharev (c) 2026';
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.textContent = document.documentElement.lang === 'en' ? 'Return' : 'Вернуться';
    dismiss.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      dialog.remove();
      delete document.body.dataset.captureBlocked;
      notice = undefined;
      if (focused instanceof HTMLElement && focused.isConnected) focused.focus({preventScroll: true});
    }, {once: true});
    dialog.append(author, dismiss);
    notice = dialog;
    document.body.append(dialog);
    document.body.dataset.captureBlocked = '';
    dialog.showModal();
  }

  function inspectLocation() {
    if (!/^#figmacapture(?:[=&]|$)/.test(location.hash)) {
      previousHash = location.hash;
      return;
    }
    history.replaceState(history.state, '', location.pathname + location.search + (previousHash || '#/'));
    blockCapture();
  }

  function isCaptureScript(node) {
    if (!(node instanceof HTMLScriptElement) || !node.src) return false;
    try {
      const url = new URL(node.src, location.href);
      return (url.origin === 'https://mcp.figma.com' && url.pathname === '/mcp/html-to-design/capture.js') ||
        (url.protocol === 'chrome-extension:' && captureExtensions.has(url.hostname));
    } catch {
      return false;
    }
  }

  function inspectNode(node) {
    if (!(node instanceof Element) || (!captureNodes.has(node.id) && !isCaptureScript(node))) return;
    node.remove();
    blockCapture();
  }

  // This bridge is the entry point used by the Capture extension in the page's main world.
  const deny = async () => {blockCapture();};
  const figma = Object.freeze({captureForDesign: deny, captureOnceForDesign: deny});
  try {Object.defineProperty(window, 'figma', {value: figma});}
  catch { /* The DOM checks still run if an extension initialized the global first. */ }

  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) inspectNode(node);
  });
  for (const container of [document.documentElement, document.head, document.body]) {
    observer.observe(container, {childList: true});
    for (const child of Array.from(container.children)) inspectNode(child);
  }
  window.addEventListener('hashchange', inspectLocation);
  inspectLocation();
})();
