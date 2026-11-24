/* =====================================================================
   Тренажёр · 9 класс · Геометрия · Векторы (начало изучения)
   40 вариантов × 10 заданий (от простого к сложному).
   Интерактив: ученик перетаскивает векторы на плоскости (без осей).
   Векторы заданы длиной и направлением — без координат.
   После выполнения — подробное пошаговое решение с чертежами.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}

function fmt(n){
  if(n===null||!isFinite(n))return "—";
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  return n.toFixed(2).replace(".",",");
}
var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,sol:opts.sol,unit:opts.unit||"",
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function step(title,html){return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";}
function vec(name){return "<span style='text-decoration:overline'>"+name+"</span>";}

/* ---------- SVG: статичный чертёж вектора на плоскости (без осей) ---------- */
function drawVec(x1,y1,x2,y2,label,color,W,H){
  color=color||"#2f6fd0";
  W=W||380; H=H||240;
  var dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)||1;
  var ux=dx/len, uy=dy/len, px=-uy, py=ux, aw=6;
  var h="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='2.5'/>";
  h+="<polygon points='"+x2+","+y2+" "+(x2-ux*12+px*aw)+","+(y2-uy*12+py*aw)+" "+(x2-ux*12-px*aw)+","+(y2-uy*12-py*aw)+"' fill='"+color+"'/>";
  h+="<circle cx='"+x1+"' cy='"+y1+"' r='3' fill='"+color+"'/>";
  if(label)h+="<text x='"+(x1+dx*0.5+px*16)+"' y='"+(y1+dy*0.5+py*16+5)+"' font-size='15' fill='"+color+"' font-weight='700' text-anchor='middle'>"+label+"</text>";
  return h;
}

function svgStatic(vectors, title){
  var W=420, H=260;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  /* Светлый фон, без осей */
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='10'/>";
  if(title)h+="<text x='"+(W/2)+"' y='20' font-size='13' fill='#666' font-weight='600' text-anchor='middle'>"+title+"</text>";
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i];
    h+=drawVec(v.x1,v.y1,v.x2,v.y2,v.label,v.color||colors[i%colors.length],W,H);
  }
  h+="</svg>";
  return h;
}

/* =====================================================================
   ИНТЕРАКТИВНОЕ ПОЛЕ ВЕКТОРОВ (без системы координат)
   Ученик перетаскивает векторы на плоскости.
   ===================================================================== */

global.__vecState={active:false,vecId:-1,svgId:"",vectors:[],mode:"move"};

global.__vecDragStart=function(vecId,svgId,e){
  e.preventDefault();
  if(e.touches)e=e.touches[0];
  global.__vecState.active=true;
  global.__vecState.vecId=vecId;
  global.__vecState.svgId=svgId;
  var svg=document.getElementById(svgId);
  if(!svg)return;
  var pt=svg.createSVGPoint();
  pt.x=e.clientX; pt.y=e.clientY;
  var ctm=svg.getScreenCTM();
  if(!ctm)return;
  var loc=pt.matrixTransform(ctm.inverse());
  global.__vecState.startX=loc.x;
  global.__vecState.startY=loc.y;
};

global.__vecDragMove=function(e){
  if(!global.__vecState.active)return;
  e.preventDefault();
  if(e.touches)e=e.touches[0];
  var svg=document.getElementById(global.__vecState.svgId);
  if(!svg)return;
  var pt=svg.createSVGPoint();
  pt.x=e.clientX; pt.y=e.clientY;
  var ctm=svg.getScreenCTM();
  if(!ctm)return;
  var loc=pt.matrixTransform(ctm.inverse());
  var dx=loc.x-global.__vecState.startX;
  var dy=loc.y-global.__vecState.startY;
  global.__vecState.startX=loc.x;
  global.__vecState.startY=loc.y;
  var vid=global.__vecState.vecId;
  var v=global.__vecState.vectors[vid];
  if(!v)return;
  if(global.__vecState.mode==="move"){
    /* Перемещаем весь вектор */
    v.x1+=dx; v.y1+=dy; v.x2+=dx; v.y2+=dy;
  }else{
    /* Перемещаем только конец (вращение/изменение длины) */
    v.x2+=dx; v.y2+=dy;
  }
  v.x1=Math.round(v.x1); v.y1=Math.round(v.y1);
  v.x2=Math.round(v.x2); v.y2=Math.round(v.y2);
  global.__vecRedraw(svg);
};

global.__vecDragEnd=function(){global.__vecState.active=false;global.__vecState.vecId=-1;};

global.__vecRedraw=function(svg){
  var g=svg.querySelector("#vec-dynamic");
  if(!g)return;
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
  var html="";
  for(var i=0;i<global.__vecState.vectors.length;i++){
    var v=global.__vecState.vectors[i];
    var col=v.color||colors[i%colors.length];
    var x1=v.x1,y1=v.y1,x2=v.x2,y2=v.y2;
    var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
    var ux=dx/len,uy=dy/len,px=-uy,py=ux,aw=6;
    /* Линия */
    html+="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+col+"' stroke-width='2.5'/>";
    /* Стрелка */
    html+="<polygon points='"+x2+","+y2+" "+(x2-ux*12+px*aw)+","+(y2-uy*12+py*aw)+" "+(x2-ux*12-px*aw)+","+(y2-uy*12-py*aw)+"' fill='"+col+"'/>";
    /* Начальная точка */
    html+="<circle cx='"+x1+"' cy='"+y1+"' r='4' fill='"+col+"' fill-opacity='0.4' stroke='"+col+"' stroke-width='1.5' style='cursor:grab' onmousedown='__vecSetMode(\"move\");__vecDragStart("+i+",\""+svg.id+"\",event)' ontouchstart='__vecSetMode(\"move\");__vecDragStart("+i+",\""+svg.id+"\",event)'/>";
    /* Подпись */
    if(v.label)html+="<text x='"+(x1+dx*0.5+px*16)+"' y='"+(y1+dy*0.5+py*16+5)+"' font-size='15' fill='"+col+"' font-weight='700' text-anchor='middle'>"+v.label+"</text>";
    /* Handle на конце (для вращения) */
    html+="<circle cx='"+x2+"' cy='"+y2+"' r='8' fill='"+col+"' fill-opacity='0.5' stroke='#fff' stroke-width='2' style='cursor:grab' onmousedown='__vecSetMode(\"rotate\");__vecDragStart("+i+",\""+svg.id+"\",event)' ontouchstart='__vecSetMode(\"rotate\");__vecDragStart("+i+",\""+svg.id+"\",event)'/>";
  }
  g.innerHTML=html;
};

global.__vecSetMode=function(m){global.__vecState.mode=m;};

/* Создаёт интерактивное SVG-поло (без координатной плоскости) */
function interactiveField(vecs, fieldId, instruction){
  var W=480, H=320;
  global.__vecState.vectors=vecs.map(function(v){return {x1:v.x1,y1:v.y1,x2:v.x2,y2:v.y2,label:v.label,color:v.color};});
  var h="<div class='tz-graph-wrap' style='max-width:520px'>";
  h+="<svg id='"+fieldId+"' width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='background:#fafafa;border:1px solid #ddd;border-radius:10px;touch-action:none'>";
  /* Просто светлый фон — без осей и сетки */
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='8'/>";
  /* Подсказка в углу */
  h+="<text x='12' y='20' font-size='11' fill='#aaa'>Перетаскивайте векторы за точки</text>";
  h+="<g id='vec-dynamic'></g>";
  h+="</svg>";
  h+="<p style='color:#666;font-size:13px;text-align:center;margin:4px 0'>"+instruction+"</p>";
  h+="</div>";
  /* Обработчики */
  if(typeof document!=="undefined"&&!global.__vecHandlersSet){
    document.addEventListener("mousemove",global.__vecDragMove);
    document.addEventListener("mouseup",global.__vecDragEnd);
    document.addEventListener("touchmove",global.__vecDragMove,{passive:false});
    document.addEventListener("touchend",global.__vecDragEnd);
    global.__vecHandlersSet=true;
  }
  h+="<scr"+"ipt>(function(){var s=document.getElementById('"+fieldId+"');if(s){__vecRedraw(s);}})();</scr"+"ipt>";
  return h;
}

/* Генерация случайного вектора с заданной длиной и углом */
function makeVec(len, angleDeg, label, color){
  var rad=angleDeg*Math.PI/180;
  return {len:len, angle:angleDeg, label:label, color:color,
    x1:0,y1:0,x2:Math.round(len*Math.cos(rad)),y2:-Math.round(len*Math.sin(rad))};
}

/* =====================================================================
   ТИПЫ 1-5: Интерактивные (перетаскивание векторов на плоскости)
   ===================================================================== */

/* Тип 1: Сумма двух векторов по правилу треугольника
   Даны 2 вектора (длина + направление). Ученик совмещает их. */
function genType1(rng){
  var len1=ri(rng,3,7), len2=ri(rng,3,7);
  var ang1=ri(rng,0,30); /* примерно вправо */
  var ang2=ri(rng,60,120); /* примерно вверх */
  /* Ответ: по теореме косинусов */
  var cosA=Math.cos((ang2-ang1)*Math.PI/180);
  var ans=Math.sqrt(len1*len1+len2*len2+2*len1*len2*cosA);
  
  var v1=makeVec(len1,ang1,"a","#2f6fd0");
  var v2=makeVec(len2,ang2,"b","#3aa758");
  /* Размещаем на поле в разных местах */
  v1.x1=120;v1.y1=200;v1.x2=120+v1.x2;v1.y2=200+v1.y2;
  v2.x1=300;v2.y1=100;v2.x2=300+v2.x2;v2.y2=100+v2.y2;
  
  var qText="<p>Даны два вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+". Угол между ними — "+(ang2-ang1)+"°.</p>";
  qText+="<p>Перетащите векторы так, чтобы начало вектора "+vec("b")+" совпало с концом вектора "+vec("a")+" (правило треугольника). Найдите длину вектора "+vec("a")+" + "+vec("b")+".</p>";
  qText+=interactiveField([v1,v2],"vf1","Перетащите синюю точку (начало b) к концу вектора a");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  
  var det="";
  det+=step("Правило треугольника","Совместим начало вектора "+vec("b")+" с концом вектора "+vec("a")+". Сумма — вектор от начала "+vec("a")+" к концу "+vec("b")+".");
  det+=step("Теорема косинусов","|"+vec("a")+" + "+vec("b")+"|² = |"+vec("a")+"|² + |"+vec("b")+"|² + 2·|"+vec("a")+"|·|"+vec("b")+"|·cos("+(ang2-ang1)+"°)");
  det+=step("Вычисление","= "+len1+"² + "+len2+"² + 2·"+len1+"·"+len2+"·cos("+(ang2-ang1)+"°) = "+(len1*len1)+" + "+(len2*len2)+" + "+Math.round(2*len1*len2*cosA*100)/100+" = <b>"+fmt(ans)+"</b>.");
  /* Статичный чертёж правильного решения */
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:200,x2:100+len1*Math.cos(ang1*Math.PI/180),y2:200-len1*Math.sin(ang1*Math.PI/180),label:"a"},
    {x1:100+len1*Math.cos(ang1*Math.PI/180),y2:200-len1*Math.sin(ang1*Math.PI/180),
     x2:100+len1*Math.cos(ang1*Math.PI/180)+len2*Math.cos(ang2*Math.PI/180),
     y2:200-len1*Math.sin(ang1*Math.PI/180)-len2*Math.sin(ang2*Math.PI/180),label:"b",color:"#3aa758"},
    {x1:100,y1:200,
     x2:100+len1*Math.cos(ang1*Math.PI/180)+len2*Math.cos(ang2*Math.PI/180),
     y2:200-len1*Math.sin(ang1*Math.PI/180)-len2*Math.sin(ang2*Math.PI/180),label:"a+b",color:"#dc503c"}
  ],"Правильное сложение")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, теорема косинусов",detailed:det});
}

/* Тип 2: Сумма двух перпендикулярных векторов */
function genType2(rng){
  var len1=ri(rng,3,8), len2=ri(rng,3,8);
  var ans=Math.sqrt(len1*len1+len2*len2);
  var v1=makeVec(len1,0,"a","#2f6fd0");
  var v2=makeVec(len2,90,"b","#3aa758");
  v1.x1=100;v1.y1=180;v1.x2=100+len1;v1.y2=180;
  v2.x1=320;v2.y1=120;v2.x2=320;v2.y2=120-len2;
  
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+".</p>";
  qText+="<p>Перетащите векторы так, чтобы построить сумму по правилу треугольника. Найдите |"+vec("a")+" + "+vec("b")+"|.</p>";
  qText+=interactiveField([v1,v2],"vf2","Совместите начало b с концом a");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  
  var det="";
  det+=step("Правило треугольника","Совместим начало "+vec("b")+" с концом "+vec("a")+".");
  det+=step("Векторы перпендикулярны → теорема Пифагора","|"+vec("a")+" + "+vec("b")+"| = √("+len1+"² + "+len2+"²) = √("+(len1*len1)+" + "+(len2*len2)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:200,x2:100+len1,y2:200,label:"a"},
    {x1:100+len1,y1:200,x2:100+len1,y2:200-len2,label:"b",color:"#3aa758"},
    {x1:100,y1:200,x2:100+len1,y2:200-len2,label:"a+b",color:"#dc503c"}
  ],"Сумма перпендикулярных векторов")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, теорема Пифагора",detailed:det});
}

/* Тип 3: Разность векторов — совместить начала */
function genType3(rng){
  var len1=ri(rng,5,9), len2=ri(rng,3,7);
  var ans=Math.sqrt(len1*len1+len2*len2);
  var v1=makeVec(len1,0,"a","#2f6fd0");
  var v2=makeVec(len2,90,"b","#3aa758");
  v1.x1=100;v1.y1=180;v1.x2=100+len1;v1.y2=180;
  v2.x1=300;v2.y1=120;v2.x2=300;v2.y2=120-len2;
  
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+".</p>";
  qText+="<p>Перетащите векторы так, чтобы их <b>начала совпали</b>. Найдите |"+vec("a")+" − "+vec("b")+"|.</p>";
  qText+=interactiveField([v1,v2],"vf3","Совместите начала векторов (синюю точку с зелёной)");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  
  var det="";
  det+=step("Вычитание",vec("a")+" − "+vec("b")+" = "+vec("a")+" + (−"+vec("b")+"). Вектор −"+vec("b")+" перпендикулярен "+vec("a")+".");
  det+=step("Теорема Пифагора","|"+vec("a")+" − "+vec("b")+"| = √("+len1+"² + "+len2+"²) = √("+(len1*len1+len2*len2)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:150,y1:200,x2:150+len1,y2:200,label:"a"},
    {x1:150,y1:200,x2:150,y2:200-len2,label:"-b",color:"#e8a820"},
    {x1:150,y1:200,x2:150+len1,y2:200-len2,label:"a-b",color:"#dc503c"}
  ],"Вычитание векторов")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести начала, a−b=a+(−b), Пифагор",detailed:det});
}

/* Тип 4: Сумма трёх векторов (правило многоугольника) */
function genType4(rng){
  var a=ri(rng,3,6), b=ri(rng,3,6), c=ri(rng,2,5);
  /* a — вправо, b — вверх, c — влево */
  var ans=Math.sqrt((a-c)*(a-c)+b*b);
  var v1=makeVec(a,0,"a","#2f6fd0");
  var v2=makeVec(b,90,"b","#3aa758");
  var v3=makeVec(c,180,"c","#e8a820");
  v1.x1=80;v1.y1=200;v1.x2=80+a;v1.y2=200;
  v2.x1=320;v2.y1=80;v2.x2=320;v2.y2=80-b;
  v3.x1=350;v3.y1=250;v3.x2=350-c;v3.y2=250;
  
  var qText="<p>Даны три вектора: "+vec("a")+" длиной "+a+", "+vec("b")+" длиной "+b+", "+vec("c")+" длиной "+c+". "+vec("a")+" направлен вправо, "+vec("b")+" — вверх, "+vec("c")+" — влево.</p>";
  qText+="<p>Перетащите векторы так, чтобы выстроить их друг за другом (правило многоугольника). Найдите |"+vec("a")+" + "+vec("b")+" + "+vec("c")+"|.</p>";
  qText+=interactiveField([v1,v2,v3],"vf4","Выстройте векторы друг за другом: конец a → начало b → конец b → начало c");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  
  var det="";
  det+=step("Правило многоугольника","Выстраиваем: a → b → c, конец каждого совпадает с началом следующего.");
  det+=step("Горизонталь","Сумма по горизонтали: "+a+" (вправо) − "+c+" (влево) = "+(a-c)+".");
  det+=step("Вертикаль","Сумма по вертикали: "+b+" (вверх).");
  det+=step("Теорема Пифагора","|"+vec("s")+"| = √("+(a-c)+"² + "+b+"²) = √("+((a-c)*(a-c))+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:80,y1:200,x2:80+a,y2:200,label:"a"},
    {x1:80+a,y1:200,x2:80+a,y2:200-b,label:"b",color:"#3aa758"},
    {x1:80+a,y1:200-b,x2:80+a-c,y2:200-b,label:"c",color:"#e8a820"},
    {x1:80,y1:200,x2:80+a-c,y2:200-b,label:"s",color:"#dc503c"}
  ],"Правило многоугольника")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Выстрой a→b→c, сложи горизонталь и вертикаль",detailed:det});
}

/* Тип 5: Сумма нескольких векторов (5-8, замкнутый контур) */
function genType5(rng){
  var n=ri(rng,5,8);
  var vecs=[];
  var lens=[];
  for(var i=0;i<n;i++){
    var l=ri(rng,3,7);
    lens.push(l);
    var ang=ri(rng,0,360);
    var v=makeVec(l,ang,String.fromCharCode(97+i));
    v.x1=50+ri(rng,0,300); v.y1=50+ri(rng,0,200);
    v.x2=v.x1+v.x2; v.y2=v.y1+v.y2;
    vecs.push(v);
  }
  /* Если векторы по замкнутому контуру — сумма = 0 */
  var qText="<p>Дано "+n+" векторов: ";
  for(var i=0;i<n;i++)qText+=vec(String.fromCharCode(97+i))+" (длина "+lens[i]+")"+(i<n-1?", ":"");
  qText+=".</p><p>Перетащите векторы так, чтобы они образовали <b>замкнутый контур</b> (конец последнего совпадает с началом первого). Чему равна сумма всех векторов?</p>";
  qText+=interactiveField(vecs,"vf5","Выстройте векторы по кругу: конец каждого → начало следующего");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  
  var det="";
  det+=step("Замкнутый контур","Если векторы выстроены так, что конец последнего совпадает с началом первого, то сумма равна нулевому вектору.");
  det+=step("Правило","Сумма векторов по замкнутому контуру = "+vec("0")+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>0</span></p>";
  return mkDec({q:qText,a:0,sol:"0",hint:"Замкнутый контур → сумма = 0",detailed:det});
}

/* =====================================================================
   ТИПЫ 6-10: По прототипам из скрина
   ===================================================================== */

/* Тип 6: Равносторонний треугольник */
function genType6(rng){
  var a=ri(rng,4,12);
  var variant=pick(rng,["а","б","в","г","д"]);
  var ans,what;
  if(variant==="а"){what="|"+vec("AB")+" + "+vec("BC")+"|";ans=a;}
  else if(variant==="б"){what="|"+vec("AB")+" + "+vec("AC")+"|";ans=a*Math.sqrt(3);}
  else if(variant==="в"){what="|"+vec("AB")+" + "+vec("CB")+"|";ans=a*Math.sqrt(3);}
  else if(variant==="г"){what="|"+vec("BA")+" − "+vec("BC")+"|";ans=a*Math.sqrt(3);}
  else{what="|"+vec("AB")+" − "+vec("AC")+"|";ans=a;}
  var qText="Сторона равностороннего треугольника ABC равна "+a+". Найдите: "+variant+") "+what+"."+NOTE;
  var det="";
  det+=step("Анализ","Все стороны = "+a+", все углы = 60°.");
  if(variant==="а")det+=step("Решение",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+". |"+vec("AC")+"| = "+a+".");
  else if(variant==="б")det+=step("Решение","Угол между AB и AC = 60°. |"+vec("s")+"|² = 2a² + 2a²·cos60° = 3a². |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
  else if(variant==="в")det+=step("Решение","Угол 120°. |"+vec("s")+"|² = 2a² + 2a²·cos60° = 3a². |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
  else if(variant==="г")det+=step("Решение",vec("BA")+" − "+vec("BC")+" = "+vec("BA")+" + "+vec("CB")+". Угол 120°. |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
  else det+=step("Решение",vec("AB")+" − "+vec("AC")+" = "+vec("CB")+". |"+vec("CB")+"| = "+a+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Правило треугольника + теорема косинусов",detailed:det});
}

/* Тип 7: Прямоугольный треугольник */
function genType7(rng){
  var ab=ri(rng,3,9), bc=ri(rng,4,10);
  var variant=pick(rng,["а","б","в","г"]);
  var what2,ans2;
  if(variant==="а"){what2="|"+vec("BA")+" − "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  else if(variant==="б"){what2="|"+vec("AB")+" + "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  else if(variant==="в"){what2="|"+vec("BA")+" + "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  else{what2="|"+vec("AB")+" − "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  var qText="В треугольнике ABC: AB = "+ab+", BC = "+bc+", ∠B = 90°. Найдите "+variant+") "+what2+"."+NOTE;
  var det="";
  det+=step("Анализ","∠B = 90°, векторы перпендикулярны.");
  det+=step("Решение",what2+": теорема Пифагора. |"+vec("s")+"| = √("+ab+"² + "+bc+"²) = <b>"+fmt(ans2)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:200,x2:100+ab,y2:200,label:"AB"},
    {x1:100+ab,y1:200,x2:100+ab,y2:200-bc,label:"BC",color:"#3aa758"},
    {x1:100,y1:200,x2:100+ab,y2:200-bc,label:"s",color:"#dc503c"}
  ],"Прямоугольный треугольник")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans2)+"</span></p>";
  return mkDec({q:qText,a:ans2,sol:fmt(ans2),hint:"∠B=90° → теорема Пифагора",detailed:det});
}

/* Тип 8: Правило многоугольника — упростить */
function genType8(rng){
  var variant=pick(rng,["а","б"]);
  var qText,det,correct;
  if(variant==="а"){
    qText="Пользуясь правилом многоугольника, упростите: ("+vec("AB")+" + "+vec("BC")+" − "+vec("MC")+") + ("+vec("MD")+" − "+vec("KD")+").";
    det=step("Решение","AB+BC=AC, −MC=CM, AC+CM=AM, AM+MD=AD, AD−KD=AD+DK=AK.");
    correct="AK";
  }else{
    qText="Пользуясь правилом многоугольника, упростите: ("+vec("CB")+" + "+vec("AC")+" + "+vec("BD")+") − ("+vec("MK")+" + "+vec("KD")+").";
    det=step("Решение","AC+CB=AB, AB+BD=AD, −MK=KM, AD+KM−KD=AM.");
    correct="AM";
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec(correct)+"</span></p>";
  return mkMC({q:qText,c:correct,opts:[correct,correct==="AK"?"AM":"AK","0","AD"],sol:correct,hint:"AB+BC=AC, группируй по правилу треугольника",detailed:det});
}

/* Тип 9: Выразить через a и b */
function genType9(rng){
  var qText="Дан треугольник ABC. Выразите через "+vec("a")+" = "+vec("AB")+" и "+vec("b")+" = "+vec("AC")+": а) "+vec("BA")+"; б) "+vec("CB")+"; в) "+vec("CB")+" + "+vec("BA")+".";
  var det="";
  det+=step("а)",vec("BA")+" = −"+vec("AB")+" = −"+vec("a")+".");
  det+=step("б)",vec("CB")+" = "+vec("CA")+" + "+vec("AB")+" = −"+vec("b")+" + "+vec("a")+" = "+vec("a")+" − "+vec("b")+".");
  det+=step("в)",vec("CB")+" + "+vec("BA")+" = ("+vec("a")+" − "+vec("b")+") + (−"+vec("a")+") = −"+vec("b")+".");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:200,x2:100+60,y2:200,label:"a"},
    {x1:100,y1:200,x2:100+30,y2:200-50,label:"b",color:"#3aa758"},
    {x1:100+60,y1:200,x2:100+30,y2:200-50,label:"CB",color:"#e8a820"}
  ],"Треугольник ABC")+"</div>";
  det+="<p><b>Ответ:</b> а) −"+vec("a")+"; б) "+vec("a")+" − "+vec("b")+"; в) −"+vec("b")+".</p>";
  return mkMC({q:qText,c:"в) −b",opts:["в) −b","в) a−b","в) −a","в) a+b"],sol:"−b",hint:"BA=−AB, CB=CA+AB",detailed:det});
}

/* Тип 10: Доказательство AB+BC+CD+DA=0 */
function genType10(rng){
  var qText="Докажите, что для любых точек A, B, C, D: "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+".";
  var det="";
  det+=step("Доказательство","AB+BC=AC, AC+CD=AD, AD+DA=0. ∎");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:80,y1:180,x2:200,y2:160,label:"AB"},
    {x1:200,y1:160,x2:260,y2:80,label:"BC",color:"#3aa758"},
    {x1:260,y1:80,x2:120,y2:60,label:"CD",color:"#e8a820"},
    {x1:120,y1:60,x2:80,y2:180,label:"DA",color:"#dc503c"}
  ],"Замкнутый контур ABCD")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec("0")+"</span> — доказано.</p>";
  return mkMC({q:qText,c:"Доказано",opts:["Доказано","Не доказано"],sol:"0",hint:"Сумма по замкнутому контуру = 0",detailed:det});
}

/* ---------- генератор варианта ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){return ALL_TYPES.map(function(gen){return gen(rng);});}

/* ---------- регистрация ---------- */
function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){var p=["./trenazher-data.js","../lessons/trenazher-data.js"];for(var i=0;i<p.length;i++){try{var tz=require(p[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}}}
  return null;
}
function register(){
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="vektory")return;
  TZ.TOPICS.push({id:"vektory",subject:"Математика",grade:"9 класс",title:"Векторы",variants:40,
    desc:"Тренажёр по геометрии (9 класс): векторы (начало изучения). "+
      "10 заданий от простого к сложному: 5 интерактивных (перетаскивание векторов на плоскости) + 5 по прототипам. "+
      "Векторы заданы длиной и направлением, без координат. 40 вариантов.",
    blocks:[{name:"Векторы",gen:genVariant,count:10}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
