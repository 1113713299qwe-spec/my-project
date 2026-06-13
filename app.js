const canvas=document.querySelector('#film'),ctx=canvas.getContext('2d');
const DURATION=300;
const chapters=[
 {start:0,end:25,kicker:'序章',title:'因为有人愿意\n把话讲明白',sub:'五分钟，致敬一份始终滚烫的教育热忱',scene:'dawn'},
 {start:25,end:65,kicker:'第一章 · 看见',title:'在选择的路口\n看见每一份迷茫',sub:'那些看似相同的问题背后，是一个个不同的人生',scene:'crossroad'},
 {start:65,end:105,kicker:'第二章 · 说清',title:'把复杂的世界\n讲成听得懂的话',sub:'不回避现实，也不放弃理想',scene:'chalk'},
 {start:105,end:145,kicker:'第三章 · 真诚',title:'一份坦率\n胜过无数漂亮答案',sub:'认真，是对提问者最朴素的尊重',scene:'desk'},
 {start:145,end:185,kicker:'第四章 · 选择',title:'答案从来不是唯一\n方向可以自己定义',sub:'让信息成为地图，而不是围墙',scene:'map'},
 {start:185,end:225,kicker:'第五章 · 陪伴',title:'屏幕这一端的声音\n陪很多人走过长夜',sub:'被理解的瞬间，勇气便有了名字',scene:'night'},
 {start:225,end:265,kicker:'第六章 · 回响',title:'一堂课会结束\n影响却仍在继续',sub:'当曾经的学生，也开始照亮别人',scene:'stars'},
 {start:265,end:300,kicker:'尾声 · 致敬',title:'谢谢您，张雪峰老师',sub:'愿真诚常在，愿每个年轻人都走向自己的远方',scene:'final'}
];
let time=0,playing=false,last=0,muted=false,audioCtx=null,audioNodes=[];
const ui={play:document.querySelector('#playBtn'),center:document.querySelector('#centerPlay'),timeline:document.querySelector('#timeline'),current:document.querySelector('#currentTime'),chapter:document.querySelector('#chapterName'),badge:document.querySelector('#chapterBadge'),mute:document.querySelector('#muteBtn')};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),ease=x=>x*x*(3-2*x),fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function chapterAt(t){return chapters.find(c=>t>=c.start&&t<c.end)||chapters.at(-1)}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function starfield(t,count=80){for(let i=0;i<count;i++){const x=(i*347.13)%1920,y=(i*i*13.7)%1080,a=.15+.45*(.5+.5*Math.sin(t*.7+i));ctx.fillStyle=`rgba(238,224,182,${a})`;ctx.beginPath();ctx.arc(x,y,1+(i%3)*.45,0,7);ctx.fill()}}
function backdrop(scene,t,p){let g=ctx.createLinearGradient(0,0,1920,1080);g.addColorStop(0,scene==='night'||scene==='stars'?'#0c211f':'#183b35');g.addColorStop(1,scene==='dawn'||scene==='final'?'#bb8f52':'#071714');ctx.fillStyle=g;ctx.fillRect(0,0,1920,1080);ctx.globalAlpha=.16;for(let i=0;i<11;i++){ctx.strokeStyle='#d5c18e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(960,540,120+i*95+t%95,0,Math.PI*2);ctx.stroke()}ctx.globalAlpha=1;
 if(scene==='crossroad'){for(let i=-2;i<3;i++){ctx.strokeStyle=i===0?'#d6b66f':'#53746b';ctx.lineWidth=i===0?8:3;ctx.beginPath();ctx.moveTo(960,1030);ctx.quadraticCurveTo(960+i*160,650,960+i*330,190);ctx.stroke()}}
 if(scene==='chalk'){ctx.save();ctx.translate(1300,520);ctx.rotate(-.06);ctx.fillStyle='#102925';ctx.strokeStyle='#b4a876';ctx.lineWidth=5;ctx.fillRect(-360,-260,720,520);ctx.strokeRect(-360,-260,720,520);ctx.font='56px serif';ctx.fillStyle='#e5ddc5';ctx.fillText('信息 + 判断',-235,-70);ctx.fillText('＝ 你的选择',-195,45);ctx.strokeStyle='#d0a65c';ctx.beginPath();ctx.moveTo(-240,105);ctx.lineTo(235,105);ctx.stroke();ctx.restore()}
 if(scene==='desk'){ctx.fillStyle='#b68a4d';ctx.fillRect(0,820,1920,260);ctx.fillStyle='#efe6ce';ctx.save();ctx.translate(1300,760);ctx.rotate(-.08);rounded(-270,-170,540,340,8);ctx.fill();ctx.fillStyle='#4a5b50';for(let i=0;i<7;i++)ctx.fillRect(-200,-100+i*34,330-i*20,5);ctx.restore();ctx.fillStyle='#d7b163';ctx.save();ctx.translate(1510,660);ctx.rotate(.55);ctx.fillRect(-12,-190,24,370);ctx.restore()}
 if(scene==='map'){ctx.strokeStyle='#d3b266';ctx.lineWidth=5;ctx.setLineDash([18,20]);ctx.beginPath();ctx.moveTo(90,900);ctx.bezierCurveTo(500,720,500,300,960,580);ctx.bezierCurveTo(1260,760,1500,330,1830,200);ctx.stroke();ctx.setLineDash([]);for(const [x,y] of [[90,900],[960,580],[1830,200]]){ctx.fillStyle='#e8d6a8';ctx.beginPath();ctx.arc(x,y,16,0,7);ctx.fill()}}
 if(scene==='night'||scene==='stars')starfield(t,scene==='stars'?150:70);
 if(scene==='final'){ctx.fillStyle='rgba(239,217,168,.13)';ctx.beginPath();ctx.arc(960,540,360+p*80,0,7);ctx.fill()}}
function draw(t){const c=chapterAt(t),p=clamp((t-c.start)/(c.end-c.start),0,1),fade=Math.min(1,p*5,(1-p)*5);ctx.clearRect(0,0,1920,1080);backdrop(c.scene,t,p);
 ctx.save();ctx.globalAlpha=fade;const drift=(p-.5)*24;ctx.translate(0,drift);ctx.fillStyle='#d5ac65';ctx.font='500 24px sans-serif';ctx.letterSpacing='6px';ctx.fillText(c.kicker.toUpperCase(),170,300);
 ctx.fillStyle='#f5f0e3';ctx.font=`700 ${c.scene==='final'?92:82}px "Noto Serif SC",serif`;const lines=c.title.split('\n');lines.forEach((line,i)=>ctx.fillText(line,170,430+i*112));
 const base=430+(lines.length-1)*112;ctx.fillStyle='#d9d4c7';ctx.font='400 29px "Noto Sans SC",sans-serif';ctx.fillText(c.sub,174,base+105);ctx.fillStyle='#c59b55';ctx.fillRect(174,base+145,80+ease(p)*180,4);ctx.restore();
 ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='18px monospace';ctx.fillText(fmt(t),1740,1015);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(170,980,1580,2);ctx.fillStyle='#d0a85e';ctx.fillRect(170,980,1580*t/DURATION,3);
}
function updateUI(){const c=chapterAt(time);ui.timeline.value=time;ui.current.textContent=fmt(time);ui.chapter.textContent=`${c.kicker} · ${c.title.replace('\n',' ')}`;ui.badge.textContent=c.kicker;ui.timeline.style.background=`linear-gradient(90deg,#1d5b4f ${time/DURATION*100}%,#c8c9c3 0%)`;draw(time)}
function tick(now){if(playing){if(last)time+=Math.min((now-last)/1000,.1);last=now;if(time>=DURATION){time=DURATION;pause()}updateUI()}requestAnimationFrame(tick)}
function startAudio(){if(muted)return;if(!audioCtx)audioCtx=new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();stopAudio();const master=audioCtx.createGain();master.gain.value=.028;master.connect(audioCtx.destination);[110,164.81,220].forEach((f,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=i===0?'sine':'triangle';o.frequency.value=f;g.gain.value=i===0?.5:.18;o.connect(g).connect(master);o.start();audioNodes.push(o)});audioNodes.push(master)}
function stopAudio(){audioNodes.forEach(n=>{try{n.stop?.()}catch{}});audioNodes=[]}
function play(){if(time>=DURATION)time=0;playing=true;last=0;ui.play.textContent='❚❚';ui.center.classList.add('hidden');startAudio()}
function pause(){playing=false;ui.play.textContent='▶';ui.center.classList.remove('hidden');stopAudio()}
function toggle(){playing?pause():play()}
ui.play.onclick=toggle;ui.center.onclick=toggle;canvas.onclick=toggle;ui.timeline.oninput=e=>{time=+e.target.value;updateUI()};document.querySelector('#restartBtn').onclick=()=>{time=0;play()};
ui.mute.onclick=()=>{muted=!muted;ui.mute.textContent=`声音 ${muted?'关':'开'}`;muted?stopAudio():playing&&startAudio()};document.querySelector('#fullscreenBtn').onclick=()=>document.querySelector('.stage-wrap').requestFullscreen();
const list=document.querySelector('#chapterList');chapters.forEach((c,i)=>{const b=document.createElement('button');b.className='chapter-card';b.innerHTML=`<span>${fmt(c.start)} / 0${i+1}</span><strong>${c.kicker}</strong><small>${c.title.replace('\n',' ')}</small>`;b.onclick=()=>{time=c.start;play()};list.appendChild(b)});
async function exportVideo(){const btn=document.querySelector('#exportBtn');if(!window.MediaRecorder){alert('当前浏览器不支持直接导出，请使用最新版 Chrome 或 Edge。');return}btn.disabled=true;btn.textContent='正在实时导出 05:00…';pause();time=0;const stream=canvas.captureStream(30);const ac=new AudioContext(),dest=ac.createMediaStreamDestination(),gain=ac.createGain();gain.gain.value=.025;gain.connect(dest);[110,164.81,220].forEach((f,i)=>{const o=ac.createOscillator();o.type=i?'triangle':'sine';o.frequency.value=f;o.connect(gain);o.start();setTimeout(()=>o.stop(),DURATION*1000)});dest.stream.getAudioTracks().forEach(x=>stream.addTrack(x));const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus',videoBitsPerSecond:5000000});const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='致敬张雪峰老师_五分钟纪念短片.webm';a.click();btn.disabled=false;btn.textContent='导出 WebM 视频';ac.close()};rec.start(1000);play();setTimeout(()=>{pause();rec.stop()},DURATION*1000+300)}
document.querySelector('#exportBtn').onclick=exportVideo;document.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();toggle()}if(e.code==='ArrowRight'){time=clamp(time+5,0,DURATION);updateUI()}if(e.code==='ArrowLeft'){time=clamp(time-5,0,DURATION);updateUI()}});updateUI();requestAnimationFrame(tick);
