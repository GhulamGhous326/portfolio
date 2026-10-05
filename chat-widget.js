/* Ask Ghulam - portfolio chat widget (vanilla JS, no dependencies). */
(function () {
  'use strict';

  var ENDPOINT = '/.netlify/functions/chat';
  var MAX_LEN = 500;
  var HISTORY_LIMIT = 10;

  var CHAT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/><path d="M9 11h.01M13 11h.01M17 11h.01"/></svg>';
  var SEND_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';

  var SUGGESTIONS = [
    'What projects has he built?',
    'How can I contact him?',
    'What is he learning now?'
  ];

  var history = []; // {role, content} for API context
  var sending = false;
  var lastFailed = null;

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    return d;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- build DOM ----
  var root = el('div', 'chat-root');
  root.innerHTML =
    '<button class="chat-fab" aria-label="Chat with Ask Ghulam" aria-expanded="false" aria-controls="chat-panel">' + CHAT_SVG + '</button>' +
    '<div class="chat-panel" id="chat-panel" role="dialog" aria-label="Ask Ghulam" aria-hidden="true">' +
      '<div class="chat-head"><div><strong>Ask Ghulam</strong><span class="ai-badge">AI-generated</span></div>' +
      '<button class="chat-close" aria-label="Close chat">&times;</button></div>' +
      '<div class="chat-msgs" role="log" aria-live="polite" aria-label="Chat messages"></div>' +
      '<div class="chat-suggest" aria-label="Suggested questions"></div>' +
      '<form class="chat-form">' +
        '<input type="text" placeholder="Ask about Ghulam..." maxlength="' + MAX_LEN + '" aria-label="Your question" autocomplete="off" />' +
        '<button type="submit" aria-label="Send message">' + SEND_SVG + '</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(root);

  var fab = root.querySelector('.chat-fab');
  var panel = root.querySelector('.chat-panel');
  var msgs = root.querySelector('.chat-msgs');
  var suggestBox = root.querySelector('.chat-suggest');
  var form = root.querySelector('.chat-form');
  var input = form.querySelector('input');
  var closeBtn = root.querySelector('.chat-close');

  SUGGESTIONS.forEach(function (q) {
    var b = el('button', null, escapeHtml(q));
    b.type = 'button';
    b.addEventListener('click', function () { send(q); });
    suggestBox.appendChild(b);
  });

  function setOpen(open) {
    panel.classList.toggle('open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    fab.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (!msgs.children.length) {
        addMsg('assistant', "Hi! I'm Ask Ghulam. Ask me about his projects, skills, or how to reach him.");
      }
      setTimeout(function () { input.focus(); }, 60);
    } else {
      fab.focus();
    }
  }

  fab.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
  });

  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }

  function addMsg(role, text) {
    var row = el('div', 'msg msg-' + role);
    var bubble = el('div', 'bubble', escapeHtml(text).replace(/\n/g, '<br>'));
    row.appendChild(bubble);
    msgs.appendChild(row);
    scrollDown();
    return bubble;
  }

  function addError(kind) {
    var row = el('div', 'msg msg-error');
    var bubble = el('div', 'bubble');
    var text = el('span');
    if (kind === 'not_configured') {
      text.innerHTML = 'Chat is not set up yet. Reach Ghulam at <a href="mailto:ghulamghous208@mail.com">ghulamghous208@mail.com</a>.';
    } else if (kind === 'not_found') {
      text.textContent = 'Chat service not found. It works only on the deployed site, not in local preview.';
    } else if (kind === 'rate_limited') {
      text.textContent = 'Too many messages right now. Please try again in a bit.';
    } else if (kind === 'upstream_key') {
      text.textContent = 'Chat key issue (400). The site owner should check the API key value.';
    } else if (kind === 'upstream_forbidden') {
      text.textContent = 'Chat key blocked (403). The site owner should check key restrictions.';
    } else if (kind === 'upstream_model') {
      text.textContent = 'Chat model issue (404). The site owner should update the model name.';
    } else if (kind === 'upstream_quota') {
      text.textContent = 'Chat is over its free quota right now. Please try again later.';
    } else if (kind === 'upstream_noreply') {
      text.textContent = 'Chat returned no reply. Please try again.';
    } else {
      text.textContent = 'Something went wrong. ';
      var retry = el('button', 'chat-retry', 'Retry');
      retry.type = 'button';
      retry.addEventListener('click', function () {
        row.remove();
        if (lastFailed) { var q = lastFailed; lastFailed = null; send(q); }
      });
      bubble.appendChild(text);
      bubble.appendChild(retry);
      row.appendChild(bubble);
      msgs.appendChild(row);
      scrollDown();
      return;
    }
    bubble.appendChild(text);
    row.appendChild(bubble);
    msgs.appendChild(row);
    scrollDown();
  }

  // typewriter reveal (client-side; backend returns a complete reply)
  function typewrite(bubble, fullText, done) {
    var i = 0, step = 3;
    var safe = escapeHtml(fullText);
    // reveal progressively on plain text to avoid breaking entities
    var plain = fullText;
    (function tick() {
      i += step;
      if (i >= plain.length) {
        bubble.innerHTML = safe.replace(/\n/g, '<br>');
        scrollDown();
        if (done) done();
        return;
      }
      bubble.textContent = plain.slice(0, i);
      scrollDown();
      setTimeout(tick, 14);
    })();
  }

  function setSending(on) {
    sending = on;
    input.disabled = on;
    form.querySelector('button[type="submit"]').disabled = on;
  }

  function send(raw) {
    var q = String(raw == null ? input.value : raw).trim().slice(0, MAX_LEN);
    if (!q || sending) return;
    if (!panel.classList.contains('open')) setOpen(true);
    suggestBox.style.display = 'none';
    input.value = '';
    addMsg('user', q);
    history.push({ role: 'user', content: q });
    history = history.slice(-HISTORY_LIMIT);

    var thinking = el('div', 'msg msg-assistant');
    thinking.innerHTML = '<div class="bubble typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(thinking);
    scrollDown();
    setSending(true);

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    }).then(function (r) {
      if (r.status === 404) return { status: 404, data: { error: 'not_found' } };
      return r.json().then(
        function (data) { return { status: r.status, data: data }; },
        function () { return { status: r.status, data: { error: 'bad_response' } }; }
      );
    }).then(function (res) {
      thinking.remove();
      setSending(false);
      if (res.status === 200 && res.data && res.data.reply) {
        var bubble = addMsg('assistant', '');
        history.push({ role: 'assistant', content: res.data.reply });
        history = history.slice(-HISTORY_LIMIT);
        typewrite(bubble, res.data.reply);
      } else {
        lastFailed = q;
        addError(res.data && res.data.error);
        history.pop();
      }
    }).catch(function () {
      thinking.remove();
      setSending(false);
      lastFailed = q;
      addError('network');
      history.pop();
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    send();
  });
})();
