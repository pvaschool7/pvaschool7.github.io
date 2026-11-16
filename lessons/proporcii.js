/* =====================================================================
   Тренажёр · 7–9 класс · Математика · Прямая пропорциональность
   Интерактивное построение графика y = kx мышкой или тачскрином.

   Тип задания "graph": ученик кликает две точки на координатной
   плоскости — через них проводится прямая. Проверка checkGraph:
   прямая должна проходить через начало координат с угловым
   коэффициентом k (с точностью до 0,3).
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function fmt(n){
  if(Math.abs(n-Math.round(n))<1e-9)return String(Math.round(n));
  return n.toFixed(2);
}

/* ---------- SVG координатной плоскости ----------
   Поле 400×400, диапазон x,y ∈ [−5; 5], шаг сетки 1, цена деления 40px.
   Внутри SVG: слой #tz-graph-layer для точек и прямой ученика,
   прозрачный прямоугольник #tz-graph-click для перехвата кликов. */
function graphSVG(){
  var S=400, O=200, sc=40;
  var h="<div class='tz-graph-wrap'>"
    +"<svg id='tz-graph-svg' width='"+S+"' height='"+S+"' viewBox='0 0 "+S+" "+S+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;cursor:crosshair;touch-action:none'>";
  /* сетка */
  h+="<g stroke='var(--line)' stroke-width='1' opacity='0.5'>";
  for(var i=-5;i<=5;i++){
    if(i===0)continue;
    h+="<line x1='"+(O+i*sc)+"' y1='0' x2='"+(O+i*sc)+"' y2='"+S+"'/>";
    h+="<line x1='0' y1='"+(O+i*sc)+"' x2='"+S+"' y2='"+(O+i*sc)+"'/>";
  }
  h+="</g>";
  /* оси */
  h+="<line x1='0' y1='"+O+"' x2='"+S+"' y2='"+O+"' stroke='var(--ink)' stroke-width='2'/>";
  h+="<line x1='"+O+"' y1='0' x2='"+O+"' y2='"+S+"' stroke='var(--ink)' stroke-width='2'/>";
  /* подписи делений */
  for(var j=-5;j<=5;j++){
    if(j===0)continue;
    h+="<text x='"+(O+j*sc)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)' text-anchor='middle'>"+j+"</text>";
    h+="<text x='"+(O-12)+"' y='"+(O-j*sc+4)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+j+"</text>";
  }
  h+="<text x='"+(O-8)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)'>O</text>";
  /* x, y */
  h+="<text x='"+(S-8)+"' y='"+(O-8)+"' font-size='13' fill='var(--ink)' font-weight='600'>x</text>";
  h+="<text x='"+(O+8)+"' y='14' font-size='13' fill='var(--ink)' font-weight='600'>y</text>";
  /* слой ученика + клик-зона */
  h+="<g id='tz-graph-layer'></g>";
  h+="<rect id='tz-graph-click' x='0' y='0' width='"+S+"' height='"+S+"' fill='transparent'/>";
  h+="</svg>";
  h+="<p style='font-size:14px;color:var(--mute);margin:6px 0 0'>Кликните две точки — через них пройдёт прямая. Кликните снова — начать заново.</p>";
  h+="<button class='btn ghost sm' type='button' id='tz-graph-reset' style='margin-top:6px'>Сбросить</button>";
  h+="</div>";
  return h;
}

/* ---------- настройка интерактивного графика ----------
   svg — элемент SVG на слайде
   task — объект задания (с полем k)
   g — глобальный индекс слайда (для записи в S.ans)
   state — объект состояния тренажёра (S) с полями ans[], answered, total
   updateBar — функция для обновления полосы прогресса (необязательная) */
function setupGraphInteraction(svg, task, g, state, updateBar){
  if(!svg)return;
  var layer=svg.querySelector("#tz-graph-layer");
  var clickTarget=svg.querySelector("#tz-graph-click");
  var resetBtn=document.getElementById("tz-graph-reset");
  var O=200, sc=40, SIZE=400;
  var points=[];

  /* восстановление предыдущего состояния */
  if(state&&state.ans&&state.ans[g]&&state.ans[g].p1){
    points=[state.ans[g].p1];
    if(state.ans[g].p2)points.push(state.ans[g].p2);
    updateGraph();
  }

  function p2m(px,py){return{x:(px-O)/sc, y:(O-py)/sc};}
  function m2p(mx,my){return{px:O+mx*sc, py:O-my*sc};}

  function updateGraph(){
    if(!layer)return;
    var html="";
    if(points.length===2){
      var a=m2p(points[0].x,points[0].y);
      var b=m2p(points[1].x,points[1].y);
      /* продлеваем прямую до границ холста */
      var dx=b.px-a.px, dy=b.py-a.py;
      if(Math.abs(dx)>0.01||Math.abs(dy)>0.01){
        var t1=-a.px/dx, t2=(SIZE-a.px)/dx, t3=-a.py/dy, t4=(SIZE-a.py)/dy;
        var ts=[];
        if(isFinite(t1))ts.push(t1);
        if(isFinite(t2))ts.push(t2);
        if(isFinite(t3))ts.push(t3);
        if(isFinite(t4))ts.push(t4);
        ts.sort(function(a,b){return a-b;});
        if(ts.length>=2){
          var x1=a.px+dx*ts[0], y1=a.py+dy*ts[0];
          var x2=a.px+dx*ts[ts.length-1], y2=a.py+dy*ts[ts.length-1];
          html+="<line x1='"+x1.toFixed(1)+"' y1='"+y1.toFixed(1)+"' x2='"+x2.toFixed(1)+"' y2='"+y2.toFixed(1)+"' stroke='var(--blue)' stroke-width='2.5' opacity='0.8'/>";
        }
      }
    }
    for(var i=0;i<points.length;i++){
      var p=m2p(points[i].x,points[i].y);
      html+="<circle cx='"+p.px.toFixed(1)+"' cy='"+p.py.toFixed(1)+"' r='7' fill='var(--blue)' stroke='var(--card)' stroke-width='2.5'/>";
      /* подпись координат */
      html+="<text x='"+(p.px+10)+"' y='"+(p.py-8)+"' font-size='11' fill='var(--blue)' font-weight='600'>("+fmt(points[i].x)+"; "+fmt(points[i].y)+")</text>";
    }
    layer.innerHTML=html;
  }

  function saveAns(){
    var prev=state&&state.ans?state.ans[g]:null;
    var wasAnswered=prev&&prev.p1&&prev.p2;
    var nowAnswered=points.length===2;
    if(state&&state.ans){
      if(points.length===2){
        state.ans[g]={p1:points[0], p2:points[1]};
      } else if(points.length===1){
        state.ans[g]={p1:points[0], p2:null};
      } else {
        state.ans[g]=null;
      }
      /* обновляем счётчик отвеченных */
      if(!wasAnswered&&nowAnswered)state.answered++;
      if(wasAnswered&&!nowAnswered&&state.answered>0)state.answered--;
    }
    /* обновляем полосу прогресса */
    if(updateBar)updateBar();
  }

  function handlePoint(clientX, clientY){
    var rect=svg.getBoundingClientRect();
    var px=(clientX-rect.left)*(SIZE/rect.width);
    var py=(clientY-rect.top)*(SIZE/rect.height);
    var m=p2m(px,py);
    /* привязка к сетке (кратность 0,5) */
    m.x=Math.round(m.x*2)/2;
    m.y=Math.round(m.y*2)/2;
    /* ограничение */
    if(m.x<-5)m.x=-5; if(m.x>5)m.x=5;
    if(m.y<-5)m.y=-5; if(m.y>5)m.y=5;
    if(points.length>=2){points=[m];}
    else{points.push(m);}
    updateGraph();
    saveAns();
  }

  clickTarget.addEventListener("click",function(e){
    handlePoint(e.clientX, e.clientY);
  });
  clickTarget.addEventListener("touchstart",function(e){
    e.preventDefault();
    if(e.touches&&e.touches[0]){
      handlePoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  },{passive:false});
  if(resetBtn){
    resetBtn.addEventListener("click",function(){
      points=[];
      updateGraph();
      saveAns();
    });
  }
}

/* ---------- проверка графика ----------
   ans: {p1:{x,y}, p2:{x,y}} — две точки ученика
   task: {k: ожидаемый угловой коэффициент, tol: допуск (0,3)}
   Прямая y=kx должна: 1) иметь угловой коэффициент ≈k, 2) проходить через O(0,0). */
function checkGraph(ans, task){
  if(!ans||!ans.p1||!ans.p2)return false;
  var dx=ans.p2.x-ans.p1.x;
  if(Math.abs(dx)<0.01)return false; /* вертикальная прямая */
  var k=(ans.p2.y-ans.p1.y)/dx;
  var tol=task.tol||0.3;
  /* проверка углового коэффициента */
  if(Math.abs(k-task.k)>tol)return false;
  /* проверка прохождения через начало координат: y = kx + b, b = p1.y - k·p1.x */
  var b=ans.p1.y-k*ans.p1.x;
  if(Math.abs(b)>tol)return false;
  return true;
}

/* ---------- генератор задания ---------- */
function genProporcii(rng){
  /* выбираем «красивый» k */
  var ks=[1,2,3,0.5,-1,-2,-0.5];
  var k=pick(rng,ks);
  var kStr;
  if(k===1)kStr="x";
  else if(k===-1)kStr="−x";
  else if(k===0.5)kStr="0,5x";
  else if(k===-0.5)kStr="−0,5x";
  else kStr=k+"x";

  var q="<p>Постройте график прямой пропорциональности <b>y = "+kStr+"</b>.</p>"
    +"<p class='task-intro' style='font-size:15px;color:var(--mute)'>Кликните две точки на координатной плоскости, через которые проходит прямая. Прямая должна проходить через начало координат.</p>"
    +graphSVG();

  /* подробное решение с чертежом правильной прямой */
  var detH="";
  /* вычисляем две точки для правильной прямой */
  var x1=-4, y1=k*x1, x2=4, y2=k*x2;
  var O=200, sc=40;
  var px1=O+x1*sc, py1=O-y1*sc, px2=O+x2*sc, py2=O-y2*sc;
  /* продлеваем до границ */
  var dx=px2-px1, dy=py2-py1;
  var t1=-px1/dx, t2=(400-px1)/dx;
  var ex1=px1+dx*t1, ey1=py1+dy*t1, ex2=px1+dx*t2, ey2=py1+dy*t2;
  detH="<p>Прямая пропорциональность <b>y = "+kStr+"</b> — это прямая, проходящая через <b>начало координат O(0; 0)</b> с угловым коэффициентом <b>k = "+k+"</b>.</p>";
  detH+="<div class='svg-center' style='margin:10px auto;max-width:420px'>";
  detH+="<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>";
  /* сетка */
  detH+="<g stroke='var(--line)' stroke-width='1' opacity='0.5'>";
  for(var i=-5;i<=5;i++){
    if(i===0)continue;
    detH+="<line x1='"+(O+i*sc)+"' y1='0' x2='"+(O+i*sc)+"' y2='400'/>";
    detH+="<line x1='0' y1='"+(O+i*sc)+"' x2='400' y2='"+(O+i*sc)+"'/>";
  }
  detH+="</g>";
  detH+="<line x1='0' y1='"+O+"' x2='400' y2='"+O+"' stroke='var(--ink)' stroke-width='2'/>";
  detH+="<line x1='"+O+"' y1='0' x2='"+O+"' y2='400' stroke='var(--ink)' stroke-width='2'/>";
  for(var j=-5;j<=5;j++){
    if(j===0)continue;
    detH+="<text x='"+(O+j*sc)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)' text-anchor='middle'>"+j+"</text>";
    detH+="<text x='"+(O-12)+"' y='"+(O-j*sc+4)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+j+"</text>";
  }
  detH+="<text x='"+(O-8)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)'>O</text>";
  /* правильная прямая */
  detH+="<line x1='"+ex1.toFixed(1)+"' y1='"+ey1.toFixed(1)+"' x2='"+ex2.toFixed(1)+"' y2='"+ey2.toFixed(1)+"' stroke='var(--green)' stroke-width='3'/>";
  /* точки на прямой */
  detH+="<circle cx='"+px1+"' cy='"+py1+"' r='5' fill='var(--green)'/>";
  detH+="<circle cx='"+px2+"' cy='"+py2+"' r='5' fill='var(--green)'/>";
  detH+="<text x='"+(px1+8)+"' y='"+(py1-6)+"' font-size='12' fill='var(--green)' font-weight='600'>(−4; "+fmt(y1)+")</text>";
  detH+="<text x='"+(px2-60)+"' y='"+(py2-6)+"' font-size='12' fill='var(--green)' font-weight='600'>(4; "+fmt(y2)+")</text>";
  detH+="</svg></div>";
  detH+="<p>Для построения достаточно двух точек. Например: x = −4 → y = "+k+"·(−4) = "+fmt(y1)+"; x = 4 → y = "+k+"·4 = "+fmt(y2)+". Прямая проходит через O(0; 0).</p>";

  return [{
    type:"graph",
    q:q,
    k:k,
    tol:0.3,
    atext:"y = "+kStr+" (прямая через O(0;0), k = "+k+")",
    sol:"y = "+kStr,
    hint:"Прямая пропорциональность y = kx всегда проходит через (0; 0). Выберите ещё одну точку: x = 2 → y = "+k+"·2 = "+(k*2),
    detailed:detH
  }];
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
  if(!TZ.checkGraph)TZ.checkGraph=checkGraph;
  if(!TZ.setupGraphInteraction)TZ.setupGraphInteraction=setupGraphInteraction;
  if(!TZ.graphSVG)TZ.graphSVG=graphSVG;

  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="proporcii")return;
  }
  TZ.TOPICS.push({
    id:"proporcii",
    subject:"Математика",
    grade:"7 класс",
    title:"Прямая пропорциональность",
    variants:10,
    desc:"Интерактивный тренажёр по прямой пропорциональности y = kx. "
      +"Ученик строит график мышкой или тачскрином: кликает две точки "
      +"на координатной плоскости — через них проводится прямая. "
      +"Пробный вариант: 1 задание. После выполнения — правильный график "
      +"с подробным решением.",
    blocks:[{name:"Построение графика y = kx",gen:genProporcii,count:1}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={checkGraph:checkGraph,genProporcii:genProporcii,graphSVG:graphSVG};
}

})(typeof window!=="undefined"?window:globalThis);
