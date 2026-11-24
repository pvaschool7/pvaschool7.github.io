/* =====================================================================
   Тренажёр · 9 класс · Геометрия · Векторы (начало изучения)
   40 вариантов × 10 заданий (от простого к сложному).
   Интерактив: ученик перетаскивает векторы на плоскости (без осей).
   После выполнения — подробное решение с чертежом построения.
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

/* ---------- SVG: статичный чертёж (тонкие стрелки) ---------- */
function svgStatic(vectors, title){
  var W=440, H=260;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='10'/>";
  if(title)h+="<text x='"+(W/2)+"' y='20' font-size='13' fill='#666' font-weight='600' text-anchor='middle'>"+title+"</text>";
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i];
    var col=v.color||colors[i%colors.length];
    h+=drawArrow(v.x1,v.y1,v.x2,v.y2,v.label,col);
  }
  h+="</svg>";
  return h;
}

/* Отрисовка одной стрелки (тонкая) */
function drawArrow(x1,y1,x2,y2,label,color){
  color=color||"#2f6fd0";
  var dx=x2-x1, dy=y2-y1, len=Math.sqrt(dx*dx+dy*dy)||1;
  var ux=dx/len, uy=dy/len, px=-uy, py=ux, aw=5;
  var h="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='1.5'/>";
  h+="<polygon points='"+x2+","+y2+" "+(x2-ux*10+px*aw)+","+(y2-uy*10+py*aw)+" "+(x2-ux*10-px*aw)+","+(y2-uy*10-py*aw)+"' fill='"+color+"'/>";
  h+="<circle cx='"+x1+"' cy='"+y1+"' r='2.5' fill='"+color+"'/>";
  if(label)h+="<text x='"+(x1+dx*0.5+px*14)+"' y='"+(y1+dy*0.5+py*14+4)+"' font-size='14' fill='"+color+"' font-weight='700' text-anchor='middle'>"+label+"</text>";
  return h;
}

/* =====================================================================
   ИНТЕРАКТИВНОЕ ПОЛЕ ВЕКТОРОВ
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
    var ux=dx/len,uy=dy/len,px=-uy,py=ux,aw=5;
    /* Тонкая линия */
    html+="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+col+"' stroke-width='1.5'/>";
    /* Маленькая стрелка */
    html+="<polygon points='"+x2+","+y2+" "+(x2-ux*10+px*aw).toFixed(0)+","+(y2-uy*10+py*aw).toFixed(0)+" "+(x2-ux*10-px*aw).toFixed(0)+","+(y2-uy*10-py*aw).toFixed(0)+"' fill='"+col+"'/>";
    /* Точка начала */
    html+="<circle cx='"+x1+"' cy='"+y1+"' r='5' fill='"+col+"' fill-opacity='0.3' stroke='"+col+"' stroke-width='1.2' style='cursor:grab' data-vid='"+i+"' data-end='start' data-field='"+svgId+"'/>";
    /* Точка конца */
    html+="<circle cx='"+x2+"' cy='"+y2+"' r='7' fill='"+col+"' fill-opacity='0.4' stroke='#fff' stroke-width='1.5' style='cursor:grab' data-vid='"+i+"' data-end='end' data-field='"+svgId+"'/>";
    /* Подпись */
    if(v.label)html+="<text x='"+(x1+dx*0.5+px*16).toFixed(0)+"' y='"+(y1+dy*0.5+py*16+5).toFixed(0)+"' font-size='14' fill='"+col+"' font-weight='700' text-anchor='middle'>"+v.label+"</text>";
  }
  g.innerHTML=html;
  /* Привязка обработчиков */
  var circles=g.querySelectorAll("circle");
  for(var ci=0;ci<circles.length;ci++){
    circles[ci].addEventListener("mousedown",global.__vecDragStart);
    circles[ci].addEventListener("touchstart",global.__vecDragStart,{passive:false});
  }
};

global.__vecDrag={active:false,vid:-1,end:"end",field:"",startX:0,startY:0,origX1:0,origY1:0,origX2:0,origY2:0};

global.__vecDragStart=function(e){
  e.preventDefault();
  if(e.touches)e=e.touches[0];
  var circle=e.currentTarget || e.target;
  global.__vecDrag.active=true;
  global.__vecDrag.vid=parseInt(circle.getAttribute("data-vid"));
  global.__vecDrag.end=circle.getAttribute("data-end");
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
  if(global.__vecDrag.end==="start"){
    v.x1=Math.round(global.__vecDrag.origX1+dx);
    v.y1=Math.round(global.__vecDrag.origY1+dy);
  }else{
    v.x2=Math.round(global.__vecDrag.origX2+dx);
    v.y2=Math.round(global.__vecDrag.origY2+dy);
  }
  global.__vecRedraw(global.__vecDrag.field);
};

global.__vecDragEnd=function(){
  global.__vecDrag.active=false;
};

/* Глобальные обработчики */
if(typeof document!=="undefined"&&!global.__vecGlobalHandlers){
  document.addEventListener("mousemove",global.__vecDragMove);
  document.addEventListener("mouseup",global.__vecDragEnd);
  document.addEventListener("touchmove",global.__vecDragMove,{passive:false});
  document.addEventListener("touchend",global.__vecDragEnd);
  global.__vecGlobalHandlers=true;
}

/* Создаёт интерактивное SVG-поле */
function interactiveField(vecs, fieldId, instruction){
  var W=480, H=320;
  var vecsCopy=vecs.map(function(v){return {x1:v.x1,y1:v.y1,x2:v.x2,y2:v.y2,label:v.label,color:v.color};});
  /* Сохраняем векторы в глобальном объекте */
  global.__vecFields[fieldId]=vecsCopy;
  var h="<div class='tz-graph-wrap' style='max-width:520px'>";
  h+="<svg id='"+fieldId+"' width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='background:#fafafa;border:1px solid #ddd;border-radius:10px;touch-action:none'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='8'/>";
  h+="<text x='12' y='20' font-size='11' fill='#aaa'>Перетаскивайте векторы за точки</text>";
  h+="<g id='vec-dynamic'></g>";
  h+="</svg>";
  h+="<p style='color:#666;font-size:13px;text-align:center;margin:4px 0'>"+instruction+"</p>";
  h+="</div>";
  /* Отложенная инициализация через setTimeout — только в браузере */
  if(typeof document!=="undefined"&&typeof setTimeout!=="undefined"){
    setTimeout(function(){
      var svg=document.getElementById(fieldId);
      if(svg&&global.__vecFields[fieldId])global.__vecRedraw(fieldId);
    },50);
  }
  return h;
}

/* Генерация вектора — координаты в пикселях SVG */
function makeVec(len, angleDeg, label, color){
  var rad=angleDeg*Math.PI/180;
  /* Масштабируем длину в пиксели (1 единица = 15 пикселей) */
  var scale=15;
  return {len:len, angle:angleDeg, label:label, color:color,
    dx:Math.round(len*scale*Math.cos(rad)), dy:-Math.round(len*scale*Math.sin(rad))};
}

/* =====================================================================
   ТИПЫ 1-5: Интерактивные
   ===================================================================== */

/* Тип 1: Сумма двух векторов (правило треугольника) */
function genType1(rng){
  var len1=ri(rng,3,7), len2=ri(rng,3,7);
  var ang1=ri(rng,0,30), ang2=ri(rng,60,120);
  var angleBetween=ang2-ang1;
  var cosA=Math.cos(angleBetween*Math.PI/180);
  var ans=Math.sqrt(len1*len1+len2*len2+2*len1*len2*cosA);
  var v1=makeVec(len1,ang1,"a","#2f6fd0");
  var v2=makeVec(len2,ang2,"b","#3aa758");
  var vecs=[
    {x1:100,y1:220,x2:100+v1.dx,y2:220+v1.dy,label:"a",color:"#2f6fd0"},
    {x1:320,y1:120,x2:320+v2.dx,y2:120+v2.dy,label:"b",color:"#3aa758"}
  ];
  var qText="<p>Даны два вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+". Угол между ними — "+angleBetween+"°.</p>";
  qText+="<p>Перетащите векторы так, чтобы начало "+vec("b")+" совпало с концом "+vec("a")+". Найдите |"+vec("a")+" + "+vec("b")+"|.</p>";
  qText+=interactiveField(vecs,"vf1","Тяните за цветные точки: синяя — начало, большая — конец");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  /* Чертёж построения в решении */
  var endX1=100+v1.dx, endY1=220+v1.dy;
  var sumEndX=endX1+v2.dx, sumEndY=endY1+v2.dy;
  var det="";
  det+=step("Построение","Совместим начало "+vec("b")+" с концом "+vec("a")+". Сумма — вектор от начала "+vec("a")+" к концу "+vec("b")+".");
  det+=step("Теорема косинусов","|"+vec("s")+"|² = "+len1+"² + "+len2+"² + 2·"+len1+"·"+len2+"·cos"+angleBetween+"° = "+(len1*len1)+" + "+(len2*len2)+" + "+fmt(2*len1*len2*cosA)+" = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:220,x2:endX1,y2:endY1,label:"a"},
    {x1:endX1,y1:endY1,x2:sumEndX,y2:sumEndY,label:"b",color:"#3aa758"},
    {x1:100,y1:220,x2:sumEndX,y2:sumEndY,label:"a+b",color:"#dc503c"}
  ],"Правильное построение суммы")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, теорема косинусов",detailed:det});
}

/* Тип 2: Сумма перпендикулярных векторов */
function genType2(rng){
  var len1=ri(rng,3,8), len2=ri(rng,3,8);
  var ans=Math.sqrt(len1*len1+len2*len2);
  var vecs=[
    {x1:100,y1:200,x2:100+len1,y2:200,label:"a",color:"#2f6fd0"},
    {x1:340,y1:120,x2:340,y2:120-len2,label:"b",color:"#3aa758"}
  ];
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+".</p>";
  qText+="<p>Перетащите векторы, совместив начало "+vec("b")+" с концом "+vec("a")+". Найдите |"+vec("a")+" + "+vec("b")+"|.</p>";
  qText+=interactiveField(vecs,"vf2","Тяните за точки, чтобы совместить векторы");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Построение","Совместили начало "+vec("b")+" с концом "+vec("a")+".");
  det+=step("Теорема Пифагора","|"+vec("a")+" + "+vec("b")+"| = √("+len1+"² + "+len2+"²) = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:120,y1:220,x2:120+len1,y2:220,label:"a"},
    {x1:120+len1,y1:220,x2:120+len1,y2:220-len2,label:"b",color:"#3aa758"},
    {x1:120,y1:220,x2:120+len1,y2:220-len2,label:"a+b",color:"#dc503c"}
  ],"Сумма перпендикулярных векторов")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, теорема Пифагора",detailed:det});
}

/* Тип 3: Разность векторов */
function genType3(rng){
  var len1=ri(rng,5,9), len2=ri(rng,3,7);
  var ans=Math.sqrt(len1*len1+len2*len2);
  var vecs=[
    {x1:100,y1:200,x2:100+len1,y2:200,label:"a",color:"#2f6fd0"},
    {x1:340,y1:120,x2:340,y2:120-len2,label:"b",color:"#3aa758"}
  ];
  var qText="<p>Даны два перпендикулярных вектора: "+vec("a")+" длиной "+len1+" и "+vec("b")+" длиной "+len2+".</p>";
  qText+="<p>Совместите <b>начала</b> векторов. Найдите |"+vec("a")+" − "+vec("b")+"|.</p>";
  qText+=interactiveField(vecs,"vf3","Тяните за синие точки — совместите начала");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Построение",vec("a")+" − "+vec("b")+" = "+vec("a")+" + (−"+vec("b")+"). Совместили начала.");
  det+=step("Теорема Пифагора","|"+vec("a")+" − "+vec("b")+"| = √("+len1+"² + "+len2+"²) = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:160,y1:220,x2:160+len1,y2:220,label:"a"},
    {x1:160,y1:220,x2:160,y2:220-len2,label:"-b",color:"#e8a820"},
    {x1:160,y1:220,x2:160+len1,y2:220-len2,label:"a-b",color:"#dc503c"}
  ],"Вычитание векторов")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести начала, a−b=a+(−b)",detailed:det});
}

/* Тип 4: Сумма трёх векторов */
function genType4(rng){
  var a=ri(rng,3,6), b=ri(rng,3,6), c=ri(rng,2,5);
  var ans=Math.sqrt((a-c)*(a-c)+b*b);
  var vecs=[
    {x1:80,y1:200,x2:80+a,y2:200,label:"a",color:"#2f6fd0"},
    {x1:320,y1:80,x2:320,y2:80-b,label:"b",color:"#3aa758"},
    {x1:360,y1:250,x2:360-c,y2:250,label:"c",color:"#e8a820"}
  ];
  var qText="<p>Даны три вектора: "+vec("a")+" = "+a+", "+vec("b")+" = "+b+", "+vec("c")+" = "+c+". "+vec("a")+" → вправо, "+vec("b")+" → вверх, "+vec("c")+" → влево.</p>";
  qText+="<p>Выстройте векторы друг за другом. Найдите |"+vec("a")+" + "+vec("b")+" + "+vec("c")+"|.</p>";
  qText+=interactiveField(vecs,"vf4","Тяните за точки — выстройте цепочку a→b→c");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Построение","Выстроили a→b→c по правилу многоугольника.");
  det+=step("Горизонталь",a+" − "+c+" = "+(a-c)+". Вертикаль: "+b+".");
  det+=step("Теорема Пифагора","|"+vec("s")+"| = √("+(a-c)+"² + "+b+"²) = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:80,y1:220,x2:80+a,y2:220,label:"a"},
    {x1:80+a,y1:220,x2:80+a,y2:220-b,label:"b",color:"#3aa758"},
    {x1:80+a,y1:220-b,x2:80+a-c,y2:220-b,label:"c",color:"#e8a820"},
    {x1:80,y1:220,x2:80+a-c,y2:220-b,label:"s",color:"#dc503c"}
  ],"Правило многоугольника")+"</div>";
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
    var dx=Math.round(l*Math.cos(rad));
    var dy=-Math.round(l*Math.sin(rad));
    vecs.push({x1:50+ri(rng,0,300),y1:50+ri(rng,0,200),x2:0,y2:0,label:String.fromCharCode(97+i)});
    vecs[i].x2=vecs[i].x1+dx;
    vecs[i].y2=vecs[i].y1+dy;
  }
  var qText="<p>Дано "+n+" векторов: ";
  for(var i=0;i<n;i++)qText+=vec(String.fromCharCode(97+i))+"="+lens[i]+(i<n-1?", ":"");
  qText+=".</p><p>Выстройте векторы в <b>замкнутый контур</b> (конец последнего → начало первого). Чему равна сумма?</p>";
  qText+=interactiveField(vecs,"vf5","Тяните за точки — замкните контур");
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Замкнутый контур","Конец последнего вектора совпадает с началом первого → сумма = "+vec("0")+".");
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
  var det="";
  det+=step("Анализ","Все стороны = "+a+", углы = 60°.");
  if(variant==="а")det+=step("Решение",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+". |"+vec("AC")+"| = "+a+".");
  else if(variant==="б")det+=step("Решение","|"+vec("s")+"|² = 2a² + 2a²·cos60° = 3a². |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
  else if(variant==="в")det+=step("Решение","Угол 120°. |"+vec("s")+"|² = 2a² + 2a²·cos60° = 3a². |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
  else if(variant==="г")det+=step("Решение",vec("BA")+" − "+vec("BC")+" = "+vec("BA")+" + "+vec("CB")+". |"+vec("s")+"| = a√3 = <b>"+fmt(ans)+"</b>.");
  else det+=step("Решение",vec("AB")+" − "+vec("AC")+" = "+vec("CB")+". |"+vec("CB")+"| = "+a+".");
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
  var det="";
  det+=step("Анализ","∠B = 90°, векторы перпендикулярны.");
  det+=step("Решение","|"+vec("s")+"| = √("+ab+"² + "+bc+"²) = <b>"+fmt(ans2)+"</b>.");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:220,x2:100+ab,y2:220,label:"AB"},
    {x1:100+ab,y1:220,x2:100+ab,y2:220-bc,label:"BC",color:"#3aa758"},
    {x1:100,y1:220,x2:100+ab,y2:220-bc,label:"s",color:"#dc503c"}
  ],"Прямоугольный треугольник")+"</div>";
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
  det+=step("б)",vec("CB")+" = "+vec("a")+" − "+vec("b")+".");
  det+=step("в)",vec("CB")+" + "+vec("BA")+" = −"+vec("b")+".");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:100,y1:220,x2:160,y2:220,label:"a"},
    {x1:100,y1:220,x2:130,y2:170,label:"b",color:"#3aa758"},
    {x1:160,y1:220,x2:130,y2:170,label:"CB",color:"#e8a820"}
  ],"Треугольник ABC")+"</div>";
  det+="<p><b>Ответ:</b> а) −"+vec("a")+"; б) "+vec("a")+" − "+vec("b")+"; в) −"+vec("b")+".</p>";
  return mkMC({q:qText,c:"в) −b",opts:["в) −b","в) a−b","в) −a","в) a+b"],sol:"−b",hint:"BA=−AB, CB=CA+AB",detailed:det});
}

function genType10(rng){
  var qText="Докажите: "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+".";
  var det="";
  det+=step("Доказательство","AB+BC=AC, AC+CD=AD, AD+DA=0. ∎");
  det+="<div class='svg-center'>"+svgStatic([
    {x1:80,y1:180,x2:200,y2:160,label:"AB"},
    {x1:200,y1:160,x2:260,y2:80,label:"BC",color:"#3aa758"},
    {x1:260,y1:80,x2:120,y2:60,label:"CD",color:"#e8a820"},
    {x1:120,y1:60,x2:80,y2:180,label:"DA",color:"#dc503c"}
  ],"Замкнутый контур ABCD")+"</div>";
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
