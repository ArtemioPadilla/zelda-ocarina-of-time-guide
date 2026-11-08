// Feedback dialog + diagnostics capture for FeedbackFAB.astro.
//
// This used to be an inline <script> on every page (~18 KB × every HTML
// file the PWA precaches). It reads everything it needs from the dialog's
// data-* attributes, so it lives here as one cached file instead; it is
// still loaded as a classic, non-deferred script at the same place in the
// document, so the console/network capture starts as early as before.
(function () {
  // ── Telemetry capture (runs once at parse time) ──────────────────────
  var W = window;
  if (!W.__cpguide_diag) {
    var MAX = 30;
    var diag = { console: [], network: [], errors: [] };
    W.__cpguide_diag = diag;

    // Intercept console.error / console.warn
    var origError = console.error.bind(console);
    var origWarn  = console.warn.bind(console);
    function captureLog(level, args) {
      var msg = Array.prototype.map.call(args, function (a) {
        if (a == null) return String(a);
        if (a instanceof Error) return a.message + '\n' + (a.stack || '');
        if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return String(a); } }
        return String(a);
      }).join(' ');
      diag.console.push({ ts: new Date().toISOString(), level: level, msg: msg.slice(0, 500) });
      if (diag.console.length > MAX) diag.console.shift();
    }
    console.error = function () { captureLog('error', arguments); origError.apply(console, arguments); W.__cpguide_updateBadge && W.__cpguide_updateBadge(); };
    console.warn  = function () { captureLog('warn',  arguments); origWarn.apply(console, arguments); };

    // Unhandled errors + rejections
    W.addEventListener('error', function (ev) {
      diag.errors.push({ ts: new Date().toISOString(), msg: (ev.message || 'Unknown').slice(0, 300), src: ev.filename ? ev.filename + ':' + ev.lineno : '' });
      if (diag.errors.length > MAX) diag.errors.shift();
      W.__cpguide_updateBadge && W.__cpguide_updateBadge();
    });
    W.addEventListener('unhandledrejection', function (ev) {
      var r = ev.reason;
      // A skipped native cross-document View Transition rejects its
      // ready/finished promises with AbortError "Transition was skipped".
      // BaseLayout attaches catch handlers on pagereveal/pageswap so this
      // normally never reaches here, but older engines don't expose
      // `viewTransition` on those events — so also drop it defensively
      // rather than lighting the error badge for a purely cosmetic skip.
      if (r && r.name === 'AbortError' && /transition was skipped/i.test(String(r.message || ''))) return;
      var msg = r instanceof Error ? r.message + '\n' + (r.stack || '') : String(r || 'Unhandled rejection');
      diag.errors.push({ ts: new Date().toISOString(), msg: msg.slice(0, 300), src: 'promise' });
      if (diag.errors.length > MAX) diag.errors.shift();
      W.__cpguide_updateBadge && W.__cpguide_updateBadge();
    });

    // Fetch network error capture
    var origFetch = W.fetch;
    if (origFetch) {
      W.fetch = function () {
        var url = arguments[0];
        var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : String(url));
        var method = (arguments[1] && arguments[1].method) || (typeof url === 'object' && url.method) || 'GET';
        return origFetch.apply(W, arguments).then(function (res) {
          if (!res.ok) {
            diag.network.push({ ts: new Date().toISOString(), method: method.toUpperCase(), url: urlStr.slice(0, 200), status: res.status, statusText: res.statusText || '' });
            if (diag.network.length > MAX) diag.network.shift();
            W.__cpguide_updateBadge && W.__cpguide_updateBadge();
          }
          return res;
        }, function (err) {
          diag.network.push({ ts: new Date().toISOString(), method: method.toUpperCase(), url: urlStr.slice(0, 200), status: 0, statusText: err && err.message ? err.message.slice(0, 100) : 'Network error' });
          if (diag.network.length > MAX) diag.network.shift();
          W.__cpguide_updateBadge && W.__cpguide_updateBadge();
          throw err;
        });
      };
    }
  }

  // ── Badge update ─────────────────────────────────────────────────────
  // Count only window-level errors (diag.errors) + explicit console.error calls (diag.console).
  // These two sources don't overlap: window 'error' events push to diag.errors,
  // console.error calls push to diag.console. unhandledrejection also goes to diag.errors only.
  W.__cpguide_updateBadge = function () {
    var badge = document.getElementById('cp-guide-report-badge');
    if (!badge) return;
    var diag = W.__cpguide_diag;
    var windowErrors = diag.errors ? diag.errors.length : 0;
    var consoleErrors = diag.console ? diag.console.filter(function(c){ return c.level === 'error'; }).length : 0;
    var count = windowErrors + consoleErrors;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    } else {
      badge.classList.add('hidden');
      badge.classList.remove('flex');
    }
  };

  // ── Duplicate-issue detection ─────────────────────────────────────────
  // Queries the GitHub Search API for open issues with a title similar to
  // what the user typed. Gracefully degrades: on rate-limit (403/429) or any
  // network error, the check is skipped silently and the user proceeds to
  // submit normally.
  //
  // Results are cached in memory by (repo, title) to avoid hammering the API
  // on every keystroke. The dedupe panel is shown only when matches exist.
  var dupeCache = {};
  var dupeTimer = null;

  function checkDuplicates(repo, rawTitle, onResults) {
    var title = rawTitle.trim();
    if (!title || title.length < 5) {
      onResults([]);
      return;
    }
    var cacheKey = repo + '\x00' + title.toLowerCase();
    if (dupeCache[cacheKey] !== undefined) {
      onResults(dupeCache[cacheKey]);
      return;
    }
    // Encode the title for the GitHub Search API q param:
    // repo:{slug}+is:issue+is:open+in:title+{title words}
    var q = 'repo:' + repo + '+is:issue+is:open+in:title+' + encodeURIComponent(title);
    var url = 'https://api.github.com/search/issues?q=' + q + '&per_page=3';
    fetch(url, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) {
        if (!res.ok) {
          // Rate-limited or other error — skip silently.
          dupeCache[cacheKey] = [];
          onResults([]);
          return;
        }
        return res.json().then(function (data) {
          var items = (data && Array.isArray(data.items)) ? data.items.slice(0, 3) : [];
          dupeCache[cacheKey] = items;
          onResults(items);
        });
      })
      .catch(function () {
        // Network error — skip silently.
        dupeCache[cacheKey] = [];
        onResults([]);
      });
  }

  // ── Modal wiring ────────────────────────────────────────────────────
  // Use DOMContentLoaded. Note: this site does not use Astro ViewTransitions,
  // so DOMContentLoaded fires on every full page load. If ViewTransitions are
  // ever added, replace with: document.addEventListener('astro:page-load', ...)
  document.addEventListener('DOMContentLoaded', function () {
    var btn     = document.getElementById('cp-guide-report-btn');
    var modal   = document.getElementById('cp-guide-report-modal');
    if (!btn || !modal) return;

    // Guard: only a plausible owner/repo slug may reach the GitHub URL below
    // (audit §5.2 — dataset values are DOM-tamperable).
    var repoRaw    = modal.dataset.repo || '';
    var repo       = /^[\w.-]+\/[\w.-]+$/.test(repoRaw) ? repoRaw : '';
    var lang       = modal.dataset.lang || 'es';
    var buildSha   = modal.dataset.buildSha || 'dev';
    var appVersion = modal.dataset.appVersion || 'dev';
    var noneLabel  = modal.dataset.lDiagnosticsNone || 'None captured';
    var copyLabel  = modal.dataset.lCopy || 'Copiar diagnósticos';
    var copiedLabel= modal.dataset.lCopied || '¡Copiado!';
    var lSimilarIssues = modal.dataset.lSimilarIssues || 'Similar issues';
    // lFileAnyway: the "File anyway" button text is set statically in the HTML
    // template; it is data-l-file-anyway only for potential future dynamic use.

    var typeEl    = document.getElementById('cp-guide-report-type');
    var titleEl   = document.getElementById('cp-guide-report-title');
    var descEl    = document.getElementById('cp-guide-report-description');
    var stepsEl   = document.getElementById('cp-guide-report-steps');
    var expectedEl= document.getElementById('cp-guide-report-expected');
    var bugFields = document.getElementById('cp-guide-report-bug-fields');
    var envBlock  = document.getElementById('cp-guide-report-env');
    var consBlock = document.getElementById('cp-guide-report-console');
    var netBlock  = document.getElementById('cp-guide-report-network');
    var diagCount = document.getElementById('cp-guide-report-diag-count');
    var copyBtn   = document.getElementById('cp-guide-report-copy');
    var copyLabel2= document.getElementById('cp-guide-report-copy-label');
    var submitBtn = document.getElementById('cp-guide-report-submit');
    var cancelBtn = document.getElementById('cp-guide-report-cancel');
    var closeBtn  = document.getElementById('cp-guide-report-close');

    // Duplicate-detection panel elements
    var similarPanel    = document.getElementById('cp-guide-report-similar');
    var similarLabel    = document.getElementById('cp-guide-report-similar-label');
    var similarList     = document.getElementById('cp-guide-report-similar-list');
    var fileAnywayBtn   = document.getElementById('cp-guide-report-file-anyway');

    // Track whether the user has dismissed the dedupe panel via "File anyway"
    var dupeAcknowledged = false;

    // Toggle bug-only fields
    if (typeEl && bugFields) {
      typeEl.addEventListener('change', function () {
        bugFields.style.display = typeEl.value === 'bug' ? '' : 'none';
      });
    }

    // ── Similar-issues panel logic ───────────────────────────────────────
    function showSimilarIssues(items) {
      if (!similarPanel || !similarList || items.length === 0) return;
      similarList.innerHTML = '';
      items.forEach(function (issue) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = issue.html_url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = '#' + issue.number + ' ' + (issue.title || '').slice(0, 80);
        a.className = 'text-amber-800 dark:text-amber-200 underline hover:no-underline truncate block';
        li.appendChild(a);
        similarList.appendChild(li);
      });
      if (similarLabel) similarLabel.textContent = lSimilarIssues + ' (' + items.length + ')';
      similarPanel.classList.remove('hidden');
    }

    function hideSimilarIssues() {
      if (similarPanel) similarPanel.classList.add('hidden');
    }

    // Debounce dedupe check on title input
    if (titleEl && repo) {
      titleEl.addEventListener('input', function () {
        dupeAcknowledged = false;
        hideSimilarIssues();
        clearTimeout(dupeTimer);
        dupeTimer = setTimeout(function () {
          var title = titleEl.value.trim();
          if (title.length < 5) return;
          checkDuplicates(repo, title, function (items) {
            if (items.length > 0 && !dupeAcknowledged) {
              showSimilarIssues(items);
            }
          });
        }, 600);
      });
    }

    // "File anyway" button dismisses the dedupe panel and unlocks submit
    if (fileAnywayBtn) {
      fileAnywayBtn.addEventListener('click', function () {
        dupeAcknowledged = true;
        hideSimilarIssues();
      });
    }

    // Open modal
    btn.addEventListener('click', function () {
      dupeAcknowledged = false;
      hideSimilarIssues();
      populateDiagnostics();
      modal.showModal();
    });

    // Close
    function closeModal() { modal.close(); }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    // Populate diagnostics
    function populateDiagnostics() {
      var diag = W.__cpguide_diag || { console: [], network: [], errors: [] };

      // Env block
      if (envBlock) {
        envBlock.textContent = JSON.stringify({
          url: location.href,
          userAgent: navigator.userAgent,
          viewport: window.innerWidth + 'x' + window.innerHeight,
          lang: lang,
          buildSha: buildSha,
          version: appVersion,
          timestamp: new Date().toISOString(),
        }, null, 2);
      }

      // Console block
      var consEntries = (diag.console || []).concat((diag.errors || []).map(function(e){ return { level: 'error', ts: e.ts, msg: e.msg + (e.src ? ' @ ' + e.src : '') }; }));
      if (consBlock) consBlock.textContent = consEntries.length ? consEntries.map(function(c){ return '[' + c.level.toUpperCase() + '] ' + c.ts + '\n' + c.msg; }).join('\n\n') : noneLabel;

      // Network block
      if (netBlock) netBlock.textContent = (diag.network || []).length
        ? diag.network.map(function(n){ return n.method + ' ' + n.status + ' ' + n.url + '\n' + n.ts; }).join('\n\n')
        : noneLabel;

      // Count badge in accordion
      var errorCount = consEntries.filter(function(c){ return c.level === 'error'; }).length + (diag.network || []).length;
      if (diagCount) {
        if (errorCount > 0) {
          diagCount.textContent = String(errorCount);
          diagCount.classList.remove('hidden');
        } else {
          diagCount.classList.add('hidden');
        }
      }
    }

    // Copy diagnostics — with fallback for non-HTTPS contexts
    if (copyBtn && copyLabel2) {
      copyBtn.addEventListener('click', function () {
        var text = [envBlock, consBlock, netBlock].map(function(el){ return el ? el.textContent : ''; }).join('\n\n---\n\n');
        function onCopied() {
          copyLabel2.textContent = copiedLabel;
          setTimeout(function(){ copyLabel2.textContent = copyLabel; }, 2000);
        }
        // navigator.clipboard.writeText is widely supported (96%+ on
        // caniuse since 2023). When unavailable (HTTP / old browser), we
        // fall back to selecting the text in a textarea so the user can
        // copy manually with Ctrl/Cmd+C — better than the deprecated
        // document.execCommand('copy') which has been removed in some
        // browsers and is flagged by `npm run check`.
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(onCopied).catch(function() {
            fallbackSelect(text);
          });
        } else {
          fallbackSelect(text);
        }
        function fallbackSelect(value) {
          var ta = document.createElement('textarea');
          ta.value = value;
          ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          // No automatic copy in the fallback — the user presses Ctrl/Cmd+C.
          // Tell the user via the existing label what to do.
          if (copyLabel2) {
            copyLabel2.textContent = 'Press Ctrl/Cmd+C';
            setTimeout(function(){
              copyLabel2.textContent = copyLabel;
              document.body.removeChild(ta);
            }, 4000);
          } else {
            setTimeout(function(){ document.body.removeChild(ta); }, 4000);
          }
        }
      });
    }

    // Submit → open GitHub Issue
    // If the dedupe panel is visible and not yet acknowledged, clicking submit
    // acts as a "File anyway" acknowledgement and then proceeds.
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        // If dedupe panel is showing and not yet acknowledged, acknowledge it
        // and proceed (one extra click is the UX — not a hard block).
        if (similarPanel && !similarPanel.classList.contains('hidden') && !dupeAcknowledged) {
          dupeAcknowledged = true;
          hideSimilarIssues();
          return; // Let the user review their title once more before filing
        }

        var type    = typeEl ? typeEl.value : 'bug';
        var title   = titleEl ? titleEl.value.trim() : '';
        var desc    = descEl  ? descEl.value.trim()  : '';
        var steps   = stepsEl   ? stepsEl.value.trim()   : '';
        var expected= expectedEl? expectedEl.value.trim() : '';

        if (!title) { if (titleEl) { titleEl.focus(); } return; }

        var diag = W.__cpguide_diag || { console: [], network: [], errors: [] };
        var consEntries = (diag.console || []).concat((diag.errors || []).map(function(e){ return { level:'error', ts:e.ts, msg:e.msg + (e.src ? ' @ '+e.src : '') }; }));
        var diagText = '**Entorno / Environment**\n```json\n' + JSON.stringify({
          url: location.href, userAgent: navigator.userAgent,
          viewport: window.innerWidth + 'x' + window.innerHeight,
          lang: lang, buildSha: buildSha, version: appVersion,
          timestamp: new Date().toISOString(),
        }, null, 2) + '\n```';

        if (consEntries.length) {
          diagText += '\n\n**Console errors**\n```\n' + consEntries.map(function(c){ return '['+c.level.toUpperCase()+'] '+c.ts+'\n'+c.msg; }).join('\n\n').slice(0, 1500) + '\n```';
        }
        if ((diag.network||[]).length) {
          diagText += '\n\n**Failed requests**\n```\n' + diag.network.map(function(n){ return n.method+' '+n.status+' '+n.url; }).join('\n').slice(0, 800) + '\n```';
        }

        var body = desc;
        if (type === 'bug') {
          if (steps)    body += '\n\n**Pasos / Steps to reproduce**\n' + steps;
          if (expected) body += '\n\n**Comportamiento esperado / Expected behavior**\n' + expected;
        }
        body += '\n\n<details>\n<summary>Diagnostics</summary>\n\n' + diagText + '\n</details>';

        var labelMap = { bug: 'bug', feature: 'enhancement', question: 'question', translation: 'translation' };
        // Truncate to ~6500 chars — conservative limit for GitHub URL params.
        // GitHub supports ~8192 chars but proxies/browsers may cut earlier.
        var params = new URLSearchParams({
          title: title,
          body: body.slice(0, 6500),
          labels: labelMap[type] || 'bug',
        });
        if (!repo) return; // invalid/tampered slug — never open a malformed GitHub URL
        window.open('https://github.com/' + repo + '/issues/new?' + params.toString(), '_blank', 'noopener,noreferrer');
        closeModal();
      });
    }

    // Initial badge update
    W.__cpguide_updateBadge();
  });
})();
