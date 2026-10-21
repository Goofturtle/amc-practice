// Page logic: sessions, tests, reviews and progress. Question generators (G, X, REF, P, fmt) come from gen.js.
const NAMES={alg:'Algebra',geo:'Geometry',nt:'Number theory',cmb:'Combinatorics',logic:'Logic'},
SUB={AR:'Computation',WP:'Word problems',AL:'Equations and functions',SQ:'Sequences and patterns',ST:'Statistics',GP:'Triangles and polygons',GC:'Circles',G3:'3D geometry',GA:'Coordinates and transformations',NT:'Divisibility and primes',DG:'Digits and bases',CT:'Counting',PR:'Probability',LG:'Logic puzzles'},
SUBT={AR:'alg',WP:'alg',AL:'alg',SQ:'alg',ST:'alg',GP:'geo',GC:'geo',G3:'geo',GA:'geo',NT:'nt',DG:'nt',CT:'cmb',PR:'cmb',LG:'logic'},
KIND={practice:'Practice',drill:'Drill',redo:'Redo',test:'Practice test',custom:'Custom test'},
TOPICS=['alg','geo','nt','cmb'],L='ABCDE',PACE=180,KEY='amc10-practice-v4',VIEWS=['home','play','test','custom','run','review','progress','ref'],
TAG={gap:'Knowledge gap',pace:'Pace',strat:'Strategy',trend:'Trend'},SKILL=new Map(),$=id=>document.getElementById(id);
REF.forEach((r,i)=>r[4].forEach(f=>SKILL.has(f)||SKILL.set(f,i)));
const mmss=s=>(s=Math.max(0,Math.round(s||0)),Math.floor(s/60)+':'+String(s%60).padStart(2,'0')),
dstr=d=>d?new Date(d).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'Earlier',
newId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6),
pc=g=>Math.round(100*g.c/g.n),of=g=>`${g.c} of ${g.n}`,rt=g=>g.c/g.n,avg=g=>g.tn?g.sec/g.tn:0,lvl=p=>p>=.75?'hi':p>=.5?'mid':'lo',
tile=(v,l,dot)=>`<div><b>${v}</b><span>${dot?`<i class="dot ${dot}"></i>`:''}${l}</span></div>`,
getJSON=async u=>{const r=await fetch(u),d=await r.json();if(!r.ok)throw new Error(d.error||r.status);return d},
store=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return e}},
read=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
blankS=()=>({sel:[...TOPICS],csel:[...TOPICS],clen:10,plen:10,dlen:10,hist:[]});
let S=blankS(),Ses=null,Tst=null,cur=null,pick=-1,done=false,busy=false,t0=0,tick=null,solP=null,lastG=null,setupMode=null,revH=null,TL=null;
function save(){for(;;){const r=store(KEY,S);if(r===true||!(r&&(r.name=='QuotaExceededError'||r.code==22))||S.hist.length<2)return;S.hist.pop()}}
const saveSes=()=>store('amc10-session',Ses),addHist=h=>{S.hist.unshift(h);S.hist=S.hist.slice(0,150);save()};
// Version 3 kept only totals and test scores, so those come over as summary-only sessions.
(()=>{const s=read(KEY);if(s)S=Object.assign(blankS(),s);else{const o=read('amc10-practice-v3');if(o){
  ['sel','csel','clen'].forEach(k=>{if(o[k])S[k]=o[k]});
  (o.hist||[]).forEach((h,i)=>S.hist.push({id:'old'+i,kind:'test',legacy:1,name:h.name,date:Date.parse(h.date)||0,pts:h.score,max:h.max}));
  const qs=[],fill=(t,k,c,n)=>{for(let j=0;j<n;j++)qs.push({t,k,a:0,r:j<c?0:1,sec:0})};
  for(const t in (o.prac&&o.prac.by)||{})fill(t,-1,...o.prac.by[t]);
  for(const i in o.drill||{})if(REF[i])fill(REF[i][1],+i,...o.drill[i]);
  if(qs.length)S.hist.push({id:'old-p',kind:'practice',legacy:1,name:'Earlier practice',date:0,qs});save()}}
  const t=read('amc10-test');if(t&&t.qs&&!t.done)Tst=Object.assign({tq:t.qs.map(()=>0),ci:t.i||0,date:Date.now()},t,{seg:null,at:null});
  const x=read('amc10-session');if(x&&x.qs)Ses=x})();

const isTest=h=>h.kind=='test'||h.kind=='custom';
function result(h){if(!h.qs)return{pts:h.pts,max:h.max,txt:`${fmt(h.pts)} / ${h.max}`};
  const k={n:h.qs.length,c:0,w:0,d:0};h.qs.forEach(q=>q.r==q.a?k.c++:q.r>=0?k.w++:k.d++);
  if(isTest(h)){k.pts=6*k.c+1.5*k.d;k.max=6*k.n;k.txt=`${fmt(k.pts)} / ${k.max}`}else k.txt=`${k.c} of ${k.n} right`;return k}
// r is the answer given: 0-4 a choice, -1 blank, -2 "I don't know".
const bucket=()=>({n:0,c:0,w:0,d:0,u:0,sec:0,tn:0}),
put=(g,q)=>{g.n++;q.r==q.a?g.c++:q.r>=0?g.w++:g.d++;if(q.r==-2)g.u++;if(q.sec>0){g.sec+=q.sec;g.tn++}},
skillOf=q=>q.s?['s:'+q.s,SUB[q.s],SUBT[q.s]]:q.k>=0&&REF[q.k]?['k:'+q.k,REF[q.k][2],REF[q.k][1]]:null,
allQs=()=>S.hist.slice().reverse().flatMap(h=>h.qs||[]),
act=k=>k.startsWith('k:')?{href:'#drill-'+k.slice(2),txt:'Drill it'}:(t=>TOPICS.includes(t)?{t,txt:'Practice '+NAMES[t]}:null)(k.startsWith('s:')?SUBT[k.slice(2)]:k);
function analyze(qs){const A={all:bucket(),top:{},sk:{},lab:{},skt:{},band:{}};
  for(const q of qs){put(A.all,q);put(A.top[q.t]||=bucket(),q);const s=skillOf(q);if(s){put(A.sk[s[0]]||=bucket(),q);A.lab[s[0]]=s[1];A.skt[s[0]]=s[2]}if(q.n)put(A.band[Math.ceil(q.n/5)]||=bucket(),q)}
  return A}
// o.min is the fewest questions a pattern needs, o.w the wrong answers in AMC-scored tests, o.qs the full history for trends.
function insights(A,o){const out={str:[],weak:[],notes:[]},note=(tag,txt,a)=>out.notes.push({tag,txt,a}),
  sum=(...g)=>g.filter(Boolean).reduce((s,x)=>({n:s.n+x.n,c:s.c+x.c}),{n:0,c:0});
  let rows=[...Object.keys(A.sk).map(k=>({k,lab:A.lab[k],g:A.sk[k],t:A.skt[k]})),...Object.keys(A.top).map(k=>({k,lab:NAMES[k]||k,g:A.top[k],top:1}))].filter(r=>r.g.n>=o.min);
  rows=rows.filter(r=>!r.top||!rows.some(s=>!s.top&&s.t==r.k&&s.g.n==r.g.n));out.enough=rows.length>0;
  out.str=rows.filter(r=>rt(r.g)>=.75).sort((a,b)=>rt(b.g)-rt(a.g)||b.g.n-a.g.n).slice(0,4);
  out.weak=rows.filter(r=>rt(r.g)<.5).sort((a,b)=>rt(a.g)-rt(b.g)||b.g.n-a.g.n).slice(0,4).map(r=>Object.assign(r,{a:act(r.k)}));
  if(A.all.u>=2){const t=Object.keys(A.top).sort((a,b)=>A.top[b].u-A.top[a].u)[0];note('gap',`You chose "I don't know" on <b>${A.all.u}</b> questions, most often in ${NAMES[t]||t} (${A.top[t].u}). Study those solutions first: they show methods you haven't learned yet.`,act(t))}
  if(A.all.tn>=o.min){const at=avg(A.all),tp=Object.keys(A.top).map(k=>({k,g:A.top[k]})).filter(r=>r.g.tn>=o.min),
    slow=tp.filter(r=>avg(r.g)>PACE&&avg(r.g)>1.2*at).sort((a,b)=>avg(b.g)-avg(a.g))[0],rush=tp.find(r=>avg(r.g)<60&&rt(r.g)<.5);
    note('pace',`You averaged <b>${mmss(at)}</b> a question, ${at>PACE?'slower than':'inside'} the 3:00 contest pace.`);
    if(slow)note('pace',`<b>${NAMES[slow.k]||slow.k}</b> is your slowest topic at ${mmss(avg(slow.g))} a question.`);
    if(rush)note('pace',`You may be rushing <b>${NAMES[rush.k]||rush.k}</b>: ${mmss(avg(rush.g))} a question and ${of(rush.g)} right. Slow down and check your work.`)}
  if(o.w>=2)note('strat',`${o.w} wrong answers scored 0 points. Left blank, they would have scored <b>${fmt(1.5*o.w)}</b> more, because the AMC gives 1.5 for a blank. Guess only when you can rule out at least two choices.`);
  const E=sum(A.band[1],A.band[2]),H=sum(A.band[3],A.band[4]);
  if(E.n>=o.min&&H.n>=o.min){if(rt(E)-rt(H)>=.25)note('strat',`On problems 1–10 you got <b>${of(E)}</b> right, but on 11–20 only <b>${of(H)}</b>. Lock in the first ten before spending time on the hard end.`);
    else if(rt(E)<.7)note('strat',`You got <b>${of(E)}</b> right on problems 1–10, the easiest part of the test. Those are the cheapest points, so slow down and check them.`)}
  if(o.qs&&o.qs.length>=30){const q=o.qs,k=Math.min(25,Math.floor(q.length/2)),f=a=>a.filter(x=>x.r==x.a).length/a.length,r=f(q.slice(-k)),e=f(q.slice(-2*k,-k));
    if(Math.abs(r-e)>=.1)note('trend',`${r>e?'Improving':'Slipping'}: ${Math.round(100*r)}% right in your last ${k} questions, ${r>e?'up':'down'} from ${Math.round(100*e)}% in the ${k} before.`)}
  return out}
const link=a=>`<a class="btn ghost sm" href="${a.href||'#practice'}"${a.t?` data-topic="${a.t}"`:''}>${a.txt}</a>`;
function renderSW(o,el){const li=(r,w)=>`<li><span><b>${r.lab}</b><small>${of(r.g)} right · ${pc(r.g)}%</small></span>${w&&r.a?link(r.a):''}</li>`;
  el.innerHTML=`<div class="sw"><div class="swc ok"><h3>Strengths</h3>${o.str.length?`<ul>${o.str.map(r=>li(r)).join('')}</ul>`:`<p>${o.enough?'Nothing at 75% or better yet.':'Not enough questions yet to tell.'}</p>`}</div><div class="swc bad"><h3>Work on</h3>${o.weak.length?`<ul>${o.weak.map(r=>li(r,1)).join('')}</ul>`:`<p>${o.enough?'Nothing under 50%. Nice work.':'Not enough questions yet to tell.'}</p>`}</div></div>`
  +(o.notes.length?`<ul class="notes">${o.notes.map(n=>`<li class="n-${n.tag}"><span class="tag">${TAG[n.tag]}</span><p>${n.txt}</p>${n.a?link(n.a):''}</li>`).join('')}</ul>`:'')}
function bar(lab,g,sm){const p=rt(g);return`<div class="bar${sm?' sm':''}" title="${lab}: ${of(g)} right"><span class="bl">${lab}</span><span class="bt"><span class="bf ${lvl(p)}" style="width:${100*p}%"></span></span><span class="bv">${of(g)} · ${pc(g)}%</span></div>`}
const topicBars=(A,sk)=>Object.keys(NAMES).filter(t=>A.top[t]).map(t=>{const ks=sk?Object.keys(A.sk).filter(k=>A.skt[k]==t).sort((a,b)=>rt(A.sk[a])-rt(A.sk[b])):[];
  return bar(NAMES[t],A.top[t])+(ks.length?`<details class="sks"><summary>${ks.length} skill${ks.length>1?'s':''} in ${NAMES[t]}, weakest first</summary>${ks.map(k=>bar(A.lab[k],A.sk[k],1)).join('')}</details>`:'')}).join(''),
stack=(k,dl)=>`<div class="stk" role="img" aria-label="${k.c} right, ${k.w} wrong, ${k.d} ${dl}">${[['s-ok',k.c],['s-bad',k.w],['s-d',k.d]].filter(x=>x[1]).map(x=>`<span class="${x[0]}" style="flex:${x[1]}"></span>`).join('')}</div>`,
tname=id=>{const m=/^(\d{4})([SF]?)([AB])-(\d+)$/.exec(id);return m?`${m[1]}${m[2]=='S'?' Spring':m[2]=='F'?' Fall':''} AMC 10${m[3]} #${m[4]}`:id},
histRow=h=>`<div class="hrow"><span class="hm">${dstr(h.date)} · <span class="kt">${KIND[h.kind]}</span></span><span class="hn">${h.name}</span><span class="hr">${result(h).txt}</span>${h.legacy?'<span class="hl">Summary only</span>':`<a href="#review-${h.id}">Review</a>`}</div>`;

function home(){const A=analyze(allQs()),best=S.hist.filter(h=>h.kind=='test').map(result).sort((a,b)=>b.pts/b.max-a.pts/a.max)[0],b=[];
  if(Tst&&!Tst.done)b.push(`<a class="resume" href="#run">${Tst.seg?`Your ${Tst.name} is in progress. Resume it`:`Your ${Tst.name} is paused with ${mmss(left())} left. Resume it`}</a>`);
  if(Ses)b.push(`<a class="resume" href="#session">Your ${KIND[Ses.kind].toLowerCase()} session is open with ${Ses.qs.length} answered. Pick up where you left off</a>`);
  $('banners').innerHTML=b.join('');
  $('stats').innerHTML=tile(A.all.n?pc(A.all)+'%':'–',A.all.n?`right over ${A.all.n} questions`:'no questions answered yet')+tile(S.hist.length,'sessions saved')+tile(best?best.txt:'–',best?'best practice test':'no practice tests yet');
  $('ref-tag').textContent=`${REF.filter(r=>r[0]=='f').length} formulas · ${REF.filter(r=>r[0]=='t').length} terms`;
  $('h-recent').hidden=!S.hist.length;$('h-recent').innerHTML=`<div class="ph"><h2 class="h2">Recent sessions</h2><a href="#progress">Strengths, weaknesses and every session</a></div><div class="hist">${S.hist.slice(0,5).map(histRow).join('')}</div>`}
function review(h){revH=h;const k=result(h),A=analyze(h.qs),test=isTest(h),dl=test?'blank':"I don't know",miss=h.qs.filter(q=>q.r!=q.a).length;
  $('v-kind').textContent=`${KIND[h.kind]} · ${h.name} · ${new Date(h.date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}`;
  $('v-score').textContent=test?`${fmt(k.pts)} / ${k.max} points`:`${k.c} of ${k.n} right`;
  $('v-sub').textContent=`${pc(k)}% right · ${mmss(h.dur)} ${test?`of ${mmss(h.lim)} used`:'spent'}${h.best>1?` · best streak ${h.best}`:''}`;
  $('v-stack').innerHTML=stack(k,dl);
  $('v-act').innerHTML=(miss?`<button class="btn" type="button" id="v-redo">Redo the ${miss} you missed</button>`:'')+`<a class="btn ghost" href="${{drill:'#drill-'+h.key,test:'#test',custom:'#custom'}[h.kind]||'#practice'}">${test?'Take another test':'Practice again'}</a><a class="btn ghost" href="#progress">All progress</a>`;
  if(miss)$('v-redo').onclick=()=>redo(h);
  $('v-stats').innerHTML=tile(k.c,'right','s-ok')+tile(k.w,'wrong','s-bad')+tile(k.d,dl,'s-d')+tile(A.all.tn?mmss(avg(A.all)):'–','a question on average');
  renderSW(insights(A,{min:2,w:test?k.w:0}),$('v-ins'));$('v-bars').innerHTML=topicBars(A,0);
  $('v-list').className='rlist';$('v-filter').querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',i==0));
  $('v-list').innerHTML=h.qs.map((q,i)=>{const st=q.r==q.a?'ok':q.r>=0?'bad':q.r==-2?'idk':'blank',sk=skillOf(q);
    return`<details class="rv ${st}" data-i="${i}"><summary><span class="mk" aria-hidden="true">${{ok:'✓',bad:'✗',idk:'?',blank:'–'}[st]}</span><span class="rvt">${i+1}. ${q.id&&!test?tname(q.id)+' · ':''}${NAMES[q.t]||'Logic'}${sk&&sk[1]!=NAMES[q.t]?' · '+sk[1]:''}</span><span class="rva">${st=='ok'?'Right':st=='bad'?`You (${L[q.r]}), answer (${L[q.a]})`:`${st=='idk'?"I don't know":'Blank'}, answer (${L[q.a]})`}${q.sec?' · '+mmss(q.sec):''}</span></summary><div class="rvb"></div></details>`}).join('')}
function progress(){const H=S.hist,has=H.length>0;$('g-empty').hidden=has;$('g-body').hidden=!has;if(!has)return;
  const qs=allQs(),A=analyze(qs),real=H.filter(h=>h.kind=='test'),best=real.map(result).sort((a,b)=>b.pts/b.max-a.pts/a.max)[0],old=H.reduce((m,h)=>h.date&&h.date<m?h.date:m,Date.now()),T=real.slice(0,12).reverse(),bands=[1,2,3,4].filter(i=>A.band[i]);
  $('g-sum').textContent=`${H.length} session${H.length>1?'s':''} saved on this device · since ${dstr(old)}`;
  $('g-stats').innerHTML=tile(A.all.n,'questions answered')+tile(A.all.n?pc(A.all)+'%':'–','right overall')+tile(A.all.tn?mmss(avg(A.all)):'–','a question on average')+tile(best?best.txt:'–',best?'best practice test':'no practice tests yet');
  renderSW(insights(A,{min:3,qs,w:H.filter(h=>isTest(h)&&h.qs).reduce((s,h)=>s+result(h).w,0)}),$('g-ins'));
  $('g-bars').innerHTML=topicBars(A,1);
  $('g-band-wrap').hidden=!bands.length;$('g-band').innerHTML=bands.map(i=>bar(`Problems ${5*i-4}–${5*i}`,A.band[i])).join('');
  $('g-tests-wrap').hidden=!T.length;$('g-tests').innerHTML=T.map(h=>{const r=result(h),tg=h.qs?'a':'div';return`<${tg} class="col"${h.qs?` href="#review-${h.id}"`:''} title="${h.name}: ${fmt(r.pts)} of ${r.max} points"><span class="cv">${fmt(r.pts)}</span><span class="ct"><span class="cf ${lvl(r.pts/r.max)}" style="height:${100*r.pts/r.max}%"></span></span><span class="cl">${dstr(h.date)}</span></${tg}>`}).join('');
  $('g-hist').innerHTML=H.map(histRow).join('')}

const chips=(sel,A)=>TOPICS.map(k=>`<button class="chip" type="button" data-k="${k}" aria-pressed="${sel.includes(k)}">${NAMES[k]}${A&&A.top[k]?`<small title="Right so far">${pc(A.top[k])}%</small>`:''}</button>`).join(''),
segLen=(el,n)=>el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.n==n)),
press=(el,sel)=>el.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',sel.includes(b.dataset.k))),
toggle=(sel,k)=>{const i=sel.indexOf(k);if(i<0)sel.push(k);else if(sel.length>1)sel.splice(i,1)},
stopTick=()=>{clearInterval(tick);tick=null},el=()=>(Date.now()-t0)/1000,
choicesHTML=(q,sel)=>[...L].map((l,i)=>`<button class="ch${sel==i?' sel':''}" type="button" aria-pressed="${sel==i}" data-i="${i}"><b>(${l})</b>${q.real?'':`<span>${q.ch[i].t}</span>`}</button>`).join(''),
fix=e=>e.querySelectorAll('img').forEach(i=>i.addEventListener('error',()=>{if(!i.dataset.f){i.dataset.f=1;i.src='https://web.archive.org/web/2023im_/'+i.src}})),
solHTML=(s,url)=>(s&&s.html?s.html:'<p>No archived solution for this problem yet.</p>')+`<p><a href="${url}" target="_blank" rel="noopener">See every solution on AoPS</a></p>`,
realQ=d=>({real:1,id:d.id,t:d.topic,s:d.sub,n:d.n,q:d.html,a:L.indexOf(d.ans),url:d.url,label:`${d.name} · Problem ${d.n} · ${NAMES[d.topic]||'Logic'}`}),
gen=gs=>{let g;do g=P(gs);while(g===lastG&&gs.length>1);lastG=g;const q=g();q.k=SKILL.has(g)?SKILL.get(g):-1;return q},
rec=(q,r,sec)=>(sec=Math.round(sec||0),q.real?{id:q.id,t:q.t,s:q.s,n:q.n||+String(q.id).split('-')[1]||0,a:q.a,r,sec}:{t:q.t,k:q.k,q:q.q,ch:q.ch.map(c=>c.t),a:q.a,r,sec,why:q.why});
function playView(a){
  if(a.kind!='session'&&Ses&&Ses.kind==a.kind&&(a.kind!='drill'||Ses.key==a.key)){history.replaceState(null,'','#session');a={kind:'session'}}
  const run=a.kind=='session',m=run?Ses:a,dr=m.kind=='drill'&&REF[m.key];
  $('p-setup').hidden=run;$('p-run').hidden=!run;
  $('p-eyebrow').textContent=m.kind=='practice'?'Real AMC problems':m.kind=='redo'?'Missed questions':dr[0]=='f'?'Formula drill':'Term drill';
  $('p-title').textContent=m.kind=='practice'?'Practice':m.kind=='redo'?'Redo missed questions':dr[2];
  if(run){if(done&&cur){sesBar();return}return next()}
  setupMode=a;$('p-topics').hidden=a.kind!='practice';$('p-fx').hidden=a.kind!='drill';
  if(a.kind=='practice')$('p-chips').innerHTML=chips(S.sel,analyze(allQs()));else $('p-fx').innerHTML=`<p class="fxv">${dr[3]}</p><a href="#ref">All formulas and terms</a>`;
  segLen($('p-len'),a.kind=='practice'?S.plen:S.dlen);
  $('p-note').textContent=Ses?`Starting ends your open ${KIND[Ses.kind].toLowerCase()} session and saves it.`:'Press "Stop now" whenever you want to end early and see your review.'}
function start(){const a=setupMode;if(!a)return;if(Ses)finish(false);
  Ses={id:newId(),kind:a.kind,key:a.key,topics:a.kind=='practice'?[...S.sel]:null,want:a.kind=='practice'?S.plen:S.dlen,qs:[],start:Date.now(),st:0,best:0,cur:null,
    name:a.kind=='practice'?(S.sel.length==4?'All topics':S.sel.map(k=>NAMES[k]).join(', ')):REF[a.key][2]};
  cur=null;done=false;saveSes();location.hash='session'}
function redo(h){const q=h.qs.filter(q=>q.r!=q.a);if(Ses)finish(false);
  Ses={id:newId(),kind:'redo',name:h.name,queue:q,want:q.length,qs:[],start:Date.now(),st:0,best:0,cur:null};cur=null;done=false;saveSes();location.hash='session'}
function sesBar(){if(!Ses)return;const n=Ses.qs.length,w=Ses.want,c=Ses.qs.filter(q=>q.r==q.a).length;
  $('p-count').textContent=`Question ${w?Math.min(n+(done?0:1),w)+' of '+w:n+(done?0:1)} · ${c} right${Ses.st>1?` · streak ${Ses.st}`:''}`;
  $('p-prog').hidden=!w;$('p-bar').style.width=w?100*n/w+'%':'0'}
async function makeQ(){const s=Ses;
  if(s.kind=='drill'){const q=gen(REF[s.key][4]);q.label=`${NAMES[q.t]} · ${REF[s.key][0]=='f'?'Formula':'Term'} drill`;return q}
  if(s.kind=='redo'){const it=s.queue[s.qs.length];if(it.id)return realQ(await getJSON('/api/problem?id='+it.id));
    return{t:it.t,k:it.k,q:it.q,ch:it.ch.map(t=>({t})),a:it.a,why:it.why,label:`${NAMES[it.t]||'Logic'} · Redo`}}
  const seen=[...new Set([...s.qs,...allQs().reverse()].map(q=>q.id).filter(Boolean))].slice(0,300);
  return realQ(await getJSON(`/api/real?t=${s.topics.join(',')}&x=${seen.join(',')}`))}
async function next(){if(busy||!Ses)return;if(Ses.want&&Ses.qs.length>=Ses.want)return finish(true);
  pick=-1;done=false;if(Ses.cur){cur=Ses.cur;return show()}
  const id=Ses.id;busy=true;loading();
  try{const q=await makeQ();busy=false;if(!Ses||Ses.id!=id)return;cur=Ses.cur=q;saveSes();if(!$('v-play').hidden)show()}
  catch(e){busy=false;if(Ses&&Ses.id==id)failLoad()}}
function show(){const q=cur;$('meta').textContent=q.label;$('q').className='q'+(q.real?' src':'');$('q').innerHTML=q.q;fix($('q'));
  $('choices').className='choices'+(q.real?' bub':'');$('choices').innerHTML=choicesHTML(q,-1);
  $('fb').hidden=true;$('card').classList.remove('done');$('go').textContent='Check';$('go').disabled=true;$('idk').hidden=false;
  if(q.real)solP=getJSON('/api/solution?id='+q.id).catch(()=>({}));
  t0=Date.now();$('time').textContent='0:00';stopTick();tick=setInterval(()=>{$('time').textContent=mmss(el())},1000);sesBar()}
function loading(){stopTick();cur=null;$('card').classList.remove('done');$('fb').hidden=true;$('choices').innerHTML='';$('meta').textContent='';$('time').textContent='';$('q').className='q ld';$('q').textContent=Ses.kind=='drill'?'':'Loading the next problem…';$('go').disabled=true;$('idk').hidden=true;sesBar()}
function failLoad(){$('q').textContent='Could not load a problem from the archive. Check your internet connection, then try again.';$('go').textContent='Try again';$('go').disabled=false;done=true;cur=null}
function choose(i){if(done||!cur)return;pick=i;document.querySelectorAll('#choices .ch').forEach((b,j)=>{b.classList.toggle('sel',j==i);b.setAttribute('aria-pressed',j==i)});$('go').disabled=false}
async function answer(r){if(done||!cur||busy||!Ses||r==-1)return;done=true;stopTick();
  const q=cur,ok=r==q.a,sec=el();Ses.qs.push(rec(q,r,sec));Ses.cur=null;Ses.st=ok?Ses.st+1:0;Ses.best=Math.max(Ses.best,Ses.st);saveSes();
  document.querySelectorAll('#choices .ch').forEach((x,i)=>{x.disabled=true;x.classList.toggle('ok',i==q.a);x.classList.toggle('bad',i==r&&!ok)});
  const ans=`(${L[q.a]})${q.real?'':' '+q.ch[q.a].t}`;$('card').classList.add('done');$('fb').className='fb '+(ok?'ok':r==-2?'idk':'bad');
  $('fbt').textContent=ok?`Correct, in ${mmss(sec)}.${sec>PACE?' That is slower than the 3:00 test pace.':''}`:r==-2?`The answer is ${ans}. Here is how to get it.`:`Not quite. The answer is ${ans}.`;
  $('live').textContent=ok?'Correct.':`${r==-2?'':'Incorrect. '}The answer is ${L[q.a]}.`;
  $('fb').hidden=false;$('idk').hidden=true;$('go').textContent=Ses.want&&Ses.qs.length>=Ses.want?'See your review':'Next question';$('go').disabled=false;$('go').focus();sesBar();
  const w=$('why');if(!q.real){w.className='why';w.innerHTML=q.why;return}
  w.className='why src';w.innerHTML='<p class="ld">Loading the solution…</p>';const s=await solP;if(cur!==q)return;w.innerHTML=solHTML(s,q.url);fix(w)}
function finish(nav){const s=Ses;Ses=null;cur=null;done=false;busy=false;stopTick();store('amc10-session',null);
  if(!s)return;if(!s.qs.length){if(nav)location.hash=s.kind=='drill'?'drill-'+s.key:s.kind=='redo'?'progress':'practice';return}
  const h={id:s.id,kind:s.kind,key:s.key,name:s.name,date:s.start,dur:s.qs.reduce((a,q)=>a+q.sec,0),best:s.best,qs:s.qs};addHist(h);if(nav)location.hash='review-'+h.id}

const spent=()=>Tst.el+(Tst.seg?(Date.now()-Tst.seg)/1000:0),left=()=>Math.max(0,Tst.lim-Math.floor(spent()));
// Time on each question: at is when the shown question (ci) started counting.
function acc(){const t=Tst,now=Date.now();if(t.seg&&t.at)t.tq[t.ci]=(t.tq[t.ci]||0)+(now-t.at)/1000;t.at=t.seg?now:null;t.ci=t.i}
const saveT=()=>{if(!Tst||Tst.done)return;acc();store('amc10-test',Object.assign({},Tst,{tm:0,el:spent(),seg:null,at:null}))};
function begin(t){if(Tst)clearInterval(Tst.tm);Tst=Object.assign(t,{ans:t.qs.map(()=>-1),tq:t.qs.map(()=>0),i:0,ci:0,at:null,lim:t.qs.length*180,el:0,seg:null,done:false,sure:false,date:Date.now()});resume();location.hash='run'}
function tickT(){if(!Tst||Tst.done||!Tst.seg)return;const s=left();$('r-time').textContent=mmss(s)+' left';if(s<=0)submit()}
function pause(){if(!Tst||Tst.done||!Tst.seg)return;acc();Tst.el=spent();Tst.seg=null;Tst.at=null;clearInterval(Tst.tm);saveT();drawPause()}
function resume(){if(!Tst||Tst.done||Tst.seg)return;Tst.seg=Date.now();Tst.at=Tst.seg;Tst.ci=Tst.i;clearInterval(Tst.tm);Tst.tm=setInterval(tickT,1000);drawQ();drawPause()}
function drawPause(){const p=!Tst.seg;$('r-card').hidden=$('r-pal').hidden=p;$('r-paused').hidden=!p;$('r-pause').textContent=p?'Resume':'Pause';$('r-time').textContent=mmss(left())+' left';$('r-pleft').textContent=`${Tst.name} · ${mmss(left())} left · ${Tst.ans.filter(a=>a!=-1).length} of ${Tst.qs.length} done`}
function drawQ(){const t=Tst,q=t.qs[t.i];acc();$('r-meta').textContent=`${t.name} · Question ${t.i+1} of ${t.qs.length}`;$('r-time').textContent=mmss(left())+' left';
  $('r-q').className='q'+(q.real?' src':'');$('r-q').innerHTML=q.q;fix($('r-q'));$('r-ch').className='choices'+(q.real?' bub':'');$('r-ch').innerHTML=choicesHTML(q,t.ans[t.i]);
  $('r-prev').disabled=t.i==0;$('r-next').disabled=t.i==t.qs.length-1;mark()}
function mark(){const t=Tst,a=t.ans[t.i];document.querySelectorAll('#r-ch .ch').forEach((b,i)=>{b.classList.toggle('sel',a==i);b.setAttribute('aria-pressed',a==i)});$('r-idk').setAttribute('aria-pressed',a==-2);
  $('r-bar').style.width=100*t.ans.filter(x=>x!=-1).length/t.qs.length+'%';
  $('r-pal').innerHTML=t.qs.map((_,i)=>{const x=t.ans[i];return`<button type="button" class="pq${x>=0?' on':x==-2?' idk':''}${i==t.i?' cur':''}" data-i="${i}" aria-label="Question ${i+1}${x>=0?', answered':x==-2?", I don't know":''}">${i+1}</button>`}).join('');
  t.sure=false;$('r-sub').textContent='Finish test';saveT()}
function submit(){const t=Tst;if(!t||t.done)return;acc();t.used=Math.min(t.lim,Math.floor(spent()));t.done=true;t.seg=null;clearInterval(t.tm);store('amc10-test',null);
  const h={id:newId(),kind:t.real?'test':'custom',name:t.name,date:t.date||Date.now(),dur:t.used,lim:t.lim,qs:t.qs.map((q,i)=>rec(q,t.ans[i],t.tq[i]))};Tst=null;addHist(h);location.hash='review-'+h.id}
const bestBy=()=>{const b={};S.hist.forEach(h=>{if(h.kind=='test'){const r=result(h);b[h.name]=Math.max(b[h.name]??-1,r.pts)}});return b};
async function testSetup(){$('t-err').hidden=true;if(!TL)try{TL=await getJSON('/api/tests')}catch(e){return}
  const b=bestBy(),s=$('t-sel'),v=s.value;s.innerHTML='<option value="">A past test you haven\'t taken yet</option>'+TL.map(t=>`<option value="${t.id}">${t.name}${t.name in b?` · best ${fmt(b[t.name])} / 120`:''}</option>`).join('');s.value=v}
function customSetup(){$('c-chips').innerHTML=chips(S.csel,analyze(allQs()));segLen($('c-len'),S.clen);$('c-info').textContent=`${S.clen} questions · ${S.clen*3} minutes · scored like the AMC: 6 points right, 1.5 for a blank or "I don't know", 0 wrong.`}
function refView(){const A=analyze(allQs()),card=(r,i)=>{const g=A.sk['k:'+i];return`<article class="rf"><div><h3>${r[2]}</h3><p class="fxv">${r[3]}</p></div><div class="rfa">${g?`<span class="rs">${g.c}/${g.n}</span>`:''}<a class="btn sm" href="#drill-${i}">Practice</a></div></article>`};
  $('f-list').innerHTML=TOPICS.map(k=>`<h3 class="label">${NAMES[k]}</h3>`+REF.map((r,i)=>r[0]=='f'&&r[1]==k?card(r,i):'').join('')).join('');
  $('t-list').innerHTML=REF.map((r,i)=>r[0]=='t'?card(r,i):'').join('')}
function route(){let h=location.hash.slice(1)||'home',arg=null;const go=to=>(history.replaceState(null,'','#'+to),to);
  if(h=='practice'){arg={kind:'practice'};h='play'}
  else if(h.startsWith('drill-')){const i=+h.slice(6);if(REF[i]){arg={kind:'drill',key:i};h='play'}else h=go('ref')}
  else if(h=='session'){if(Ses){arg={kind:'session'};h='play'}else h=go('home')}
  else if(h.startsWith('review-')){arg=S.hist.find(x=>x.id==h.slice(7));h=arg&&!arg.legacy?'review':go('progress')}
  else if(h=='run'&&!(Tst&&!Tst.done))h=go('home');
  if(!VIEWS.includes(h))h=go('home');
  if(h!='play')stopTick();
  VIEWS.forEach(v=>{$('v-'+v).hidden=v!=h});
  ({home,play:()=>playView(arg),test:testSetup,custom:customSetup,run:()=>{drawQ();drawPause()},review:()=>review(arg),progress,ref:refView})[h]();window.scrollTo(0,0)}

$('p-chips').onclick=e=>{const c=e.target.closest('.chip');if(c){toggle(S.sel,c.dataset.k);save();press($('p-chips'),S.sel)}};
$('c-chips').onclick=e=>{const c=e.target.closest('.chip');if(c){toggle(S.csel,c.dataset.k);save();press($('c-chips'),S.csel)}};
$('p-len').onclick=e=>{const b=e.target.closest('button');if(!b||!setupMode)return;const n=+b.dataset.n;if(setupMode.kind=='practice')S.plen=n;else S.dlen=n;save();segLen($('p-len'),n)};
$('c-len').onclick=e=>{const b=e.target.closest('button');if(b){S.clen=+b.dataset.n;save();customSetup()}};
$('p-start').onclick=start;$('p-stop').onclick=()=>finish(true);$('idk').onclick=()=>answer(-2);
$('choices').onclick=e=>{const c=e.target.closest('.ch');if(c)choose(+c.dataset.i)};
$('go').onclick=()=>done?next():answer(pick);
$('v-filter').onclick=e=>{const b=e.target.closest('button');if(!b)return;$('v-filter').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x==b));$('v-list').classList.toggle('miss',b.dataset.f=='miss')};
$('v-list').addEventListener('toggle',async e=>{const d=e.target;if(!d.open||d.dataset.l||!revH)return;d.dataset.l=1;const q=revH.qs[+d.dataset.i],box=d.querySelector('.rvb');
  if(!q.id){box.innerHTML=q.q?`<div class="q">${q.q}</div><p class="rvc">${q.r>=0&&q.r!=q.a?`You answered (${L[q.r]}) ${q.ch[q.r]}. `:''}The answer is (${L[q.a]}) ${q.ch[q.a]}.</p><div class="why">${q.why}</div>${q.k>=0?`<a href="#drill-${q.k}">Drill ${REF[q.k][2]}</a>`:''}`:'<p class="sub">This question was saved before full reviews existed.</p>';return}
  box.innerHTML='<p class="ld">Loading the problem…</p>';
  try{const p=await getJSON('/api/problem?id='+q.id);box.innerHTML=`<div class="q src">${p.html}</div><div class="why src"><p class="ld">Loading the solution…</p></div>`;fix(box);
    const s=await getJSON('/api/solution?id='+q.id).catch(()=>({})),w=box.querySelector('.why');w.innerHTML=solHTML(s,p.url);fix(w)}
  catch(err){delete d.dataset.l;box.innerHTML='<p class="err">Could not load this problem. Check your internet connection, then close and open it again.</p>'}},true);
$('t-start').onclick=async()=>{const b=$('t-start');b.disabled=true;b.textContent='Loading the test…';$('t-err').hidden=true;
  try{const bb=bestBy(),pool=(TL||[]).filter(t=>!(t.name in bb)),d=await getJSON('/api/test?id='+($('t-sel').value||(pool.length?P(pool).id:'')));begin({name:d.name,real:1,qs:d.qs.map(realQ)})}
  catch(e){$('t-err').hidden=false}b.disabled=false;b.textContent='Start test'};
$('c-start').onclick=()=>{lastG=null;const gs=S.csel.flatMap(k=>G[k]),qs=[];for(let i=0;i<S.clen;i++)qs.push(gen(gs));begin({name:'Custom test',qs})};
$('r-ch').onclick=e=>{const c=e.target.closest('.ch');if(!c||!Tst||Tst.done)return;const i=+c.dataset.i;Tst.ans[Tst.i]=Tst.ans[Tst.i]==i?-1:i;mark()};
$('r-idk').onclick=()=>{const t=Tst;if(!t||t.done||!t.seg)return;t.ans[t.i]=t.ans[t.i]==-2?-1:-2;if(t.ans[t.i]==-2&&t.i<t.qs.length-1){t.i++;drawQ()}else mark()};
$('r-pal').onclick=e=>{const b=e.target.closest('.pq');if(b){Tst.i=+b.dataset.i;drawQ();$('r-pal').children[Tst.i].focus()}};
$('r-prev').onclick=()=>{if(Tst.i>0){Tst.i--;drawQ()}};
$('r-next').onclick=()=>{if(Tst.i<Tst.qs.length-1){Tst.i++;drawQ()}};
$('r-sub').onclick=()=>{const b=Tst.ans.filter(a=>a==-1).length;if(b&&!Tst.sure){Tst.sure=true;$('r-sub').textContent=`Finish with ${b} unanswered?`;return}submit()};
$('r-pause').onclick=()=>Tst.seg?pause():resume();$('r-resume').onclick=resume;
$('g-clear').onclick=e=>{const b=e.currentTarget;if(!b.dataset.sure){b.dataset.sure=1;b.textContent='Click again to delete everything';return}delete b.dataset.sure;b.textContent='Delete all saved progress';S.hist=[];save();progress()};
document.addEventListener('click',e=>{const a=e.target.closest('a[data-topic]');if(a){S.sel=[a.dataset.topic];save()}});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName))return;const k=e.key.toUpperCase(),i=k.length==1?Math.max('ABCDE'.indexOf(k),'12345'.indexOf(k)):-1;
  if(!$('v-play').hidden&&!$('p-run').hidden){if(e.key=='Enter'){if(e.target.closest('a,summary,button:not(#go):not(.ch)'))return;e.preventDefault();if(!$('go').disabled)$('go').click()}else if(e.key=='?')answer(-2);else if(i>=0)choose(i)}
  else if(!$('v-run').hidden&&Tst&&!Tst.done&&Tst.seg){if(i>=0){Tst.ans[Tst.i]=i;mark()}else if(e.key=='?')$('r-idk').click();else if(e.key=='ArrowRight')$('r-next').click();else if(e.key=='ArrowLeft')$('r-prev').click()}});
const keep=()=>{if(Tst&&!Tst.done)saveT()};
window.addEventListener('pagehide',keep);document.addEventListener('visibilitychange',()=>{if(document.hidden)keep()});
window.addEventListener('hashchange',route);route();
