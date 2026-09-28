/* Market Support — site interactions */
(function () {
  'use strict';
  var FORM_EMAIL = 'chalit@marketsupport.co.th';           // enquiry form recipient
  var lang = document.documentElement.lang === 'th' ? 'th' : 'en';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var dataEl = document.getElementById('ui-data');
  var ui = dataEl ? JSON.parse(dataEl.textContent) : {};

  /* ---------- Language toggle: remember choice, keep the section ---------- */
  $$('.lang-toggle a').forEach(function (a) {
    a.addEventListener('click', function () {
      try { localStorage.setItem('msp-lang', a.getAttribute('data-lang')); } catch (e) {}
      if (location.hash) a.setAttribute('href', a.getAttribute('href').split('#')[0] + location.hash);
    });
  });
  try {
    var saved = localStorage.getItem('msp-lang');
    var fromSite = document.referrer && document.referrer.indexOf(location.host) !== -1;
    if (saved === 'th' && lang === 'en' && !fromSite) {
      var th = $('.lang-toggle a[data-lang="th"]');
      if (th) location.replace(th.getAttribute('href') + location.hash);
    }
  } catch (e) {}

  /* ---------- Mobile menu: close after choosing a link ---------- */
  $$('.mobile-nav-menu a').forEach(function (a) {
    a.addEventListener('click', function () { var d = a.closest('details'); if (d) d.open = false; });
  });
  document.addEventListener('click', function (e) {
    var d = $('.mobile-nav-menu[open]');
    if (d && !d.contains(e.target)) d.open = false;
  });

  /* ---------- Hero: segment dots ---------- */
  if (ui.seg) {
    var chips = $$('[data-seg]'), dots = $('[data-seg-dots]'), share = $('[data-seg-share]'), text = $('[data-seg-text]');
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        var s = ui.seg[+b.getAttribute('data-seg')];
        chips.forEach(function (c, j) { c.setAttribute('style', s.chips[j]); c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        var kids = dots.children;
        for (var k = 0; k < kids.length; k++) kids[k].style.background = s.dots[k];
        share.textContent = s.share; text.textContent = s.text;
      });
    });
  }

  /* ---------- Tabs: business cycle + industries ---------- */
  $$('[data-tabs]').forEach(function (list) {
    var key = list.getAttribute('data-tabs'), st = ui[key];
    if (!st) return;
    function select(i, focus) {
      list.innerHTML = st.tabs[i];
      $$('[data-panel^="' + key + '-"]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== key + '-' + i; });
      var tabs = $$('[role=tab]', list);
      tabs.forEach(function (t, j) { t.setAttribute('aria-controls', key + '-panel-' + j); t.tabIndex = j === i ? 0 : -1; });
      if (focus) tabs[i].focus();
    }
    list.addEventListener('click', function (e) {
      var t = e.target.closest('[role=tab]'); if (!t) return;
      select($$('[role=tab]', list).indexOf(t));
    });
    list.addEventListener('keydown', function (e) {
      var tabs = $$('[role=tab]', list), i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); select((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
    });
    select(0);
  });

  /* ---------- FAQ accordion ---------- */
  if (ui.faq) {
    var items = $$('[data-faq]');
    function setItem(it, open) {
      var b = $('button', it), a = b.nextElementSibling;
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (a) a.hidden = !open;
      var icon = $('[aria-hidden]', b); if (icon) icon.setAttribute('style', open ? ui.faq.iconOpen : ui.faq.iconClosed);
    }
    items.forEach(function (it) {
      $('button', it).addEventListener('click', function () {
        var isOpen = $('button', it).getAttribute('aria-expanded') === 'true';
        items.forEach(function (o) { setItem(o, false); });
        if (!isOpen) setItem(it, true);
      });
    });
  }

  /* ---------- Client logos: pause / play ---------- */
  var mq = $('[data-mq-toggle]');
  if (mq && ui.mq) {
    var sec = $('#clients');
    mq.setAttribute('aria-pressed', 'false');
    mq.addEventListener('click', function () {
      var paused = sec.classList.toggle('is-paused');
      mq.innerHTML = paused ? ui.mq.pausedHTML : ui.mq.playHTML;
      mq.setAttribute('aria-pressed', paused ? 'true' : 'false');
    });
  }

  /* ---------- Enquiry form ---------- */
  var form = $('#contact-form');
  if (form) {
    var needs = $$('[data-need]'), sent = $('[data-sent]');
    needs.forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.setAttribute('style', on ? ui.need.on : ui.need.off);
      });
    });
    var T = {
      en: { req: 'Please enter your name and a valid work email.', fail: 'Sorry, your message could not be sent. Please email us at msp@marketsupport.co.th or call +66 2 255 8575.', sending: 'Sending…', activate: 'The enquiry form is waiting for activation. The site owner needs to click “Activate Form” in the email sent by FormSubmit (check the spam folder too). After that, please send again.', local: 'The form only works when the site is opened from the web address, not from a file on your computer.' },
      th: { req: 'กรุณากรอกชื่อและอีเมลที่ถูกต้องค่ะ', fail: 'ขออภัย ระบบส่งข้อความไม่สำเร็จค่ะ กรุณาส่งอีเมลมาที่ msp@marketsupport.co.th หรือโทร 02 255 8575 ค่ะ', sending: 'กำลังส่ง…', activate: 'ฟอร์มยังรอการเปิดใช้งานค่ะ เจ้าของเว็บไซต์ต้องกด “Activate Form” ในอีเมลจาก FormSubmit ก่อน (กรุณาเช็กโฟลเดอร์ Spam ด้วยค่ะ) จากนั้นลองส่งใหม่อีกครั้งค่ะ', local: 'ฟอร์มจะใช้งานได้เมื่อเปิดเว็บไซต์ผ่านลิงก์ออนไลน์เท่านั้นค่ะ ไม่สามารถส่งจากไฟล์ในเครื่องได้ค่ะ' }
    }[lang];
    var submit = $('button[type=submit]', form), label = submit.textContent;
    function showError(msg) {
      var e = $('.form-error', form);
      if (!e) { e = document.createElement('p'); e.className = 'form-error'; e.setAttribute('role', 'alert'); submit.parentElement.parentElement.insertBefore(e, submit.parentElement); }
      e.textContent = msg; e.hidden = !msg;
    }
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = new FormData(form);
      var name = (f.get('name') || '').trim(), email = (f.get('email') || '').trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError(T.req); return; }
      showError('');
      var payload = {
        _subject: 'Website enquiry — ' + (f.get('company') || name),
        _template: 'table', _captcha: 'false', _replyto: email,
        Name: name, Company: f.get('company') || '', Email: email, Industry: f.get('industry') || '',
        'Business cycle': needs.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.getAttribute('data-label'); }).join(', '),
        Brief: f.get('brief') || '', Language: lang.toUpperCase(), Page: location.href
      };
      if (f.get('_honey')) return;
      submit.disabled = true; submit.textContent = T.sending;
      fetch('https://formsubmit.co/ajax/' + FORM_EMAIL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || String(j.success) !== 'true') throw new Error(j.message || ('HTTP ' + r.status)); }); })
        .then(function () { form.hidden = true; sent.hidden = false; sent.scrollIntoView({ block: 'center' }); })
        .catch(function (err) {
          var msg = String(err && err.message || '');
          if (window.console) console.error('Form service replied:', msg);
          if (/activat/i.test(msg)) showError(T.activate);
          else if (location.protocol === 'file:') showError(T.local);
          else showError(T.fail + (msg ? ' (' + msg + ')' : ''));
        })
        .then(function () { submit.disabled = false; submit.textContent = label; });
    });
    var reset = $('[data-reset]');
    if (reset) reset.addEventListener('click', function () {
      form.reset(); needs.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); b.setAttribute('style', ui.need.off); });
      sent.hidden = true; form.hidden = false;
    });
  }
})();
