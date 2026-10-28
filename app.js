/* Логика консультации: показывает реплики из scenario.js, озвучивает их и рисует кнопки. */
(function () {
  const S = window.SCENARIO;
  const $ = (sel) => document.querySelector(sel);

  const ui = {
    options: $("#options"),
    subtitle: $("#subtitle"),
    card: $("#product-card"),
    step: $("#step"),
    video: $("#avatar-video"),
    start: $("#start-overlay"),
    skip: $("#btn-skip"),
    sound: $("#btn-sound"),
    modal: $("#modal"),
    modalBody: $("#modal-body"),
  };

  const state = { node: null, lastOffer: null, muted: false, started: false, run: 0, skip: null };

  document.querySelectorAll("[data-specialist-name]").forEach((el) => (el.textContent = S.specialist.name));
  document.querySelectorAll("[data-specialist-title]").forEach((el) => (el.textContent = S.specialist.title));
  document.querySelectorAll("[data-specialist-short]").forEach((el) => (el.textContent = S.specialist.short));
  Avatar.mount($("#avatar-slot"));
  Avatar.setSpeaking(false);

  const rub = (n) => n.toLocaleString("ru-RU") + " ₽";

  /* ---------- Голос ---------- */
  let voice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const ru = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("ru"));
    const male = /dmitry|pavel|maxim|yuri|dmitri|дмитрий|павел|максим/i;
    voice = ru.find((v) => male.test(v.name) && /natural|online/i.test(v.name))
         || ru.find((v) => male.test(v.name))
         || ru.find((v) => /google/i.test(v.name))
         || ru[0] || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  // Разбивает текст на слова для подсветки субтитров
  // На экране только текущее предложение, чтобы не закрывать специалиста.
  function renderSubtitle(text) {
    const words = text.split(/\s+/);
    let sentence = 0;
    ui.subtitle.innerHTML = words.map((w) => {
      const html = `<span class="w" data-s="${sentence}">${w}</span> `;
      if (/[.!?…]$/.test(w)) sentence++;
      return html;
    }).join("");
    ui.subtitle.classList.add("show");
    const spans = [...ui.subtitle.querySelectorAll(".w")];
    // начало каждого слова в исходном тексте — для событий onboundary
    const starts = [];
    let pos = 0;
    words.forEach((w) => { pos = text.indexOf(w, pos); starts.push(pos); pos += w.length; });
    return {
      upTo(i) {
        const cur = spans[Math.min(Math.max(i, 0), spans.length - 1)].dataset.s;
        spans.forEach((s, k) => {
          s.classList.toggle("on", k <= i);
          s.hidden = s.dataset.s !== cur;
        });
      },
      byChar(c) { let i = 0; while (i + 1 < starts.length && starts[i + 1] <= c) i++; this.upTo(i); },
      all() { ui.subtitle.classList.remove("show"); },
      count: spans.length,
    };
  }

  // Говорит текст: синтезатор речи, видео или беззвучная «имитация» по таймеру.
  function speak(text, videoUrl) {
    const run = state.run;
    const sub = renderSubtitle(text);
    sub.upTo(0);
    const estMs = Math.max(1800, sub.count * 360);
    ui.skip.hidden = false;
    Avatar.setSpeaking(true);

    return new Promise((resolve) => {
      let done = false, timer = null, hl = null;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer); clearInterval(hl);
        if ("speechSynthesis" in window) speechSynthesis.cancel();
        ui.video.onended = null;
        sub.all();
        Avatar.setSpeaking(false);
        ui.skip.hidden = true;
        if (run === state.run) resolve();
      };
      state.skip = finish;

      // подсветка слов по времени (если браузер не присылает события слов)
      let gotBoundary = false;
      const t0 = performance.now();
      const timeHighlight = (total) => {
        hl = setInterval(() => {
          if (!gotBoundary) sub.upTo(Math.floor(((performance.now() - t0) / total) * sub.count));
        }, 120);
      };

      if (videoUrl) {
        ui.video.hidden = false;
        ui.video.src = videoUrl;
        ui.video.muted = state.muted;
        ui.video.onended = finish;
        ui.video.onloadedmetadata = () => timeHighlight(ui.video.duration * 1000);
        ui.video.play().catch(finish);
        return;
      }
      ui.video.hidden = true;
      ui.video.pause();

      if (state.muted || !("speechSynthesis" in window)) {
        timeHighlight(estMs);
        timer = setTimeout(finish, estMs);
        return;
      }

      // Chrome обрывает длинные фразы — говорим по предложениям
      const parts = text.match(/[^.!?…]+[.!?…]*/g) || [text];
      let offset = 0;
      speechSynthesis.cancel();
      parts.forEach((p, idx) => {
        const u = new SpeechSynthesisUtterance(p.trim());
        const base = text.indexOf(p.trim(), offset);
        offset = base + p.trim().length;
        u.lang = "ru-RU";
        if (voice) u.voice = voice;
        u.rate = 0.95;
        u.pitch = 0.85;
        u.onboundary = (e) => {
          if (e.name && e.name !== "word") return;
          gotBoundary = true;
          sub.byChar(base + e.charIndex);
          Avatar.pulse();
        };
        if (idx === parts.length - 1) u.onend = finish;
        u.onerror = (e) => { if (e.error !== "interrupted" && e.error !== "canceled") finish(); };
        speechSynthesis.speak(u);
      });
      timeHighlight(estMs);
      timer = setTimeout(finish, estMs * 2.5 + 4000); // страховка, если onend не придёт
    });
  }

  /* ---------- Иконки программ (тонкая линия) ---------- */
  const ICONS = {
    leaf: '<path d="M10 54C10 30 26 12 54 10c0 28-16 44-40 44"/><path d="M10 54L38 26M22 42h10M28 36v-9"/>',
    moon: '<path d="M44 12a22 22 0 1 0 8 34A18 18 0 0 1 44 12z"/><path d="M50 14l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/>',
    branch: '<path d="M32 58V8"/><path d="M32 18c-8-2-12-8-12-12 6 0 11 5 12 12zM32 30c8-2 12-8 12-12-6 0-11 5-12 12zM32 42c-8-2-12-8-12-12 6 0 11 5 12 12z"/>',
    drop: '<path d="M32 8c10 14 18 24 18 34a18 18 0 0 1-36 0c0-10 8-20 18-34z"/><path d="M24 44a8 8 0 0 0 8 8"/>',
    scroll: '<path d="M16 10h30a6 6 0 0 1 6 6v38H22a6 6 0 0 1-6-6z"/><path d="M16 48a6 6 0 0 0 6 6M26 22h16M26 30h16M26 38h10"/>',
  };
  const icon = (k) => `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[k] || ICONS.leaf}</svg>`;

  /* ---------- Реплики и кнопки ---------- */
  function renderCard(id) {
    const p = S.products[id];
    if (!p) { ui.card.hidden = true; return; }
    ui.card.hidden = false;
    ui.card.innerHTML = `
      <div class="pc-icon">${icon(p.icon)}</div>
      <div>
        <h3>${p.title}</h3>
        <div class="pc-price"><b>${rub(p.price)}</b>${p.oldPrice ? `<s>${rub(p.oldPrice)}</s>` : ""}</div>
      </div>`;
  }

  function currentProduct() {
    const n = S.nodes[state.node];
    return (n && n.product) || (state.lastOffer && S.nodes[state.lastOffer].product);
  }

  let steps = 0;
  async function show(id) {
    if (id === "@offer") id = state.lastOffer || S.start;
    const node = S.nodes[id];
    if (!node) return console.warn("Нет реплики", id);
    if (state.skip) state.skip();
    state.run++;
    const run = state.run;
    state.node = id;
    if (id === S.start) { state.lastOffer = null; ui.card.hidden = true; steps = 0; }
    if (node.product) { state.lastOffer = id; renderCard(node.product); }
    ui.step.textContent = "Реплика " + String(++steps).padStart(2, "0");

    const text = node.sayFromProduct ? S.products[currentProduct()][node.sayFromProduct] : node.say;
    ui.options.innerHTML = `<div class="typing"><i></i><i></i><i></i>${S.specialist.short} говорит</div>`;

    await speak(text, node.video);
    if (run !== state.run) return;

    if (node.then) return show(node.then);
    renderOptions(node.options || []);
  }

  function renderOptions(opts) {
    ui.options.innerHTML = "";
    opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "opt" + (o.style ? " " + o.style : "");
      b.textContent = o.label;
      b.style.animationDelay = i * 70 + "ms";
      b.onclick = () => choose(o);
      ui.options.appendChild(b);
    });
  }

  function choose(o) {
    if (o.action === "buy") return openBuy(o.product || currentProduct());
    if (o.action === "lead") return openLead();
    if (o.action === "catalog") { $("#programs").scrollIntoView(); return; }
    show(o.next);
  }

  /* ---------- Покупка и заявка ---------- */
  function openModal(html) {
    ui.modalBody.innerHTML = html;
    ui.modal.hidden = false;
  }
  function closeModal() { ui.modal.hidden = true; }
  ui.modal.addEventListener("click", (e) => { if (e.target === ui.modal || e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function openBuy(id) {
    const p = S.products[id];
    if (!p) return;
    openModal(`
      <div class="eyebrow">Программа</div>
      <h3>${p.title}</h3>
      <p class="m-lead">${p.short}</p>
      <ul>${p.items.map((i) => `<li>${i}</li>`).join("")}</ul>
      <div class="m-price"><b>${rub(p.price)}</b>${p.oldPrice ? `<s>${rub(p.oldPrice)}</s>` : ""}</div>
      <form id="buy-form">
        <label>Почта для доступа</label>
        <input type="email" name="email" required placeholder="you@mail.ru">
        <label>Telegram — по желанию</label>
        <input type="text" name="tg" placeholder="@username">
        <button class="btn btn-dark" type="submit">Перейти к оплате</button>
        <div class="note">Картой или через СБП · доступ сразу после оплаты</div>
      </form>`);
    $("#buy-form").onsubmit = (e) => {
      e.preventDefault();
      if (p.payUrl) { window.location.href = p.payUrl; return; }
      // прототип: платёжной ссылки ещё нет — показываем, что было бы после оплаты
      openModal(`<div class="check">✓</div>
        <h3>Демо-режим</h3>
        <p class="m-lead">Здесь клиент перейдёт на страницу оплаты (Prodamus / ЮKassa). После оплаты материалы автоматически уйдут на почту и в Telegram.</p>
        <button class="btn btn-dark" data-close>Понятно</button>`);
      if (state.started) show("thanks");
    };
  }

  function openLead() {
    openModal(`
      <div class="eyebrow">Личный приём</div>
      <h3>Записаться к травнику</h3>
      <p class="m-lead">Оставьте контакт — мы напишем и договоримся о времени.</p>
      <form id="lead-form">
        <label>Как к вам обращаться</label>
        <input type="text" name="name" required placeholder="Имя">
        <label>Телефон или Telegram</label>
        <input type="text" name="contact" required placeholder="+7… или @username">
        <button class="btn btn-dark" type="submit">Отправить заявку</button>
        <div class="note">Демо: в прототипе заявка никуда не отправляется</div>
      </form>`);
    $("#lead-form").onsubmit = (e) => { e.preventDefault(); closeModal(); show("lead_thanks"); };
  }

  /* ---------- Каталог ---------- */
  $("#catalog-grid").innerHTML = Object.entries(S.products).map(([id, p], i) => `
    <article class="item${p.featured ? " featured" : ""}">
      <div class="item-top">
        <div class="item-icon">${icon(p.icon)}</div>
        ${p.featured ? '<span class="badge">Всё в одном</span>' : `<span class="item-num">${String(i + 1).padStart(2, "0")}</span>`}
      </div>
      <h3>${p.title}</h3>
      <p>${p.short}</p>
      <div class="item-foot">
        <div><span class="price">${rub(p.price)}</span>${p.oldPrice ? `<span class="old">${rub(p.oldPrice)}</span>` : ""}</div>
        <button class="btn ${p.featured ? "btn-brass" : "btn-outline"}" data-buy="${id}">Подробнее</button>
      </div>
    </article>`).join("");
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-buy]");
    if (b) openBuy(b.dataset.buy);
  });

  /* ---------- Кнопки окна ---------- */
  $("#btn-start").onclick = () => {
    state.started = true;
    ui.start.hidden = true;
    show(S.start);
  };
  ui.skip.onclick = () => state.skip && state.skip();
  ui.sound.onclick = () => {
    state.muted = !state.muted;
    ui.sound.classList.toggle("muted", state.muted);
    ui.sound.setAttribute("aria-label", state.muted ? "Включить звук" : "Выключить звук");
    ui.video.muted = state.muted;
    // выключили звук посреди фразы — дочитываем её субтитрами и показываем кнопки
    if (state.muted && !ui.skip.hidden && ui.video.hidden && state.skip) state.skip();
  };

  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
