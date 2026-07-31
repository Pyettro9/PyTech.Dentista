/* ==========================================================================
   MONSTER — cinematic scroll experience
   GSAP + ScrollTrigger + Lenis
   ========================================================================== */

(function(){
  "use strict";

  /* ---------------------------------------------------------------------
     1. FLAVOR CONFIG — single source of truth for colors + content
     --------------------------------------------------------------------- */
  const FLAVORS = [
    {
      id:'mangoloco', name:'MANGO LOCO',
      bg1:'#083241', bg2:'#031820', accent:'#FF8A1F', accent2:'#FFD23F',
      canLight:'#5DCBEF', canBody:'#1FA9DD', canHi:'#3FBBE6', canDark:'#0E7CA8',
      pattern:'mango', topText:'MANGO LOCO', topTextColor:'#0a2a38',
      clawColor:'#FF7A00', clawWidth:30,
      wordStack:[
        {text:'MONSTER', y:436, size:34, weight:900, color:'#101820', spacing:1},
        {text:'JUICE', y:480, size:46, weight:900, color:'#FFD400', spacing:1},
        {text:'ENERGY + SUCO', y:502, size:11, weight:700, color:'#101820', spacing:3}
      ]
    },
    {
      id:'ultra', name:'MONSTER ULTRA',
      bg1:'#141f2c', bg2:'#0a1018', accent:'#EAF6FF', accent2:'#7FD1FF',
      canLight:'#F6F7FA', canBody:'#E7EAF0', canHi:'#EFF1F5', canDark:'#C9CFDA',
      pattern:'crackle', topText:'TAURINA', topTextColor:'#3a4250',
      clawColor:'#151515', clawWidth:18,
      wordStack:[
        {text:'MONSTER', y:436, size:34, weight:900, color:'#101010', spacing:1},
        {text:'ENERGY', y:462, size:16, weight:600, color:'#101010', spacing:6},
        {text:'ULTRA', y:500, size:28, weight:900, color:'#101010', spacing:4}
      ]
    },
    {
      id:'ultraviolet', name:'ULTRA VIOLET',
      bg1:'#2a1250', bg2:'#100626', accent:'#B44BFF', accent2:'#7A2EEB',
      canLight:'#9B6BD9', canBody:'#7143B8', canHi:'#8556C9', canDark:'#4A2686',
      pattern:'paisley', topText:'SEM AÇÚCARES', topTextColor:'#f2eaff',
      clawColor:'#ffffff', clawWidth:18,
      wordStack:[
        {text:'MONSTER', y:436, size:34, weight:900, color:'#ffffff', spacing:1},
        {text:'ENERGY', y:462, size:16, weight:600, color:'#ffffff', spacing:6},
        {text:'ULTRA VIOLET', y:500, size:22, weight:900, color:'#ffffff', spacing:3}
      ]
    }
  ];

  const root = document.documentElement;

  /* ---------------------------------------------------------------------
     2. CAN SVG GENERATION — stylized art inspired by the real cans
     --------------------------------------------------------------------- */
  function buildPattern(f){
    if(f.pattern==='mango'){
      const pts = [[75,120],[225,110],[70,420],[230,430],[80,510],[220,510],[150,140]];
      return pts.map(([x,y])=>`
        <g opacity="0.32" fill="none" stroke="#ffffff" stroke-width="2">
          <circle cx="${x}" cy="${y}" r="9"/>
          <circle cx="${x-13}" cy="${y+5}" r="7"/>
          <circle cx="${x+13}" cy="${y+5}" r="7"/>
          <circle cx="${x}" cy="${y+15}" r="7"/>
        </g>`).join('');
    }
    if(f.pattern==='crackle'){
      const pts = [[90,150],[210,180],[100,450],[200,480],[150,530],[95,300]];
      return pts.map(([x,y])=>`
        <g opacity="0.16" stroke="#ffffff" stroke-width="1.4" fill="none">
          <path d="M${x},${y} l14,-10 M${x},${y} l-16,-6 M${x},${y} l6,16 M${x},${y} l-8,14 M${x},${y} l18,8"/>
        </g>`).join('');
    }
    if(f.pattern==='paisley'){
      const pts = [[85,130],[215,140],[90,440],[210,460],[150,520],[110,260]];
      return pts.map(([x,y],i)=>`
        <g opacity="0.25" fill="#ffffff11" stroke="#ffffff" stroke-width="1" transform="rotate(${i*35} ${x} ${y})">
          <path d="M${x},${y} q14,-4 14,14 q0,16 -14,18 q-16,2 -18,-14 q-2,-16 18,-18 Z"/>
        </g>`).join('');
    }
    return '';
  }

  function buildWordStack(f){
    return f.wordStack.map(w =>
      `<text x="150" y="${w.y}" text-anchor="middle" font-family="Anton, sans-serif"
        font-size="${w.size}" font-weight="${w.weight}" fill="${w.color}" letter-spacing="${w.spacing}">${w.text}</text>`
    ).join('');
  }

  function buildCanSVG(f){
    const gid = f.id;
    return `
    <svg viewBox="0 0 300 640" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="body-${gid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${f.canLight}"/>
          <stop offset="14%" stop-color="${f.canBody}"/>
          <stop offset="50%" stop-color="${f.canBody}"/>
          <stop offset="58%" stop-color="${f.canHi}"/>
          <stop offset="90%" stop-color="${f.canBody}"/>
          <stop offset="100%" stop-color="${f.canDark}"/>
        </linearGradient>
        <linearGradient id="rim-${gid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fafafa"/>
          <stop offset="45%" stop-color="#c3c3c3"/>
          <stop offset="100%" stop-color="#8f8f8f"/>
        </linearGradient>
        <radialGradient id="top-${gid}" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#eeeeee"/>
          <stop offset="100%" stop-color="#a8a8a8"/>
        </radialGradient>
        <linearGradient id="gloss-${gid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity=".2"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <clipPath id="clip-${gid}"><rect x="46" y="66" width="208" height="500" rx="30"/></clipPath>
      </defs>

      <!-- shadow ellipse under can -->
      <ellipse cx="150" cy="600" rx="98" ry="14" fill="rgba(0,0,0,.4)"/>

      <!-- body -->
      <rect x="46" y="66" width="208" height="500" rx="30" fill="url(#body-${gid})"/>

      <!-- decorative pattern -->
      <g clip-path="url(#clip-${gid})">${buildPattern(f)}</g>

      <!-- bottom rim -->
      <ellipse cx="150" cy="562" rx="104" ry="20" fill="url(#rim-${gid})"/>
      <ellipse cx="150" cy="558" rx="104" ry="18" fill="${f.canBody}"/>

      <!-- top small text -->
      <text x="150" y="102" text-anchor="middle" font-family="Manrope, sans-serif"
            font-weight="800" font-size="14" fill="${f.topTextColor}" letter-spacing="3">${f.topText}</text>

      <!-- claw mark -->
      <g fill="none" stroke="${f.clawColor}" stroke-width="${f.clawWidth}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M118 150 L110 180 L120 205 L106 235 L118 262 L104 292 L116 318 L104 340"/>
        <path d="M150 145 L142 178 L152 205 L138 238 L150 268 L136 300 L148 328 L136 348"/>
        <path d="M182 150 L190 180 L180 205 L194 235 L182 262 L196 292 L184 318 L196 340"/>
      </g>

      <!-- bottom wordmark stack -->
      ${buildWordStack(f)}

      <!-- gloss highlight -->
      <rect x="46" y="66" width="208" height="500" rx="30" fill="url(#gloss-${gid})"/>
      <rect x="74" y="90" width="18" height="440" rx="9" fill="#ffffff" opacity="0.10"/>

      <!-- top rim + tab -->
      <ellipse cx="150" cy="66" rx="104" ry="22" fill="url(#rim-${gid})"/>
      <ellipse cx="150" cy="62" rx="86" ry="17" fill="url(#top-${gid})"/>
      <ellipse cx="150" cy="60" rx="70" ry="12" fill="#d8d8d8"/>
      <ellipse cx="150" cy="59" rx="62" ry="9" fill="#c2c2c2"/>
      <rect x="140" y="50" width="20" height="8" rx="4" fill="#9a9a9a"/>
    </svg>`;
  }

  /* ---------------------------------------------------------------------
     3. INJECT DOM: cans + nav dots
     --------------------------------------------------------------------- */
  const canVisualsEl = document.getElementById('canVisuals');
  const navDotsEl = document.getElementById('navDots');

  FLAVORS.forEach((f, i)=>{
    const div = document.createElement('div');
    div.className = 'can-visual';
    div.id = `can-${f.id}`;
    div.innerHTML = buildCanSVG(f);
    canVisualsEl.appendChild(div);

    const li = document.createElement('li');
    li.innerHTML = `<button data-target="${f.id}" aria-label="${f.name}"></button><span class="dot-label">${f.name}</span>`;
    navDotsEl.appendChild(li);
  });

  const canEls = FLAVORS.map(f => document.getElementById(`can-${f.id}`));
  const dotEls = Array.from(navDotsEl.querySelectorAll('button'));

  // initial state
  gsap.set(canEls, {opacity:0, scale:0.72, rotateY:-140});
  gsap.set(canEls[0], {opacity:1, scale:1, rotateY:0});
  dotEls[0].classList.add('is-active');

  root.style.setProperty('--bg1', FLAVORS[0].bg1);
  root.style.setProperty('--bg2', FLAVORS[0].bg2);
  root.style.setProperty('--accent', FLAVORS[0].accent);
  root.style.setProperty('--accent2', FLAVORS[0].accent2);

  /* ---------------------------------------------------------------------
     4. LENIS SMOOTH SCROLL + GSAP TICKER
     --------------------------------------------------------------------- */
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time)=>{
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // nav dot / cta click -> smooth scroll
  function scrollToId(id){
    const el = document.getElementById(id);
    if(el) lenis.scrollTo(el, {offset:0, duration:1.6});
  }
  dotEls.forEach(btn=>{
    btn.addEventListener('click', ()=> scrollToId(btn.dataset.target));
  });
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if(el){
        e.preventDefault();
        scrollToId(id);
      }
    });
  });

  /* ---------------------------------------------------------------------
     5. GLOBAL PROGRESS BAR
     --------------------------------------------------------------------- */
  gsap.to('#progressFill', {
    height:'100%', ease:'none',
    scrollTrigger:{
      trigger:'main', start:'top top', end:'bottom bottom', scrub:0.3
    }
  });

  /* ---------------------------------------------------------------------
     6. ACTIVE FLAVOR TRACKING (background + nav dots + aura)
     --------------------------------------------------------------------- */
  function setActive(i){
    dotEls.forEach((d,idx)=> d.classList.toggle('is-active', idx===i));
  }

  FLAVORS.forEach((f, i)=>{
    ScrollTrigger.create({
      trigger: `#${f.id}`,
      start:'top center',
      end:'bottom center',
      onEnter:()=> setActive(i),
      onEnterBack:()=> setActive(i),
    });
  });

  /* ---------------------------------------------------------------------
     7. CAN TRANSITIONS BETWEEN FLAVORS (scroll-scrubbed)
     --------------------------------------------------------------------- */
  for(let i=0; i<FLAVORS.length-1; i++){
    const fromF = FLAVORS[i], toF = FLAVORS[i+1];
    const fromCan = canEls[i], toCan = canEls[i+1];
    const toSection = `#${toF.id}`;
    const fxFrom = document.getElementById(`fx-${fromF.id}`);
    const fxTo = document.getElementById(`fx-${toF.id}`);

    const tl = gsap.timeline({
      scrollTrigger:{
        trigger: toSection,
        start:'top bottom',
        end:'top 25%',
        scrub:0.7,
      }
    });

    tl.to(fromCan, {opacity:0, scale:1.16, rotateY:150, x:'-5%', ease:'power1.in', duration:1}, 0)
      .fromTo(toCan, {opacity:0, scale:0.7, rotateY:-150, x:'5%'}, {opacity:1, scale:1, rotateY:0, x:'0%', ease:'power2.out', duration:1}, 0)
      .to(root, {
        '--bg1':toF.bg1, '--bg2':toF.bg2, '--accent':toF.accent, '--accent2':toF.accent2,
        duration:1, ease:'none'
      }, 0);

    if(fxFrom) tl.to(fxFrom, {opacity:0, duration:1}, 0);
    if(fxTo) tl.fromTo(fxTo, {opacity:0}, {opacity:1, duration:1}, 0);
  }

  // fade the can stage out entirely as the closing section arrives
  gsap.timeline({
    scrollTrigger:{
      trigger:'#closing', start:'top bottom', end:'top 40%', scrub:0.7
    }
  }).to('#canStage', {opacity:0, scale:0.85, ease:'power1.in'});

  // fade the last flavor's fx layer visible on load
  const firstFx = document.getElementById(`fx-${FLAVORS[0].id}`);
  if(firstFx) gsap.set(firstFx, {opacity:1});

  /* ---------------------------------------------------------------------
     8. AMBIENT CAN MOTION — float + slow idle spin
     --------------------------------------------------------------------- */
  gsap.to('#canFloat', {
    y:'+=22', duration:2.8, ease:'sine.inOut', yoyo:true, repeat:-1
  });
  gsap.to('#canSpin', {
    rotateY:'+=14', duration:6, ease:'sine.inOut', yoyo:true, repeat:-1
  });
  gsap.to('#canAura', {
    opacity:0.35, scale:1.06, duration:2.4, ease:'sine.inOut', yoyo:true, repeat:-1
  });

  /* ---------------------------------------------------------------------
     9. MOUSE PARALLAX
     --------------------------------------------------------------------- */
  const qx = gsap.quickTo('#canParallax', 'x', {duration:0.9, ease:'power3'});
  const qy = gsap.quickTo('#canParallax', 'y', {duration:0.9, ease:'power3'});
  const qrx = gsap.quickTo('#canTilt', 'rotationX', {duration:0.9, ease:'power3'});
  const qry = gsap.quickTo('#canTilt', 'rotationY', {duration:0.9, ease:'power3'});

  window.addEventListener('pointermove', (e)=>{
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    qx(nx * 22);
    qy(ny * 14);
    qry(nx * 9);
    qrx(-ny * 7);
  });

  /* ---------------------------------------------------------------------
     10. SECTION CONTENT REVEAL (fade + slide + blur)
     --------------------------------------------------------------------- */
  document.querySelectorAll('.flavor-section, .closing').forEach(section=>{
    const content = section.querySelector('.section-content') || section;
    const eyebrow = content.querySelector('.eyebrow');
    const title = content.querySelector('.flavor-title, .closing-title');
    const tagline = content.querySelector('.flavor-tagline');
    const desc = content.querySelector('.flavor-desc, .closing-desc');
    const tags = content.querySelectorAll('.flavor-tags li');
    const cta = content.querySelectorAll ? section.querySelectorAll('.cta-row .btn') : [];

    const tl = gsap.timeline({
      scrollTrigger:{
        trigger: section,
        start:'top 78%',
        toggleActions:'play none none none'
      }
    });

    if(eyebrow) tl.fromTo(eyebrow, {opacity:0, x:-30, filter:'blur(8px)'}, {opacity:1, x:0, filter:'blur(0px)', duration:.6, ease:'power3.out'}, 0);
    if(title) tl.fromTo(title, {opacity:0, y:60, filter:'blur(14px)'}, {opacity:1, y:0, filter:'blur(0px)', duration:.8, ease:'power3.out'}, 0.08);
    if(tagline) tl.fromTo(tagline, {opacity:0, y:30, filter:'blur(8px)'}, {opacity:1, y:0, filter:'blur(0px)', duration:.7, ease:'power3.out'}, 0.2);
    if(desc) tl.fromTo(desc, {opacity:0, y:26}, {opacity:1, y:0, duration:.7, ease:'power2.out'}, 0.3);
    if(tags && tags.length) tl.fromTo(tags, {opacity:0, y:16, scale:.9}, {opacity:1, y:0, scale:1, duration:.5, stagger:.08, ease:'back.out(2)'}, 0.4);
    if(cta && cta.length) tl.fromTo(cta, {opacity:0, y:20}, {opacity:1, y:0, duration:.6, stagger:.1, ease:'power2.out'}, 0.35);
  });

  // hide scroll cue after first scroll
  ScrollTrigger.create({
    trigger:'#mangoloco', start:'top top', end:'+=1',
    onLeave:()=> gsap.to('#scrollCue', {opacity:0, duration:.5}),
    onEnterBack:()=> gsap.to('#scrollCue', {opacity:1, duration:.5}),
  });

  /* ---------------------------------------------------------------------
     11. AMBIENT PARTICLE FIELD (canvas)
     --------------------------------------------------------------------- */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const PARTICLE_COUNT = 46;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makeParticle(){
    return {
      x: Math.random()*W,
      y: Math.random()*H,
      r: Math.random()*2 + 0.6,
      speed: Math.random()*0.35 + 0.08,
      drift: (Math.random()-0.5) * 0.25,
      alpha: Math.random()*0.5 + 0.15,
    };
  }
  for(let i=0;i<PARTICLE_COUNT;i++) particles.push(makeParticle());

  let currentAccent = FLAVORS[0].accent;
  function hexToRgb(hex){
    const num = parseInt(hex.replace('#',''),16);
    return `${(num>>16)&255},${(num>>8)&255},${num&255}`;
  }
  let accentRgb = hexToRgb(currentAccent);
  let accentUpdateTick = 0;

  function drawParticles(){
    ctx.clearRect(0,0,W,H);
    accentUpdateTick++;
    if(accentUpdateTick % 20 === 0){
      const val = getComputedStyle(root).getPropertyValue('--accent').trim();
      if(val) accentRgb = hexToRgb(val.startsWith('#') ? val : currentAccent);
    }
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p=>{
      p.y -= p.speed;
      p.x += p.drift;
      if(p.y < -10){ p.y = H + 10; p.x = Math.random()*W; }
      if(p.x < -10) p.x = W+10;
      if(p.x > W+10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${accentRgb},${p.alpha})`;
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(drawParticles);
  }
  requestAnimationFrame(drawParticles);

  /* ---------------------------------------------------------------------
     12. REFRESH ON LOAD
     --------------------------------------------------------------------- */
  window.addEventListener('load', ()=> ScrollTrigger.refresh());

})();
