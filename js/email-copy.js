(function () {
  var EMAIL = 'mrbuha@ya.ru';

  function showToast(msg) {
    var t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '28px', left: '50%',
      transform: 'translateX(-50%) translateY(16px)',
      background: 'rgba(20,20,20,0.88)', color: '#fff',
      padding: '10px 22px', borderRadius: '10px',
      fontSize: '14px', fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.01em', zIndex: '99999', opacity: '0',
      transition: 'opacity 0.22s ease, transform 0.22s ease',
      pointerEvents: 'none', backdropFilter: 'blur(8px)',
    });
    document.body.appendChild(t);
    requestAnimationFrame(function () {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(function () { t.remove(); }, 280);
    }, 2200);
  }

  function copyEmail() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { showToast('Почта скопирована!'); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = EMAIL;
      Object.assign(ta.style, { position: 'fixed', opacity: '0' });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('Почта скопирована!');
    }
  }

  function setup() {
    // Find all text nodes containing the email and walk up to the nearest button/anchor
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var handled = new Set();
    var node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() !== EMAIL) continue;
      var el = node.parentElement;
      // Walk up to find nearest button or anchor
      for (var i = 0; i < 12 && el; i++) {
        var tag = el.tagName;
        if (tag === 'BUTTON' || tag === 'A' || el.hasAttribute('data-reaction-click')) break;
        el = el.parentElement;
      }
      if (!el || handled.has(el)) continue;
      handled.add(el);
      el.style.cursor = 'pointer';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        copyEmail();
      }, true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
