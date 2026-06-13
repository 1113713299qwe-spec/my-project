const canvas = document.querySelector('#film');
const ctx = canvas.getContext('2d');
const DURATION = 300;

const chapters = [
  {start: 0, end: 25, kicker: '序章', title: '因为有人愿意\n把话讲明白', sub: '五分钟，致敬一份始终滚烫的教育热忱', scene: 'dawn', mood: 'warm'},
  {start: 25, end: 65, kicker: '第一章 · 看见', title: '在选择的路口\n看见每一份迷茫', sub: '那些看似相同的问题背后，是一个个不同的人生', scene: 'crossroad', mood: 'thoughtful'},
  {start: 65, end: 105, kicker: '第二章 · 说清', title: '把复杂的世界\n讲成听得懂的话', sub: '不回避现实，也不放弃理想', scene: 'chalk', mood: 'explain'},
  {start: 105, end: 145, kicker: '第三章 · 真诚', title: '一份坦率\n胜过无数漂亮答案', sub: '认真，是对提问者最朴素的尊重', scene: 'desk', mood: 'earnest'},
  {start: 145, end: 185, kicker: '第四章 · 选择', title: '答案从来不是唯一\n方向可以自己定义', sub: '让信息成为地图，而不是围墙', scene: 'map', mood: 'energetic'},
  {start: 185, end: 225, kicker: '第五章 · 陪伴', title: '屏幕这一端的声音\n陪很多人走过长夜', sub: '被理解的瞬间，勇气便有了名字', scene: 'night', mood: 'gentle'},
  {start: 225, end: 265, kicker: '第六章 · 回响', title: '一堂课会结束\n影响却仍在继续', sub: '当曾经的学生，也开始照亮别人', scene: 'stars', mood: 'hopeful'},
  {start: 265, end: 300, kicker: '尾声 · 致敬', title: '谢谢您，张雪峰老师', sub: '愿真诚常在，愿每个年轻人都走向自己的远方', scene: 'final', mood: 'grateful'}
];

let time = 0;
let playing = false;
let last = 0;
let muted = false;
let audioCtx = null;
let audioNodes = [];
const ui = {
  play: document.querySelector('#playBtn'),
  center: document.querySelector('#centerPlay'),
  timeline: document.querySelector('#timeline'),
  current: document.querySelector('#currentTime'),
  chapter: document.querySelector('#chapterName'),
  badge: document.querySelector('#chapterBadge'),
  mute: document.querySelector('#muteBtn')
};
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const ease = x => x * x * (3 - 2 * x);
const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const chapterAt = t => chapters.find(c => t >= c.start && t < c.end) || chapters.at(-1);

function rounded(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function starfield(t, count = 80) {
  for (let i = 0; i < count; i++) {
    const x = (i * 347.13) % 1920;
    const y = (i * i * 13.7) % 1080;
    const alpha = .15 + .45 * (.5 + .5 * Math.sin(t * .7 + i));
    ctx.fillStyle = `rgba(238,224,182,${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + (i % 3) * .45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawClassroom(scene, t) {
  const dark = scene === 'night' || scene === 'stars';
  const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
  gradient.addColorStop(0, dark ? '#071a19' : '#183b35');
  gradient.addColorStop(1, scene === 'final' ? '#9d7540' : '#071512');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1920, 1080);

  ctx.fillStyle = dark ? '#102723' : '#234b43';
  ctx.fillRect(1030, 130, 730, 510);
  ctx.strokeStyle = '#b69256';
  ctx.lineWidth = 10;
  ctx.strokeRect(1030, 130, 730, 510);
  ctx.fillStyle = '#d8d0b8';
  ctx.font = '34px "Noto Serif SC", serif';
  const boardLines = scene === 'map' ? ['选择 ≠ 标准答案', '信息 → 判断 → 行动'] : ['把问题讲明白', '把选择交给你'];
  boardLines.forEach((line, i) => ctx.fillText(line, 1120, 285 + i * 105));
  ctx.strokeStyle = '#cda95f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(1115, 335);
  ctx.quadraticCurveTo(1390, 390 + Math.sin(t) * 8, 1660, 330);
  ctx.stroke();

  ctx.fillStyle = '#b8894d';
  ctx.fillRect(0, 835, 1920, 245);
  ctx.fillStyle = '#5c3c27';
  ctx.fillRect(1070, 750, 610, 110);
  ctx.fillStyle = '#d4b26c';
  ctx.fillRect(1050, 735, 650, 24);
  if (dark) starfield(t, scene === 'stars' ? 145 : 70);
}

function arm(x, y, length, angle, sleeve, hand = true) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = sleeve;
  ctx.lineWidth = 47;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, length);
  ctx.stroke();
  if (hand) {
    ctx.fillStyle = '#e7b78f';
    ctx.beginPath();
    ctx.arc(0, length + 12, 27, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTeacher(t, mood) {
  const beat = Math.sin(t * 3.1);
  const gestureCycle = t % 12;
  const walk = Math.sin(t * .42);
  const x = 750 + walk * 105;
  const y = 752 + Math.abs(Math.sin(t * .84)) * 5;
  const point = gestureCycle > 2 && gestureCycle < 5.5;
  const open = gestureCycle > 6.2 && gestureCycle < 9.5;
  const thoughtful = mood === 'thoughtful' || mood === 'gentle';
  const emphatic = mood === 'explain' || mood === 'energetic';
  const smile = mood === 'warm' || mood === 'hopeful' || mood === 'grateful';
  const bodyLean = point ? -.06 : emphatic ? .035 * beat : 0;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(bodyLean);

  // Shadow and walking legs.
  ctx.fillStyle = 'rgba(0,0,0,.22)';
  ctx.beginPath();
  ctx.ellipse(0, 220, 145, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#20272a';
  ctx.lineWidth = 58;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-48, 85);
  ctx.lineTo(-58 + walk * 18, 205);
  ctx.moveTo(48, 85);
  ctx.lineTo(58 - walk * 18, 205);
  ctx.stroke();

  // Torso and tie.
  ctx.fillStyle = '#283a40';
  rounded(-145, -240, 290, 350, 72);
  ctx.fill();
  ctx.fillStyle = '#eee7d8';
  ctx.beginPath();
  ctx.moveTo(-55, -225);
  ctx.lineTo(0, -105);
  ctx.lineTo(55, -225);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#a04b3f';
  ctx.beginPath();
  ctx.moveTo(-15, -205);
  ctx.lineTo(18, -205);
  ctx.lineTo(30, -55);
  ctx.lineTo(0, -28);
  ctx.lineTo(-28, -55);
  ctx.closePath();
  ctx.fill();

  // Continuous gestures: point to board, open both hands, or conversational motion.
  if (point) {
    arm(112, -165, 250, -2.02 + beat * .04, '#283a40');
    arm(-110, -155, 175, .35 + beat * .08, '#283a40');
  } else if (open) {
    arm(112, -155, 210, -1.05 + beat * .08, '#283a40');
    arm(-112, -155, 210, 1.05 - beat * .08, '#283a40');
  } else if (thoughtful) {
    arm(112, -155, 195, -.28 + beat * .03, '#283a40');
    arm(-112, -155, 155, 2.58 + beat * .02, '#283a40');
  } else {
    arm(112, -155, 195, -.55 + beat * .16, '#283a40');
    arm(-112, -155, 185, .48 - beat * .12, '#283a40');
  }

  // Head, hair and ears.
  ctx.fillStyle = '#e7b78f';
  ctx.beginPath();
  ctx.ellipse(0, -310, 104, 118, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#252527';
  ctx.beginPath();
  ctx.arc(0, -337, 105, Math.PI, Math.PI * 2);
  ctx.quadraticCurveTo(75, -430, 97, -348);
  ctx.lineTo(82, -375);
  ctx.quadraticCurveTo(0, -420, -91, -368);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e7b78f';
  ctx.beginPath();
  ctx.arc(-101, -304, 22, 0, Math.PI * 2);
  ctx.arc(101, -304, 22, 0, Math.PI * 2);
  ctx.fill();

  // Brows and blinking eyes communicate changing expression.
  const blink = (t % 4.7) > 4.52 ? 1 : 0;
  const browTilt = thoughtful ? -.12 : emphatic ? .14 * beat : 0;
  ctx.strokeStyle = '#3b2923';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-72, -342 + browTilt * 20);
  ctx.lineTo(-20, -348 - browTilt * 20);
  ctx.moveTo(20, -348 - browTilt * 20);
  ctx.lineTo(72, -342 + browTilt * 20);
  ctx.stroke();
  ctx.strokeStyle = '#252527';
  ctx.lineWidth = blink ? 5 : 8;
  ctx.beginPath();
  ctx.moveTo(-63, -322);
  ctx.lineTo(-28, -322 + (blink ? 0 : beat * 1.5));
  ctx.moveTo(28, -322 + (blink ? 0 : beat * 1.5));
  ctx.lineTo(63, -322);
  ctx.stroke();

  // Distinctive glasses, without claiming photorealistic identity.
  ctx.strokeStyle = '#20282a';
  ctx.lineWidth = 7;
  rounded(-82, -345, 70, 56, 17);
  ctx.stroke();
  rounded(12, -345, 70, 56, 17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-12, -320);
  ctx.lineTo(12, -320);
  ctx.stroke();

  // Mouth moves continuously like speech and changes with emotion.
  const speech = .5 + .5 * Math.sin(t * 8.4);
  ctx.strokeStyle = '#803e38';
  ctx.fillStyle = '#773b37';
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (smile) {
    ctx.arc(0, -270, 35, .15, Math.PI - .15);
    ctx.stroke();
  } else if (speech > .56) {
    ctx.ellipse(0, -269, 25, 8 + speech * 12, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(-28, -270);
    ctx.quadraticCurveTo(0, -264 + beat * 3, 28, -270);
    ctx.stroke();
  }

  ctx.restore();
}

function draw(t) {
  const chapter = chapterAt(t);
  const progress = clamp((t - chapter.start) / (chapter.end - chapter.start), 0, 1);
  const fade = Math.min(1, progress * 6, (1 - progress) * 6);
  drawClassroom(chapter.scene, t);
  drawTeacher(t, chapter.mood);

  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(5,20,17,.76)';
  rounded(110, 130, 770, 410, 22);
  ctx.fill();
  ctx.fillStyle = '#d5ac65';
  ctx.font = '500 24px sans-serif';
  ctx.fillText(chapter.kicker, 165, 225);
  ctx.fillStyle = '#f5f0e3';
  ctx.font = `700 ${chapter.scene === 'final' ? 74 : 65}px "Noto Serif SC", serif`;
  chapter.title.split('\n').forEach((line, i) => ctx.fillText(line, 165, 330 + i * 88));
  ctx.fillStyle = '#d9d4c7';
  ctx.font = '400 25px "Noto Sans SC", sans-serif';
  ctx.fillText(chapter.sub, 166, 500);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.font = '18px monospace';
  ctx.fillText(fmt(t), 1740, 1015);
  ctx.fillStyle = 'rgba(255,255,255,.25)';
  ctx.fillRect(170, 980, 1580, 2);
  ctx.fillStyle = '#d0a85e';
  ctx.fillRect(170, 980, 1580 * t / DURATION, 3);
}

// Original score: warm piano-like melody, bass, soft pulse and chapter swells.
const NOTE = n => 440 * 2 ** ((n - 69) / 12);
const chords = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
const melody = [64, 67, 69, 67, 64, 62, 60, 62, 64, 67, 72, 69, 67, 64, 62, 60];

function tone(context, destination, frequency, start, duration, volume, type = 'sine') {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + .03);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .05);
  audioNodes.push(oscillator, gain);
}

function createScore(context, destination, offset = 0, length = DURATION - offset) {
  const now = context.currentTime + .06;
  const master = context.createGain();
  master.gain.value = .42;
  master.connect(destination);
  audioNodes.push(master);
  const step = .5;
  const first = Math.floor(offset / step);
  const lastStep = Math.ceil((offset + length) / step);
  for (let i = first; i < lastStep; i++) {
    const absolute = i * step;
    const at = now + absolute - offset;
    const chapterIndex = chapters.findIndex(c => absolute >= c.start && absolute < c.end);
    const energy = chapterIndex >= 4 ? 1.16 : chapterIndex === 5 ? .72 : 1;
    tone(context, master, NOTE(melody[i % melody.length]), at, .42, .045 * energy, 'triangle');
    if (i % 2 === 0) {
      const chord = chords[Math.floor(i / 8) % chords.length];
      tone(context, master, NOTE(chord[0]), at, .9, .055 * energy, 'sine');
      tone(context, master, NOTE(chord[2]), at, .75, .018 * energy, 'triangle');
    }
    if (i % 8 === 0) {
      const chord = chords[Math.floor(i / 8) % chords.length];
      tone(context, master, NOTE(chord[1]), at, 3.4, .018, 'sine');
      tone(context, master, NOTE(chord[3]), at, 3.1, .014, 'sine');
    }
  }
}

function stopAudio() {
  audioNodes.forEach(node => {
    try { node.stop?.(); } catch {}
    try { node.disconnect?.(); } catch {}
  });
  audioNodes = [];
}

function startAudio() {
  if (muted) return;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  stopAudio();
  createScore(audioCtx, audioCtx.destination, time);
}

function updateUI() {
  const chapter = chapterAt(time);
  ui.timeline.value = time;
  ui.current.textContent = fmt(time);
  ui.chapter.textContent = `${chapter.kicker} · ${chapter.title.replace('\n', ' ')}`;
  ui.badge.textContent = chapter.kicker;
  ui.timeline.style.background = `linear-gradient(90deg,#1d5b4f ${time / DURATION * 100}%,#c8c9c3 0%)`;
  draw(time);
}

function tick(now) {
  if (playing) {
    if (last) time += Math.min((now - last) / 1000, .1);
    last = now;
    if (time >= DURATION) {
      time = DURATION;
      pause();
    }
    updateUI();
  }
  requestAnimationFrame(tick);
}

function play() {
  if (time >= DURATION) time = 0;
  playing = true;
  last = 0;
  ui.play.textContent = '❚❚';
  ui.center.classList.add('hidden');
  startAudio();
}
function pause() {
  playing = false;
  ui.play.textContent = '▶';
  ui.center.classList.remove('hidden');
  stopAudio();
}
function toggle() { playing ? pause() : play(); }

ui.play.onclick = toggle;
ui.center.onclick = toggle;
canvas.onclick = toggle;
ui.timeline.oninput = event => {
  time = +event.target.value;
  if (playing) startAudio();
  updateUI();
};
document.querySelector('#restartBtn').onclick = () => { time = 0; play(); };
ui.mute.onclick = () => {
  muted = !muted;
  ui.mute.textContent = `音乐 ${muted ? '关' : '开'}`;
  muted ? stopAudio() : playing && startAudio();
};
document.querySelector('#fullscreenBtn').onclick = () => document.querySelector('.stage-wrap').requestFullscreen();

const list = document.querySelector('#chapterList');
chapters.forEach((chapter, i) => {
  const button = document.createElement('button');
  button.className = 'chapter-card';
  button.innerHTML = `<span>${fmt(chapter.start)} / 0${i + 1}</span><strong>${chapter.kicker}</strong><small>${chapter.title.replace('\n', ' ')}</small>`;
  button.onclick = () => { time = chapter.start; play(); };
  list.appendChild(button);
});

async function exportVideo() {
  const button = document.querySelector('#exportBtn');
  if (!window.MediaRecorder) {
    alert('当前浏览器不支持直接导出，请使用最新版 Chrome 或 Edge。');
    return;
  }
  button.disabled = true;
  button.textContent = '正在实时导出 05:00…';
  pause();
  time = 0;
  const stream = canvas.captureStream(30);
  const exportAudio = new AudioContext();
  const destination = exportAudio.createMediaStreamDestination();
  createScore(exportAudio, destination, 0, DURATION);
  destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
  const recorder = new MediaRecorder(stream, {mimeType: 'video/webm;codecs=vp9,opus', videoBitsPerSecond: 6000000});
  const chunks = [];
  recorder.ondataavailable = event => event.data.size && chunks.push(event.data);
  recorder.onstop = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob(chunks, {type: 'video/webm'}));
    link.download = '致敬张雪峰老师_连续人物动画纪念短片.webm';
    link.click();
    button.disabled = false;
    button.textContent = '导出 WebM 视频';
    exportAudio.close();
    audioNodes = [];
  };
  recorder.start(1000);
  playing = true;
  last = 0;
  ui.center.classList.add('hidden');
  setTimeout(() => { pause(); recorder.stop(); }, DURATION * 1000 + 300);
}

document.querySelector('#exportBtn').onclick = exportVideo;
document.addEventListener('keydown', event => {
  if (event.code === 'Space') { event.preventDefault(); toggle(); }
  if (event.code === 'ArrowRight') { time = clamp(time + 5, 0, DURATION); if (playing) startAudio(); updateUI(); }
  if (event.code === 'ArrowLeft') { time = clamp(time - 5, 0, DURATION); if (playing) startAudio(); updateUI(); }
});
updateUI();
requestAnimationFrame(tick);
