// Question generators for Custom test and the formula and term drills.
const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),P=a=>a[R(0,a.length-1)],
gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a),lcm=(a,b)=>a/gcd(a,b)*b,
C=(n,k)=>{let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r)},
F=n=>n<2?1:n*F(n-1),
ng=v=>v<0?'−'+(-v):''+v,
fmt=v=>Number.isInteger(v)?(v<0?'−':'')+Math.abs(v).toLocaleString('en-US'):ng(+v.toFixed(2)),
money=x=>'$'+(Math.abs(x-Math.round(x))<1e-9?Math.round(x).toLocaleString('en-US'):x.toFixed(2)),
fr=(a,b)=>{const g=gcd(a,b),n=a/g,d=b/g;return{v:a/b,t:(n<0?'−':'')+Math.abs(n)+(d==1?'':'/'+d)}},
sg=v=>(v<0?'− ':'+ ')+Math.abs(v),
poly=(b,c)=>'<i>x</i>²'+(b?` ${b<0?'−':'+'} ${Math.abs(b)==1?'':Math.abs(b)}<i>x</i>`:'')+(c?' '+sg(c):''),
fac=e=>[2,3,5].map((p,i)=>e[i]?p+(e[i]>1?`<sup>${e[i]}</sup>`:''):'').filter(Boolean).join(' · '),
T=[[3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29]],
tri=()=>{const[x,y,z]=P(T),k=x>8?1:R(1,3);return[x*k,y*k,z*k]};
function mk(t,q,a,w,why,f=fmt){const N=x=>typeof x=='number'?{v:x,t:f(x)}:x,A=N(a),ch=[A],seen=new Set([A.t]),add=o=>{if(ch.length<5&&isFinite(o.v)&&!seen.has(o.t)){seen.add(o.t);ch.push(o)}};
w.forEach(x=>add(N(x)));for(let k=1;ch.length<5;k++)typeof a=='number'?(add(N(a+k)),add(N(a-k))):add(fr(k,36));
ch.sort((x,y)=>x.v-y.v);return{t,q,ch,a:ch.indexOf(A),why}}
const G={alg:[
()=>{const r=R(-5,7);let s=R(-5,7);while(s==r)s=R(-5,7);const S=r+s,p=r*s,a=S**3-3*p*S;
return mk('alg',`The roots of ${poly(-S,p)} = 0 are <i>r</i> and <i>s</i>. What is <i>r</i>³ + <i>s</i>³?`,a,[S**3+3*p*S,S**3,S**3-p*S,(S*S-2*p)*S,a+2*S],
`Use <i>r</i>³ + <i>s</i>³ = (<i>r</i> + <i>s</i>)³ − 3<i>rs</i>(<i>r</i> + <i>s</i>). By Vieta's formulas <i>r</i> + <i>s</i> = ${ng(S)} and <i>rs</i> = ${ng(p)}, so the answer is ${ng(S**3)} ${sg(-3*p*S)} = ${ng(a)}.`)},
()=>{const[a,b,c,t]=P([[3,6,4,4],[2,3,6,1.5],[4,6,12,3],[5,10,6,7.5],[6,12,8,8],[10,15,12,12],[4,12,6,6],[6,8,12,4.8]]),L=lcm(a,lcm(b,c)),u=L/a+L/b-L/c;
return mk('alg',`Pipe A fills a tank in ${a} hours and pipe B fills it in ${b} hours. A drain empties a full tank in ${c} hours. The tank starts empty with both pipes and the drain open. How many hours does it take to fill?`,t,[a+b-c,a*b/(a+b),(a+b+c)/3,t+1,2*t],
`Each hour the tank gains 1/${a} + 1/${b} − 1/${c} = ${L/a}/${L} + ${L/b}/${L} − ${L/c}/${L} = ${fr(u,L).t} of its volume. So it fills in ${fr(L,u).t} = ${fmt(t)} hours.`)},
()=>{const[u,v]=P([[30,60],[40,60],[20,30],[30,70],[36,45],[45,90],[24,40],[60,90]]),d=P([60,90,120,180]),a=2*u*v/(u+v);
return mk('alg',`Sam drives ${d} miles to a lake at ${u} mph and drives straight back along the same road at ${v} mph. What is his average speed for the whole trip, in mph?`,a,[(u+v)/2,Math.round(Math.sqrt(u*v)),a+5,a-5,(u+v)/2+5],
`Average speed is total distance over total time. The drive there takes ${d}/${u} = ${fmt(d/u)} hours and the drive back takes ${d}/${v} = ${fmt(d/v)} hours, so ${2*d} miles take ${fmt(d/u+d/v)} hours: ${2*d} ÷ ${fmt(d/u+d/v)} = ${fmt(a)} mph. The plain average of the two speeds, ${fmt((u+v)/2)}, is the trap.`)},
()=>{const a=R(2,5),b=R(1,6)*P([1,-1]),A=a*a,B=(a+1)*b,k=R(2,9);
return mk('alg',`A linear function <i>f</i>(<i>x</i>) = <i>ax</i> + <i>b</i> with <i>a</i> > 0 satisfies <i>f</i>(<i>f</i>(<i>x</i>)) = ${A}<i>x</i> ${sg(B)} for every <i>x</i>. What is <i>f</i>(${k})?`,a*k+b,[A*k+B,a*k-b,a*k+B,b-a*k,a*k+b+a],
`<i>f</i>(<i>f</i>(<i>x</i>)) = <i>a</i>(<i>ax</i> + <i>b</i>) + <i>b</i> = <i>a</i>²<i>x</i> + (<i>a</i> + 1)<i>b</i>. Matching ${A}<i>x</i> ${sg(B)} gives <i>a</i>² = ${A}, so <i>a</i> = ${a}, and ${a+1}<i>b</i> = ${ng(B)}, so <i>b</i> = ${ng(b)}. Then <i>f</i>(${k}) = ${a} × ${k} ${sg(b)} = ${ng(a*k+b)}.`)},
()=>{const[p,q]=P([[25,20],[100,50],[150,60],[300,75],[400,80],[60,37.5]]);
return mk('alg',`A stock's price rises ${p}%. By what percent must the new price fall to get back to the original price?`,q,[p,p/2,q+10,q-5,100-q],
`Say the original price is 100. After the rise it is ${100+p}. Getting back to 100 means dropping ${p} out of ${100+p}, which is ${p}/${100+p} = ${fmt(q)}% of the new price.`,v=>fmt(v)+'%')}],
geo:[
()=>{const[a,b,c]=tri(),r=(a+b-c)/2;
return mk('geo',`What is the radius of the circle inscribed in a right triangle with legs ${a} and ${b}?`,r,[c/2,a*b/c,(a+b)/4,r+1,2*r],
`The hypotenuse is √(${a}² + ${b}²) = ${c}. The inradius is the area divided by half the perimeter: area = ${fmt(a*b/2)} and half the perimeter = (${a} + ${b} + ${c}) ÷ 2 = ${fmt((a+b+c)/2)}, so <i>r</i> = ${fmt(a*b/2)} ÷ ${fmt((a+b+c)/2)} = ${fmt(r)}.`)},
()=>{const[a,b,c]=tri(),h=fr(a*b,c);
return mk('geo',`A right triangle has legs ${a} and ${b}. How long is the altitude from the right angle to the hypotenuse?`,h,[fr(c,2),fr(a+b,2),fr(a*b,2*c),fr(Math.min(a,b),1),fr(a*b+c,c),fr(a*b,a+b)],
`The hypotenuse is √(${a}² + ${b}²) = ${c}. Write the area two ways: ½ × ${a} × ${b} = ½ × ${c} × <i>h</i>. So <i>h</i> = ${a*b}/${c}${h.t==a*b+'/'+c?'':' = '+h.t}.`)},
()=>{let p,D;do{p=[0,0,0].map(()=>[R(-4,6),R(-4,6)]);D=p[0][0]*(p[1][1]-p[2][1])+p[1][0]*(p[2][1]-p[0][1])+p[2][0]*(p[0][1]-p[1][1])}while(Math.abs(D)<8);
const t=[p[0][0]*(p[1][1]-p[2][1]),p[1][0]*(p[2][1]-p[0][1]),p[2][0]*(p[0][1]-p[1][1])],A=Math.abs(D)/2,pt=q=>`(${ng(q[0])}, ${ng(q[1])})`;
return mk('geo',`What is the area of the triangle with vertices ${pt(p[0])}, ${pt(p[1])} and ${pt(p[2])}?`,A,[Math.abs(D),A+1,A-1,A+.5,A+2],
`Use the shoelace formula: area = ½|<i>x</i>₁(<i>y</i>₂ − <i>y</i>₃) + <i>x</i>₂(<i>y</i>₃ − <i>y</i>₁) + <i>x</i>₃(<i>y</i>₁ − <i>y</i>₂)| = ½|${ng(t[0])} ${sg(t[1])} ${sg(t[2])}| = ½ × ${Math.abs(D)} = ${fmt(A)}.`)},
()=>{const[x,y,z]=tri(),sw=Math.random()<.5,D=sw?y:x,H=sw?x:y;
return mk('geo',`A chord of a circle with radius ${z} is ${D} units from the center. How long is the chord?`,2*H,[H,2*z,z+D,2*(z-D),2*H+2],
`The perpendicular from the center to the chord bisects it, making a right triangle with hypotenuse ${z} (a radius) and one leg ${D}. The other leg is √(${z}² − ${D}²) = ${H}. That is half the chord, so the chord is ${2*H}.`)},
()=>{const[m,n]=P([[1,2],[2,3],[3,4],[1,3],[3,5],[4,5],[2,5]]),b=n*R(2,6),s=b*m/n;
return mk('geo',`A line parallel to the base of a triangle cuts off a smaller triangle at the top whose area is ${m*m}/${n*n} of the whole triangle's area. The base has length ${b}. How long is the part of the line inside the triangle?`,s,[b*m*m/(n*n),b/2,b-s,s+1,b*m/(n+1)],
`The small triangle is similar to the whole one. An area ratio of ${m*m}/${n*n} means a length ratio of √(${m*m}/${n*n}) = ${m}/${n}, so the segment is ${m}/${n} × ${b} = ${fmt(s)}.`)}],
nt:[
()=>{const e=[R(2,7),R(1,5),R(0,3)],N=2**e[0]*3**e[1]*5**e[2],a=e.reduce((s,x)=>s*(Math.floor(x/2)+1),1),all=e.reduce((s,x)=>s*(x+1),1);
return mk('nt',`How many positive divisors of ${fmt(N)} are perfect squares?`,a,[all,Math.floor(all/2),a+1,2*a,e.reduce((s,x)=>s*Math.ceil(x/2),1)],
`${fmt(N)} = ${fac(e)}. A divisor is a perfect square exactly when each of its exponents is even. ${[2,3,5].map((p,i)=>e[i]?`For ${p}, the even exponents from 0 to ${e[i]} give ${Math.floor(e[i]/2)+1} choices.`:'').filter(Boolean).join(' ')} Multiplying, there are ${a} square divisors.`)},
()=>{const m=P([7,9,11,13]);let b=R(2,6);while(gcd(b,m)>1)b=R(2,6);const e=R(50,2026),cy=[b%m];for(let x=b*b%m;x!=cy[0];x=x*b%m)cy.push(x);const L=cy.length,r=e%L,a=cy[(r+L-1)%L];
return mk('nt',`What is the remainder when ${b}<sup>${e}</sup> is divided by ${m}?`,a,[...cy,(a+1)%m,(m-a)%m,b],
`Powers of ${b} leave remainders ${cy.join(', ')} when divided by ${m}, and then the pattern repeats every ${L}. Since ${e} = ${L} × ${Math.floor(e/L)} + ${r}, ${b}<sup>${e}</sup> leaves the same remainder as ${b}<sup>${r||L}</sup>, which is ${a}.`)},
()=>{const a=R(1,6),b=R(1,4),N=2**a*3**b,s1=2**(a+1)-1,s2=(3**(b+1)-1)/2,S=s1*s2;
return mk('nt',`What is the sum of all positive divisors of ${fmt(N)}?`,S,[S-N,(a+1)*(b+1),N+1,S+N,s1+s2],
`${fmt(N)} = ${fac([a,b,0])}. Each divisor is a power of 2 times a power of 3, so the sum factors: (1 + 2 + ⋯ + 2<sup>${a}</sup>)(1 + 3 + ⋯ + 3<sup>${b}</sup>) = ${s1} × ${s2} = ${fmt(S)}.`)},
()=>{const[m,n]=P([[3,5],[4,7],[5,6],[7,9],[8,9],[5,7],[4,9],[6,7]]),a=R(1,m-1),b=R(1,n-1);let x=a;while(x%n!=b)x+=m;const l=[];for(let y=a;y<=x;y+=m)l.push(y);
return mk('nt',`What is the smallest positive integer that leaves a remainder of ${a} when divided by ${m} and a remainder of ${b} when divided by ${n}?`,x,[x+m*n,x+m,x>m?x-m:x+2*m,a*n+b,m*n-x],
`The numbers with remainder ${a} when divided by ${m} are ${l.slice(0,9).join(', ')}${l.length>9?', …':''}. Checking each one against ${n}, the first with remainder ${b} is ${x}.`)},
()=>{const ex=[R(1,4),R(1,3),R(0,2)],ax=ex.map(x=>R(0,x));if(!ax.some(Boolean))ax[0]=1;const L=2**ex[0]*3**ex[1]*5**ex[2],A=2**ax[0]*3**ax[1]*5**ax[2],per=ex.map((x,i)=>ax[i]<x?1:x+1),a=per.reduce((s,v)=>s*v,1);
return mk('nt',`How many positive integers <i>n</i> satisfy lcm(<i>n</i>, ${fmt(A)}) = ${fmt(L)}?`,a,[a+1,2*a,ex.reduce((s,x)=>s*(x+1),1),Math.max(1,a-1),a+2],
`${fmt(L)} = ${fac(ex)}, so <i>n</i> has no other prime factors, and for each prime the larger of the two exponents must match. ${[2,3,5].map((p,i)=>!ex[i]?'':ax[i]<ex[i]?`${fmt(A)} has fewer factors of ${p}, so <i>n</i> must have exactly ${p}<sup>${ex[i]}</sup> (1 choice).`:`${fmt(A)} already has ${p}<sup>${ex[i]}</sup>, so <i>n</i> can have any power of ${p} from 0 to ${ex[i]} (${ex[i]+1} choices).`).filter(Boolean).join(' ')} Multiplying gives ${a}.`)}],
cmb:[
()=>{const n=R(5,8),tog=Math.random()<.5,t=2*F(n-1),a=tog?t:F(n)-t;
return mk('cmb',`In how many ways can ${n} friends, including Ava and Ben, sit in a row of ${n} chairs if Ava and Ben ${tog?'must':'must not'} sit next to each other?`,a,[tog?F(n)-t:t,F(n-1),F(n),tog?t*(n-1):F(n)-F(n-1),a/2],
tog?`Glue Ava and Ben into one block. Then ${n-1} things are arranged in ${n-1}! = ${fmt(F(n-1))} ways, and the pair sits in 2 orders, giving 2 × ${fmt(F(n-1))} = ${fmt(t)}.`:`There are ${n}! = ${fmt(F(n))} seatings in all. In 2 × ${n-1}! = ${fmt(t)} of them Ava and Ben are side by side (treat them as one block, then order the pair). So ${fmt(F(n))} − ${fmt(t)} = ${fmt(a)} keep them apart.`)},
()=>{const n=R(4,8),tot=2**n,a=fr(tot-1-n,tot);
return mk('cmb',`A fair coin is flipped ${n} times. What is the probability of getting at least two heads?`,a,[fr(C(n,2),tot),fr(tot-1,tot),fr(tot-n,tot),fr(1,2),fr(tot-2-n,tot),fr(n-1,n)],
`Count the opposite: no heads (1 way) or exactly one head (${n} ways). So ${tot} − 1 − ${n} = ${tot-1-n} of the ${tot} equally likely outcomes have at least two heads, and the probability is ${tot-1-n}/${tot}${a.t==(tot-1-n)+'/'+tot?'':' = '+a.t}.`)},
()=>{const x=R(3,6),y=R(3,6),p=R(1,x-1),q=R(1,y-1),all=C(x+y,x),u=C(p+q,p),v=C(x-p+y-q,x-p),a=all-u*v;
return mk('cmb',`A path from (0, 0) to (${x}, ${y}) moves one unit right or one unit up at each step. How many such paths avoid the point (${p}, ${q})?`,a,[all,u*v,all-u,a+1,C(x+y-1,x)],
`All paths: C(${x+y}, ${x}) = ${all}. Paths through (${p}, ${q}): C(${p+q}, ${p}) = ${u} ways to get there times C(${x-p+y-q}, ${x-p}) = ${v} ways to finish, so ${u*v}. Subtract: ${all} − ${u*v} = ${a}.`)},
()=>{const b=R(4,8),g=R(3,6),k=R(3,4),a=C(b+g,k)-C(b,k);
return mk('cmb',`A committee of ${k} is chosen from ${b} boys and ${g} girls. How many possible committees include at least one girl?`,a,[C(b+g,k),g*C(b+g-1,k-1),C(b+g,k)-C(g,k),C(b,k),a-g],
`Count all committees and remove the all-boy ones: C(${b+g}, ${k}) − C(${b}, ${k}) = ${C(b+g,k)} − ${C(b,k)} = ${a}. Choosing one girl first and then any ${k-1} others counts some committees more than once, which is the usual trap.`)},
()=>{const N=R(8,20),pos=Math.random()<.5,a=pos?C(N-1,2):C(N+2,2);
return mk('cmb',`How many ordered triples of ${pos?'positive':'nonnegative'} integers (<i>a</i>, <i>b</i>, <i>c</i>) satisfy <i>a</i> + <i>b</i> + <i>c</i> = ${N}?`,a,[pos?C(N+2,2):C(N-1,2),C(N,2),C(N+1,2),C(N,3),a+N],
pos?`Line up ${N} stars. Putting 2 bars into the ${N-1} gaps between stars splits them into three positive parts, so there are C(${N-1}, 2) = ${a} triples.`:`Line up ${N} stars and 2 bars in ${N+2} spots. Each arrangement splits the stars into three parts, some possibly empty, so there are C(${N+2}, 2) = ${a} triples.`)}]};
const X={
vieta2:()=>{const r=R(-6,9);let s=R(-6,9);while(s==r)s=R(-6,9);const S=r+s,p=r*s,a=S*S-2*p;
return mk('alg',`The two roots of ${poly(-S,p)} = 0 are <i>r</i> and <i>s</i>. What is <i>r</i>² + <i>s</i>²?`,a,[S*S+2*p,S*S,S*S-p,2*Math.abs(S),Math.abs(p)],
`By Vieta's formulas, <i>r</i> + <i>s</i> = ${ng(S)} and <i>rs</i> = ${ng(p)}. Then <i>r</i>² + <i>s</i>² = (<i>r</i> + <i>s</i>)² − 2<i>rs</i> = ${S*S} ${sg(-2*p)} = ${a}.`)},
series:()=>{const a=R(1,9),d=R(2,7),c=R(10,30),l=a+(c-1)*d,S=c*(a+l)/2;
return mk('alg',`An arithmetic sequence starts at ${a}, and each term is ${d} more than the one before it. What is the sum of the first ${c} terms?`,S,[c*(a+l),c*l,S-l,S+l+d,c*(a+l+d)/2],
`Term ${c} is ${a} + ${c-1} × ${d} = ${l}. The sum is the number of terms times the average of the first and last terms: ${c} × (${a} + ${l}) ÷ 2 = ${fmt(S)}.`)},
pct:()=>{const p=P([10,20,25,40,50]),q=P([10,20,25,40,50]),v=P([80,120,160,200,240]),u=1+p/100,w=1-q/100,a=v*u*w;
return mk('alg',`A jacket costs $${v}. Its price rises ${p}%, and then the new price drops ${q}%. What is the final price?`,a,[v*(1+(p-q)/100),v,v*u,v*w,a+10],
`Percent changes multiply. A ${p}% rise multiplies the price by ${u} and a ${q}% drop multiplies it by ${w}: ${money(v)} × ${u} × ${w} = ${money(a)}. Treating it as one change of ${ng(p-q)}% is the usual trap.`,money)},
mean:()=>{const c=R(4,9),k=R(1,3),m=R(60,98-(c+1)*k),a=m+(c+1)*k;
return mk('alg',`The mean of Mia's first ${c} quiz scores is ${m}. After one more quiz, her mean is ${m+k}. What did she score on that quiz?`,a,[m+k,m+c*k,m+(c+2)*k,m+2*k,a+c],
`Before the quiz her scores total ${c} × ${m} = ${c*m}. After it they total ${c+1} × ${m+k} = ${(c+1)*(m+k)}. The new score is the difference: ${a}.`)},
hyp:()=>{const[a,b,c]=tri(),[A,B]=Math.random()<.5?[a,b]:[b,a];
return mk('geo',`A right triangle has a leg of length ${A} and a hypotenuse of length ${c}. What is its area?`,A*B/2,[A*B,A*c/2,B*c/2,A*B/2+A,(A+B)*2],
`The other leg is √(${c}² − ${A}²) = √${c*c-A*A} = ${B}. The two legs are a base and its height, so the area is ½ × ${A} × ${B} = ${fmt(A*B/2)}.`)},
dist:()=>{const[x,y,z]=P(T.slice(0,4)),k=x>5?1:R(1,2),u=R(-5,5),v=R(-5,5),sw=Math.random()<.5,dx=(sw?y:x)*k*P([1,-1]),dy=(sw?x:y)*k*P([1,-1]);
return mk('geo',`What is the distance between the points (${ng(u)}, ${ng(v)}) and (${ng(u+dx)}, ${ng(v+dy)})?`,z*k,[(x+y)*k,z*k+1,z*k-1,Math.abs(dx+dy),2*z*k],
`The points are ${Math.abs(dx)} apart left to right and ${Math.abs(dy)} apart up and down. By the Pythagorean theorem the distance is √(${Math.abs(dx)}² + ${Math.abs(dy)}²) = √${z*z*k*k} = ${z*k}.`)},
pgon:()=>{const s=P([5,6,8,9,10,12,15,18,20,24,30,36]),X=180-360/s;
return mk('geo',`Each interior angle of a regular polygon measures ${X}°. How many sides does the polygon have?`,s,[s+1,s-1,s+2,s*2,Math.round(X/10)],
`Each exterior angle is 180° − ${X}° = ${180-X}°. A polygon's exterior angles add up to 360°, so it has 360 ÷ ${180-X} = ${s} sides.`)},
circ:()=>{const r=R(2,12);
return mk('geo',`A circle has area ${r*r}π. What is its circumference?`,2*r,[r,4*r,r*r,2*r*r,r+2],
`Area = π<i>r</i>² = ${r*r}π, so <i>r</i>² = ${r*r} and <i>r</i> = ${r}. Circumference = 2π<i>r</i> = ${2*r}π.`,v=>fmt(v)+'π')},
div:()=>{const e=[R(1,5),R(0,3),R(0,2)],N=2**e[0]*3**e[1]*5**e[2],a=(e[0]+1)*(e[1]+1)*(e[2]+1);
return mk('nt',`How many positive divisors does ${fmt(N)} have?`,a,[e[0]+e[1]+e[2],a-1,a+1,e[0]+e[1]+e[2]+3,2*a],
`${fmt(N)} = ${fac(e)}. A divisor chooses each prime's exponent from 0 up to its full power, so there are ${e.filter(Boolean).map(x=>`(${x} + 1)`).join(' × ')} = ${a} divisors.`)},
zeros:()=>{const m=R(25,250),a=[5,25,125].map(p=>Math.floor(m/p)),z=a[0]+a[1]+a[2];
return mk('nt',`How many zeros are at the end of ${m}!, the product 1 × 2 × 3 × ⋯ × ${m}?`,z,[a[0],Math.floor(m/10),z+1,z-1,a[0]+a[1]+2*a[2]],
`Each zero at the end comes from a factor of 10 = 2 × 5, and factors of 5 are the scarcer kind. Count them: ⌊${m}/5⌋ + ⌊${m}/25⌋ + ⌊${m}/125⌋ = ${a.join(' + ')} = ${z}.`)},
units:()=>{const b=R(2,9),e=R(20,2026),cy=[b%10];for(let x=b*b%10;x!=cy[0];x=x*b%10)cy.push(x);const L=cy.length,r=e%L,a=cy[(r+L-1)%L];
return mk('nt',`What is the units digit of ${b}<sup>${e}</sup>?`,a,[...cy,b,(a+5)%10,(a+1)%10,9-a],
`The units digits of ${b}, ${b}², ${b}³, … repeat in a cycle of length ${L}: ${cy.join(', ')}. Since ${e} = ${L} × ${Math.floor(e/L)} + ${r}, ${b}<sup>${e}</sup> ends the same way as ${b}<sup>${r||L}</sup>, which ends in ${a}.`)},
base:()=>{const B=R(3,9),d=[R(1,B-1),R(0,B-1),R(0,B-1)],v=d[0]*B*B+d[1]*B+d[2];
return mk('nt',`What is the base-${B} number ${d.join('')}<sub>${B}</sub> written in base 10?`,v,[d[0]*100+d[1]*10+d[2],d[2]*B*B+d[1]*B+d[0],v+B,d[0]*B+d[1]+d[2],v-1],
`In base ${B} the three places are worth ${B*B}, ${B} and 1. So ${d[0]} × ${B*B} + ${d[1]} × ${B} + ${d[2]} = ${v}.`)},
comm:()=>{const b=R(4,9),g=R(4,9),i=R(1,3),j=R(1,3),a=C(b,i)*C(g,j),pl=(k,s)=>k+' '+s+(k>1?'s':'');
return mk('cmb',`A club has ${b} boys and ${g} girls. How many ways can it pick a team of ${pl(i,'boy')} and ${pl(j,'girl')}?`,a,[C(b+g,i+j),C(b,i)+C(g,j),a*2,C(b,i)*F(i)*C(g,j)*F(j),b*g],
`Pick the boys in C(${b}, ${i}) = ${C(b,i)} ways and the girls in C(${g}, ${j}) = ${C(g,j)} ways. Any group of boys can go with any group of girls, so multiply: ${C(b,i)} × ${C(g,j)} = ${fmt(a)}.`)},
word:()=>{const w=P(['LEVEL','BANANA','PEPPER','LETTER','COOKIE','STREET','PIZZA','TATTOO','BALLOON','COFFEE','GEOMETRY','ALGEBRA']),c={};for(const h of w)c[h]=(c[h]||0)+1;const rep=Object.entries(c).filter(e=>e[1]>1),den=rep.reduce((s,e)=>s*F(e[1]),1),a=F(w.length)/den;
return mk('cmb',`How many different arrangements are there of the letters in ${w}?`,a,[F(w.length),F(w.length)/2,a*2,a/2,a*3],
`${w} has ${w.length} letters, and ${rep.map(([k,v])=>`${k} appears ${v} times`).join(', ')}. Swapping identical letters gives the same word, so divide ${w.length}! by the factorial of each repeat count: ${fmt(F(w.length))} ÷ ${den} = ${fmt(a)}.`)},
comp:()=>{const L=P([3,4]),d=R(1,9),t=9*10**(L-1),o=8*9**(L-1),a=t-o;
return mk('cmb',`How many ${L}-digit positive integers have at least one digit equal to ${d}?`,a,[o,t-9**L,L*9**(L-1),a+10**(L-1),a-9**(L-2)],
`There are ${fmt(t)} ${L}-digit numbers. Count the ones with no ${d}: the first digit has 8 choices (not 0 and not ${d}) and each other digit has 9, giving 8 × 9<sup>${L-1}</sup> = ${fmt(o)}. All the rest have at least one ${d}: ${fmt(t)} − ${fmt(o)} = ${fmt(a)}.`)},
incl:()=>{const[p,q]=P([[3,5],[4,6],[2,7],[6,9],[4,10],[5,8],[3,7],[6,8]]),N=R(5,30)*10,l=lcm(p,q),x=Math.floor(N/p),y=Math.floor(N/q),z=Math.floor(N/l),a=x+y-z;
return mk('cmb',`How many integers from 1 to ${N} are divisible by ${p} or by ${q}?`,a,[x+y,x+y-2*z,N-a,z,a+1],
`There are ⌊${N}/${p}⌋ = ${x} multiples of ${p} and ⌊${N}/${q}⌋ = ${y} multiples of ${q}. Numbers divisible by both are the multiples of lcm(${p}, ${q}) = ${l}; there are ${z} of them and they were counted twice. So the count is ${x} + ${y} − ${z} = ${a}.`)},
dice:()=>{const s=R(2,12),w=6-Math.abs(s-7),pr=[];for(let x=1;x<=6;x++){const y=s-x;if(y>=1&&y<=6)pr.push(`(${x}, ${y})`)}
return mk('cmb',`Two fair six-sided dice are rolled. What is the probability that the numbers add up to ${s}?`,fr(w,36),[fr(w,11),fr(w+1,36),fr(w+2,36),fr(w,12),fr(1,6),fr(1,36),fr(w+3,36)],
`There are 6 × 6 = 36 equally likely rolls. A sum of ${s} comes from ${pr.join(', ')}: ${w} roll${w>1?'s':''}. So the probability is ${w}/36${gcd(w,36)>1?' = '+fr(w,36).t:''}.`)},
median:()=>{const n=P([7,8,9,10]),a=Array.from({length:n},()=>R(1,40)),s=[...a].sort((x,y)=>x-y),m=n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2;
return mk('alg',`What is the median of ${a.join(', ')}?`,m,[a.reduce((x,y)=>x+y,0)/n,s[Math.floor(n/2)+1],a[Math.floor(n/2)],s[Math.floor(n/2)-1],m+1],
`Sort the ${n} numbers: ${s.join(', ')}. ${n%2?`The middle one, number ${(n+1)/2} in the sorted list, is ${m}.`:`With an even count, the median is the average of the two middle numbers: (${s[n/2-1]} + ${s[n/2]}) ÷ 2 = ${fmt(m)}.`}`)},
modr:()=>{const m=R(3,15),o=[];while(o.length<5){const v=R(1,25);if(v!=m&&!o.includes(v))o.push(v)}const a=[m,m,m,...o,o[0]].sort(()=>Math.random()-.5),hi=Math.max(...a),lo=Math.min(...a),r=hi-lo;
return mk('alg',`For the list ${a.join(', ')}, what is the range plus the mode?`,r+m,[r,m+hi,r+o[0],hi+lo,r+m+1],
`The range is the largest minus the smallest: ${hi} − ${lo} = ${r}. The mode is the value that appears most often: ${m}, which appears 3 times. So ${r} + ${m} = ${r+m}.`)},
prime:()=>{const a=R(10,80),b=a+R(20,40),pr=[];for(let x=a;x<=b;x++){let p=true;for(let d=2;d*d<=x;d++)if(x%d==0){p=false;break}if(p)pr.push(x)}
return mk('nt',`How many prime numbers are there from ${a} to ${b}, inclusive?`,pr.length,[pr.length+1,pr.length-1,pr.length+2,Math.round((b-a)/2),pr.length+3],
`A prime has exactly two positive divisors, 1 and itself. Checking each number from ${a} to ${b} finds ${pr.join(', ')}: ${pr.length} primes.`)},
coprime:()=>{const n=P([12,15,18,20,21,24,28,30,36,40,42,45]),c=[];for(let k=1;k<=n;k++)if(gcd(k,n)==1)c.push(k);const ps=[2,3,5,7].filter(p=>n%p==0);
return mk('nt',`How many integers from 1 to ${n} are relatively prime to ${n}?`,c.length,[n-c.length,n/2,c.length+2,c.length-2,c.length+4],
`Two numbers are relatively prime when their greatest common divisor is 1. The primes dividing ${n} are ${ps.join(', ').replace(/, (\d+)$/,' and $1')}, so remove every multiple of them: ${n} × ${ps.map(p=>`(1 − 1/${p})`).join(' × ')} = ${c.length}.`)},
square:()=>{const a=R(10,200),b=a+R(100,600),lo=Math.ceil(Math.sqrt(a)),hi=Math.floor(Math.sqrt(b)),c=hi-lo+1;
return mk('nt',`How many perfect squares are there from ${a} to ${b}, inclusive?`,c,[c+1,c-1,hi,lo,c+2],
`A perfect square is an integer times itself. The smallest square at least ${a} is ${lo}² = ${lo*lo}, and the largest square at most ${b} is ${hi}² = ${hi*hi}. So the squares are ${lo}² through ${hi}²: ${hi} − ${lo} + 1 = ${c} of them.`)},
lattice:()=>{const g=R(2,12);let x,y;do{x=R(1,9);y=R(1,9)}while(gcd(x,y)>1);const a=g*x,b=g*y;
return mk('geo',`How many lattice points lie on the line segment from (0, 0) to (${a}, ${b}), counting both endpoints?`,g+1,[g,g+2,a+b,Math.min(a,b)+1,2*g+1],
`A lattice point has integer coordinates. Since gcd(${a}, ${b}) = ${g}, the segment steps from lattice point to lattice point by (${x}, ${y}). That takes ${g} steps, so there are ${g} + 1 = ${g+1} lattice points.`)},
arith:()=>{const a=R(-10,20),d=R(2,9)*P([1,-1]),m=R(2,6),n=m+R(3,8),k=n+R(5,30),am=a+(m-1)*d,an=a+(n-1)*d,ak=a+(k-1)*d;
return mk('alg',`In an arithmetic sequence, term ${m} is ${ng(am)} and term ${n} is ${ng(an)}. What is term ${k}?`,ak,[ak+d,ak-d,ak+2*d,an+k-n,Math.round(an*k/n)],
`Terms ${m} and ${n} are ${n-m} steps apart, so the common difference is (${ng(an)} − (${ng(am)})) ÷ ${n-m} = ${ng(d)}. Term ${k} is ${k-n} steps after term ${n}: ${ng(an)} + ${k-n} × (${ng(d)}) = ${ng(ak)}.`)},
geom:()=>{const a=R(1,5),r=P([2,3,-2,-3]),k=R(5,8),t2=a*r,t4=a*r**3,ak=a*r**(k-1);
return mk('alg',`In a geometric sequence, the second term is ${ng(t2)}, the fourth term is ${ng(t4)}, and the common ratio is ${r>0?'positive':'negative'}. What is term ${k}?`,ak,[-ak,ak*r,ak/r,a*r*k,t4+(k-4)*(t4-t2)/2],
`From term 2 to term 4 the sequence is multiplied by the ratio twice, so <i>r</i>² = ${ng(t4)} ÷ ${ng(t2)} = ${r*r} and <i>r</i> = ${ng(r)}. Term ${k} = term 4 × <i>r</i><sup>${k-4}</sup> = ${ng(t4)} × ${ng(r**(k-4))} = ${fmt(ak)}.`)},
ev:()=>{const W=R(2,9),c=R(1,4),S=P([[6],[5,6],[4,5,6],[1,2],[2,4,6]]),k=S.length,num=k*W-(6-k)*c,a=fr(num,6);
return mk('cmb',`You roll a fair six-sided die. If it shows ${k==1?S[0]:S.slice(0,-1).join(', ')+' or '+S[k-1]}, you win $${W}. Otherwise you lose $${c}. What is your expected gain per roll, in dollars?`,a,[fr(k*W,6),fr(W-c,2),fr(k*W-c,6),fr(-num,6),fr(W,6),fr(num,36)],
`Expected value adds each outcome times its probability. You win $${W} with probability ${fr(k,6).t} and lose $${c} with probability ${fr(6-k,6).t}: ${fr(k,6).t} × ${W} − ${fr(6-k,6).t} × ${c} = ${a.t}.`)},
recip:()=>{const k=R(3,9),cube=Math.random()<.5,a=cube?k**3-3*k:k*k-2;
return mk('alg',`A real number <i>x</i> satisfies <i>x</i> + 1/<i>x</i> = ${k}. What is <i>x</i>${cube?'³':'²'} + 1/<i>x</i>${cube?'³':'²'}?`,a,cube?[k**3,k**3+3*k,k**3-k,a-1]:[k*k,k*k+2,2*k,k*k-1],
cube?`Cube both sides: (<i>x</i> + 1/<i>x</i>)³ = <i>x</i>³ + 1/<i>x</i>³ + 3(<i>x</i> + 1/<i>x</i>). So ${k**3} = <i>x</i>³ + 1/<i>x</i>³ + 3 × ${k}, which gives ${k**3} − ${3*k} = ${a}.`:`Square both sides: (<i>x</i> + 1/<i>x</i>)² = <i>x</i>² + 2 + 1/<i>x</i>². So ${k*k} = <i>x</i>² + 1/<i>x</i>² + 2, which gives ${a}.`)},
sang:()=>{const sup=Math.random()<.5,tot=sup?180:90,m=R(2,3),x=R(8,Math.floor((tot-5)/(m+1))),s=tot-(m+1)*x,big=m*x+s;
return mk('geo',`Two angles are ${sup?'supplementary':'complementary'}. The larger one is ${s}° more than ${m} times the smaller one. What is the larger angle?`,big,[x,m*x,(sup?90:180)-x,tot-s,s+x],
`${sup?'Supplementary':'Complementary'} angles add up to ${tot}°. With the smaller angle <i>x</i>: <i>x</i> + (${m}<i>x</i> + ${s}) = ${tot}, so ${m+1}<i>x</i> = ${tot-s} and <i>x</i> = ${x}. The larger angle is ${m} × ${x} + ${s} = ${big}°.`,v=>fmt(v)+'°')}};
const REF=[
['f','alg',"Vieta's formulas",'For <i>x</i>² − <i>Sx</i> + <i>P</i> = 0, the roots satisfy <i>r</i> + <i>s</i> = <i>S</i> and <i>rs</i> = <i>P</i>',[X.vieta2,G.alg[0]]],
['f','alg','Arithmetic series','Sum = number of terms × (first + last) ÷ 2',[X.series]],
['f','alg','Work rates','Rates add: 1/<i>T</i> = 1/<i>a</i> + 1/<i>b</i> − 1/<i>c</i>',[G.alg[1]]],
['f','alg','Average speed','Total distance ÷ total time; there and back at <i>u</i> and <i>v</i>, it is 2<i>uv</i>/(<i>u</i> + <i>v</i>)',[G.alg[2]]],
['f','alg','Percent change','Changes multiply: up <i>p</i>% is ×(1 + <i>p</i>/100), down <i>q</i>% is ×(1 − <i>q</i>/100)',[X.pct,G.alg[4]]],
['f','geo','Pythagorean theorem','<i>a</i>² + <i>b</i>² = <i>c</i>²; know 3-4-5, 5-12-13, 8-15-17 and 7-24-25',[X.hyp,X.dist]],
['f','geo','Polygon angles','Interior angles add to 180(<i>n</i> − 2)°; exterior angles add to 360°',[X.pgon]],
['f','geo','Circle area and circumference','Area = π<i>r</i>², circumference = 2π<i>r</i>',[X.circ]],
['f','geo','Chords','(half the chord)² + (distance to the center)² = radius²',[G.geo[3]]],
['f','geo','Similar figures','Lengths scale by <i>k</i>, areas by <i>k</i>²',[G.geo[4]]],
['f','geo','Inradius','<i>r</i> = area ÷ semiperimeter; in a right triangle <i>r</i> = (<i>a</i> + <i>b</i> − <i>c</i>)/2',[G.geo[0]]],
['f','geo','Altitude to the hypotenuse','<i>h</i> = <i>ab</i>/<i>c</i>',[G.geo[1]]],
['f','geo','Shoelace formula','Area = ½|<i>x</i>₁(<i>y</i>₂ − <i>y</i>₃) + <i>x</i>₂(<i>y</i>₃ − <i>y</i>₁) + <i>x</i>₃(<i>y</i>₁ − <i>y</i>₂)|',[G.geo[2]]],
['f','nt','Number of divisors','<i>p</i><sup><i>a</i></sup><i>q</i><sup><i>b</i></sup> has (<i>a</i> + 1)(<i>b</i> + 1) divisors',[X.div,G.nt[0]]],
['f','nt','Sum of divisors','(1 + <i>p</i> + ⋯ + <i>p</i><sup><i>a</i></sup>)(1 + <i>q</i> + ⋯ + <i>q</i><sup><i>b</i></sup>)',[G.nt[2]]],
['f','nt','Zeros at the end of n!','⌊<i>n</i>/5⌋ + ⌊<i>n</i>/25⌋ + ⌊<i>n</i>/125⌋ + ⋯',[X.zeros]],
['f','nt','Remainder cycles','Powers repeat their remainders, so divide the exponent by the cycle length',[X.units,G.nt[1]]],
['f','nt','Chinese remainder theorem','Remainders by coprime <i>m</i> and <i>n</i> pin down one number below <i>mn</i>',[G.nt[3]]],
['f','nt','GCD and LCM','gcd takes the smaller power of each prime, lcm the larger',[G.nt[4]]],
['f','nt','Base b place value','<i>d</i>₂<i>d</i>₁<i>d</i>₀ in base <i>b</i> = <i>d</i>₂<i>b</i>² + <i>d</i>₁<i>b</i> + <i>d</i>₀',[X.base]],
['f','cmb','Combinations','C(<i>n</i>, <i>k</i>) = <i>n</i>! ÷ (<i>k</i>!(<i>n</i> − <i>k</i>)!)',[X.comm,G.cmb[3]]],
['f','cmb','Arrangements with repeats','<i>n</i>! ÷ (<i>a</i>! <i>b</i>! ⋯) when letters repeat <i>a</i>, <i>b</i>, … times',[X.word]],
['f','cmb','Keeping people together','Glue them into one block: (<i>n</i> − 1)! × 2',[G.cmb[0]]],
['f','cmb','Grid paths','C(<i>m</i> + <i>n</i>, <i>m</i>) right-and-up paths reach (<i>m</i>, <i>n</i>)',[G.cmb[2]]],
['f','cmb','Stars and bars','<i>a</i> + <i>b</i> + <i>c</i> = <i>N</i> has C(<i>N</i> + 2, 2) nonnegative solutions',[G.cmb[4]]],
['f','cmb','Complementary counting','Count what you do not want, then subtract it from the total',[X.comp,G.cmb[1]]],
['f','cmb','Inclusion–exclusion','|<i>A</i> ∪ <i>B</i>| = |<i>A</i>| + |<i>B</i>| − |<i>A</i> ∩ <i>B</i>|',[X.incl]],
['f','cmb','Equally likely outcomes','Probability = favorable outcomes ÷ total outcomes (36 for two dice)',[X.dice]],
['t','alg','Mean','The sum of the numbers divided by how many there are',[X.mean]],
['t','alg','Median','The middle number once the list is sorted; with an even count, the average of the two middle numbers',[X.median]],
['t','alg','Mode and range','Mode: the value that appears most often. Range: the largest minus the smallest',[X.modr]],
['t','nt','Prime number','An integer greater than 1 whose only positive divisors are 1 and itself',[X.prime]],
['t','nt','Relatively prime','Two integers whose greatest common divisor is 1',[X.coprime]],
['t','nt','Perfect square','An integer equal to some integer times itself, like 49 = 7²',[X.square]],
['t','geo','Lattice point','A point whose coordinates are both integers',[X.lattice]],
['t','alg','Arithmetic sequence','Each term adds the same difference <i>d</i>: <i>a</i><sub><i>n</i></sub> = <i>a</i>₁ + (<i>n</i> − 1)<i>d</i>',[X.arith]],
['t','alg','Geometric sequence','Each term multiplies by the same ratio <i>r</i>: <i>a</i><sub><i>n</i></sub> = <i>a</i>₁<i>r</i><sup><i>n</i>−1</sup>',[X.geom]],
['t','cmb','Expected value','The long-run average: add each outcome times its probability',[X.ev]],
['t','alg','Reciprocal','The reciprocal of <i>x</i> is 1/<i>x</i>; a number times its reciprocal is 1',[X.recip]],
['t','geo','Complementary and supplementary angles','Complementary angles add to 90°; supplementary angles add to 180°',[X.sang]]];
