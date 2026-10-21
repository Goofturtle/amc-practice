const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=+process.env.PORT||+process.argv[2]||3572,DIR=__dirname,CACHE=path.join(DIR,'cache'),AO='https://artofproblemsolving.com';
fs.mkdirSync(CACHE,{recursive:true});

// Topic of problems 1-20 of each test, in TESTS order.
const CODES='AR AL WP AR G3 DG ST WP SQ GP GP PR LG CT GC GA PR CT GP CT|AR AR AR SQ ST DG GP NT GA GP GP PR WP GA LG SQ AL NT GP GA|AR WP GP WP AL LG GP CT WP GP G3 GA SQ WP PR NT GA PR CT DG|DG WP AL AL WP G3 WP GA PR GA WP WP CT NT GP CT CT CT GP NT|AR WP AR CT LG WP NT WP GP AL CT AL GP AL GC GP NT DG NT CT|AR WP CT G3 CT PR GC SQ PR G3 NT GC NT ST GP NT GP CT NT SQ|AR NT WP CT SQ GP GA GA NT GA NT ST GC GP SQ GC CT DG AL PR|WP NT WP GA GA AL NT GP AL GP WP DG ST NT GP GP PR SQ NT GC|AR ST AL WP AL CT AR SQ NT G3 ST GP PR AL NT PR AL CT CT GP|AR G3 WP NT CT DG NT GP NT G3 PR DG GA GC SQ LG CT PR NT G3|AR WP DG SQ ST WP LG DG AL AL DG G3 G3 AL CT ST GP AL GA CT|AL AL WP WP NT ST GC SQ GA G3 NT NT DG GC AL CT LG PR ST GP|AR AR G3 WP NT WP GP DG PR ST WP NT PR AL GC AL G3 CT GC AL|AR GP AR AL AL NT NT NT WP LG GC AL GP PR GP PR GA GP AL PR|AR WP WP WP GP AL NT ST CT GP AL LG GP CT GC AL DG GA NT SQ|AR GP CT WP AR NT AL NT SQ ST LG PR NT CT SQ GP NT CT CT GP|WP WP NT GP AL AL PR AL CT ST GP NT GP PR GC AL GP G3 GA CT|WP WP GC WP AL SQ GP NT AL LG NT AL GA NT NT CT AL NT PR G3|AR WP NT AR NT CT NT WP CT SQ NT ST GA GC NT GP PR NT NT CT|AR AR AL SQ SQ NT NT NT AL GP GP CT AL PR ST LG CT NT GA CT'.split('|');
const TOPIC={AR:'alg',WP:'alg',AL:'alg',SQ:'alg',ST:'alg',GP:'geo',GC:'geo',G3:'geo',GA:'geo',NT:'nt',DG:'nt',CT:'cmb',PR:'cmb',LG:'logic'};
const TESTS=[],add=(id,name,page,ts)=>TESTS.push({id,name,page,ts});
for(const y of [2016,2017,2018,2019,2020])for(const s of 'AB')add(y+s,`${y} AMC 10${s}`,`${y}_AMC_10${s}_Problems`,'2023');
for(const s of 'AB')add('2021S'+s,`2021 Spring AMC 10${s}`,`2021_AMC_10${s}_Problems`,'2023');
for(const s of 'AB')add('2021F'+s,`2021 Fall AMC 10${s}`,`2021_Fall_AMC_10${s}_Problems`,'2023');
for(const s of 'AB')add('2022'+s,`2022 AMC 10${s}`,`2022_AMC_10${s}_Problems`,'2023');
for(const s of 'AB')add('2023'+s,`2023 AMC 10${s}`,`2023_AMC_10${s}_Problems`,'2024');
for(const s of 'AB')add('2024'+s,`2024 AMC 10${s}`,`2024_AMC_10${s}_Problems`,'2025');
const POOL=[];TESTS.forEach((t,i)=>CODES[i].split(' ').forEach((c,j)=>POOL.push({id:`${t.id}-${j+1}`,test:t,n:j+1,topic:TOPIC[c],sub:c})));

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// AoPS blocks automated requests, so pages come from the Internet Archive's copies instead.
async function wb(title,ts,mark){
  for(const t of [ts,'2023','2024','2022'])for(let k=0;k<2;k++){
    try{const r=await fetch(`https://web.archive.org/web/${t}id_/${AO}/wiki/index.php/${title}`,{signal:AbortSignal.timeout(45000)});const h=await r.text();if(r.ok&&h.includes(mark))return h;break}
    catch(e){await sleep(1500)}}
  return null}
const SOLRE=/<p>\s*(?:<br\s*\/?>\s*)?<a[^>]*>\s*Solutions?\s*<\/a>\s*<\/p>/gi;
// Archived pages sometimes kept a figure that failed to render; its Asymptote source then shows as plain text.
const broken=h=>/\[asy\]|Error making remote request/i.test(h.replace(/<[^>]+>/g,''));
const serve=(h,url)=>h.replace(SOLRE,'')+(broken(h)?`<p><a href="${url}" target="_blank" rel="noopener">This problem's figure is missing from the archive. Open it on AoPS</a></p>`:'');
const purl=p=>`${AO}/wiki/index.php/${p.test.page}/Problem_${p.n}`,
pj=(p,d)=>({id:p.id,name:p.test.name,n:p.n,topic:p.topic,sub:p.sub,html:serve(d.probs[p.n],purl(p)),ans:d.ans[p.n-1],url:purl(p)});
const clean=h=>h.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/\son\w+="[^"]*"/gi,'').replace(/\ssrcset="[^"]*"/gi,'')
  .replace(SOLRE,'').replace(/(src|href)="\/\//g,'$1="https://').replace(/(src|href)="\/(?!\/)/g,`$1="${AO}/`).replace(/<a /g,'<a target="_blank" rel="noopener" ');
const section=(h,re)=>{const p=h.split(re);if(p.length<3)return null;let s=p[2];const j=s.indexOf('<h2');if(j>=0)s=s.slice(0,j);return clean(s.replace(/^[\s\S]*?<\/h2>/,''))};

const tests={},sols={};
async function fetchTest(t){
  const f=path.join(CACHE,t.id+'.json');try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){}
  const page=await wb(t.page,t.ts,'id="Problem_1"'),key=await wb(t.page.replace('_Problems','_Answer_Key'),t.ts,'<li>');
  if(!page||!key)throw new Error('archive unavailable');
  const parts=page.split(/<h2[^>]*>\s*<span class="mw-headline" id="Problem_(\d+)"[^>]*>/),probs={};
  for(let i=1;i<parts.length;i+=2){const n=+parts[i];if(n>20)continue;let s=parts[i+1];const j=s.indexOf('<h2');if(j>=0)s=s.slice(0,j);probs[n]=clean(s.replace(/^[\s\S]*?<\/h2>/,''))}
  const ans=[...key.matchAll(/<li>\s*([A-E])\s*</g)].map(m=>m[1]);
  if(ans.length<20||Object.keys(probs).length<20)throw new Error('could not read '+t.id);
  const d={probs,ans};fs.writeFileSync(f,JSON.stringify(d));return d}
const loadTest=t=>tests[t.id]||=fetchTest(t).catch(e=>{delete tests[t.id];throw e});
async function fetchSol(p){
  const f=path.join(CACHE,p.id+'.sol.json'),url=`${AO}/wiki/index.php/${p.test.page}/Problem_${p.n}`;
  try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){}
  const h=await wb(`${p.test.page}/Problem_${p.n}`,p.test.ts,'id="Solution'),d={html:h&&section(h,/<h2[^>]*>\s*<span class="mw-headline" id="(Solution[^"]*)"[^>]*>/),url};
  if(d.html)fs.writeFileSync(f,JSON.stringify(d));return d}
async function solution(p){sols[p.id]||=fetchSol(p).catch(()=>({html:null}));const d=await sols[p.id];if(!d.html)delete sols[p.id];return d}

// With APP_PASSWORD set (the hosted copy), every page and API call needs the login cookie. Locally it stays open.
const PASS=process.env.APP_PASSWORD||'',TOKEN=PASS&&crypto.createHmac('sha256',PASS).update('amc10-practice').digest('hex'),
authed=req=>!PASS||(req.headers.cookie||'').split(/;\s*/).includes('amc='+TOKEN),
sha=s=>crypto.createHash('sha256').update(s).digest(),
LOGIN=e=>`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AMC 10 Practice</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f9;color:#141821;font:16px/1.5 system-ui,sans-serif}form{display:grid;gap:12px;width:min(320px,90vw)}h1{margin:0;font-size:22px}input,button{font:inherit;padding:12px;border-radius:10px;border:1px solid #dde2ea}button{border:0;background:#2b55c9;color:#fff;font-weight:600;cursor:pointer}p{margin:0;color:#c2372f}@media (prefers-color-scheme:dark){body{background:#0e1117;color:#e7eaf0}input{background:#161a22;color:#e7eaf0;border-color:#2a303b}button{background:#7f9dff;color:#0e1117}p{color:#ff7c72}}</style><form method="post" action="/login"><h1>AMC 10 Practice</h1><label for="p">Password</label><input id="p" name="p" type="password" autocomplete="current-password" required autofocus>${e?'<p>That password is not right.</p>':''}<button>Open</button></form></html>`;
if(!PASS&&process.env.RENDER){console.error('APP_PASSWORD is not set; refusing to start a public copy without it.');process.exit(1)}
const recent=[];
http.createServer(async(req,res)=>{
  const send=(c,type,body)=>{res.writeHead(c,{'content-type':type,'cache-control':'no-store'});res.end(body)},json=(o,c=200)=>send(c,'application/json',JSON.stringify(o));
  try{const u=new URL(req.url,'http://localhost');
    if(u.pathname=='/login'&&req.method=='POST'){let b='';for await(const c of req){b+=c;if(b.length>1e4)break}const p=new URLSearchParams(b).get('p')||'';
      if(PASS&&crypto.timingSafeEqual(sha(p),sha(PASS))){res.writeHead(303,{'set-cookie':`amc=${TOKEN}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${req.headers['x-forwarded-proto']=='https'?'; Secure':''}`,location:'/'});return res.end()}
      return send(401,'text/html; charset=utf-8',LOGIN(1))}
    if(!authed(req))return u.pathname.startsWith('/api/')?json({error:'locked'},401):send(200,'text/html; charset=utf-8',LOGIN(0));
    if(u.pathname=='/'||u.pathname=='/index.html')return send(200,'text/html; charset=utf-8',fs.readFileSync(path.join(DIR,'index.html')));
    if(/^\/(gen|app)\.js$/.test(u.pathname))return send(200,'text/javascript; charset=utf-8',fs.readFileSync(path.join(DIR,u.pathname.slice(1))));
    if(u.pathname=='/api/real'){
      const want=(u.searchParams.get('t')||'alg,geo,nt,cmb').split(','),ex=new Set((u.searchParams.get('x')||'').split(',')),all=POOL.filter(p=>want.includes(p.topic));
      let c=all.filter(p=>!ex.has(p.id)&&!recent.includes(p.id));if(!c.length)c=all.filter(p=>!ex.has(p.id));if(!c.length)c=all.filter(p=>!recent.includes(p.id));if(!c.length)c=all;if(!c.length)return json({error:'no problems for those topics'},400);
      for(let k=0;k<8;k++){const p=c[Math.floor(Math.random()*c.length)];
        try{const d=await loadTest(p.test);if(broken(d.probs[p.n]))continue;recent.push(p.id);if(recent.length>80)recent.shift();solution(p);
          return json(pj(p,d))}catch(e){}}
      return json({error:'archive unavailable'},502)}
    if(u.pathname=='/api/tests')return json(TESTS.map(t=>({id:t.id,name:t.name})));
    if(u.pathname=='/api/test'){
      const t=TESTS.find(t=>t.id==u.searchParams.get('id'))||TESTS[Math.floor(Math.random()*TESTS.length)],d=await loadTest(t);
      return json({id:t.id,name:t.name,qs:POOL.filter(p=>p.test==t).map(p=>(solution(p),pj(p,d)))})}
    if(u.pathname=='/api/problem'){const p=POOL.find(p=>p.id==u.searchParams.get('id'));return p?json(pj(p,await loadTest(p.test))):json({error:'unknown id'},404)}
    if(u.pathname=='/api/solution'){const p=POOL.find(p=>p.id==u.searchParams.get('id'));return p?json(await solution(p)):json({error:'unknown id'},404)}
    send(404,'text/plain','Not found')
  }catch(e){json({error:String(e.message||e)},500)}
}).listen(PORT,async()=>{
  console.log(`AMC 10 Practice on http://localhost:${PORT}`);
  for(const t of TESTS){try{await loadTest(t)}catch(e){console.log('skipped',t.id,e.message)}await sleep(800)}
  console.log('all tests cached')});
