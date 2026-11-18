/* =====================================================================
   Тренажёр · 8 класс · Геометрия · Подобные треугольники
   По задачам 657–671 учебника. 40 вариантов × 8 заданий.
   Типы: dec (число), mc (да/нет), frac (отношение a:b).
   После выполнения — подробное решение с чертежом SVG и пошаговым решением.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

function fmt(n){
  if(n===null||!isFinite(n))return "—";
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  return n.toFixed(2).replace(".",",");
}
function fmtF(n){
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  for(var d=2;d<=20;d++){
    var num=Math.round(n*d);
    if(Math.abs(num/d-n)<1e-6)return num+"/"+d;
  }
  return n.toFixed(2).replace(".",",");
}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число, округлите до сотых)</span>";
var NOTE_FR=" <span style='color:var(--mute);font-size:14px'>(ответ — отношение вида a:b или a/b)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,unit:opts.unit||"",sol:opts.sol,atext:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,hint:opts.hint||"",detailed:opts.detailed||""};
}

/* ---------- SVG: треугольник с подписями ---------- */
function svgTriangle(pts,labels,extra){
  var W=300,H=260,pad=40;
  var minX=Math.min.apply(null,pts.map(function(p){return p[0]}));
  var maxX=Math.max.apply(null,pts.map(function(p){return p[0]}));
  var minY=Math.min.apply(null,pts.map(function(p){return p[1]}));
  var maxY=Math.max.apply(null,pts.map(function(p){return p[1]}));
  var sx=function(x){return pad+(x-minX)/(maxX-minX+0.01)*(W-2*pad);};
  var sy=function(y){return pad+(maxY-y)/(maxY-minY+0.01)*(H-2*pad);};
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto'>";
  var polyPts=pts.map(function(p){return sx(p[0]).toFixed(1)+","+sy(p[1]).toFixed(1);}).join(" ");
  h+="<polygon points='"+polyPts+"' fill='rgba(47,111,208,.08)' stroke='var(--ink)' stroke-width='2'/>";
  for(var i=0;i<pts.length;i++){
    var px=sx(pts[i][0]),py=sy(pts[i][1]);
    h+="<circle cx='"+px.toFixed(1)+"' cy='"+py.toFixed(1)+"' r='3' fill='var(--ink)'/>";
    if(labels&&labels[i]){
      h+="<text x='"+(px+ (i===0?-15:i===1?8:-15)).toFixed(0)+"' y='"+(py+(i===2?18:-8)).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='600' text-anchor='middle'>"+labels[i]+"</text>";
    }
  }
  if(extra)h+=extra;
  h+="</svg>";
  return h;
}

/* ---------- SVG: трапеция с диагоналями ---------- */
function svgTrapezoid(ab,cd,height,labels){
  var W=320,H=240,pad=40;
  var topY=height,botY=0;
  var cx=(ab+cd)/2;
  var A=[-ab/2,topY],B=[ab/2,topY],C=[cd/2,botY],D=[-cd/2,botY];
  var pts=[A,B,C,D];
  var minX=-cd/2-10,maxX=cd/2+10,minY=-10,maxY=topY+10;
  var sx=function(x){return pad+(x-minX)/(maxX-minX)*(W-2*pad);};
  var sy=function(y){return pad+(maxY-y)/(maxY-minY)*(H-2*pad);};
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto'>";
  var polyPts=pts.map(function(p){return sx(p[0]).toFixed(1)+","+sy(p[1]).toFixed(1);}).join(" ");
  h+="<polygon points='"+polyPts+"' fill='rgba(47,111,208,.06)' stroke='var(--ink)' stroke-width='2'/>";
  /* диагонали */
  h+="<line x1='"+sx(A[0]).toFixed(1)+"' y1='"+sy(A[1]).toFixed(1)+"' x2='"+sx(C[0]).toFixed(1)+"' y2='"+sy(C[1]).toFixed(1)+"' stroke='var(--red)' stroke-width='1' stroke-dasharray='4,3' opacity='0.5'/>";
  h+="<line x1='"+sx(B[0]).toFixed(1)+"' y1='"+sy(B[1]).toFixed(1)+"' x2='"+sx(D[0]).toFixed(1)+"' y2='"+sy(D[1]).toFixed(1)+"' stroke='var(--red)' stroke-width='1' stroke-dasharray='4,3' opacity='0.5'/>";
  var lbls=labels||["A","B","C","D"];
  var offs=[[-12,-8],[8,-8],[8,16],[-12,16]];
  for(var i=0;i<4;i++){
    var px=sx(pts[i][0]),py=sy(pts[i][1]);
    h+="<circle cx='"+px.toFixed(1)+"' cy='"+py.toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(px+offs[i][0]).toFixed(0)+"' y='"+(py+offs[i][1]).toFixed(0)+"' font-size='13' fill='var(--ink)' font-weight='600' text-anchor='middle'>"+lbls[i]+"</text>";
  }
  h+="</svg>";
  return h;
}

/* ---------- SVG: угол с параллельными прямыми ---------- */
function svgAngleParallel(){
  var W=300,H=240,pad=30;
  var O=[pad,pad+10];
  var A1=[pad+80,pad+90],B1=[pad+200,pad+90];
  var A2=[pad+50,pad+150],B2=[pad+250,pad+150];
  function sx(x){return x;}
  function sy(y){return y;}
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto'>";
  /* стороны угла */
  h+="<line x1='"+O[0]+"' y1='"+O[1]+"' x2='"+(pad+260)+"' y2='"+(pad+180)+"' stroke='var(--ink)' stroke-width='2'/>";
  h+="<line x1='"+O[0]+"' y1='"+O[1]+"' x2='"+(pad+260)+"' y2='"+(pad+20)+"' stroke='var(--ink)' stroke-width='2'/>";
  /* параллельные */
  h+="<line x1='"+A1[0]+"' y1='"+A1[1]+"' x2='"+B1[0]+"' y2='"+B1[1]+"' stroke='var(--blue)' stroke-width='2'/>";
  h+="<line x1='"+A2[0]+"' y1='"+A2[1]+"' x2='"+B2[0]+"' y2='"+B2[1]+"' stroke='var(--blue)' stroke-width='2'/>";
  /* точки */
  var pts=[[O[0],O[1],"O"],[A1[0],A1[1],"A"],[B1[0],B1[1],"B"],[A2[0],A2[1],"C"],[B2[0],B2[1],"D"]];
  var offs=[[-8,-5],[-8,-8],[8,-8],[-8,16],[8,16]];
  for(var i=0;i<pts.length;i++){
    h+="<circle cx='"+pts[i][0]+"' cy='"+pts[i][1]+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(pts[i][0]+offs[i][0])+"' y='"+(pts[i][1]+offs[i][1])+"' font-size='12' fill='var(--ink)' font-weight='600' text-anchor='middle'>"+pts[i][2]+"</text>";
  }
  h+="</svg>";
  return h;
}

function detSteps(items,answerLine){
  var h="";
  for(var i=0;i<items.length;i++){
    h+="<p><b>"+items[i].title+"</b></p>";
    if(items[i].text)h+="<p>"+items[i].text+"</p>";
    if(items[i].svg)h+="<div class='svg-center' style='margin:8px auto'>"+items[i].svg+"</div>";
  }
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p>";
  return h;
}

/* =====================================================================
   ГЕНЕРАТОРЫ ЗАДАЧ (8 типов, случайный выбор в каждом варианте)
-------------------------------------------------------------------- */

/* Тип 1: Подобные треугольники — найти сторону (по коэффициенту подобия) */
function genType1(rng){
  var k=pick(rng,[2,3,0.5,1.5,2.5,0.4]);
  var a=ri(rng,3,12);
  var b=ri(rng,4,15);
  var c=ri(rng,5,18);
  var side=pick(rng,["a","b","c"]);
  var ans;
  if(side==="a")ans=a*k;
  else if(side==="b")ans=b*k;
  else ans=c*k;
  var detH=detSteps([
    {title:"Дано",text:"△ABC ~ △A₁B₁C₁, коэффициент подобия k = "+fmt(k)+". Стороны △ABC: a = "+a+", b = "+b+", c = "+c+".",svg:svgTriangle([[0,0],[4,0],[2,3]],["A","B","C"])},
    {title:"Решение",text:"В подобных треугольниках стороны относятся как k. Искомая сторона "+side+"₁ = "+side+" · k = "+side+" · "+fmt(k)+" = <b>"+fmt(ans)+"</b>."},
  ],fmt(ans));
  return mkDec({
    q:"△ABC ~ △A₁B₁C₁ с коэффициентом подобия k = "+fmt(k)+". Стороны △ABC: a = "+a+", b = "+b+", c = "+c+". Найдите сторону "+side+"₁."+NOTE,
    a:ans,sol:fmt(ans),
    hint:"Стороны подобных треугольников относятся как коэффициент подобия",
    detailed:detH
  });
}

/* Тип 2: Трапеция — отношение диагоналей (обратная задача) */
function genType2(rng){
  var ab=ri(rng,4,12),cd=ab*ri(rng,2,4);
  var od=ri(rng,3,8),ob=ri(rng,3,8);
  var ac=ab+cd;
  var ao=ab*ac/cd;
  /* прямая задача: найти AO */
  var detH=detSteps([
    {title:"Дано",text:"Трапеция ABCD, основания AB = "+ab+", CD = "+cd+". Диагонали пересекаются в O. AC = "+ac+".",svg:svgTrapezoid(ab,cd,8)},
    {title:"Свойство",text:"Диагонали трапеции делятся точкой пересечения пропорционально основаниям: AO/OC = AB/CD."},
    {title:"Решение",text:"AO/OC = "+ab+"/"+cd+". AC = AO + OC = "+ac+". Пусть OC = x, тогда AO = ("+ab+"/"+cd+")·x. ("+ab+"/"+cd+")·x + x = "+ac+". x = "+ac+"·"+cd+"/"+(ab+cd)+" = "+fmt(ac*cd/(ab+cd))+". AO = "+ac+" − "+fmt(ac*cd/(ab+cd))+" = <b>"+fmt(ao)+"</b>."},
  ],fmt(ao));
  return mkDec({
    q:"В трапеции ABCD с основаниями AB = "+ab+" и CD = "+cd+" диагонали пересекаются в точке O. AC = "+ac+". Найдите AO."+NOTE,
    a:ao,sol:fmt(ao),
    hint:"AO/OC = AB/CD; AO + OC = AC",
    detailed:detH
  });
}

/* Тип 3: Параллельные прямые, пересекающие стороны угла — найти отрезок */
function genType3(rng){
  var ab=ri(rng,3,10),bd=ri(rng,2,8);
  var ce=ri(rng,4,12);
  var ac=ab*ce/bd;
  var detH=detSteps([
    {title:"Дано",text:"Стороны угла A пересечены параллельными прямыми BC и DE. BD = "+bd+", CE = "+ce+", AB = "+ab+".",svg:svgAngleParallel()},
    {title:"Теорема",text:"Параллельные прямые, пересекающие стороны угла, отсекают пропорциональные отрезки: AB/BD = AC/CE."},
    {title:"Решение",text:ab+"/"+bd+" = AC/"+ce+". AC = "+ab+"·"+ce+"/"+bd+" = <b>"+fmt(ac)+"</b>."},
  ],fmt(ac));
  return mkDec({
    q:"Стороны угла A пересечены параллельными прямыми BC ∥ DE. AB = "+ab+", BD = "+bd+", CE = "+ce+". Найдите AC."+NOTE,
    a:ac,sol:fmt(ac),
    hint:"AB/BD = AC/CE (теорема о пропорциональных отрезках)",
    detailed:detH
  });
}

/* Тип 4: Подобны ли треугольники? (по трём сторонам) — Да/Нет */
function genType4(rng){
  var k=pick(rng,[1.5,2,2.5,3,0.5]);
  var similar=rng()<0.7;
  var a=ri(rng,3,8),b=ri(rng,4,10),c=ri(rng,5,12);
  var a1,b1,c1;
  if(similar){
    a1=a*k;b1=b*k;c1=c*k;
  } else {
    a1=a*k+pick(rng,[-1,1,-2,2]);b1=b*k;c1=c*k;
    if(a1<=0)a1=a*k+1;
  }
  var correct=similar?"Да":"Нет";
  var ratio1=a1/a,ratio2=b1/b,ratio3=c1/c;
  var allEqual=Math.abs(ratio1-ratio2)<0.01&&Math.abs(ratio2-ratio3)<0.01;
  var detH="<p>Стороны △ABC: "+a+", "+b+", "+c+". Стороны △A₁B₁C₁: "+fmt(a1)+", "+fmt(b1)+", "+fmt(c1)+".</p>";
  detH+="<p>Проверяем отношения сторон: "+fmt(a1)+"/"+a+" = "+fmt(ratio1)+", "+fmt(b1)+"/"+b+" = "+fmt(ratio2)+", "+fmt(c1)+"/"+c+" = "+fmt(ratio3)+".</p>";
  if(allEqual){
    detH+="<p>Все отношения равны → треугольники <b>подобны</b> по третьему признаку (по трём пропорциональным сторонам).</p>";
  } else {
    detH+="<p>Отношения не равны → треугольники <b>не подобны</b>.</p>";
  }
  return mkMC({
    q:"Подобны ли треугольники ABC и A₁B₁C₁, если AB = "+a+", BC = "+b+", CA = "+c+", A₁B₁ = "+fmt(a1)+", B₁C₁ = "+fmt(b1)+", C₁A₁ = "+fmt(c1)+"?",
    c:correct,opts:["Да","Нет"],
    hint:"Проверьте, равны ли отношения соответствующих сторон",
    detailed:detH
  });
}

/* Тип 5: Найти коэффициент подобия по отношению площадей */
function genType5(rng){
  var k=ri(rng,2,5);
  var s1=ri(rng,4,20);
  var s2=s1*k*k;
  var detH="<p>Отношение площадей подобных треугольников равно квадрату коэффициента подобия: S₁/S₂ = k².</p>";
  detH+="<p>S₁/S₂ = "+s1+"/"+s2+" = "+(s1/s2)+". k² = "+(s1/s2)+". k = √("+(s1/s2)+") = <b>"+fmt(k)+"</b>.</p>";
  return mkDec({
    q:"Площади подобных треугольников равны "+s1+" и "+s2+". Найдите коэффициент подобия."+NOTE,
    a:k,sol:fmt(k),
    hint:"S₁/S₂ = k², поэтому k = √(S₁/S₂)",
    detailed:detH
  });
}

/* Тип 6: Трапеция — боковые стороны продолжены до пересечения (обратная) */
function genType6(rng){
  var small=ri(rng,3,7),large=small+ri(rng,2,5);
  var side1=ri(rng,3,6),side2=ri(rng,3,6);
  /* расстояние от M до меньшего основания = side * small/(large-small) */
  var d1=side1*small/(large-small);
  var d2=side2*small/(large-small);
  var ans=d1;
  var detH="<p>Трапеция с основаниями "+small+" и "+large+". Боковые стороны "+side1+" и "+side2+" продолжены до точки M.</p>";
  detH+="<p>Треугольник, образованный продолжениями сторон и меньшим основанием, подобен треугольнику с большим основанием (коэффициент подобия "+small+"/"+large+").</p>";
  detH+="<p>Боковая сторона малого треугольника / боковая сторона большого = "+small+"/"+large+". Полная боковая сторона = "+side1+". Значит, отрезок от M до меньшего основания = "+side1+"·"+small+"/"+(large-small)+" = <b>"+fmt(d1)+"</b>.</p>";
  return mkDec({
    q:"Основания трапеции равны "+small+" и "+large+". Боковые стороны "+side1+" и "+side2+" продолжены до пересечения в точке M. Найдите расстояние от M до ближайшего конца меньшего основания."+NOTE,
    a:ans,sol:fmt(ans),
    hint:"Треугольники с вершиной M подобны. Коэффициент = меньшее основание / большее",
    detailed:detH
  });
}

/* Тип 7: Средняя линия / параллельный отрезок в треугольнике */
function genType7(rng){
  var ab=ri(rng,6,15),ac=ri(rng,8,18);
  var ratio=pick(rng,[0.3,0.4,0.5,0.6,0.7]);
  var am=ab*ratio;
  var mn=ac*ratio;
  var detH="<p>В △ABC: M ∈ AB, N ∈ BC, MN ∥ AC. AM/AB = "+fmt(ratio)+".</p>";
  detH+="<p>По теореме: MN ∥ AC → △MBN ~ △ABC с коэффициентом MB/AB = "+fmt(1-ratio)+".</p>";
  detH+="<p>MN = AC · (1 − "+fmt(ratio)+") = "+ac+" · "+fmt(1-ratio)+" = <b>"+fmt(mn)+"</b>.</p>";
  return mkDec({
    q:"В треугольнике ABC точка M лежит на AB, N — на BC, MN ∥ AC. AB = "+ab+", AC = "+ac+". AM = "+fmt(am)+". Найдите MN."+NOTE,
    a:mn,sol:fmt(mn),
    hint:"△MBN ~ △ABC, MN/AC = MB/AB",
    detailed:detH
  });
}

/* Тип 8: Вписанный квадрат в треугольник (обратная) */
function genType8(rng){
  var a=ri(rng,6,12),h=ri(rng,4,10);
  var side=a*h/(a+h);
  var detH="<p>△ABC: AB = "+a+", высота CH = "+h+". Квадрат вписан так, что две вершины на AB, две — на AC и BC.</p>";
  detH+="<p>Сторона квадрата x. Малый треугольник над квадратом подобен △ABC: x/"+a+" = ("+h+"−x)/"+h+".</p>";
  detH+="<p>"+h+"·x = "+a+"·("+h+"−x). x("+h+"+"+a+") = "+a*h+". x = "+a*h+"/"+(a+h)+" = <b>"+fmt(side)+"</b>.</p>";
  return mkDec({
    q:"В треугольнике ABC сторона AB = "+a+", высота CH = "+h+". Найдите сторону квадрата, вписанного в треугольник так, что две вершины лежат на AB, а две другие — на AC и BC."+NOTE,
    a:side,sol:fmt(side),
    hint:"Малый треугольник над квадратом подобен данному. x/a = (h−x)/h",
    detailed:detH
  });
}

/* ---------- генератор варианта: 8 случайных заданий без повторов типа ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8];
function genVariant(rng){
  var types=shuf(rng,[0,1,2,3,4,5,6,7]);
  return types.map(function(idx){return ALL_TYPES[idx](rng);});
}

/* ---------- регистрация темы ---------- */
function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){
    var paths=["./trenazher-data.js","../lessons/trenazher-data.js"];
    for(var i=0;i<paths.length;i++){
      try{var tz=require(paths[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}
    }
  }
  return null;
}
function register(){
  var TZ=getTZ();
  if(!TZ||!TZ.TOPICS)return;
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="podobnye")return;
  }
  TZ.TOPICS.push({
    id:"podobnye",
    subject:"Математика",
    grade:"8 класс",
    title:"Подобные треугольники",
    variants:40,
    desc:"Тренажёр по геометрии (8 класс): подобные треугольники. "
      +"8 заданий: коэффициент подобия, трапеция с диагоналями, "
      +"параллельные прямые, признаки подобия, площади, вписанный квадрат. "
      +"40 вариантов. После выполнения — подробное решение с чертежами SVG.",
    blocks:[{name:"Подобные треугольники",gen:genVariant,count:8}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
