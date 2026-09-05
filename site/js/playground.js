/**
 * Zudo Code Playground — Floating Editor
 * Creates a bottom-right floating panel for writing and running TypeScript/JavaScript.
 */
(function () {
  'use strict';

  var DEFAULT_CODE = [
    '// Welcome to the Zudo Playground!',
    '// Write TypeScript or JavaScript and hit RUN.',
    '',
    'const greeting = (name: string): string => {',
    '  return `Hello, ${name}! Welcome to Zudo.`;',
    '};',
    '',
    'console.log(greeting("Developer"));',
    '',
    '// Try editing this code and running it.',
  ].join('\n');

  function createPlayground() {
    // Toggle button
    var toggle = document.createElement('button');
    toggle.className = 'playground-toggle';
    toggle.setAttribute('aria-label', 'Open code playground');
    toggle.innerHTML = '&lt;/&gt;';
    toggle.title = 'Open Code Playground';

    // Panel
    var panel = document.createElement('div');
    panel.className = 'playground-panel';
    panel.innerHTML = [
      '<div class="playground-header">',
      '  <span class="playground-header-title">Code Playground</span>',
      '  <div class="playground-header-actions">',
      '    <button class="playground-btn playground-btn-run" id="pgRun">Run</button>',
      '    <button class="playground-btn playground-btn-clear" id="pgClear">Clear</button>',
      '    <button class="playground-btn playground-btn-close" id="pgClose">&times;</button>',
      '  </div>',
      '</div>',
      '<div class="playground-editor-wrap">',
      '  <textarea class="playground-editor" id="pgEditor" spellcheck="false" placeholder="// Write your code here..."></textarea>',
      '</div>',
      '<div class="playground-output-wrap">',
      '  <div class="playground-output-header">',
      '    <span class="playground-output-label">Output</span>',
      '    <button class="playground-btn" id="pgClearOutput" style="padding:2px 8px;font-size:0.6rem;border-color:#444;color:#444">CLEAR</button>',
      '  </div>',
      '  <textarea class="playground-output" id="pgOutput" readonly placeholder="Output will appear here..."></textarea>',
      '</div>',
    ].join('');

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    var editor = document.getElementById('pgEditor');
    var output = document.getElementById('pgOutput');
    var btnRun = document.getElementById('pgRun');
    var btnClear = document.getElementById('pgClear');
    var btnClose = document.getElementById('pgClose');
    var btnClearOutput = document.getElementById('pgClearOutput');

    // Load saved code or default
    var saved = null;
    try { saved = localStorage.getItem('zudo_playground_code'); } catch (e) {}
    editor.value = saved || DEFAULT_CODE;

    // Tab support in editor
    editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
      }
      // Ctrl+Enter / Cmd+Enter to run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        btnRun.click();
      }
    });

    // Save on change
    editor.addEventListener('input', function () {
      try { localStorage.setItem('zudo_playground_code', editor.value); } catch (e) {}
    });

    // Toggle panel
    toggle.addEventListener('click', function () {
      panel.classList.add('open');
      toggle.style.display = 'none';
      editor.focus();
    });

    btnClose.addEventListener('click', function () {
      panel.classList.remove('open');
      toggle.style.display = 'flex';
    });

    // Clear editor
    btnClear.addEventListener('click', function () {
      editor.value = '';
      output.value = '';
      editor.focus();
    });

    // Clear output
    btnClearOutput.addEventListener('click', function () {
      output.value = '';
    });

    // Run code
    btnRun.addEventListener('click', function () {
      runCode(editor.value);
    });

    function runCode(code) {
      output.value = '';
      var lines = [];

      function pushLine(text, cls) {
        lines.push({ text: text, cls: cls || '' });
        renderOutput();
      }

      function renderOutput() {
        output.value = lines.map(function (l) { return l.text; }).join('\n');
        output.scrollTop = output.scrollHeight;
      }

      // Override console methods
      var origLog = console.log;
      var origError = console.error;
      var origWarn = console.warn;
      var origInfo = console.info;

      console.log = function () {
        var args = Array.prototype.slice.call(arguments);
        pushLine(args.map(formatArg).join(' '), 'log-info');
      };
      console.error = function () {
        var args = Array.prototype.slice.call(arguments);
        pushLine('ERROR: ' + args.map(formatArg).join(' '), 'log-error');
      };
      console.warn = function () {
        var args = Array.prototype.slice.call(arguments);
        pushLine('WARN: ' + args.map(formatArg).join(' '), 'log-warn');
      };
      console.info = function () {
        var args = Array.prototype.slice.call(arguments);
        pushLine(args.map(formatArg).join(' '), 'log-info');
      };

      function formatArg(val) {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';
        if (typeof val === 'string') return val;
        if (typeof val === 'function') return val.toString();
        try { return JSON.stringify(val, null, 2); } catch (e) { return String(val); }
      }

      pushLine('> Running...', 'log-info');

      try {
        var startTime = performance.now();
        var fn = new Function(code);
        var result = fn();
        var elapsed = (performance.now() - startTime).toFixed(2);

        if (result !== undefined) {
          pushLine('=> ' + formatArg(result), 'log-result');
        }
        pushLine('> Done (' + elapsed + 'ms)', 'log-info');
      } catch (err) {
        pushLine('Error: ' + err.message, 'log-error');
        if (err.stack) {
          var stackLine = err.stack.split('\n').slice(1, 3).join('\n');
          pushLine(stackLine, 'log-error');
        }
      } finally {
        console.log = origLog;
        console.error = origError;
        console.warn = origWarn;
        console.info = origInfo;
      }
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPlayground);
  } else {
    createPlayground();
  }
})();
