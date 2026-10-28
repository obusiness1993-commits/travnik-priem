/* Рисованный специалист за столом (заглушка, пока нет видео).
   Avatar.mount(el) — вставляет сцену, Avatar.setSpeaking(true/false) — шевелит губами. */
(function () {
  const jarColors = ["#8a9a5b", "#b5893f", "#6f7f46", "#a3763c", "#9aa36a", "#7d5a34", "#b9a05a", "#5f7040"];

  function jars(y, x0, x1, h, seed) {
    let out = "", x = x0, i = seed;
    while (x < x1 - 30) {
      const w = 34 + (i * 7) % 16, hh = h - (i * 5) % 14, c = jarColors[i % jarColors.length];
      out += `<g>
        <rect x="${x}" y="${y - hh}" width="${w}" height="${hh}" rx="6" fill="rgba(235,240,230,.35)" stroke="rgba(255,255,255,.45)" stroke-width="1.5"/>
        <rect x="${x + 3}" y="${y - hh * 0.72}" width="${w - 6}" height="${hh * 0.72 - 3}" rx="4" fill="${c}"/>
        <rect x="${x + 3}" y="${y - hh * 0.72}" width="${w - 6}" height="${hh * 0.72 - 3}" rx="4" fill="url(#grain)" opacity=".5"/>
        <rect x="${x + 2}" y="${y - hh - 7}" width="${w - 4}" height="9" rx="2" fill="#8d8a84"/>
        <rect x="${x + 6}" y="${y - hh + 6}" width="5" height="${hh - 14}" rx="2" fill="rgba(255,255,255,.35)"/>
      </g>`;
      x += w + 9; i++;
    }
    return out;
  }

  function bottles(y, x0, n) {
    let out = "";
    for (let i = 0; i < n; i++) {
      const x = x0 + i * 26;
      out += `<g>
        <rect x="${x}" y="${y - 38}" width="20" height="38" rx="3" fill="#5b3418"/>
        <rect x="${x + 6}" y="${y - 48}" width="8" height="11" fill="#3a2414"/>
        <rect x="${x + 2}" y="${y - 26}" width="16" height="12" fill="#efe4cc"/>
        <rect x="${x + 4}" y="${y - 36}" width="3" height="30" fill="rgba(255,255,255,.18)"/>
      </g>`;
    }
    return out;
  }

  function plant(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 0 C-8 -40 -30 -55 -42 -70 M0 0 C-2 -45 6 -70 2 -95 M0 0 C10 -38 30 -50 44 -66 M0 0 C-14 -30 -36 -30 -50 -38 M0 0 C14 -26 38 -28 50 -34"
        stroke="#4f6b3a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g fill="#5f8045">
        <ellipse cx="-42" cy="-72" rx="10" ry="5" transform="rotate(-30 -42 -72)"/>
        <ellipse cx="2" cy="-97" rx="6" ry="11"/>
        <ellipse cx="45" cy="-68" rx="10" ry="5" transform="rotate(30 45 -68)"/>
        <ellipse cx="-50" cy="-40" rx="11" ry="5"/>
        <ellipse cx="51" cy="-36" rx="11" ry="5"/>
        <ellipse cx="-20" cy="-52" rx="9" ry="5" transform="rotate(-50 -20 -52)"/>
        <ellipse cx="18" cy="-56" rx="9" ry="5" transform="rotate(50 18 -56)"/>
      </g>
      <path d="M-30 0 L30 0 L24 42 L-24 42 Z" fill="#b0603a"/>
      <rect x="-34" y="-4" width="68" height="10" rx="2" fill="#c16f45"/>
    </g>`;
  }

  function books(x, y) {
    const c = ["#7a3b2a", "#4a5a3a", "#8a6a3a", "#3f3a4a", "#6a4a2a", "#5a2a24"];
    let out = "", cx = x;
    c.forEach((col, i) => {
      const w = 14 + (i * 3) % 8, h = 70 + (i * 11) % 22;
      out += `<rect x="${cx}" y="${y - h}" width="${w}" height="${h}" fill="${col}"/>
              <rect x="${cx}" y="${y - h + 10}" width="${w}" height="3" fill="rgba(230,200,140,.5)"/>`;
      cx += w + 2;
    });
    return out;
  }

  const svg = `
<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" class="avatar-svg">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a4a37"/><stop offset="1" stop-color="#2e251b"/>
    </linearGradient>
    <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#6b4226"/>
    </linearGradient>
    <linearGradient id="deskFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a3720"/><stop offset="1" stop-color="#3e2515"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f1eadb"/><stop offset="1" stop-color="#d9cdb4"/>
    </linearGradient>
    <radialGradient id="face" cx=".45" cy=".4" r=".7">
      <stop offset="0" stop-color="#e8bc95"/><stop offset="1" stop-color="#c99470"/>
    </radialGradient>
    <radialGradient id="light" cx=".5" cy=".42" r=".75">
      <stop offset="0" stop-color="#ffdca0" stop-opacity=".22"/>
      <stop offset=".6" stop-color="#fff3d6" stop-opacity="0"/>
      <stop offset="1" stop-color="#0b0805" stop-opacity=".7"/>
    </radialGradient>
    <radialGradient id="flame" cx=".5" cy=".7" r=".6">
      <stop offset="0" stop-color="#fff7c8"/><stop offset=".5" stop-color="#ffc24a"/><stop offset="1" stop-color="#e0701f" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="rgba(0,0,0,.25)"/><circle cx="4" cy="4" r=".8" fill="rgba(255,255,255,.2)"/>
    </pattern>
  </defs>

  <!-- стена и полки -->
  <rect width="800" height="500" fill="url(#wall)"/>
  ${jars(88, 10, 790, 62, 0)}
  <rect x="0" y="88" width="800" height="12" fill="#3f2b1b"/>
  <rect x="0" y="100" width="800" height="4" fill="rgba(0,0,0,.2)"/>
  ${bottles(208, 20, 6)}
  ${plant(215, 208, .8)}
  ${books(570, 208)}
  ${plant(720, 208, .8)}
  <rect x="0" y="208" width="270" height="10" fill="#3f2b1b"/>
  <rect x="540" y="208" width="260" height="10" fill="#3f2b1b"/>
  ${plant(70, 400, 1.15)}
  ${plant(735, 400, 1.05)}
  <rect x="0" y="330" width="800" height="110" fill="#6e4a2c" opacity=".55"/>

  <!-- специалист -->
  <g id="person" transform="translate(400 500) scale(1.18) translate(-400 -500)">
    <g class="breath">
      <path d="M262 500 C262 392 292 340 400 330 C508 340 538 392 538 500 Z" fill="url(#shirt)" stroke="#c9bb9e" stroke-width="2"/>
      <path d="M400 345 L400 500" stroke="#cdbfa3" stroke-width="2"/>
      <circle cx="400" cy="380" r="3" fill="#bdae90"/><circle cx="400" cy="420" r="3" fill="#bdae90"/>
      <rect x="430" y="372" width="40" height="36" rx="3" fill="none" stroke="#cdbfa3" stroke-width="2"/>
      <path d="M372 300 L372 335 C384 355 416 355 428 335 L428 300 Z" fill="#c99470"/>
      <path d="M362 330 L400 372 L382 340 Z M438 330 L400 372 L418 340 Z" fill="#ddd2bb" stroke="#c9bb9e" stroke-width="2"/>
      <path d="M368 328 C378 350 422 350 432 328" fill="none" stroke="#e8dfcc" stroke-width="7"/>
    </g>

    <g id="head" class="head">
      <ellipse cx="344" cy="238" rx="10" ry="18" fill="#c99470"/>
      <ellipse cx="456" cy="238" rx="10" ry="18" fill="#c99470"/>
      <ellipse cx="400" cy="232" rx="57" ry="72" fill="url(#face)"/>
      <path d="M343 222 C336 168 366 152 402 152 C442 151 466 170 457 222 C452 196 440 182 404 184 C370 184 352 196 343 222 Z" fill="#9f927e"/>
      <path d="M352 186 C370 166 420 158 448 180" stroke="#b6aa95" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M346 214 C346 200 350 194 356 192 L352 222 Z M454 214 C454 200 450 194 444 192 L448 222 Z" fill="#8d806d"/>

      <g class="brows">
        <path d="M362 202 C370 195 382 195 391 200" stroke="#7a6e5e" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M409 200 C418 195 430 195 438 202" stroke="#7a6e5e" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      <g>
        <ellipse cx="377" cy="217" rx="10" ry="6" fill="#f6efe6"/>
        <ellipse cx="423" cy="217" rx="10" ry="6" fill="#f6efe6"/>
        <g class="pupils">
          <circle cx="378" cy="217" r="4.8" fill="#4f6a86"/><circle cx="378" cy="217" r="2.2" fill="#1d1712"/>
          <circle cx="424" cy="217" r="4.8" fill="#4f6a86"/><circle cx="424" cy="217" r="2.2" fill="#1d1712"/>
          <circle cx="379.5" cy="215.5" r="1.2" fill="#fff"/><circle cx="425.5" cy="215.5" r="1.2" fill="#fff"/>
        </g>
        <g class="lids">
          <ellipse cx="377" cy="217" rx="11" ry="7" fill="#d4a07b"/>
          <ellipse cx="423" cy="217" rx="11" ry="7" fill="#d4a07b"/>
        </g>
        <path d="M366 212 C372 208 384 208 389 212 M411 212 C416 208 428 208 434 212" stroke="#9b6b4e" stroke-width="1.5" fill="none"/>
      </g>
      <path d="M400 222 C397 236 392 247 393 252 C397 256 404 256 408 252" stroke="#a8724f" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="366" cy="248" rx="12" ry="7" fill="#d9846a" opacity=".22"/>
      <ellipse cx="434" cy="248" rx="12" ry="7" fill="#d9846a" opacity=".22"/>

      <!-- борода -->
      <path d="M345 240 C346 290 372 308 400 309 C428 308 454 290 455 240 C450 268 436 278 418 280 C410 270 390 270 382 280 C364 278 350 268 345 240 Z" fill="#a99d8b"/>
      <path d="M345 240 C346 290 372 308 400 309 C428 308 454 290 455 240 C450 268 436 278 418 280 C410 270 390 270 382 280 C364 278 350 268 345 240 Z" fill="url(#grain)" opacity=".6"/>
      <g id="mouth">
        <ellipse id="mouth-open" cx="400" cy="280" rx="11" ry="2" fill="#5a2a22"/>
        <rect id="mouth-teeth" x="392" y="278" width="16" height="2.5" rx="1" fill="#efe6da" opacity="0"/>
      </g>
      <path d="M380 270 C388 264 396 266 400 268 C404 266 412 264 420 270 C414 274 406 273 400 272 C394 273 386 274 380 270 Z" fill="#978a77"/>
    </g>

    <!-- руки на столе -->
    <path d="M276 392 C258 430 270 452 300 456 L382 456 C394 446 390 432 376 430 L318 428 C318 410 308 396 296 386 Z" fill="url(#shirt)" stroke="#c9bb9e" stroke-width="2"/>
    <path d="M524 392 C542 430 530 452 500 456 L418 456 C406 446 410 432 424 430 L482 428 C482 410 492 396 504 386 Z" fill="url(#shirt)" stroke="#c9bb9e" stroke-width="2"/>
  </g>

  <!-- стол -->
  <rect x="0" y="440" width="800" height="22" fill="url(#deskTop)"/>
  <rect x="0" y="440" width="800" height="3" fill="rgba(255,220,170,.25)"/>
  <rect x="0" y="462" width="800" height="38" fill="url(#deskFront)"/>
  <path d="M0 470 C200 466 420 476 800 468 M0 484 C260 480 520 490 800 482" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none"/>

  <g id="hands" transform="translate(400 500) scale(1.18) translate(-400 -500)">
    <ellipse cx="386" cy="444" rx="22" ry="13" fill="#d09c77"/>
    <ellipse cx="414" cy="446" rx="22" ry="13" fill="#c99470"/>
    <path d="M398 438 L430 440 M396 446 L428 448" stroke="#a8724f" stroke-width="1.5" opacity=".6"/>
    <rect x="426" y="434" width="12" height="16" rx="2" fill="#6b4a2a"/>
    <circle cx="432" cy="442" r="5" fill="#d8d0c0" stroke="#8a7550" stroke-width="1.5"/>
  </g>

  <!-- предметы на столе -->
  <g id="herbs">
    <path d="M110 452 L200 438" stroke="#7a6a3a" stroke-width="3"/>
    <g fill="#8b8f62">
      <ellipse cx="200" cy="436" rx="22" ry="9" transform="rotate(-10 200 436)"/>
      <ellipse cx="214" cy="440" rx="16" ry="7" fill="#9fa274" transform="rotate(-6 214 440)"/>
      <ellipse cx="190" cy="430" rx="14" ry="6" fill="#a6a07a" transform="rotate(-16 190 430)"/>
    </g>
    <rect x="148" y="440" width="10" height="10" fill="#a8321e" transform="rotate(-10 153 445)"/>
  </g>
  <g id="mortar">
    <path d="M64 420 L128 420 C126 444 110 452 96 452 C82 452 66 444 64 420 Z" fill="#8f8a80"/>
    <ellipse cx="96" cy="420" rx="32" ry="7" fill="#6f6a62"/>
    <rect x="104" y="384" width="9" height="42" rx="4" fill="#a39e94" transform="rotate(22 108 404)"/>
  </g>
  <g id="book">
    <path d="M520 448 L600 430 L690 440 L612 460 Z" fill="#f7f1e3" stroke="#cfc3a8" stroke-width="1.5"/>
    <path d="M600 430 L612 460" stroke="#cfc3a8" stroke-width="1.5"/>
    <path d="M540 446 L596 434 M546 450 L600 438 M622 438 L670 443 M620 444 L664 448" stroke="#b8ab92" stroke-width="1.2"/>
  </g>
  <g id="bottle">
    <rect x="700" y="404" width="30" height="46" rx="5" fill="#f4f2ee" stroke="#d6d2ca"/>
    <path d="M706 404 L710 388 L720 388 L724 404 Z" fill="#f4f2ee" stroke="#d6d2ca"/>
    <path d="M711 388 L715 372 L719 388 Z" fill="#fafafa" stroke="#d6d2ca"/>
    <rect x="704" y="420" width="22" height="14" fill="#a8321e" opacity=".85"/>
  </g>
  <g id="candle">
    <rect x="756" y="398" width="16" height="50" rx="2" fill="#efe2c2"/>
    <path d="M764 398 L764 390" stroke="#2a1f16" stroke-width="2"/>
    <ellipse class="flame" cx="764" cy="380" rx="7" ry="14" fill="url(#flame)"/>
    <circle class="glow" cx="764" cy="382" r="46" fill="#ffcf73" opacity=".12"/>
  </g>

  <rect width="800" height="500" fill="url(#light)" pointer-events="none"/>
</svg>`;

  const css = `
  .avatar-svg .breath { transform-box: fill-box; transform-origin: 50% 100%; animation: av-breath 4.2s ease-in-out infinite; }
  .avatar-svg .head { transform-box: fill-box; transform-origin: 50% 90%; animation: av-sway 7s ease-in-out infinite; }
  .avatar-svg.speaking .head { animation: av-talk 2.6s ease-in-out infinite; }
  .avatar-svg.listening .head { animation: av-listen 5s ease-in-out infinite; }
  .avatar-svg .lids ellipse { transform-box: fill-box; transform-origin: 50% 0; transform: scaleY(0); animation: av-blink 4.8s infinite; }
  .avatar-svg .brows { transition: transform .3s; }
  .avatar-svg.speaking .brows { animation: av-brows 3.1s ease-in-out infinite; }
  .avatar-svg .flame { transform-box: fill-box; transform-origin: 50% 100%; animation: av-flame .18s ease-in-out infinite alternate; }
  .avatar-svg .glow { animation: av-glow 2.2s ease-in-out infinite alternate; }
  @keyframes av-breath { 50% { transform: scaleY(1.012) translateY(-1px); } }
  @keyframes av-sway { 0%,100% { transform: rotate(0); } 50% { transform: rotate(1.2deg); } }
  @keyframes av-talk { 0%,100% { transform: rotate(-1deg) translateY(0); } 25% { transform: rotate(1.4deg) translateY(1px); } 55% { transform: rotate(-.6deg) translateY(-1px); } 80% { transform: rotate(1deg); } }
  @keyframes av-listen { 0%,100% { transform: rotate(-2.4deg); } 50% { transform: rotate(-1.4deg) translateY(1px); } }
  @keyframes av-blink { 0%, 94%, 100% { transform: scaleY(0); } 96.5% { transform: scaleY(1); } }
  @keyframes av-brows { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-2.5px); } 60% { transform: translateY(0); } }
  @keyframes av-flame { from { transform: scale(1, 1) skewX(-2deg); } to { transform: scale(.92, 1.08) skewX(3deg); } }
  @keyframes av-glow { from { opacity: .08; } to { opacity: .16; } }
  `;

  let el, mouth, teeth, speaking = false, target = 2, current = 2, last = 0;

  function tick(t) {
    if (speaking && t - last > 85 + Math.random() * 60) {
      target = Math.random() < 0.18 ? 2 : 3 + Math.random() * 8;
      last = t;
    }
    if (!speaking) target = 2;
    current += (target - current) * 0.35;
    mouth.setAttribute("ry", current.toFixed(2));
    mouth.setAttribute("rx", (11 - (current - 2) * 0.25).toFixed(2));
    teeth.setAttribute("opacity", current > 5 ? 0.85 : 0);
    requestAnimationFrame(tick);
  }

  window.Avatar = {
    mount(slot) {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      slot.innerHTML = svg;
      el = slot.querySelector("svg");
      mouth = el.querySelector("#mouth-open");
      teeth = el.querySelector("#mouth-teeth");
      requestAnimationFrame(tick);
    },
    setSpeaking(on) {
      speaking = on;
      el.classList.toggle("speaking", on);
      el.classList.toggle("listening", !on);
    },
    // короткий «открытый» рот на каждом слове (если браузер присылает события слов)
    pulse() { target = 6 + Math.random() * 5; last = performance.now(); },
  };
})();
