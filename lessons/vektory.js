/* =====================================================================
   Тренажёр · 9 класс · Геометрия · Векторы
   40 вариантов × 10 заданий (5 интерактивных + 5 по прототипам).
   Интерактив: ученик перетаскивает векторы на SVG-поле.
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

/* ---------- SVG: статичный чертёж для решения ---------- */
function svgVector(x1,y1,x2,y2,label,color){
  color=color||"#2f6fd0";
  var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
  var ux=dx/len,uy=dy/len,px=-uy,py=ux,aw=5;
  var h="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='2.2'/>";
  h+="<polygon points='"+x2+","+y2+" "+(x2-ux*10+px*aw)+","+(y2-uy*10+py*aw)+" "+(x2-ux*10-px*aw)+","+(y2-uy*10-py*aw)+"' fill='"+color+"'/>";
  if(label)h+="<text x='"+(x1+dx*0.5+px*14)+"' y='"+(y1+dy*0.5+py*14+4)+"' font-size='14' fill='"+color+"' font-weight='700' text-anchor='middle'>"+label+"</text>";
  return h;
}
function svgCoord(vectors,title){
  var W=460,H=360,cx=W/2,cy=H/2,s=18;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  if(title)h+="<text x='230' y='16' font-size='13' fill='#666' font-weight='600' text-anchor='middle'>"+title+"</text>";
  for(var gx=-12;gx<=12;gx++)h+="<line x1='"+(cx+gx*s)+"' y1='20' x2='"+(cx+gx*s)+"' y2='340' stroke='#eee' stroke-width='0.5'/>";
  for(var gy=-9;gy<=9;gy++)h+="<line x1='20' y1='"+(cy+gy*s)+"' x2='440' y2='"+(cy+gy*s)+"' stroke='#eee' stroke-width='0.5'/>";
  h+="<line x1='20' y1='"+cy+"' x2='440' y2='"+cy+"' stroke='#999' stroke-width='1'/>";
  h+="<line x1='"+cx+"' y1='20' x2='"+cx+"' y2='340' stroke='#999' stroke-width='1'/>";
  h+="<text x='445' y='"+(cy+4)+"' font-size='11' fill='#999'>x</text><text x='"+(cx+5)+"' y='18' font-size='11' fill='#999'>y</text>";
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6","#06b6d4"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i],col=v.color||colors[i%colors.length];
    h+=svgVector(cx+v.x1*s,cy-v.y1*s,cx+v.x2*s,cy-v.y2*s,v.label,col);
  }
  h+="</svg>";
  return h;
}

/* =====================================================================
   ИНТЕРАКТИВНОЕ ПОЛЕ ВЕКТОРОВ
   Ученик перетаскивает концы векторов для построения суммы/разности.
   ===================================================================== */

/* Глобальное состояние drag */
global.__vecState={active:false,vecId:-1,svgId:"",vectors:[]};

global.__vecDragStart=function(vecId,svgId,e){
  e.preventDefault();
  if(e.touches)e=e.touches[0];
  global.__vecState.active=true;
  global.__vecState.vecId=vecId;
  global.__vecState.svgId=svgId;
  var svg=document.getElementById(svgId);
  if(!svg)return;
  var pt=svg.createSVGPoint();
  pt.x=e.clientX;pt.y=e.clientY;
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
  pt.x=e.clientX;pt.y=e.clientY;
  var ctm=svg.getScreenCTM();
  if(!ctm)return;
  var loc=pt.matrixTransform(ctm.inverse());
  var dx=loc.x-global.__vecState.startX;
  var dy=loc.y-global.__vecState.startY;
  global.__vecState.startX=loc.x;
  global.__vecState.startY=loc.y;
  /* Обновляем вектор */
  var vid=global.__vecState.vecId;
  var v=global.__vecState.vectors[vid];
  if(!v)return;
  v.x2+=dx; v.y2-=dy; /* y инвертирован в SVG */
  /* Привязка к сетке */
  var grid=18;
  v.x2=Math.round(v.x2/grid)*grid;
  v.y2=Math.round(v.y2/grid)*grid;
  /* Перерисовываем */
  global.__vecRedraw(svg);
};

global.__vecDragEnd=function(){
  global.__vecState.active=false;
  global.__vecState.vecId=-1;
};

global.__vecRedraw=function(svg){
  var cx=parseFloat(svg.getAttribute("data-cx"));
  var cy=parseFloat(svg.getAttribute("data-cy"));
  var s=parseFloat(svg.getAttribute("data-scale"))||18;
  var g=svg.querySelector("#vec-dynamic");
  if(!g)return;
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
  var html="";
  for(var i=0;i<global.__vecState.vectors.length;i++){
    var v=global.__vecState.vectors[i];
    var col=v.color||colors[i%colors.length];
    var x1=cx+v.x1*s,y1=cy-v.y1*s,x2=cx+v.x2*s,y2=cy-v.y2*s;
    /* Стрелка */
    var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
    var ux=dx/len,uy=dy/len,px=-uy,py=ux,aw=5;
    html+="<line x1='"+x1.toFixed(0)+"' y1='"+y1.toFixed(0)+"' x2='"+x2.toFixed(0)+"' y2='"+y2.toFixed(0)+"' stroke='"+col+"' stroke-width='2.2'/>";
    html+="<polygon points='"+x2.toFixed(0)+","+y2.toFixed(0)+" "+(x2-ux*10+px*aw).toFixed(0)+","+(y2-uy*10+py*aw).toFixed(0)+" "+(x2-ux*10-px*aw).toFixed(0)+","+(y2-uy*10-py*aw).toFixed(0)+"' fill='"+col+"'/>";
    if(v.label)html+="<text x='"+(x1+dx*0.5+px*14).toFixed(0)+"' y='"+(y1+dy*0.5+py*14+4).toFixed(0)+"' font-size='14' fill='"+col+"' font-weight='700' text-anchor='middle'>"+v.label+"</text>";
    /* Handle для drag на конце */
    html+="<circle cx='"+x2.toFixed(0)+"' cy='"+y2.toFixed(0)+"' r='8' fill='"+col+"' fill-opacity='0.5' stroke='#fff' stroke-width='2' style='cursor:grab' onmousedown='__vecDragStart("+i+",\""+svg.id+"\",event)' ontouchstart='__vecDragStart("+i+",\""+svg.id+"\",event)'/>";
    /* Координаты */
    var vx=Math.round((v.x2-v.x1)/1), vy=Math.round((v.y2-v.y1)/1);
    html+="<text x='"+(x2+12).toFixed(0)+"' y='"+(y2+4).toFixed(0)+"' font-size='10' fill='#999'>("+vx+";"+vy+")</text>";
  }
  g.innerHTML=html;
};

/* Создаёт интерактивное SVG-поле */
function interactiveField(vecs, fieldId, instruction){
  var W=480,H=360,cx=W/2,cy=H/2,s=18;
  /* Клонируем векторы в состояние */
  global.__vecState.vectors=vecs.map(function(v){return {x1:v.x1,y1:v.y1,x2:v.x2,y2:v.y2,label:v.label,color:v.color};});
  var h="<div class='tz-graph-wrap' style='max-width:520px'>";
  h+="<svg id='"+fieldId+"' width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' data-cx='"+cx+"' data-cy='"+cy+"' data-scale='"+s+"' style='background:#fafafa;border:1px solid #ddd;border-radius:10px;touch-action:none'>";
  /* Сетка */
  for(var gx=-13;gx<=13;gx++)h+="<line x1='"+(cx+gx*s)+"' y1='10' x2='"+(cx+gx*s)+"' y2='350' stroke='#eee' stroke-width='0.5'/>";
  for(var gy=-10;gy<=10;gy++)h+="<line x1='10' y1='"+(cy+gy*s)+"' x2='470' y2='"+(cy+gy*s)+"' stroke='#eee' stroke-width='0.5'/>";
  /* Оси */
  h+="<line x1='10' y1='"+cy+"' x2='470' y2='"+cy+"' stroke='#999' stroke-width='1'/>";
  h+="<line x1='"+cx+"' y1='10' x2='"+cx+"' y2='350' stroke='#999' stroke-width='1'/>";
  h+="<text x='465' y='"+(cy-5)+"' font-size='11' fill='#999'>x</text>";
  h+="<text x='"+(cx+5)+"' y='18' font-size='11' fill='#999'>y</text>";
  h+="<text x='"+(cx-10)+"' y='"+(cy+15)+"' font-size='10' fill='#999'>O</text>";
  /* Динамическая группа для векторов */
  h+="<g id='vec-dynamic'></g>";
  h+="</svg>";
  h+="<p style='color:#666;font-size:13px;text-align:center;margin:4px 0'>"+instruction+"</p>";
  h+="</div>";
  /* Глобальные обработчики mousemove/touchmove — только в браузере */
  if(typeof document!=="undefined"&&!global.__vecHandlersSet){
    document.addEventListener("mousemove",global.__vecDragMove);
    document.addEventListener("mouseup",global.__vecDragEnd);
    document.addEventListener("touchmove",global.__vecDragMove,{passive:false});
    document.addEventListener("touchend",global.__vecDragEnd);
    global.__vecHandlersSet=true;
  }
  /* Отложенная инициализация — перерисовка после вставки в DOM */
  h+="<script>(function(){var s=document.getElementById('"+fieldId+"');if(s){__vecRedraw(s);}})();</"+"script>";
  return h;
}

/* =====================================================================
   ТИПЫ 1-5: Интерактивные задания на сложение/вычитание
   ===================================================================== */

/* Тип 1: Сумма двух векторов — перетащи конец второго к началу первого */
function genType1(rng){
  var a=ri(rng,3,7), b=ri(rng,3,7);
  var ans=Math.sqrt(a*a+b*b);
  var qText="<p>Даны два вектора. Перетащите конец вектора "+vec("b")+" так, чтобы начало вектора "+vec("b")+" совпало с концом вектора "+vec("a")+" (правило треугольника). Найдите длину получившегося вектора суммы.</p>";
  qText+=interactiveField([
    {x1:0,y1:0,x2:a,y2:0,label:"a",color:"#2f6fd0"},
    {x1:-3,y1:4,x2:-3+b,y2:4,label:"b",color:"#3aa758"}
  ],"vf1","Перетаскивайте зелёный кружок (конец вектора b)");
  qText+="<p>Длина вектора "+vec("a")+" = "+a+", длина вектора "+vec("b")+" = "+b+". Векторы перпендикулярны.</p>";
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Правило треугольника", vec("a")+" + "+vec("b")+": начало вектора "+vec("b")+" совмещаем с концом вектора "+vec("a")+". Сумма — вектор от начала "+vec("a")+" к концу "+vec("b")+".");
  det+=step("Так как векторы перпендикулярны", "|"+vec("a")+" + "+vec("b")+"| = √("+a+"² + "+b+"²) = √("+(a*a)+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgCoord([
    {x1:0,y1:0,x2:a,y2:0,label:"a"},
    {x1:a,y1:0,x2:a,y2:b,label:"b",color:"#3aa758"},
    {x1:0,y1:0,x2:a,y2:b,label:"a+b",color:"#dc503c"}
  ],"Сложение по правилу треугольника")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Совмести b с концом a, потом теорема Пифагора",detailed:det});
}

/* Тип 2: Разность векторов — перетащи так, чтобы начала совпадали */
function genType2(rng){
  var a=ri(rng,5,9), b=ri(rng,3,7);
  var ans=Math.sqrt(a*a+b*b);
  var qText="<p>Даны два вектора "+vec("a")+" и "+vec("b")+". Перетащите вектор "+vec("b")+" так, чтобы его начало совпало с началом вектора "+vec("a")+". Найдите длину вектора "+vec("a")+" − "+vec("b")+".</p>";
  qText+=interactiveField([
    {x1:0,y1:0,x2:a,y2:0,label:"a",color:"#2f6fd0"},
    {x1:3,y1:5,x2:3,y2:5-b,label:"b",color:"#3aa758"}
  ],"vf2","Перетаскивайте зелёный кружок — совместите начала векторов");
  qText+="<p>|"+vec("a")+"| = "+a+", |"+vec("b")+"| = "+b+". Векторы перпендикулярны.</p>";
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Вычитание", vec("a")+" − "+vec("b")+" = "+vec("a")+" + (−"+vec("b")+"). Вектор −"+vec("b")+" перпендикулярен "+vec("a")+".");
  det+=step("Теорема Пифагора", "|"+vec("a")+" − "+vec("b")+"| = √("+a+"² + "+b+"²) = √("+(a*a)+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgCoord([
    {x1:0,y1:0,x2:a,y2:0,label:"a"},
    {x1:0,y1:0,x2:0,y2:-b,label:"-b",color:"#e8a820"},
    {x1:0,y1:0,x2:a,y2:-b,label:"a-b",color:"#dc503c"}
  ],"Вычитание векторов")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"a−b = a+(−b), совмести начала",detailed:det});
}

/* Тип 3: Сумма трёх векторов по правилу многоугольника */
function genType3(rng){
  var a=ri(rng,3,6), b=ri(rng,3,6), c=ri(rng,2,5);
  var sx=a-c, sy=b;
  var ans=Math.sqrt(sx*sx+sy*sy);
  var qText="<p>Даны три вектора. Перетащите их так, чтобы каждый следующий начинался там, где заканчивается предыдущий. Найдите длину вектора суммы.</p>";
  qText+=interactiveField([
    {x1:0,y1:0,x2:a,y2:0,label:"a",color:"#2f6fd0"},
    {x1:-4,y1:5,x2:-4,y2:5+b,label:"b",color:"#3aa758"},
    {x1:5,y1:-3,x2:5-c,y2:-3,label:"c",color:"#e8a820"}
  ],"vf3","Перетаскивайте концы векторов, выстраивая их друг за другом");
  qText+="<p>"+vec("a")+" = ("+a+"; 0), "+vec("b")+" = (0; "+b+"), "+vec("c")+" = (−"+c+"; 0).</p>";
  qText+="<p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Сложим по компонентам", vec("a")+" + "+vec("b")+" + "+vec("c")+" = ("+a+" + 0 + (−"+c+"); 0 + "+b+" + 0) = ("+(a-c)+"; "+b+").");
  det+=step("Теорема Пифагора", "|"+vec("s")+"| = √("+(a-c)+"² + "+b+"²) = √("+((a-c)*(a-c))+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgCoord([
    {x1:0,y1:0,x2:a,y2:0,label:"a"},
    {x1:a,y1:0,x2:a,y2:b,label:"b",color:"#3aa758"},
    {x1:a,y1:b,x2:a-c,y2:b,label:"c",color:"#e8a820"},
    {x1:0,y1:0,x2:a-c,y2:b,label:"s",color:"#dc503c"}
  ],"Правило многоугольника")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Выстрой векторы друг за другом, сложи компоненты",detailed:det});
}

/* Тип 4: Сумма 4-5 векторов разной направленности */
function genType4(rng){
  var n=ri(rng,4,5);
  var vecs=[];
  var sumX=0,sumY=0;
  var dirs=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1]];
  for(var i=0;i<n;i++){
    var d=pick(rng,dirs);
    var len=ri(rng,2,5);
    var vx=d[0]*len, vy=d[1]*len;
    vecs.push({x1:ri(rng,-3,3),y1:ri(rng,-3,3),x2:0,y2:0,label:String.fromCharCode(97+i)});
    vecs[i].x2=vecs[i].x1+vx;
    vecs[i].y2=vecs[i].y1+vy;
    sumX+=vx; sumY+=vy;
  }
  var ans=Math.sqrt(sumX*sumX+sumY*sumY);
  var qText="<p>Дано "+n+" векторов разной направленности. Перетащите векторы так, чтобы выстроить их друг за другом по правилу многоугольника. Найдите длину вектора суммы.</p>";
  qText+=interactiveField(vecs,"vf4","Перетаскивайте концы векторов, выстраивая цепочку");
  qText+="<p>Векторы: ";
  for(var i=0;i<n;i++){
    var vx=vecs[i].x2-vecs[i].x1, vy=vecs[i].y2-vecs[i].y1;
    qText+=vecs[i].label+" = ("+vx+"; "+vy+")"+(i<n-1?", ":"");
  }
  qText+=".</p><p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Сложим по компонентам","Сумма = ("+sumX+"; "+sumY+").");
  det+=step("Теорема Пифагора","|"+vec("s")+"| = √("+sumX+"² + "+sumY+"²) = √("+(sumX*sumX)+" + "+(sumY*sumY)+") = <b>"+fmt(ans)+"</b>.");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Сложи все x-компоненты и все y-компоненты отдельно",detailed:det});
}

/* Тип 5: 5-8 векторов — построить сумму, проверить замкнутость */
function genType5(rng){
  var n=ri(rng,5,8);
  var vecs=[];
  var sumX=0,sumY=0;
  for(var i=0;i<n;i++){
    var angle=rng()*2*Math.PI;
    var len=ri(rng,3,7);
    var vx=Math.round(len*Math.cos(angle));
    var vy=Math.round(len*Math.sin(angle));
    if(vx===0&&vy===0)vy=1;
    vecs.push({x1:ri(rng,-3,3),y1:ri(rng,-3,3),x2:0,y2:0,label:String.fromCharCode(97+i)});
    vecs[i].x2=vecs[i].x1+vx;
    vecs[i].y2=vecs[i].y1+vy;
    sumX+=vx; sumY+=vy;
  }
  var ans=Math.sqrt(sumX*sumX+sumY*sumY);
  var qText="<p>Дано "+n+" векторов различной направленности. Перетащите векторы, выстраивая их по правилу многоугольника. Найдите длину вектора суммы.</p>";
  qText+=interactiveField(vecs,"vf5","Перетаскивайте концы векторов, выстраивая цепочку");
  qText+="<p>Векторы: ";
  for(var i=0;i<n;i++){
    var vx=vecs[i].x2-vecs[i].x1, vy=vecs[i].y2-vecs[i].y1;
    qText+=vecs[i].label+" = ("+vx+"; "+vy+")"+(i<n-1?", ":"");
  }
  qText+=".</p><p><b>Введите ответ:</b></p>"+NOTE;
  var det="";
  det+=step("Сложим по компонентам","Σx = "+sumX+", Σy = "+sumY+". Сумма = ("+sumX+"; "+sumY+").");
  det+=step("Длина суммы","|"+vec("s")+"| = √("+sumX+"² + "+sumY+"²) = √("+(sumX*sumX)+" + "+(sumY*sumY)+") = <b>"+fmt(ans)+"</b>.");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Сложи все x и все y компоненты",detailed:det});
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
  else if(variant==="б")det+=step("Решение","Угол между "+vec("AB")+" и "+vec("AC")+" = 60°. По теореме косинусов: |"+vec("s")+"|² = "+a+"² + "+a+"² − 2·"+a+"²·cos120° = "+(3*a*a)+". |"+vec("s")+"| = "+a+"√3 = <b>"+fmt(ans)+"</b>.");
  else if(variant==="в")det+=step("Решение","Угол между AB и CB = 120°. |"+vec("s")+"|² = 2a² + 2a²·cos60° = "+(3*a*a)+". |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
  else if(variant==="г")det+=step("Решение",vec("BA")+" − "+vec("BC")+" = "+vec("BA")+" + "+vec("CB")+". Угол 120°. |"+vec("s")+"| = "+a+"√3 = <b>"+fmt(ans)+"</b>.");
  else det+=step("Решение",vec("AB")+" − "+vec("AC")+" = "+vec("AB")+" + "+vec("CA")+" = "+vec("CB")+". |"+vec("CB")+"| = "+a+".");
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
  det+=step("Решение",what2+": теорема Пифагора. |"+vec("s")+"| = √("+ab+"² + "+bc+"²) = √("+(ab*ab+bc*bc)+") = <b>"+fmt(ans2)+"</b>.");
  det+="<div class='svg-center'>"+svgCoord([{x1:0,y1:0,x2:ab,y2:0,label:"AB"},{x1:ab,y1:0,x2:ab,y2:bc,label:"BC",color:"#3aa758"},{x1:0,y1:0,x2:ab,y2:bc,label:"s",color:"#dc503c"}],"Прямоугольный треугольник")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans2)+"</span></p>";
  return mkDec({q:qText,a:ans2,sol:fmt(ans2),hint:"∠B=90° → теорема Пифагора",detailed:det});
}

/* Тип 8: Правило многоугольника — упростить */
function genType8(rng){
  var variant=pick(rng,["а","б"]);
  var qText,det,ans,correct;
  if(variant==="а"){
    qText="Пользуясь правилом многоугольника, упростите: ("+vec("AB")+" + "+vec("BC")+" − "+vec("MC")+") + ("+vec("MD")+" − "+vec("KD")+").";
    det=step("Решение",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+". −"+vec("MC")+" = "+vec("CM")+". "+vec("AC")+" + "+vec("CM")+" = "+vec("AM")+". "+vec("AM")+" + "+vec("MD")+" = "+vec("AD")+". "+vec("AD")+" − "+vec("KD")+" = "+vec("AD")+" + "+vec("DK")+" = "+vec("AK")+".");
    correct="AK";
  }else{
    qText="Пользуясь правилом многоугольника, упростите: ("+vec("CB")+" + "+vec("AC")+" + "+vec("BD")+") − ("+vec("MK")+" + "+vec("KD")+").";
    det=step("Решение",vec("AC")+" + "+vec("CB")+" = "+vec("AB")+". "+vec("AB")+" + "+vec("BD")+" = "+vec("AD")+". −"+vec("MK")+" = "+vec("KM")+". "+vec("AD")+" + "+vec("KM")+" − "+vec("KD")+" = "+vec("AM")+".");
    correct="AM";
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec(correct)+"</span></p>";
  return mkMC({q:qText,c:correct,opts:[correct,correct==="AK"?"AM":"AK","0","AD"],sol:vec(correct),hint:"AB+BC=AC, группируй по правилу треугольника",detailed:det});
}

/* Тип 9: Выразить через a и b */
function genType9(rng){
  var qText="Дан треугольник ABC. Выразите через "+vec("a")+" = "+vec("AB")+" и "+vec("b")+" = "+vec("AC")+": а) "+vec("BA")+"; б) "+vec("CB")+"; в) "+vec("CB")+" + "+vec("BA")+".";
  var det="";
  det+=step("а)",vec("BA")+" = −"+vec("AB")+" = −"+vec("a")+".");
  det+=step("б)",vec("CB")+" = "+vec("CA")+" + "+vec("AB")+" = −"+vec("b")+" + "+vec("a")+" = "+vec("a")+" − "+vec("b")+".");
  det+=step("в)",vec("CB")+" + "+vec("BA")+" = ("+vec("a")+" − "+vec("b")+") + (−"+vec("a")+") = −"+vec("b")+".");
  det+="<div class='svg-center'>"+svgCoord([{x1:0,y1:0,x2:6,y2:0,label:"a"},{x1:0,y1:0,x2:3,y2:5,label:"b",color:"#3aa758"},{x1:6,y1:0,x2:3,y2:5,label:"CB",color:"#e8a820"}],"Треугольник ABC")+"</div>";
  det+="<p><b>Ответ:</b> а) −"+vec("a")+"; б) "+vec("a")+" − "+vec("b")+"; в) −"+vec("b")+".</p>";
  return mkMC({q:qText,c:"в) −b",opts:["в) −b","в) a−b","в) −a","в) a+b"],sol:"−b",hint:"BA=−AB, CB=CA+AB",detailed:det});
}

/* Тип 10: Доказательство AB+BC+CD+DA=0 */
function genType10(rng){
  var qText="Докажите, что для любых точек A, B, C, D: "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+".";
  var det="";
  det+=step("Доказательство",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+". "+vec("AC")+" + "+vec("CD")+" = "+vec("AD")+". "+vec("AD")+" + "+vec("DA")+" = "+vec("0")+". ∎");
  det+="<div class='svg-center'>"+svgCoord([{x1:-3,y1:2,x2:3,y2:3,label:"AB"},{x1:3,y1:3,x2:4,y2:-2,label:"BC",color:"#3aa758"},{x1:4,y1:-2,x2:-2,y2:-3,label:"CD",color:"#e8a820"},{x1:-2,y1:-3,x2:-3,y2:2,label:"DA",color:"#dc503c"}],"Замкнутый контур ABCD")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec("0")+"</span> — доказано.</p>";
  return mkMC({q:qText,c:"Доказано",opts:["Доказано","Не доказано"],sol:vec("0"),hint:"Сумма по замкнутому контуру = 0",detailed:det});
}

/* ---------- генератор варианта ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){return ALL_TYPES.map(function(gen){return gen(rng);});}

/* ---------- регистрация ---------- */
function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){var paths=["./trenazher-data.js","../lessons/trenazher-data.js"];for(var i=0;i<paths.length;i++){try{var tz=require(paths[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}}}
  return null;
}
function register(){
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="vektory")return;
  TZ.TOPICS.push({id:"vektory",subject:"Математика",grade:"9 класс",title:"Векторы",variants:40,
    desc:"Тренажёр по геометрии (9 класс): векторы. 10 заданий от простого к сложному: "+
      "5 интерактивных (перетаскивание векторов на SVG-поле) + 5 по прототипам. 40 вариантов.",
    blocks:[{name:"Векторы",gen:genVariant,count:10}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
