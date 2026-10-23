const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait=ms=>new Promise(r=>setTimeout(r,reduce?0:ms));
const EMAIL='semblantecharisse69@gmail.com';

/* ---------- toast + confetti ---------- */
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2200)}
const cv=$('#fx'),cx=cv.getContext('2d');let ps=[];
function size(){cv.width=innerWidth;cv.height=innerHeight}size();addEventListener('resize',size);
function burst(x,y,n){
  if(reduce)return;
  const cols=['#FF6B6B','#FFC857','#3DD6D0','#FFF4E0'];
  const start=ps.length===0;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=3+Math.random()*7;
    ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-4,s:4+Math.random()*6,c:cols[i%cols.length],l:70+Math.random()*30,r:Math.random()*6})}
  if(start)loop();
}
function loop(){
  cx.clearRect(0,0,cv.width,cv.height);
  ps=ps.filter(p=>p.l>0);
  ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.25;p.l--;p.r+=.2;cx.save();cx.globalAlpha=Math.min(1,p.l/30);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);cx.restore()});
  if(ps.length)requestAnimationFrame(loop);else cx.clearRect(0,0,cv.width,cv.height);
}

/* ---------- chat engine ---------- */
const log=$('#log');
function scrollEnd(){log.scrollTop=log.scrollHeight}
function addBubble(html,who='bot'){
  const d=document.createElement('div');d.className='bubble '+who;d.innerHTML=html;log.append(d);scrollEnd();return d;
}
async function say(...parts){
  for(const p of parts){
    const t=document.createElement('div');t.className='bubble bot typing';t.innerHTML='<i></i><i></i><i></i>';
    log.append(t);scrollEnd();
    await wait(550+Math.min(p.length,120)*6);
    t.remove();
    const b=addBubble(p);
    b.querySelectorAll('.m i').forEach(i=>setTimeout(()=>i.style.width=i.dataset.w+'%',60));
    b.querySelectorAll('[data-open-games]').forEach(x=>x.onclick=openArcade);
    b.querySelectorAll('[data-copy]').forEach(x=>x.onclick=copyEmail);
  }
}

/* ---------- topics ---------- */
const skills=[['HTML and CSS',80],['JavaScript',65],['UI and UX thinking',85],['Teamwork',90],['Time management',70]];
const facts=['I can lose track of time when I\'m designing something.','I\'d pick milk tea over almost any drink.','My happiest place is near the sea.','I believe good design should need zero instructions.','I always hover over buttons to see what they do. You probably do too.','I\'m building this page for an HCI class. Hi, teacher! 👋'];
let fi=-1;
const topics={
  about:{label:'Who are you?',keys:['who','about','name','intro','you'],reply:()=>say(
    'I\'m <b>Charisse S. Toriing</b>, an Information Technology student based in <b>Cebu City, PH</b>.',
    'I like building things that feel easy to use, which is why I\'m taking HCI. This whole page is a chat because talking is the most natural interface there is.')},
  hobbies:{label:'What are your hobbies?',keys:['hobb','interest','free time','fun','like'],reply:()=>say(
    'Here\'s what I\'m into:<div class="tags"><span>🎧 Music</span><span>🎨 Design</span><span>🎮 Gaming</span><span>🧋 Milk tea runs</span><span>🌊 Beaches</span></div>',
    'Playlists for every mood, cozy games on good days, and hunting for the best snacks around Cebu City.')},
  skills:{label:'What are your skills?',keys:['skill','good at','tech','code','coding','program'],reply:()=>say(
    'Here\'s my honest skill check:'+skills.map(s=>`<div class="bar-row"><div class="r"><span>${s[0]}</span><span>${s[1]}%</span></div><div class="m"><i data-w="${s[1]}"></i></div></div>`).join(''),
    'Time management is still a work in progress. I\'m being honest on purpose.')},
  fact:{label:'Tell me a fun fact',keys:['fact','random','surprise','secret'],reply:()=>{
    let n;do{n=Math.floor(Math.random()*facts.length)}while(n===fi);fi=n;
    return say(facts[n]+'<br><button class="btn inline-btn" data-fact-again>Another one</button>').then(()=>{
      const b=[...log.querySelectorAll('[data-fact-again]')].pop();
      if(b)b.onclick=()=>{b.remove();ask('fact')};
    });}},
  game:{label:'Play a game',keys:['game','play','arcade','bored','star','memory'],reply:()=>say(
    'Challenge accepted! I made three mini games. Beat my scores (they\'re easy to beat).<br><button class="btn hot inline-btn" data-open-games>Open the arcade 🎮</button>')},
  contact:{label:'How can I reach you?',keys:['contact','email','mail','reach','message','hire'],reply:()=>say(
    'Email me at <b>'+EMAIL+'</b>. I read everything.<br><a class="btn inline-btn" href="mailto:'+EMAIL+'">Send a message</a> <button class="btn inline-btn" data-copy>Copy email</button>')}
};
const explored=new Set();
const exploreIds=['hobbies','skills','fact','game','contact'];

function renderReplies(){
  const box=$('#replies');box.innerHTML='';
  Object.entries(topics).forEach(([id,t])=>{
    const b=document.createElement('button');b.className='chip'+(explored.has(id)?' done':'');b.textContent=t.label;
    b.onclick=()=>ask(id,t.label);box.append(b);
  });
}
function updateMeter(){
  const n=exploreIds.filter(i=>explored.has(i)).length;
  $('#meterFill').style.width=(n/5*100)+'%';
  $('#meterTxt').textContent=n+' of 5 topics explored';
  return n;
}
let busy=false;
async function ask(id,text){
  if(busy)return;busy=true;
  addBubble(text||topics[id].label,'me');
  await topics[id].reply();
  const first=!explored.has(id);explored.add(id);
  const n=updateMeter();renderReplies();
  if(first&&n===5){
    burst(innerWidth/2,innerHeight/3,100);
    await say('🎉 You explored everything about me! That means you stayed curious, and that\'s the best compliment a website can get. Thank you for visiting.');
  }
  busy=false;
}

/* typed messages */
$('#composer').addEventListener('submit',e=>{
  e.preventDefault();
  const inp=$('#msg'),v=inp.value.trim();if(!v)return;
  inp.value='';
  const low=v.toLowerCase();
  const hit=Object.entries(topics).find(([id,t])=>t.keys.some(k=>low.includes(k)));
  if(hit)ask(hit[0],v);
  else if(!busy){
    busy=true;addBubble(v.replace(/</g,'&lt;'),'me');
    say('Hmm, I didn\'t catch that. Try one of the quick replies below, or type: <b>hobbies</b>, <b>skills</b>, <b>fun fact</b>, <b>game</b> or <b>contact</b>.').then(()=>busy=false);
  }
});

/* copy email */
async function copyEmail(){
  try{await navigator.clipboard.writeText(EMAIL);toast('Email copied ✅')}
  catch{toast('Could not copy. Select the email and copy it.')}
}
$('#copyBtn').onclick=copyEmail;

/* ---------- arcade ---------- */
const arcade=$('#arcade');
function openArcade(){arcade.hidden=false;$('#closeArcade').focus()}
function closeArcade(){arcade.hidden=true;playing=false;clearInterval(timer);$$('.target').forEach(x=>x.remove())}
$('#closeArcade').onclick=closeArcade;
arcade.addEventListener('click',e=>{if(e.target===arcade)closeArcade()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!arcade.hidden)closeArcade()});

$$('.tab').forEach(t=>t.onclick=()=>{
  $$('.tab').forEach(x=>x.setAttribute('aria-selected',x===t));
  $$('.game').forEach(g=>g.classList.toggle('show',g.id===t.dataset.g));
});

/* star catcher */
let score=0,best=0,left=15,timer=null,playing=false;
function spawn(){
  if(!playing)return;
  const a=$('#arena');$$('.target').forEach(x=>x.remove());
  const t=document.createElement('button');t.className='target';t.setAttribute('aria-label','Star, tap it');
  const bonus=Math.random()<.15;
  t.textContent=bonus?'💎':'⭐';
  t.style.left=Math.random()*(a.clientWidth-60)+'px';
  t.style.top=Math.random()*(a.clientHeight-60)+'px';
  t.addEventListener('pointerdown',e=>{
    e.preventDefault();score+=bonus?3:1;$('#sc').textContent=score;
    const r=t.getBoundingClientRect();burst(r.left+27,r.top+27,6);spawn();
  });
  a.append(t);
  setTimeout(()=>{if(t.isConnected&&playing)spawn()},bonus?800:1100);
}
$('#startStar').onclick=()=>{
  clearInterval(timer);score=0;left=15;playing=true;
  $('#sc').textContent=0;$('#tm').textContent=left;$('#arenaMsg').style.display='none';
  spawn();
  timer=setInterval(()=>{
    left--;$('#tm').textContent=left;
    if(left<=0){
      clearInterval(timer);playing=false;$$('.target').forEach(x=>x.remove());
      const nb=score>best;if(nb){best=score;$('#bs').textContent=best}
      const m=$('#arenaMsg');m.style.display='grid';
      m.textContent=(nb&&score>0?'New best! ':'Time is up. ')+'You scored '+score+'. Press Start to retry.';
      if(nb&&score>0)burst(innerWidth/2,innerHeight/2,60);
    }
  },1000);
};

/* memory match */
const faces=['🍓','🎧','🎨','🌴','🎮','🧋','🚀','🌈'];
let first=null,lock=false,moves=0,pairs=0,mbest=null;
function buildMem(){
  const deck=[...faces,...faces].sort(()=>Math.random()-.5);
  const grid=$('#mem');grid.innerHTML='';moves=0;pairs=0;first=null;lock=false;
  $('#mv').textContent=0;$('#memOut').textContent='Flip two cards to find pairs.';
  deck.forEach(f=>{
    const b=document.createElement('button');b.className='mcard';b.dataset.f=f;b.setAttribute('aria-label','Hidden card');
    b.innerHTML='<span class="q">?</span>';
    b.onclick=()=>flipCard(b);grid.append(b);
  });
}
function flipCard(b){
  if(lock||b.classList.contains('up')||b.classList.contains('done'))return;
  b.classList.add('up');b.textContent=b.dataset.f;b.setAttribute('aria-label','Card '+b.dataset.f);
  if(!first){first=b;return}
  moves++;$('#mv').textContent=moves;
  if(first.dataset.f===b.dataset.f){
    first.classList.add('done');b.classList.add('done');first=null;pairs++;
    if(pairs===faces.length){
      const nb=mbest===null||moves<mbest;if(nb){mbest=moves;$('#mbest').textContent=mbest}
      $('#memOut').textContent='All pairs found in '+moves+' moves!'+(nb?' New best!':'');
      burst(innerWidth/2,innerHeight/2,80);
    }else $('#memOut').textContent='Match! '+(faces.length-pairs)+' pairs left.';
  }else{
    lock=true;$('#memOut').textContent='Not a match. Try again.';
    const a=first;first=null;
    setTimeout(()=>{[a,b].forEach(c=>{c.classList.remove('up');c.innerHTML='<span class="q">?</span>';c.setAttribute('aria-label','Hidden card')});lock=false},750);
  }
}
$('#resetMem').onclick=buildMem;buildMem();

/* rock paper scissors */
const em={rock:'✊',paper:'✋',scissors:'✌️'},beats={rock:'scissors',paper:'rock',scissors:'paper'};
let w=0,l=0,t=0;
$$('#rps .btn').forEach(b=>b.onclick=()=>{
  const me=b.dataset.c,cpu=Object.keys(em)[Math.floor(Math.random()*3)];
  let r;
  if(me===cpu){t++;r='Tie! We both picked '+em[me]+'.'}
  else if(beats[me]===cpu){w++;r='You win! '+em[me]+' beats '+em[cpu]+'.';const bb=b.getBoundingClientRect();burst(bb.left+30,bb.top,18)}
  else{l++;r='I win! '+em[cpu]+' beats '+em[me]+'. Rematch?'}
  $('#rw').textContent=w;$('#rl').textContent=l;$('#rt').textContent=t;$('#rpsOut').textContent=r;
});

/* ---------- start the conversation ---------- */
renderReplies();
say('Hi! 👋 I\'m <b>Charisse</b>. Welcome to my page.','Ask me anything by tapping a reply below, or type your own question.');
