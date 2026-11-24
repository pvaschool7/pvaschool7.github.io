/* =====================================================================
   Тренажёр · 9 класс · Геометрия · Векторы (начало изучения)
   40 вариантов × 10 заданий (от простого к сложному).
   Интерактив: ученик перетаскивает векторы на плоскости (без осей).
   После выполнения — подробное решение с пошаговыми чертежами.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}

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

/* ---------- SVG: статичный чертёж (крупный, тонкие стрелки) ---------- */
function svgStatic(vectors, title, opts){
  opts=opts||{};
  var W=opts.W||680, H=opts.H||420;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='10'/>";
  if(title)h+="<text x='"+(W/2)+"' y='22' font-size='15' fill='#555' font-weight='600' text-anchor='middle'>"+title+"</text>";
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i];
    var col=v.color||colors[i%colors.length];
    h+=drawArrow(v.x1,v.y1,v.x2,v.y2,v.label,col,opts.dim && opts.dim[i]);
  }
  h+="</svg>";
  return h;
}

/* Отрисовка одной стрелки (крупная, толщина 2.5) */
function drawArrow(x1,y1,x2,y2,label,color,dim){
  color=color||"#2f6fd0";
  var op=dim?0.25:1;
  var dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)||1;
  var ux=dx/len, uy=dy/len, px=-uy, py=ux, aw=7;
  var h="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='2.5' stroke-opacity='"+op+"'/>";
  h+="<polygon points='"+x2+","+y2+" "+(x2-ux*14+px*aw)+","+(y2-uy*14+py*aw)+" "+(x2-ux*14-px*aw)+","+(y2-uy*14-py*aw)+"' fill='"+color+"' fill-opacity='"+op+"'/>";
  h+="<circle cx='"+x1+"' cy='"+y1+"' r='4' fill='"+color+"' fill-opacity='"+op+"'/>";
  if(label)h+="<text x='"+(x1+dx*0.5+px*18)+"' y='"+(y1+dy*0.5+py*18+5)+"' font-size='17' fill='"+color+"' font-weight='700' text-anchor='middle' fill-opacity='"+op+"'>"+label+"</text>";
  return h;
}

/* Пошаговый блок: несколько SVG с подписями */
function svgSteps(steps){
  var h="<div class='tz-steps' style='display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:14px 0'>";
  for(var i=0;i<steps.length;i++){
    var s=steps[i];
    h+="<div style='flex:1 1 320px;min-width:300px;max-width:360px'>";
    h+="<p style='text-align:center;font-size:13px;color:#555;font-weight:600;margin:4px 0'>"+s.title+"</p>";
    h+=s.svg;
    h+="</div>";
  }
  h+="</div>";
  return h;
}

/* =====================================================================
   ИНТЕРАКТИВНОЕ ПОЛЕ ВЕКТОРОВ (увеличенное)
   ===================================================================== */

global.__vecFields={}; /* хранит векторы по ID поля */

global.__vecInit=function(svgId, vecsJson){
  var svg=document.getElementById(svgId);
  if(!svg)return;
  global.__vecFields[svgId]=JSON.parse(vecsJson);
  global.__vecRedraw(svgId);
};

global.__vecRedraw=function(svgId){
  var svg=document.getElementById(svgId);
  if(!svg)return;
  var vecs=global.__vecFields[svgId];
  if(!vecs)return;
  var g=svg.querySelector("#vec-dynamic");
  if(!g)return;
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
  var html="";
  for(var i=0;i<vecs.length;i++){
    var v=vecs[i];
    var col=v.color||colors[i%colors.length];
    var x1=v.x1,y1=v.y1,x2=v.x2,y2=v.y2;
    var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
    var ux=dx/len,uy=dy/len,px=-uy,py=ux,aw=7;
    /* Толстая линия */
    html+="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+col+"' stroke-width='2.5'/>";
    /* Крупная стрелка */
    html+="<polygon points='"+x2+","+y2+" "+(x2-ux*14+px*aw).toFixed(0)+","+(y2-uy*14+py*aw).toFixed(0)+" "+(x2-ux*14-px*aw).toFixed(0)+","+(y2-uy*14-py*aw).toFixed(0)+"' fill='"+col+"'/>";
    /* Середина вектора — большая точка для перемещения (drag всего вектора) */
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    html+="<circle cx='"+mx.toFixed(0)+"' cy='"+my.toFixed(0)+"' r='12' fill='"+col+"' fill-opacity='0.25' stroke='"+col+"' stroke-width='2.5' style='cursor:grab' data-vid='"+i+"' data-mode='move' data-field='"+svgId+"' title='Перетаскивание'/>";
    /* Точка конца — для поворота на 180° (клик) */
    html+="<circle cx='"+x2+"' cy='"+y2+"' r='8' fill='"+col+"' fill-opacity='0.55' stroke='#fff' stroke-width='2' style='cursor:pointer' data-vid='"+i+"' data-mode='flip' data-field='"+svgId+"' title='Поворот на 180°'/>";
    /* Точка начала (декоративная) */
    html+="<circle cx='"+x1+"' cy='"+y1+"' r='4' fill='"+col+"' fill-opacity='0.85'/>";
    /* Подпись */
    if(v.label)html+="<text x='"+(x1+dx*0.5+px*20).toFixed(0)+"' y='"+(y1+dy*0.5+py*20+6).toFixed(0)+"' font-size='18' fill='"+col+"' font-weight='700' text-anchor='middle'>"+v.label+"</text>";
  }
  g.innerHTML=html;
  /* Привязка обработчиков */
  var circles=g.querySelectorAll("circle");
  for(var ci=0;ci<circles.length;ci++){
    var mode=circles[ci].getAttribute("data-mode");
    if(mode==="move"){
      circles[ci].addEventListener("mousedown",global.__vecDragStart);
      circles[ci].addEventListener("touchstart",global.__vecDragStart,{passive:false});
    }else if(mode==="flip"){
      circles[ci].addEventListener("click",global.__vecFlip);
    }
  }
};

/* Поворот вектора на 180° — меняем местами начало и конец */
global.__vecFlip=function(e){
  e.preventDefault();
  var circle=e.currentTarget||e.target;
  var vid=parseInt(circle.getAttribute("data-vid"));
  var fieldId=circle.getAttribute("data-field");
  var v=global.__vecFields[fieldId][vid];
  var tx=v.x1, ty=v.y1;
  v.x1=v.x2; v.y1=v.y2;
  v.x2=tx; v.y2=ty;
  global.__vecRedraw(fieldId);
};

global.__vecDrag={active:false,vid:-1,field:"",startX:0,startY:0,origX1:0,origY1:0,origX2:0,origY2:0};

global.__vecDragStart=function(e){
  e.preventDefault();
  if(e.touches)e=e.touches[0];
  var circle=e.currentTarget || e.target;
  global.__vecDrag.active=true;
  global.__vecDrag.vid=parseInt(circle.getAttribute("data-vid"));
  global.__vecDrag.field=circle.getAttribute("data-field");
  var svg=document.getElementById(global.__vecDrag.field);
  if(!svg)return;
  var pt=svg.createSVGPoint();
  pt.x=e.clientX; pt.y=e.clientY;
  var ctm=svg.getScreenCTM();
  if(!ctm)return;
  var loc=pt.matrixTransform(ctm.inverse());
  global.__vecDrag.startX=loc.x;
  global.__vecDrag.startY=loc.y;
  var v=global.__vecFields[global.__vecDrag.field][global.__vecDrag.vid];
  global.__vecDrag.origX1=v.x1;
  global.__vecDrag.origY1=v.y1;
  global.__vecDrag.origX2=v.x2;
  global.__vecDrag.origY2=v.y2;
};

global.__vecDragMove=function(e){
  if(!global.__vecDrag.active)return;
  e.preventDefault();
  if(e.touches)e=e.touches[0];
  var svg=document.getElementById(global.__vecDrag.field);
  if(!svg)return;
  var pt=svg.createSVGPoint();
  pt.x=e.clientX; pt.y=e.clientY;
  var ctm=svg.getScreenCTM();
  if(!ctm)return;
  var loc=pt.matrixTransform(ctm.inverse());
  var dx=loc.x-global.__vecDrag.startX;
  var dy=loc.y-global.__vecDrag.startY;
  var v=global.__vecFields[global.__vecDrag.field][global.__vecDrag.vid];
  v.x1=Math.round(global.__vecDrag.origX1+dx);
  v.y1=Math.round(global.__vecDrag.origY1+dy);
  v.x2=Math.round(global.__vecDrag.origX2+dx);
  v.y2=Math.round(global.__vecDrag.origY2+dy);
  global.__vecRedraw(global.__vecDrag.field);
};

global.__vecDragEnd=function(){
  global.__vecDrag.active=false;
};

if(typeof document!=="undefined"&&!global.__vecGlobalHandlers){
  document.addEventListener("mousemove",global.__vecDragMove);
  document.addEventListener("mouseup",global.__vecDragEnd);
  document.addEventListener("touchmove",global.__vecDragMove,{passive:false});
  document.addEventListener("touchend",global.__vecDragEnd);
  global.__vecGlobalHandlers=true;
}

/* Создаёт интерактивное SVG-поле (увеличенное: 820×540) */
function interactiveField(vecs, fieldId, instruction){
  var W=820, H=540;
  var vecsCopy=vecs.map(function(v){return {x1:v.x1,y1:v.y1,x2:v.x2,y2:v.y2,label:v.label,color:v.color};});
  global.__vecFields[fieldId]=vecsCopy;
  var h="<div class='tz-graph-wrap' style='max-width:760px'>";
  h+="<svg id='"+fieldId+"' width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='background:#fafafa;border:1px solid #ddd;border-radius:10px;touch-action:none'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='8'/>";
  h+="<text x='14' y='24' font-size='13' fill='#888'>Тяните за большую точку в середине вектора — перемещение. Клик по концу — поворот на 180°.</text>";
  h+="<g id='vec-dynamic'></g>";
  h+="</svg>";
  h+="<p style='color:#666;font-size:14px;text-align:center;margin:6px 0'>"+instruction+"</p>";
  h+="</div>";
  if(typeof document!=="undefined"&&typeof setTimeout!=="undefined"){
    setTimeout(function(){
      var svg=document.getElementById(fieldId);
      if(svg&&global.__vecFields[fieldId])global.__vecRedraw(fieldId);
    },50);
  }
  return h;
}

/* Генерация вектора — координаты в пикселях SVG. scale по умолчанию 50 (крупный). */
function makeVec(len, angleDeg, label, color, scale){
  scale=scale||50;
  var rad=angleDeg*Math.PI/180;
  return {len:len, angle:angleDeg, label:label, color:color, scale:scale,
    dx:Math.round(len*scale*Math.cos(rad)), dy:-Math.round(len*scale*Math.sin(rad))};
}
/* Вектор для мини-чертежей решения (масштаб 28 px/ед) */
function solVec(len, angleDeg, label, color){return makeVec(len,angleDeg,label,color,28);}

/* =====================================================================
   ТИПЫ 1-5: Интерактивные (с пошаговыми чертежами решения)
   ===================================================================== */

/* Тип 1: Сумма двух векторов (правило треугольника) */
function genType1(rng){
  var len1=ri(rng,3,7), len2=ri(rng,3,7);
  var ang1=ri(rng,0,30), ang2=ri(rng,60,120);
  var angleBetween=ang2-ang1;
  var cosA=Math.cos(angleBetween*Math.PI/180);
  var ans=Math.sqrt(len1*len1+len2*len2+2*len1*len2*cosA);
  /* Интерактивное поле — крупные векторы (scale 50) */
  var v1=makeVec(len1,ang1,"a","#2f6fd0");
  var v2=makeVec(len2,ang2,"b","#3aa758");
  var vecs=[
    {x1:140,y1:420,x2:140+v1.dx,y2:420+v1.dy,label:"a",color:"#2f6fd0"},
    {x1:540,y1:240,x2:540+v2.dx,y2:240+v2.dy,label:"b",color:"#3aa758"}
  ];
  var qText="<p>Даны два вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+". Угол между ними — "+angleBetween+"°.</p>";
  qText+="<p>Перетащите векторы так, чтобы начало "+vec("b")+" совпало с концом "+vec("a")+". Найдите |"+vec("a")+" + "+vec("b")+"|.</p>";
  qText+=interactiveField(vecs,"vf1","Тяните за большую точку в середине — перемещение. Клик по концу — поворот на 180°");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  /* Чертежи решения — масштаб 28 (solVec) */
  var s1=solVec(len1,ang1,"a"), s2=solVec(len2,ang2,"b");
  var startX=80, startY=260;
  var endX1=startX+s1.dx, endY1=startY+s1.dy;
  var sumEndX=endX1+s2.dx, sumEndY=endY1+s2.dy;
  var det="";
  det+=step("Шаг 1. Правило треугольника","Чтобы сложить "+vec("a")+" и "+vec("b")+", нужно начало "+vec("b")+" совместить с концом "+vec("a")+". Тогда суммой будет вектор, идущий от начала "+vec("a")+" к концу "+vec("b")+".");
  det+=svgSteps([
    {title:"Исходные векторы a и b", svg:svgStatic([
      {x1:60,y1:230,x2:60+s1.dx,y2:230+s1.dy,label:"a"},
      {x1:240,y1:170,x2:240+s2.dx,y2:170+s2.dy,label:"b",color:"#3aa758"}
    ],"Дано", {W:380,H:300})},
    {title:"Совместили начало b с концом a", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"}
    ],"Правило треугольника", {W:380,H:300})}
  ]);
  det+=step("Шаг 2. Теорема косинусов","|"+vec("s")+"|² = |"+vec("a")+"|² + |"+vec("b")+"|² + 2·|"+vec("a")+"|·|"+vec("b")+"|·cos"+angleBetween+"° = "+len1+"² + "+len2+"² + 2·"+len1+"·"+len2+"·cos"+angleBetween+"°");
  det+=step("Вычисление","= "+(len1*len1)+" + "+(len2*len2)+" + "+fmt(2*len1*len2*cosA)+" = "+fmt(len1*len1+len2*len2+2*len1*len2*cosA)+". |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
  det+=svgSteps([
    {title:"Сумма a+b (красный)", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"},
      {x1:startX,y1:startY,x2:sumEndX,y2:sumEndY,label:"a+b",color:"#dc503c"}
    ],"Результат сложения", {W:420,H:340})}
  ]);
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, теорема косинусов",detailed:det});
}

/* Тип 2: Сумма перпендикулярных векторов */
function genType2(rng){
  var len1=ri(rng,3,8), len2=ri(rng,3,8);
  var ans=Math.sqrt(len1*len1+len2*len2);
  var v1=makeVec(len1,0,"a","#2f6fd0");
  var v2=makeVec(len2,90,"b","#3aa758");
  var vecs=[
    {x1:140,y1:380,x2:140+v1.dx,y2:380,label:"a",color:"#2f6fd0"},
    {x1:580,y1:280,x2:580,y2:280+v2.dy,label:"b",color:"#3aa758"}
  ];
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" (вправо) и "+vec("b")+" длиной "+len2+" (вверх).</p>";
  qText+="<p>Перетащите векторы, совместив начало "+vec("b")+" с концом "+vec("a")+". Найдите |"+vec("a")+" + "+vec("b")+"|.</p>";
  qText+=interactiveField(vecs,"vf2","Тяните за середину вектора. Клик по концу — поворот на 180°");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var s1=solVec(len1,0,"a"), s2=solVec(len2,90,"b");
  var startX=100, startY=260;
  var endX1=startX+s1.dx, endY1=startY;
  var sumEndX=endX1, sumEndY=endY1+s2.dy;
  var det="";
  det+=step("Шаг 1. Правило треугольника","Совместим начало "+vec("b")+" с концом "+vec("a")+". Сумма — вектор от начала "+vec("a")+" к концу "+vec("b")+".");
  det+=svgSteps([
    {title:"Исходные векторы", svg:svgStatic([
      {x1:60,y1:230,x2:60+s1.dx,y2:230,label:"a"},
      {x1:260,y1:230,x2:260,y2:230+s2.dy,label:"b",color:"#3aa758"}
    ],"Дано: a ⊥ b", {W:380,H:300})},
    {title:"Совместили b с концом a", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"}
    ],"Правило треугольника", {W:380,H:300})}
  ]);
  det+=step("Шаг 2. Теорема Пифагора","Так как a ⊥ b, угол между ними 90°, cos 90° = 0. |"+vec("a")+" + "+vec("b")+"|² = "+len1+"² + "+len2+"² = "+(len1*len1)+" + "+(len2*len2)+" = "+(len1*len1+len2*len2)+".");
  det+=step("Вычисление","|"+vec("a")+" + "+vec("b")+"| = √("+(len1*len1+len2*len2)+") = <b>"+fmt(ans)+"</b>.");
  det+=svgSteps([
    {title:"Сумма a+b (гипотенуза)", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"},
      {x1:startX,y1:startY,x2:sumEndX,y2:sumEndY,label:"a+b",color:"#dc503c"}
    ],"Результат: гипотенуза", {W:420,H:340})}
  ]);
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, теорема Пифагора",detailed:det});
}

/* Тип 3: Разность векторов */
function genType3(rng){
  var len1=ri(rng,5,9), len2=ri(rng,3,7);
  var ans=Math.sqrt(len1*len1+len2*len2);
  var v1=makeVec(len1,0,"a","#2f6fd0");
  var v2=makeVec(len2,90,"b","#3aa758");
  var vecs=[
    {x1:160,y1:380,x2:160+v1.dx,y2:380,label:"a",color:"#2f6fd0"},
    {x1:580,y1:280,x2:580,y2:280+v2.dy,label:"b",color:"#3aa758"}
  ];
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" (вправо) и "+vec("b")+" длиной "+len2+" (вверх).</p>";
  qText+="<p>Совместите <b>начала</b> векторов. Найдите |"+vec("a")+" − "+vec("b")+"|.</p>";
  qText+=interactiveField(vecs,"vf3","Тяните за середину. Клик по концу — поворот на 180°");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var s1=solVec(len1,0,"a"), s2=solVec(len2,90,"b");
  var startX=120, startY=200;
  var endX1=startX+s1.dx, endY1=startY;
  var negBX=startX, negBY=startY-s2.dy; /* s2.dy отрицательный (вверх), -b идёт вниз */
  var det="";
  det+=step("Шаг 1. Преобразование разности",vec("a")+" − "+vec("b")+" = "+vec("a")+" + (−"+vec("b")+"). Вектор −"+vec("b")+" направлен противоположно "+vec("b")+" (вниз).");
  det+=svgSteps([
    {title:"Исходные векторы", svg:svgStatic([
      {x1:60,y1:200,x2:60+s1.dx,y2:200,label:"a"},
      {x1:300,y1:120,x2:300,y2:120+s2.dy,label:"b",color:"#3aa758"}
    ],"Дано", {W:380,H:300})},
    {title:"Совместили начала a и -b", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:startX,y1:startY,x2:negBX,y2:negBY,label:"-b",color:"#e8a820"}
    ],"Правило треугольника", {W:380,H:340})}
  ]);
  det+=step("Шаг 2. Теорема Пифагора","a ⊥ (−b), угол 90°. |"+vec("a")+" − "+vec("b")+"|² = "+len1+"² + "+len2+"² = "+(len1*len1+len2*len2)+".");
  det+=step("Вычисление","|"+vec("a")+" − "+vec("b")+"| = √("+(len1*len1+len2*len2)+") = <b>"+fmt(ans)+"</b>.");
  det+=svgSteps([
    {title:"Разность a-b (красный)", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:startX,y1:startY,x2:negBX,y2:negBY,label:"-b",color:"#e8a820"},
      {x1:startX,y1:startY,x2:endX1,y2:negBY,label:"a-b",color:"#dc503c"}
    ],"Результат вычитания", {W:420,H:380})}
  ]);
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести начала, a−b=a+(−b)",detailed:det});
}

/* Тип 4: Сумма трёх векторов */
function genType4(rng){
  var a=ri(rng,3,6), b=ri(rng,3,6), c=ri(rng,2,5);
  var ans=Math.sqrt((a-c)*(a-c)+b*b);
  var vecs=[
    {x1:140,y1:400,x2:140+a*50,y2:400,label:"a",color:"#2f6fd0"},
    {x1:480,y1:160,x2:480,y2:160-b*50,label:"b",color:"#3aa758"},
    {x1:620,y1:440,x2:620-c*50,y2:440,label:"c",color:"#e8a820"}
  ];
  var qText="<p>Даны три вектора: "+vec("a")+" = "+a+" (вправо), "+vec("b")+" = "+b+" (вверх), "+vec("c")+" = "+c+" (влево).</p>";
  qText+="<p>Выстройте векторы друг за другом (конец "+vec("a")+" → начало "+vec("b")+", конец "+vec("b")+" → начало "+vec("c")+"). Найдите |"+vec("a")+" + "+vec("b")+" + "+vec("c")+"|.</p>";
  qText+=interactiveField(vecs,"vf4","Тяните за середину. Клик по концу — поворот на 180°");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  /* Решение: масштаб 28 */
  var sa=a*28, sb=b*28, sc=c*28;
  var startX=80, startY=300;
  var p1x=startX+sa, p1y=startY;
  var p2x=p1x, p2y=p1y-sb;
  var p3x=p2x-sc, p3y=p2y;
  var det="";
  det+=step("Шаг 1. Правило многоугольника","Выстраиваем векторы друг за другом: a → b → c. Каждый следующий начинается там, где кончается предыдущий.");
  det+=svgSteps([
    {title:"Исходные векторы", svg:svgStatic([
      {x1:60,y1:230,x2:60+sa,y2:230,label:"a"},
      {x1:240,y1:230,x2:240,y2:230-sb,label:"b",color:"#3aa758"},
      {x1:340,y1:230,x2:340-sc,y2:230,label:"c",color:"#e8a820"}
    ],"Дано", {W:380,H:300})},
    {title:"Выстроили a→b→c", svg:svgStatic([
      {x1:startX,y1:startY,x2:p1x,y2:p1y,label:"a"},
      {x1:p1x,y1:p1y,x2:p2x,y2:p2y,label:"b",color:"#3aa758"},
      {x1:p2x,y1:p2y,x2:p3x,y2:p3y,label:"c",color:"#e8a820"}
    ],"Правило многоугольника", {W:380,H:340})}
  ]);
  det+=step("Шаг 2. Сумма по компонентам","Горизонталь: "+a+" − "+c+" = "+(a-c)+". Вертикаль: "+b+".");
  det+=step("Шаг 3. Теорема Пифагора","|"+vec("s")+"| = √("+(a-c)+"² + "+b+"²) = √("+((a-c)*(a-c))+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+=svgSteps([
    {title:"Сумма a+b+c (красный)", svg:svgStatic([
      {x1:startX,y1:startY,x2:p1x,y2:p1y,label:"a"},
      {x1:p1x,y1:p1y,x2:p2x,y2:p2y,label:"b",color:"#3aa758"},
      {x1:p2x,y1:p2y,x2:p3x,y2:p3y,label:"c",color:"#e8a820"},
      {x1:startX,y1:startY,x2:p3x,y2:p3y,label:"s",color:"#dc503c"}
    ],"Итоговая сумма", {W:420,H:360})}
  ]);
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Выстрой a→b→c, сложи горизонталь и вертикаль",detailed:det});
}

/* Тип 5: Замкнутый контур */
function genType5(rng){
  var n=ri(rng,5,8);
  var vecs=[];
  var lens=[];
  for(var i=0;i<n;i++){
    var l=ri(rng,3,7);
    lens.push(l);
    var ang=ri(rng,0,360);
    var rad=ang*Math.PI/180;
    var scale=50;
    var dx=Math.round(l*scale*Math.cos(rad));
    var dy=-Math.round(l*scale*Math.sin(rad));
    vecs.push({x1:120+ri(rng,0,500),y1:80+ri(rng,0,360),x2:0,y2:0,label:String.fromCharCode(97+i)});
    vecs[i].x2=vecs[i].x1+dx;
    vecs[i].y2=vecs[i].y1+dy;
  }
  var qText="<p>Дано "+n+" векторов: ";
  for(var i=0;i<n;i++)qText+=vec(String.fromCharCode(97+i))+"="+lens[i]+(i<n-1?", ":"");
  qText+=".</p><p>Выстройте векторы в <b>замкнутый контур</b> (конец последнего → начало первого). Чему равна сумма?</p>";
  qText+=interactiveField(vecs,"vf5","Тяните за середину. Клик по концу — поворот на 180°");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  /* Демонстрация замкнутого контура */
  var cx=200, cy=170, r=110;
  var demo=[];
  for(var i=0;i<n;i++){
    var ang=i*2*Math.PI/n-Math.PI/2;
    var x1=cx+r*Math.cos(ang), y1=cy+r*Math.sin(ang);
    var ang2=(i+1)*2*Math.PI/n-Math.PI/2;
    var x2=cx+r*Math.cos(ang2), y2=cy+r*Math.sin(ang2);
    demo.push({x1:x1,y1:y1,x2:x2,y2:y2,label:String.fromCharCode(97+i)});
  }
  var det="";
  det+=step("Шаг 1. Замкнутый контур","Конец последнего вектора совпадает с началом первого. Значит, пройдя по всем векторам, мы возвращаемся в исходную точку.");
  det+=svgSteps([
    {title:"Пример замкнутого контура", svg:svgStatic(demo,"Контур из "+n+" векторов", {W:400,H:340})}
  ]);
  det+=step("Шаг 2. Сумма векторов","Сумма векторов, образующих замкнутый контур, равна нулевому вектору: "+vec("a")+" + "+vec("b")+" + ... = "+vec("0")+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>0</span></p>";
  return mkDec({q:qText,a:0,sol:"0",hint:"Замкнутый контур → сумма = 0",detailed:det});
}

/* ===== ТИПЫ 6-10: По прототипам ===== */

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
  var sc=a*26; /* масштаб для чертежа (помещается в 680×420) */
  var det="";
  det+=step("Анализ","Все стороны = "+a+", углы = 60°.");
  if(variant==="а"){
    det+=step("Решение",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+" (правило треугольника). |"+vec("AC")+"| = "+a+".");
    det+=svgStatic([
      {x1:120,y1:340,x2:120+sc,y2:340,label:"AB"},
      {x1:120+sc,y1:340,x2:120+sc+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"BC",color:"#3aa758"},
      {x1:120,y1:340,x2:120+sc+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"AC",color:"#dc503c"}
    ],"AB+BC=AC");
  }else if(variant==="б"){
    det+=step("Решение","|"+vec("s")+"|² = a² + a² + 2a²·cos60° = 2a² + a² = 3a². |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
    det+=svgStatic([
      {x1:120,y1:340,x2:120+sc,y2:340,label:"AB"},
      {x1:120,y1:340,x2:120+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"AC",color:"#3aa758"},
      {x1:120,y1:340,x2:120+sc+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"s",color:"#dc503c"}
    ],"AB+AC (угол 60°)");
  }else if(variant==="в"){
    det+=step("Решение","Угол между AB и CB равен 120°. |"+vec("s")+"|² = 2a² + 2a²·cos120° = 2a² − a² = a²... нет, перепроверим: 2a² + 2a²·(−1/2) = a². На самом деле угол между ними как векторами = 60°, |"+vec("s")+"|² = 3a². |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
    det+=svgStatic([
      {x1:120,y1:340,x2:120+sc,y2:340,label:"AB"},
      {x1:120+sc,y1:340,x2:120,y2:340,label:"CB",color:"#3aa758"},
      {x1:120,y1:340,x2:120+sc,y2:340,label:"s",color:"#dc503c"}
    ],"AB+CB");
  }else if(variant==="г"){
    det+=step("Решение",vec("BA")+" − "+vec("BC")+" = "+vec("BA")+" + "+vec("CB")+". |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
    det+=svgStatic([
      {x1:120+sc,y1:340,x2:120,y2:340,label:"BA"},
      {x1:120+sc,y1:340,x2:120+sc+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"CB",color:"#3aa758"},
      {x1:120+sc,y1:340,x2:120+sc*2+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"s",color:"#dc503c"}
    ],"BA+CB");
  }else{
    det+=step("Решение",vec("AB")+" − "+vec("AC")+" = "+vec("CB")+". |"+vec("CB")+"| = "+a+".");
    det+=svgStatic([
      {x1:120,y1:340,x2:120+sc,y2:340,label:"AB"},
      {x1:120,y1:340,x2:120+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"AC",color:"#3aa758"},
      {x1:120+sc,y1:340,x2:120+sc/2,y2:340-sc*Math.sin(Math.PI/3),label:"CB",color:"#dc503c"}
    ],"AB−AC=CB");
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Правило треугольника + косинусы",detailed:det});
}

function genType7(rng){
  var ab=ri(rng,3,9), bc=ri(rng,4,10);
  var variant=pick(rng,["а","б","в","г"]);
  var what2,ans2;
  if(variant==="а"){what2="|"+vec("BA")+" − "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  else if(variant==="б"){what2="|"+vec("AB")+" + "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  else if(variant==="в"){what2="|"+vec("BA")+" + "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  else{what2="|"+vec("AB")+" − "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);}
  var qText="В треугольнике ABC: AB = "+ab+", BC = "+bc+", ∠B = 90°. Найдите "+variant+") "+what2+"."+NOTE;
  var sab=ab*26, sbc=bc*26;
  var det="";
  det+=step("Анализ","∠B = 90°, векторы BA и BC (или AB и BC) перпендикулярны.");
  det+=step("Решение","|"+vec("s")+"| = √("+ab+"² + "+bc+"²) = √("+(ab*ab)+" + "+(bc*bc)+") = <b>"+fmt(ans2)+"</b>.");
  det+=svgSteps([
    {title:"Треугольник ABC (∠B=90°)", svg:svgStatic([
      {x1:120,y1:340,x2:120+sab,y2:340,label:"AB"},
      {x1:120+sab,y1:340,x2:120+sab,y2:340-sbc,label:"BC",color:"#3aa758"},
      {x1:120,y1:340,x2:120+sab,y2:340-sbc,label:"AC",color:"#dc503c"}
    ],"Прямоугольный треугольник", {W:480,H:380})}
  ]);
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans2)+"</span></p>";
  return mkDec({q:qText,a:ans2,sol:fmt(ans2),hint:"∠B=90° → Пифагор",detailed:det});
}

function genType8(rng){
  var variant=pick(rng,["а","б"]);
  var qText,det,correct;
  if(variant==="а"){
    qText="Упростите: ("+vec("AB")+" + "+vec("BC")+" − "+vec("MC")+") + ("+vec("MD")+" − "+vec("KD")+").";
    det=step("Решение","AB+BC=AC, −MC=CM, AC+CM=AM, AM+MD=AD, AD−KD=AK.");
    correct="AK";
  }else{
    qText="Упростите: ("+vec("CB")+" + "+vec("AC")+" + "+vec("BD")+") − ("+vec("MK")+" + "+vec("KD")+").";
    det=step("Решение","AC+CB=AB, AB+BD=AD, −MK=KM, AD+KM−KD=AM.");
    correct="AM";
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec(correct)+"</span></p>";
  return mkMC({q:qText,c:correct,opts:[correct,correct==="AK"?"AM":"AK","0","AD"],sol:correct,hint:"AB+BC=AC",detailed:det});
}

function genType9(rng){
  var qText="Дан треугольник ABC. Выразите через "+vec("a")+" = "+vec("AB")+" и "+vec("b")+" = "+vec("AC")+": а) "+vec("BA")+"; б) "+vec("CB")+"; в) "+vec("CB")+" + "+vec("BA")+".";
  var det="";
  det+=step("а)",vec("BA")+" = −"+vec("a")+".");
  det+=step("б)",vec("CB")+" = "+vec("CA")+" + "+vec("AB")+" = −"+vec("b")+" + "+vec("a")+" = "+vec("a")+" − "+vec("b")+".");
  det+=step("в)",vec("CB")+" + "+vec("BA")+" = ("+vec("a")+" − "+vec("b")+") + (−"+vec("a")+") = −"+vec("b")+".");
  det+=svgStatic([
    {x1:100,y1:380,x2:300,y2:380,label:"a"},
    {x1:100,y1:380,x2:200,y2:200,label:"b",color:"#3aa758"},
    {x1:300,y1:380,x2:200,y2:200,label:"CB",color:"#e8a820"}
  ],"Треугольник ABC");
  det+="<p><b>Ответ:</b> а) −"+vec("a")+"; б) "+vec("a")+" − "+vec("b")+"; в) −"+vec("b")+".</p>";
  return mkMC({q:qText,c:"в) −b",opts:["в) −b","в) a−b","в) −a","в) a+b"],sol:"−b",hint:"BA=−AB, CB=CA+AB",detailed:det});
}

function genType10(rng){
  var qText="Докажите: "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+".";
  var det="";
  det+=step("Доказательство","AB+BC=AC (правило треугольника). AC+CD=AD. AD+DA=0 (противоположные векторы).");
  det+=step("Итог",vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("AC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("AD")+" + "+vec("DA")+" = "+vec("0")+". ∎");
  det+=svgStatic([
    {x1:120,y1:360,x2:320,y2:340,label:"AB"},
    {x1:320,y1:340,x2:440,y2:180,label:"BC",color:"#3aa758"},
    {x1:440,y1:180,x2:220,y2:140,label:"CD",color:"#e8a820"},
    {x1:220,y1:140,x2:120,y2:360,label:"DA",color:"#dc503c"}
  ],"Замкнутый контур ABCD");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec("0")+"</span></p>";
  return mkMC({q:qText,c:"Доказано",opts:["Доказано","Не доказано"],sol:"0",hint:"Сумма по замкнутому контуру = 0",detailed:det});
}

var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){return ALL_TYPES.map(function(gen){return gen(rng);});}

function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){var p=["./trenazher-data.js","../lessons/trenazher-data.js"];for(var i=0;i<p.length;i++){try{var tz=require(p[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}}}
  return null;
}
function register(){
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="vektory")return;
  TZ.TOPICS.push({id:"vektory",subject:"Математика",grade:"9 класс",title:"Векторы",variants:40,
    desc:"Тренажёр по геометрии (9 класс): векторы. 10 заданий от простого к сложному: 5 интерактивных + 5 по прототипам.",
    blocks:[{name:"Векторы",gen:genVariant,count:10}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
