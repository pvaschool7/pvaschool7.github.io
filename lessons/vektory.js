/* =====================================================================
   Тренажёр · 9 класс · Геометрия · Векторы (начало изучения)
   40 вариантов × 10 заданий.
   Задачи 1-5: интерактивное построение (ответ — чертёж, без чисел).
   Задачи 6-10: численный ответ с подробным чертежом в решении.
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
/* Новый тип: veccheck — ответ = правильное построение векторов на поле */
function mkVecCheck(opts){
  return {type:"veccheck",q:opts.q,checkType:opts.checkType,fieldId:opts.fieldId,
    sol:"чертёж",hint:opts.hint||"",detailed:opts.detailed||""};
}
function step(title,html){return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";}
function vec(name){return "<span style='text-decoration:overline'>"+name+"</span>";}

/* ---------- SVG: статичный чертёж (крупный) ---------- */
function svgStatic(vectors, title, opts){
  opts=opts||{};
  var W=opts.W||760, H=opts.H||480;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='10'/>";
  if(title)h+="<text x='"+(W/2)+"' y='24' font-size='16' fill='#555' font-weight='600' text-anchor='middle'>"+title+"</text>";
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i];
    var col=v.color||colors[i%colors.length];
    h+=drawArrow(v.x1,v.y1,v.x2,v.y2,v.label,col,opts.dim && opts.dim[i], v.dashed);
  }
  h+="</svg>";
  return h;
}

/* Отрисовка одной стрелки (крупная, толщина 3) */
function drawArrow(x1,y1,x2,y2,label,color,dim,dashed){
  color=color||"#2f6fd0";
  var op=dim?0.3:1;
  var dashAttr=dashed?" stroke-dasharray='8,5'":"";
  var dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)||1;
  var ux=dx/len, uy=dy/len, px=-uy, py=ux, aw=9;
  var h="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='3' stroke-opacity='"+op+"'"+dashAttr+"/>";
  h+="<polygon points='"+x2+","+y2+" "+(x2-ux*16+px*aw)+","+(y2-uy*16+py*aw)+" "+(x2-ux*16-px*aw)+","+(y2-uy*16-py*aw)+"' fill='"+color+"' fill-opacity='"+op+"'/>";
  h+="<circle cx='"+x1+"' cy='"+y1+"' r='5' fill='"+color+"' fill-opacity='"+op+"'/>";
  if(label)h+="<text x='"+(x1+dx*0.5+px*20)+"' y='"+(y1+dy*0.5+py*20+6)+"' font-size='20' fill='"+color+"' font-weight='700' text-anchor='middle' fill-opacity='"+op+"'>"+label+"</text>";
  return h;
}

/* Пошаговый блок: несколько SVG с подписями */
function svgSteps(steps){
  var h="<div class='tz-steps' style='display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin:14px 0'>";
  for(var i=0;i<steps.length;i++){
    var s=steps[i];
    h+="<div style='flex:1 1 380px;min-width:340px;max-width:440px'>";
    h+="<p style='text-align:center;font-size:14px;color:#555;font-weight:600;margin:4px 0'>"+s.title+"</p>";
    h+=s.svg;
    h+="</div>";
  }
  h+="</div>";
  return h;
}

/* =====================================================================
   ИНТЕРАКТИВНОЕ ПОЛЕ ВЕКТОРОВ (крупное: 960×620, scale 75)
   ===================================================================== */

global.__vecFields={};

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
    var ux=dx/len,uy=dy/len,px=-uy,py=ux,aw=6;
    html+="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+col+"' stroke-width='2.5'/>";
    html+="<polygon points='"+x2+","+y2+" "+(x2-ux*12+px*aw).toFixed(0)+","+(y2-uy*12+py*aw).toFixed(0)+" "+(x2-ux*12-px*aw).toFixed(0)+","+(y2-uy*12-py*aw).toFixed(0)+"' fill='"+col+"'/>";
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    html+="<circle cx='"+mx.toFixed(0)+"' cy='"+my.toFixed(0)+"' r='10' fill='"+col+"' fill-opacity='0.25' stroke='"+col+"' stroke-width='2.5' style='cursor:grab' data-vid='"+i+"' data-mode='move' data-field='"+svgId+"' title='Перетаскивание'/>";
    html+="<circle cx='"+x2+"' cy='"+y2+"' r='6' fill='"+col+"' fill-opacity='0.55' stroke='#fff' stroke-width='2' style='cursor:pointer' data-vid='"+i+"' data-mode='flip' data-field='"+svgId+"' title='Поворот на 180°'/>";
    html+="<circle cx='"+x1+"' cy='"+y1+"' r='4' fill='"+col+"' fill-opacity='0.85'/>";
    if(v.label)html+="<text x='"+(x1+dx*0.5+px*18).toFixed(0)+"' y='"+(y1+dy*0.5+py*18+5).toFixed(0)+"' font-size='17' fill='"+col+"' font-weight='700' text-anchor='middle'>"+v.label+"</text>";
  }
  g.innerHTML=html;
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

/* Создаёт интерактивное SVG-поле (крупное: 960×620) */
function interactiveField(vecs, fieldId, instruction){
  var W=640, H=415;
  var vecsCopy=vecs.map(function(v){return {x1:v.x1,y1:v.y1,x2:v.x2,y2:v.y2,label:v.label,color:v.color};});
  global.__vecFields[fieldId]=vecsCopy;
  var h="<div class='tz-graph-wrap' style='max-width:680px'>";
  h+="<svg id='"+fieldId+"' width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='background:#fafafa;border:1px solid #ddd;border-radius:10px;touch-action:none'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='8'/>";
  h+="<text x='12' y='20' font-size='12' fill='#888'>Тяните за точку в середине вектора — перемещение. Клик по концу — поворот на 180°.</text>";
  h+="<g id='vec-dynamic'></g>";
  h+="</svg>";
  h+="<p style='color:#666;font-size:13px;text-align:center;margin:6px 0'>"+instruction+"</p>";
  h+="</div>";
  if(typeof document!=="undefined"&&typeof setTimeout!=="undefined"){
    setTimeout(function(){
      var svg=document.getElementById(fieldId);
      if(svg&&global.__vecFields[fieldId])global.__vecRedraw(fieldId);
    },50);
  }
  return h;
}

/* Генерация вектора — координаты в пикселях SVG. scale по умолчанию 75 (крупный). */
function makeVec(len, angleDeg, label, color, scale){
  scale=scale||50;
  var rad=angleDeg*Math.PI/180;
  return {len:len, angle:angleDeg, label:label, color:color, scale:scale,
    dx:Math.round(len*scale*Math.cos(rad)), dy:-Math.round(len*scale*Math.sin(rad))};
}
/* Вектор для чертежей решения (масштаб 38 px/ед) */
function solVec(len, angleDeg, label, color){return makeVec(len,angleDeg,label,color,38);}

/* =====================================================================
   ПРОВЕРКА ПОСТРОЕНИЯ ВЕКТОРОВ
   checkType:
     "chain2" — b.x1≈a.x2 и b.y1≈a.y2 (b пристыкован к концу a)
     "sameStart2" — a.x1≈b.x1 и a.y1≈b.y1 (начала a и b совпадают)
     "chain3" — b.x1≈a.x2, b.y1≈a.y2 и c.x1≈b.x2, c.y1≈b.y2
     "closed" — замкнутый контур: конец i = начало i+1, конец посл. = начало первого
   ===================================================================== */
global.__vecCheck=function(fieldId, checkType){
  var vecs=global.__vecFields[fieldId];
  if(!vecs||!vecs.length)return false;
  var TOL=18; /* допуск в пикселях */
  function dist(a,b){return Math.sqrt(a*a+b*b);}
  function close(p1,p2){return dist(p1.x-p2.x, p1.y-p2.y)<TOL;}
  if(checkType==="chain2"&&vecs.length>=2){
    var a=vecs[0], b=vecs[1];
    return close({x:a.x2,y:a.y2}, {x:b.x1,y:b.y1});
  }
  if(checkType==="sameStart2"&&vecs.length>=2){
    var a2=vecs[0], b2=vecs[1];
    return close({x:a2.x1,y:a2.y1}, {x:b2.x1,y:b2.y1});
  }
  if(checkType==="chain3"&&vecs.length>=3){
    var a3=vecs[0], b3=vecs[1], c3=vecs[2];
    return close({x:a3.x2,y:a3.y2},{x:b3.x1,y:b3.y1}) &&
           close({x:b3.x2,y:b3.y2},{x:c3.x1,y:c3.y1});
  }
  if(checkType==="closed"&&vecs.length>=3){
    for(var i=0;i<vecs.length;i++){
      var cur=vecs[i], nxt=vecs[(i+1)%vecs.length];
      if(!close({x:cur.x2,y:cur.y2},{x:nxt.x1,y:nxt.y1}))return false;
    }
    return true;
  }
  return false;
};

/* =====================================================================
   ТИПЫ 1-5: ИНТЕРАКТИВНОЕ ПОСТРОЕНИЕ (ответ — чертёж)
   ===================================================================== */

/* Тип 1: Сумма двух векторов (правило треугольника) */
function genType1(rng){
  var len1=ri(rng,3,6), len2=ri(rng,3,6);
  var ang1=ri(rng,0,30), ang2=ri(rng,60,120);
  var angleBetween=ang2-ang1;
  var v1=makeVec(len1,ang1,"a","#2f6fd0");
  var v2=makeVec(len2,ang2,"b","#3aa758");
  var vecs=[
    {x1:107,y1:340,x2:107+v1.dx,y2:340+v1.dy,label:"a",color:"#2f6fd0"},
    {x1:413,y1:340,x2:413+v2.dx,y2:340+v2.dy,label:"b",color:"#3aa758"}
  ];
  var fieldId="vf1_"+ri(rng,1,99999);
  var qText="<p>Даны два вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+". Угол между ними — "+angleBetween+"°.</p>";
  qText+="<p><b>Постройте сумму</b> "+vec("a")+" + "+vec("b")+" по правилу треугольника: переместите векторы так, чтобы <b>начало "+vec("b")+" совпало с концом "+vec("a")+"</b>.</p>";
  qText+=interactiveField(vecs,fieldId,"Перетащите векторы: начало b должно совпасть с концом a");
  /* Чертёж-решение: правильное построение */
  var s1=solVec(len1,ang1,"a"), s2=solVec(len2,ang2,"b");
  var startX=120, startY=320;
  var endX1=startX+s1.dx, endY1=startY+s1.dy;
  var sumEndX=endX1+s2.dx, sumEndY=endY1+s2.dy;
  var det="";
  det+=step("Правило треугольника","Чтобы сложить "+vec("a")+" и "+vec("b")+", нужно начало "+vec("b")+" совместить с концом "+vec("a")+". Сумма — вектор от начала "+vec("a")+" к концу "+vec("b")+".");
  det+=svgSteps([
    {title:"Исходные векторы a и b", svg:svgStatic([
      {x1:80,y1:280,x2:80+s1.dx,y2:280+s1.dy,label:"a"},
      {x1:400,y1:200,x2:400+s2.dx,y2:200+s2.dy,label:"b",color:"#3aa758"}
    ],"Дано", {W:420,H:380})},
    {title:"b пристыкован к концу a", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"}
    ],"Правильное построение", {W:420,H:380})}
  ]);
  det+=step("Результат","Сумма "+vec("a")+" + "+vec("b")+" — это вектор, идущий от начала "+vec("a")+" к концу "+vec("b")+" (красный).");
  det+=svgSteps([
    {title:"Сумма a+b (выделена красным)", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a",color:"#888",dim:true},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#888",dim:true},
      {x1:startX,y1:startY,x2:sumEndX,y2:sumEndY,label:"a+b",color:"#dc503c"}
    ],"Результат сложения", {W:480,H:420})}
  ]);
  return mkVecCheck({q:qText,checkType:"chain2",fieldId:fieldId,
    hint:"Перетащите b так, чтобы его начало совпало с концом a",
    detailed:det});
}

/* Тип 2: Сумма перпендикулярных векторов */
function genType2(rng){
  var len1=ri(rng,3,6), len2=ri(rng,3,6);
  var v1=makeVec(len1,0,"a","#2f6fd0");
  var v2=makeVec(len2,90,"b","#3aa758");
  var vecs=[
    {x1:107,y1:340,x2:107+v1.dx,y2:340,label:"a",color:"#2f6fd0"},
    {x1:440,y1:340,x2:440,y2:340+v2.dy,label:"b",color:"#3aa758"}
  ];
  var fieldId="vf2_"+ri(rng,1,99999);
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" (вправо) и "+vec("b")+" длиной "+len2+" (вверх).</p>";
  qText+="<p><b>Постройте сумму</b> "+vec("a")+" + "+vec("b")+": переместите векторы так, чтобы <b>начало "+vec("b")+" совпало с концом "+vec("a")+"</b>.</p>";
  qText+=interactiveField(vecs,fieldId,"Перетащите векторы: начало b должно совпасть с концом a");
  var s1=solVec(len1,0,"a"), s2=solVec(len2,90,"b");
  var startX=120, startY=300;
  var endX1=startX+s1.dx, endY1=startY;
  var sumEndX=endX1, sumEndY=endY1+s2.dy;
  var det="";
  det+=step("Правило треугольника","Совместим начало "+vec("b")+" с концом "+vec("a")+". Сумма — вектор от начала "+vec("a")+" к концу "+vec("b")+" (гипотенуза прямоугольного треугольника).");
  det+=svgSteps([
    {title:"Исходные векторы", svg:svgStatic([
      {x1:80,y1:280,x2:80+s1.dx,y2:280,label:"a"},
      {x1:340,y1:280,x2:340,y2:280+s2.dy,label:"b",color:"#3aa758"}
    ],"Дано: a ⊥ b", {W:420,H:380})},
    {title:"b пристыкован к концу a", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"}
    ],"Правильное построение", {W:420,H:380})}
  ]);
  det+=step("Результат","Сумма "+vec("a")+" + "+vec("b")+" — красный вектор (гипотенуза).");
  det+=svgSteps([
    {title:"Сумма a+b (выделена красным)", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a",color:"#888",dim:true},
      {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#888",dim:true},
      {x1:startX,y1:startY,x2:sumEndX,y2:sumEndY,label:"a+b",color:"#dc503c"}
    ],"Результат сложения", {W:480,H:420})}
  ]);
  return mkVecCheck({q:qText,checkType:"chain2",fieldId:fieldId,
    hint:"Перетащите b так, чтобы его начало совпало с концом a",
    detailed:det});
}

/* Тип 3: Разность векторов — совместить начала */
function genType3(rng){
  var len1=ri(rng,4,7), len2=ri(rng,3,5);
  var v1=makeVec(len1,0,"a","#2f6fd0");
  var v2=makeVec(len2,90,"b","#3aa758");
  var vecs=[
    {x1:120,y1:340,x2:120+v1.dx,y2:340,label:"a",color:"#2f6fd0"},
    {x1:440,y1:340,x2:440,y2:340+v2.dy,label:"b",color:"#3aa758"}
  ];
  var fieldId="vf3_"+ri(rng,1,99999);
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" (вправо) и "+vec("b")+" длиной "+len2+" (вверх).</p>";
  qText+="<p><b>Постройте разность</b> "+vec("a")+" − "+vec("b")+": переместите векторы так, чтобы <b>их начала совпадали</b>. Разность — это вектор от конца "+vec("b")+" к концу "+vec("a")+".</p>";
  qText+=interactiveField(vecs,fieldId,"Перетащите векторы: начала a и b должны совпасть");
  var s1=solVec(len1,0,"a"), s2=solVec(len2,90,"b");
  var startX=160, startY=240;
  var endX1=startX+s1.dx, endY1=startY;
  var endX2=startX, endY2=startY+s2.dy;
  var det="";
  det+=step("Правило разности",vec("a")+" − "+vec("b")+" = "+vec("a")+" + (−"+vec("b")+"). Приводим к общему началу: совмещаем начала "+vec("a")+" и "+vec("b")+". Разность — вектор от конца "+vec("b")+" к концу "+vec("a")+".");
  det+=svgSteps([
    {title:"Исходные векторы", svg:svgStatic([
      {x1:80,y1:240,x2:80+s1.dx,y2:240,label:"a"},
      {x1:360,y1:160,x2:360,y2:160+s2.dy,label:"b",color:"#3aa758"}
    ],"Дано", {W:420,H:380})},
    {title:"Начала совмещены", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a"},
      {x1:startX,y1:startY,x2:endX2,y2:endY2,label:"b",color:"#3aa758"}
    ],"Правильное построение", {W:420,H:380})}
  ]);
  det+=step("Результат","Разность "+vec("a")+" − "+vec("b")+" — красный вектор: идёт от конца "+vec("b")+" к концу "+vec("a")+".");
  det+=svgSteps([
    {title:"Разность a−b (выделена красным)", svg:svgStatic([
      {x1:startX,y1:startY,x2:endX1,y2:endY1,label:"a",color:"#888",dim:true},
      {x1:startX,y1:startY,x2:endX2,y2:endY2,label:"b",color:"#888",dim:true},
      {x1:endX2,y1:endY2,x2:endX1,y2:endY1,label:"a-b",color:"#dc503c"}
    ],"Результат вычитания", {W:480,H:420})}
  ]);
  return mkVecCheck({q:qText,checkType:"sameStart2",fieldId:fieldId,
    hint:"Перетащите векторы так, чтобы их начальные точки совпали",
    detailed:det});
}

/* Тип 4: Сумма трёх векторов (правило многоугольника) */
function genType4(rng){
  var a=ri(rng,3,5), b=ri(rng,3,5), c=ri(rng,2,4);
  var vecs=[
    {x1:107,y1:330,x2:107+a*50,y2:330,label:"a",color:"#2f6fd0"},
    {x1:373,y1:330,x2:373,y2:330-b*50,label:"b",color:"#3aa758"},
    {x1:480,y1:360,x2:480-c*50,y2:360,label:"c",color:"#e8a820"}
  ];
  var fieldId="vf4_"+ri(rng,1,99999);
  var qText="<p>Даны три вектора: "+vec("a")+" = "+a+" (вправо), "+vec("b")+" = "+b+" (вверх), "+vec("c")+" = "+c+" (влево).</p>";
  qText+="<p><b>Постройте сумму</b> "+vec("a")+" + "+vec("b")+" + "+vec("c")+" по правилу многоугольника: выстройте векторы <b>друг за другом</b> (конец "+vec("a")+" → начало "+vec("b")+", конец "+vec("b")+" → начало "+vec("c")+").</p>";
  qText+=interactiveField(vecs,fieldId,"Выстройте a → b → c друг за другом");
  var sa=a*38, sb=b*38, sc=c*38;
  var startX=100, startY=360;
  var p1x=startX+sa, p1y=startY;
  var p2x=p1x, p2y=p1y-sb;
  var p3x=p2x-sc, p3y=p2y;
  var det="";
  det+=step("Правило многоугольника","Выстраиваем векторы друг за другом: a → b → c. Каждый следующий начинается там, где кончается предыдущий.");
  det+=svgSteps([
    {title:"Исходные векторы", svg:svgStatic([
      {x1:60,y1:280,x2:60+sa,y2:280,label:"a"},
      {x1:280,y1:280,x2:280,y2:280-sb,label:"b",color:"#3aa758"},
      {x1:400,y1:280,x2:400-sc,y2:280,label:"c",color:"#e8a820"}
    ],"Дано", {W:420,H:380})},
    {title:"Выстроили a → b → c", svg:svgStatic([
      {x1:startX,y1:startY,x2:p1x,y2:p1y,label:"a"},
      {x1:p1x,y1:p1y,x2:p2x,y2:p2y,label:"b",color:"#3aa758"},
      {x1:p2x,y1:p2y,x2:p3x,y2:p3y,label:"c",color:"#e8a820"}
    ],"Правильное построение", {W:460,H:420})}
  ]);
  det+=step("Результат","Сумма "+vec("a")+" + "+vec("b")+" + "+vec("c")+" — красный вектор от начала "+vec("a")+" к концу "+vec("c")+".");
  det+=svgSteps([
    {title:"Сумма a+b+c (выделена красным)", svg:svgStatic([
      {x1:startX,y1:startY,x2:p1x,y2:p1y,label:"a",color:"#888",dim:true},
      {x1:p1x,y1:p1y,x2:p2x,y2:p2y,label:"b",color:"#888",dim:true},
      {x1:p2x,y1:p2y,x2:p3x,y2:p3y,label:"c",color:"#888",dim:true},
      {x1:startX,y1:startY,x2:p3x,y2:p3y,label:"s",color:"#dc503c"}
    ],"Итоговая сумма", {W:480,H:420})}
  ]);
  return mkVecCheck({q:qText,checkType:"chain3",fieldId:fieldId,
    hint:"Конец a → начало b, конец b → начало c",
    detailed:det});
}

/* Тип 5: Замкнутый контур */
function genType5(rng){
  var n=ri(rng,5,8);
  var vecs=[];
  var lens=[];
  for(var i=0;i<n;i++){
    var l=ri(rng,2,5);
    lens.push(l);
    var ang=ri(rng,0,360);
    var rad=ang*Math.PI/180;
    var scale=50;
    var dx=Math.round(l*scale*Math.cos(rad));
    var dy=-Math.round(l*scale*Math.sin(rad));
    vecs.push({x1:80+ri(rng,0,400),y1:60+ri(rng,0,250),x2:0,y2:0,label:String.fromCharCode(97+i)});
    vecs[i].x2=vecs[i].x1+dx;
    vecs[i].y2=vecs[i].y1+dy;
  }
  var fieldId="vf5_"+ri(rng,1,99999);
  var qText="<p>Дано "+n+" векторов: ";
  for(var i=0;i<n;i++)qText+=vec(String.fromCharCode(97+i))+"="+lens[i]+(i<n-1?", ":"");
  qText+=".</p><p><b>Постройте замкнутый контур</b>: выстройте векторы так, чтобы <b>конец каждого совпадал с началом следующего</b>, а конец последнего — с началом первого.</p>";
  qText+=interactiveField(vecs,fieldId,"Выстройте векторы в замкнутый контур");
  var cx=240, cy=220, r=140;
  var demo=[];
  for(var i=0;i<n;i++){
    var ang=i*2*Math.PI/n-Math.PI/2;
    var x1=cx+r*Math.cos(ang), y1=cy+r*Math.sin(ang);
    var ang2=(i+1)*2*Math.PI/n-Math.PI/2;
    var x2=cx+r*Math.cos(ang2), y2=cy+r*Math.sin(ang2);
    demo.push({x1:x1,y1:y1,x2:x2,y2:y2,label:String.fromCharCode(97+i)});
  }
  var det="";
  det+=step("Замкнутый контур","Конец последнего вектора совпадает с началом первого. Пройдя по всем векторам, мы возвращаемся в исходную точку.");
  det+=svgSteps([
    {title:"Пример замкнутого контура", svg:svgStatic(demo,"Контур из "+n+" векторов", {W:480,H:420})}
  ]);
  det+=step("Результат","Если векторы образуют замкнутый контур, их сумма равна нуль-вектору "+vec("0")+".");
  return mkVecCheck({q:qText,checkType:"closed",fieldId:fieldId,
    hint:"Конец каждого вектора = начало следующего; замыкаем контур",
    detailed:det});
}

/* ===== ТИПЫ 6-10: Численный ответ с большим чертежом в решении ===== */

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
  var sc=a*30;
  var det="";
  det+=step("Анализ","Все стороны = "+a+", углы = 60°.");
  if(variant==="а"){
    det+=step("Решение",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+" (правило треугольника). |"+vec("AC")+"| = "+a+".");
    det+="<div class='svg-center'>"+svgStatic([
      {x1:140,y1:380,x2:140+sc,y2:380,label:"AB"},
      {x1:140+sc,y1:380,x2:140+sc+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"BC",color:"#3aa758"},
      {x1:140,y1:380,x2:140+sc+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"AC",color:"#dc503c"}
    ],"AB+BC=AC — чертёж ответа", {W:620,H:440})+"</div>";
  }else if(variant==="б"){
    det+=step("Решение","|"+vec("s")+"|² = a² + a² + 2a²·cos60° = 3a². |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
    det+="<div class='svg-center'>"+svgStatic([
      {x1:140,y1:380,x2:140+sc,y2:380,label:"AB"},
      {x1:140,y1:380,x2:140+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"AC",color:"#3aa758"},
      {x1:140,y1:380,x2:140+sc+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"s",color:"#dc503c"}
    ],"AB+AC — чертёж ответа", {W:620,H:440})+"</div>";
  }else if(variant==="в"){
    det+=step("Решение","Угол между AB и CB = 60° (как векторы). |"+vec("s")+"|² = 3a². |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
    det+="<div class='svg-center'>"+svgStatic([
      {x1:140,y1:380,x2:140+sc,y2:380,label:"AB"},
      {x1:140+sc,y1:380,x2:140,y2:380,label:"CB",color:"#3aa758"},
      {x1:140,y1:380,x2:140+sc,y2:380,label:"s",color:"#dc503c"}
    ],"AB+CB — чертёж ответа", {W:620,H:440})+"</div>";
  }else if(variant==="г"){
    det+=step("Решение",vec("BA")+" − "+vec("BC")+" = "+vec("BA")+" + "+vec("CB")+". |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
    det+="<div class='svg-center'>"+svgStatic([
      {x1:140+sc,y1:380,x2:140,y2:380,label:"BA"},
      {x1:140+sc,y1:380,x2:140+sc+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"CB",color:"#3aa758"},
      {x1:140+sc,y1:380,x2:140+sc*2+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"s",color:"#dc503c"}
    ],"BA+CB — чертёж ответа", {W:620,H:440})+"</div>";
  }else{
    det+=step("Решение",vec("AB")+" − "+vec("AC")+" = "+vec("CB")+". |"+vec("CB")+"| = "+a+".");
    det+="<div class='svg-center'>"+svgStatic([
      {x1:140,y1:380,x2:140+sc,y2:380,label:"AB"},
      {x1:140,y1:380,x2:140+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"AC",color:"#3aa758"},
      {x1:140+sc,y1:380,x2:140+sc/2,y2:380-sc*Math.sin(Math.PI/3),label:"CB",color:"#dc503c"}
    ],"AB−AC=CB — чертёж ответа", {W:620,H:440})+"</div>";
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
  var sab=ab*30, sbc=bc*30;
  var det="";
  det+=step("Анализ","∠B = 90°, векторы BA и BC (или AB и BC) перпендикулярны.");
  det+=step("Решение","|"+vec("s")+"| = √("+ab+"² + "+bc+"²) = √("+(ab*ab)+" + "+(bc*bc)+") = <b>"+fmt(ans2)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:140,y1:380,x2:140+sab,y2:380,label:"AB"},
    {x1:140+sab,y1:380,x2:140+sab,y2:380-sbc,label:"BC",color:"#3aa758"},
    {x1:140,y1:380,x2:140+sab,y2:380-sbc,label:"s",color:"#dc503c"}
  ],"Чертёж ответа — прямоугольный треугольник", {W:620,H:440})+"</div>";
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
  det+="<div class='svg-center'>"+svgStatic([
    {x1:120,y1:420,x2:340,y2:420,label:"a"},
    {x1:120,y1:420,x2:220,y2:220,label:"b",color:"#3aa758"},
    {x1:340,y1:420,x2:220,y2:220,label:"CB",color:"#e8a820"}
  ],"Чертёж треугольника ABC", {W:620,H:480})+"</div>";
  det+="<p><b>Ответ:</b> а) −"+vec("a")+"; б) "+vec("a")+" − "+vec("b")+"; в) −"+vec("b")+".</p>";
  return mkMC({q:qText,c:"в) −b",opts:["в) −b","в) a−b","в) −a","в) a+b"],sol:"−b",hint:"BA=−AB, CB=CA+AB",detailed:det});
}

function genType10(rng){
  var qText="Докажите: "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+".";
  var det="";
  det+=step("Доказательство","AB+BC=AC (правило треугольника). AC+CD=AD. AD+DA=0 (противоположные векторы).");
  det+=step("Итог",vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("AC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("AD")+" + "+vec("DA")+" = "+vec("0")+". ∎");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:140,y1:400,x2:360,y2:380,label:"AB"},
    {x1:360,y1:380,x2:480,y2:200,label:"BC",color:"#3aa758"},
    {x1:480,y1:200,x2:260,y2:160,label:"CD",color:"#e8a820"},
    {x1:260,y1:160,x2:140,y2:400,label:"DA",color:"#dc503c"}
  ],"Чертёж замкнутого контура ABCD", {W:620,H:480})+"</div>";
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
  /* Регистрируем функцию проверки построения */
  TZ.checkVecBuilding=global.__vecCheck;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="vektory")return;
  TZ.TOPICS.push({id:"vektory",subject:"Математика",grade:"9 класс",title:"Векторы",variants:40,
    desc:"Тренажёр по геометрии (9 класс): векторы. 10 заданий. Первые 5 — построение векторов (ответ-чертёж), последние 5 — численные ответы с чертежами.",
    blocks:[{name:"Векторы",gen:genVariant,count:10}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
