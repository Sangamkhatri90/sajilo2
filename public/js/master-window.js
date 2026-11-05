/* master-window.js
   Places every .mw-suggestions list directly under its input, flips it
   upward when there is not enough room below, and caps its height to the
   room available — so a list can never enlarge the window.
   Works with your existing JS: it only watches the list (shown / filled)
   and sets CSS variables; it never changes your data or display logic.
   Include once, after the HTML:  <script src="master-window.js"></script> */
(function () {
  var MAX = 200, GAP = 6, MIN = 80;

  function place(field, list, input) {
    if (getComputedStyle(list).display === 'none') return;

    var bound = field.closest('.mw-search') || field.closest('.master-window');
    var b = bound.getBoundingClientRect();
    var i = input.getBoundingClientRect();

    var below = b.bottom - i.bottom - GAP;
    var above = i.top - b.top - GAP;

    list.style.setProperty('--mw-dd-max', 'none');
    var need = Math.min(list.scrollHeight, MAX);

    var up = need > below && above > below;
    var room = Math.max(MIN, Math.min(MAX, up ? above : below));

    if (up) {
      list.style.setProperty('--mw-dd-top', 'auto');
      list.style.setProperty('--mw-dd-bottom', (field.offsetHeight - input.offsetTop + 2) + 'px');
    } else {
      list.style.setProperty('--mw-dd-top', (input.offsetTop + input.offsetHeight + 2) + 'px');
      list.style.setProperty('--mw-dd-bottom', 'auto');
    }
    list.style.setProperty('--mw-dd-max', room + 'px');
  }

  function init(field) {
    if (field.__mwDD) return;
    var list = field.querySelector('.mw-suggestions');
    var input = field.querySelector('input');
    if (!list || !input) return;
    field.__mwDD = true;

    var opts = { attributes: true, attributeFilter: ['style', 'class'], childList: true, subtree: true };
    var obs = new MutationObserver(run);

    function run() {
      obs.disconnect();                 // our own style changes must not re-trigger us
      place(field, list, input);
      obs.observe(list, opts);
    }
    obs.observe(list, opts);
    input.addEventListener('focus', run);
    input.addEventListener('input', run);
    window.addEventListener('resize', run);
  }

  function initAll(root) {
    (root || document).querySelectorAll('.mw-suggestion-field').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initAll(); });
  else initAll();

  // windows added to the page later (dynamic master windows)
  new MutationObserver(function () { initAll(); }).observe(document.body, { childList: true, subtree: true });
})();