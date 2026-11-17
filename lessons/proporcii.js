/* =====================================================================
   Тренажёр · 7–9 класс · Математика · Прямая пропорциональность
   Интерактивное построение графика y = kx мышкой или тачскрином.
   50 вариантов. До 3 попыток. Ученик сам выбирает две точки и проводит прямую.
   Ученик может кликать на координатной плоскости ИЛИ вводить x,y в таблицу.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function fmt(n){
  if(Math.abs(n-Math.round(n))<1e-9)return String(Math.round(n));
  return n.toFixed(1).replace(".",",");
}

/* ---------- SVG координатной плоскости + таблица ---------- */
function graphSVG(){
  var S=400, O=200, sc=40;
  var h="<div class='tz-graph-wrap'>"
    /* SVG */
    +"<svg id='tz-graph-svg' width='"+S+"' height='"+S+"' viewBox='0 0 "+S+" "+S+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;cursor:crosshair;touch-action:none'>";
  h+="<g stroke='var(--line)' stroke-width='1' opacity='0.5'>";
  for(var i=-5;i<=5;i++){
    if(i===0)continue;
    h+="<line x1='"+(O+i*sc)+"' y1='0' x2='"+(O+i*sc)+"' y2='"+S+"'/>";
    h+="<line x1='0' y1='"+(O+i*sc)+"' x2='"+S+"' y2='"+(O+i*sc)+"'/>";
  }
  h+="</g>";
  h+="<line x1='0' y1='"+O+"' x2='"+S+"' y2='"+O+"' stroke='var(--ink)' stroke-width='2'/>";
  h+="<line x1='"+O+"' y1='0' x2='"+O+"' y2='"+S+"' stroke='var(--ink)' stroke-width='2'/>";
  for(var j=-5;j<=5;j++){
    if(j===0)continue;
    h+="<text x='"+(O+j*sc)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)' text-anchor='middle'>"+j+"</text>";
    h+="<text x='"+(O-12)+"' y='"+(O-j*sc+4)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+j+"</text>";
  }
  h+="<text x='"+(O-8)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)'>O</text>";
  h+="<text x='"+(S-8)+"' y='"+(O-8)+"' font-size='13' fill='var(--ink)' font-weight='600'>x</text>";
  h+="<text x='"+(O+8)+"' y='14' font-size='13' fill='var(--ink)' font-weight='600'>y</text>";
  h+="<g id='tz-graph-layer'></g>";
  h+="<rect id='tz-graph-click' x='0' y='0' width='"+S+"' height='"+S+"' fill='transparent'/>";
  h+="</svg>";
  /* таблица — две пустые строки для двух точек */
  h+="<table class='tz-graph-table' style='border-collapse:collapse;margin:10px auto;font-size:16px;font-family:Golos Text,sans-serif'>";
  h+="<tr><th style='border:1.5px solid var(--line);padding:6px 18px;background:var(--paper)'>x</th>"
    +"<th style='border:1.5px solid var(--line);padding:6px 18px;background:var(--paper)'>y</th></tr>";
  /* строка 1 — первая точка */
  h+="<tr><td style='border:1.5px solid var(--line);padding:4px 10px;text-align:center'>"
    +"<input id='tz-graph-x1' type='text' inputmode='decimal' style='width:60px;text-align:center;font-size:16px;border:2px solid var(--blue);border-radius:6px;padding:3px' placeholder='x₁'></td>"
    +"<td style='border:1.5px solid var(--line);padding:4px 10px;text-align:center'>"
    +"<input id='tz-graph-y1' type='text' inputmode='decimal' style='width:60px;text-align:center;font-size:16px;border:2px solid var(--blue);border-radius:6px;padding:3px' placeholder='y₁'></td></tr>";
  /* строка 2 — вторая точка */
  h+="<tr><td style='border:1.5px solid var(--line);padding:4px 10px;text-align:center'>"
    +"<input id='tz-graph-x2' type='text' inputmode='decimal' style='width:60px;text-align:center;font-size:16px;border:2px solid var(--blue);border-radius:6px;padding:3px' placeholder='x₂'></td>"
    +"<td style='border:1.5px solid var(--line);padding:4px 10px;text-align:center'>"
    +"<input id='tz-graph-y2' type='text' inputmode='decimal' style='width:60px;text-align:center;font-size:16px;border:2px solid var(--blue);border-radius:6px;padding:3px' placeholder='y₂'></td></tr>";
  h+="</table>";
  h+="<p style='font-size:14px;color:var(--mute);margin:4px 0 0'>Зажмите мышку (или палец) на координатной плоскости и проведите прямую — от одной точки до другой. Подумайте, через какие точки проходит график y = kx.</p>";
  /* кнопки */
  h+="<div style='display:flex;gap:10px;justify-content:center;margin-top:8px;flex-wrap:wrap'>";
  h+="<button class='btn sm' type='button' id='tz-graph-check' style='background:var(--blue);color:var(--on-accent)'>Проверить</button>";
  h+="<button class='btn ghost sm' type='button' id='tz-graph-reset'>Сбросить</button>";
  h+="</div>";
  /* сообщение о результате */
  h+="<p id='tz-graph-msg' style='font-size:15px;font-weight:600;text-align:center;margin:8px 0 0;min-height:1.2em'></p>";
  h+="</div>";
  return h;
}

/* ---------- настройка интерактивного графика ----------
   Ученик САМ рисует прямую перетаскиванием (drag) мышкой или пальцем.
   Зажимает на координатной плоскости → ведёт → отпускает.
   Начало и конец перетаскивания = две точки прямой.
   Координаты точек на графике НЕ показываются (только в таблице). */
function setupGraphInteraction(svg, task, g, state, updateBar){
  if(!svg)return;
  var layer=svg.querySelector("#tz-graph-layer");
  var clickTarget=svg.querySelector("#tz-graph-click");
  var checkBtn=document.getElementById("tz-graph-check");
  var resetBtn=document.getElementById("tz-graph-reset");
  var x1Input=document.getElementById("tz-graph-x1");
  var y1Input=document.getElementById("tz-graph-y1");
  var x2Input=document.getElementById("tz-graph-x2");
  var y2Input=document.getElementById("tz-graph-y2");
  var msgEl=document.getElementById("tz-graph-msg");
  var O=200, sc=40, SIZE=400;
  var p1=null, p2=null;
  var attempts=0, maxAttempts=3, answered=false;
  var dragging=false, dragStart=null;

  /* восстановление */
  if(state&&state.ans&&state.ans[g]&&state.ans[g].p1){
    p1=state.ans[g].p1;
    p2=state.ans[g].p2;
    attempts=state.ans[g].attempts||0;
    answered=!!state.ans[g].answered;
    if(p1){if(x1Input)x1Input.value=fmt(p1.x);if(y1Input)y1Input.value=fmt(p1.y);}
    if(p2){if(x2Input)x2Input.value=fmt(p2.x);if(y2Input)y2Input.value=fmt(p2.y);}
    updateGraph();
  }

  function p2m(px,py){return{x:(px-O)/sc, y:(O-py)/sc};}
  function m2p(mx,my){return{px:O+mx*sc, py:O-my*sc};}

  function roundPoint(mx,my){
    mx=Math.round(mx*2)/2; my=Math.round(my*2)/2;
    if(mx<-5)mx=-5;if(mx>5)mx=5;
    if(my<-5)my=-5;if(my>5)my=5;
    return{x:mx,y:my};
  }

  function extendLine(a,b){
    /* продлеваем отрезок a-b до границ холста */
    var dx=b.px-a.px, dy=b.py-a.py;
    if(Math.abs(dx)<0.01&&Math.abs(dy)<0.01)return null;
    var ts=[],t1=-a.px/dx,t2=(SIZE-a.px)/dx,t3=-a.py/dy,t4=(SIZE-a.py)/dy;
    if(isFinite(t1))ts.push(t1);if(isFinite(t2))ts.push(t2);
    if(isFinite(t3))ts.push(t3);if(isFinite(t4))ts.push(t4);
    ts.sort(function(a,b){return a-b;});
    if(ts.length<2)return null;
    return{x1:(a.px+dx*ts[0]).toFixed(1),y1:(a.py+dy*ts[0]).toFixed(1),
            x2:(a.px+dx*ts[ts.length-1]).toFixed(1),y2:(a.py+dy*ts[ts.length-1]).toFixed(1)};
  }

  function updateGraph(){
    if(!layer)return;
    var html="";
    if(p1&&p2){
      var a=m2p(p1.x,p1.y), b=m2p(p2.x,p2.y);
      var ext=extendLine(a,b);
      if(ext){
        html+="<line x1='"+ext.x1+"' y1='"+ext.y1+"' x2='"+ext.x2+"' y2='"+ext.y2+"' stroke='var(--blue)' stroke-width='2.5' opacity='0.8'/>";
      }
      /* концы прямой — маленькие точки без координат */
      html+="<circle cx='"+a.px.toFixed(1)+"' cy='"+a.py.toFixed(1)+"' r='5' fill='var(--blue)'/>";
      html+="<circle cx='"+b.px.toFixed(1)+"' cy='"+b.py.toFixed(1)+"' r='5' fill='var(--blue)'/>";
    }
    layer.innerHTML=html;
  }

  /* превью линии во время перетаскивания */
  function updatePreview(curPx,curPy){
    if(!layer||!dragStart)return;
    var a={px:dragStart.px,py:dragStart.py};
    var b={px:curPx,py:curPy};
    var ext=extendLine(a,b);
    var html="";
    if(ext){
      html+="<line x1='"+ext.x1+"' y1='"+ext.y1+"' x2='"+ext.x2+"' y2='"+ext.y2+"' stroke='var(--blue)' stroke-width='2' opacity='0.5' stroke-dasharray='6,4'/>";
    }
    html+="<circle cx='"+a.px.toFixed(1)+"' cy='"+a.py.toFixed(1)+"' r='5' fill='var(--blue)'/>";
    html+="<circle cx='"+b.px.toFixed(1)+"' cy='"+b.py.toFixed(1)+"' r='5' fill='var(--blue)'/>";
    layer.innerHTML=html;
  }

  function saveAns(){
    var prev=state&&state.ans?state.ans[g]:null;
    var wasAnswered=prev&&prev.answered;
    if(state&&state.ans){
      state.ans[g]={p1:p1,p2:p2,attempts:attempts,answered:answered,correct:answered&&(function(){
        if(!p1||!p2)return false;
        var dx=p2.x-p1.x;
        if(Math.abs(dx)<0.01)return false;
        var k=(p2.y-p1.y)/dx;
        var b=p1.y-k*p1.x;
        return Math.abs(k-task.k)<=(task.tol||0.3)&&Math.abs(b)<=(task.tol||0.3);
      })()};
      if(!wasAnswered&&answered)state.answered++;
      if(wasAnswered&&!answered&&state.answered>0)state.answered--;
    }
    if(updateBar)updateBar();
  }

  function getSVGCoords(clientX,clientY){
    var rect=svg.getBoundingClientRect();
    return{
      px:(clientX-rect.left)*(SIZE/rect.width),
      py:(clientY-rect.top)*(SIZE/rect.height)
    };
  }

  /* ---- DRAG: мышка ---- */
  if(clickTarget){
    clickTarget.addEventListener("mousedown",function(e){
      if(answered)return;
      var c=getSVGCoords(e.clientX,e.clientY);
      var m=p2m(c.px,c.py);
      dragStart={px:c.px,py:c.py,x:m.x,y:m.y};
      dragging=true;
      if(msgEl)msgEl.textContent="";
      e.preventDefault();
    });
    clickTarget.addEventListener("mousemove",function(e){
      if(!dragging)return;
      var c=getSVGCoords(e.clientX,e.clientY);
      updatePreview(c.px,c.py);
    });
    clickTarget.addEventListener("mouseup",function(e){
      if(!dragging)return;
      dragging=false;
      var c=getSVGCoords(e.clientX,e.clientY);
      var m=p2m(c.px,c.py);
      var start=roundPoint(dragStart.x,dragStart.y);
      var end=roundPoint(m.x,m.y);
      p1=start; p2=end;
      if(x1Input)x1Input.value=fmt(start.x);
      if(y1Input)y1Input.value=fmt(start.y);
      if(x2Input)x2Input.value=fmt(end.x);
      if(y2Input)y2Input.value=fmt(end.y);
      updateGraph();
    });
    clickTarget.addEventListener("mouseleave",function(){
      if(dragging){dragging=false;updateGraph();}
    });

    /* ---- DRAG: тачскрин ---- */
    clickTarget.addEventListener("touchstart",function(e){
      if(answered)return;
      if(e.touches&&e.touches[0]){
        var c=getSVGCoords(e.touches[0].clientX,e.touches[0].clientY);
        var m=p2m(c.px,c.py);
        dragStart={px:c.px,py:c.py,x:m.x,y:m.y};
        dragging=true;
        if(msgEl)msgEl.textContent="";
        e.preventDefault();
      }
    },{passive:false});
    clickTarget.addEventListener("touchmove",function(e){
      if(!dragging)return;
      if(e.touches&&e.touches[0]){
        var c=getSVGCoords(e.touches[0].clientX,e.touches[0].clientY);
        updatePreview(c.px,c.py);
        e.preventDefault();
      }
    },{passive:false});
    clickTarget.addEventListener("touchend",function(e){
      if(!dragging)return;
      dragging=false;
      if(e.changedTouches&&e.changedTouches[0]){
        var c=getSVGCoords(e.changedTouches[0].clientX,e.changedTouches[0].clientY);
        var m=p2m(c.px,c.py);
        var start=roundPoint(dragStart.x,dragStart.y);
        var end=roundPoint(m.x,m.y);
        p1=start; p2=end;
        if(x1Input)x1Input.value=fmt(start.x);
        if(y1Input)y1Input.value=fmt(start.y);
        if(x2Input)x2Input.value=fmt(end.x);
        if(y2Input)y2Input.value=fmt(end.y);
        updateGraph();
      }
    });
  }

  function handleCheck(){
    if(answered)return;
    /* если линия не проведена — пробуем из таблицы */
    if(!p1&&x1Input&&y1Input){
      var xv1=parseFloat(String(x1Input.value).replace(",","."));
      var yv1=parseFloat(String(y1Input.value).replace(",","."));
      if(isFinite(xv1)&&isFinite(yv1))p1={x:xv1,y:yv1};
    }
    if(!p2&&x2Input&&y2Input){
      var xv2=parseFloat(String(x2Input.value).replace(",","."));
      var yv2=parseFloat(String(y2Input.value).replace(",","."));
      if(isFinite(xv2)&&isFinite(yv2))p2={x:xv2,y:yv2};
    }
    if(!p1||!p2){
      if(msgEl)msgEl.textContent="Проведите прямую на координатной плоскости — зажмите и ведите.";
      if(msgEl)msgEl.style.color="var(--red)";
      return;
    }
    attempts++;
    var dx=p2.x-p1.x, correct=false;
    if(Math.abs(dx)>=0.01){
      var k=(p2.y-p1.y)/dx;
      var b=p1.y-k*p1.x;
      correct=Math.abs(k-task.k)<=(task.tol||0.3)&&Math.abs(b)<=(task.tol||0.3);
    }
    if(correct){
      answered=true;
      if(msgEl)msgEl.textContent="✓ Верно! Прямая y="+task.kStr+" построена правильно.";
      if(msgEl)msgEl.style.color="var(--green)";
      if(checkBtn)checkBtn.disabled=true;
    } else {
      if(attempts>=maxAttempts){
        answered=true;
        if(msgEl)msgEl.textContent="✗ Попытки закончились. Верный ответ: y="+task.kStr+".";
        if(msgEl)msgEl.style.color="var(--red)";
        if(checkBtn)checkBtn.disabled=true;
      } else {
        if(msgEl)msgEl.textContent="✗ Неверно (попытка "+attempts+" из "+maxAttempts+"). Попробуйте ещё раз.";
        if(msgEl)msgEl.style.color="var(--red)";
        p1=null;p2=null;
        if(x1Input)x1Input.value="";if(y1Input)y1Input.value="";
        if(x2Input)x2Input.value="";if(y2Input)y2Input.value="";
        updateGraph();
      }
    }
    saveAns();
  }

  if(checkBtn)checkBtn.addEventListener("click",handleCheck);
  if(resetBtn){
    resetBtn.addEventListener("click",function(){
      if(answered)return;
      p1=null;p2=null;dragging=false;
      if(x1Input)x1Input.value="";if(y1Input)y1Input.value="";
      if(x2Input)x2Input.value="";if(y2Input)y2Input.value="";
      if(msgEl)msgEl.textContent="";
      updateGraph();
    });
  }
  /* ввод в таблицу → линия */
  function bindInput(xi,yi,idx){
    if(!xi||!yi)return;
    var onInput=function(){
      var xv=parseFloat(String(xi.value).replace(",","."));
      var yv=parseFloat(String(yi.value).replace(",","."));
      if(isFinite(xv)&&isFinite(yv)){
        var pt=roundPoint(xv,yv);
        if(idx===1)p1=pt;else p2=pt;
        if(idx===1){if(x1Input)x1Input.value=fmt(pt.x);if(y1Input)y1Input.value=fmt(pt.y);}
        else{if(x2Input)x2Input.value=fmt(pt.x);if(y2Input)y2Input.value=fmt(pt.y);}
        updateGraph();
      } else if(!xi.value&&!yi.value){
        if(idx===1)p1=null;else p2=null;
        updateGraph();
      }
    };
    xi.addEventListener("input",onInput);
    yi.addEventListener("input",onInput);
    yi.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();handleCheck();}});
  }
  bindInput(x1Input,y1Input,1);
  bindInput(x2Input,y2Input,2);
}

/* ---------- проверка графика ---------- */
function checkGraph(ans, task){
  if(!ans||!ans.answered)return false;
  if(ans.correct!==undefined)return ans.correct;
  if(!ans.p1||!ans.p2)return false;
  var dx=ans.p2.x-ans.p1.x;
  if(Math.abs(dx)<0.01)return false;
  var k=(ans.p2.y-ans.p1.y)/dx;
  var tol=task.tol||0.3;
  var b=ans.p1.y-k*ans.p1.x;
  return Math.abs(k-task.k)<=tol&&Math.abs(b)<=tol;
}

/* ---------- генератор задания ---------- */
function genProporcii(rng){
  var ks=[1,2,3,0.5,-1,-2,-0.5];
  var k=pick(rng,ks);
  var kStr;
  if(k===1)kStr="x";
  else if(k===-1)kStr="−x";
  else if(k===0.5)kStr="0,5x";
  else if(k===-0.5)kStr="−0,5x";
  else kStr=k+"x";

  var q="<p>Постройте график прямой пропорциональности <b>y = "+kStr+"</b>.</p>"
    +"<p class='task-intro' style='font-size:15px;color:var(--mute)'>Подумайте, через какие две точки проходит график. "
    +"Введите координаты в таблицу или кликните на координатной плоскости. "
    +"Затем нажмите «Провести прямую» и «Проверить». У вас до 3 попыток.</p>"
    +graphSVG();

  /* подробное решение */
  var x1=-4,y1=k*x1,x2=4,y2=k*x2;
  var O=200,sc=40;
  var px1=O+x1*sc,py1=O-y1*sc,px2=O+x2*sc,py2=O-y2*sc;
  var dx=px2-px1,dy=py2-py1;
  var t1=-px1/dx,t2=(400-px1)/dx;
  var ex1=px1+dx*t1,ey1=py1+dy*t1,ex2=px1+dx*t2,ey2=py1+dy*t2;
  var detH="<p>Прямая пропорциональность <b>y = "+kStr+"</b> — прямая через <b>O(0; 0)</b> с угловым коэффициентом <b>k = "+k+"</b>.</p>";
  detH+="<div class='svg-center' style='margin:10px auto;max-width:420px'>";
  detH+="<svg width='400' height='400' viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>";
  detH+="<g stroke='var(--line)' stroke-width='1' opacity='0.5'>";
  for(var i=-5;i<=5;i++){if(i===0)continue;
    detH+="<line x1='"+(O+i*sc)+"' y1='0' x2='"+(O+i*sc)+"' y2='400'/>";
    detH+="<line x1='0' y1='"+(O+i*sc)+"' x2='400' y2='"+(O+i*sc)+"'/>";
  }
  detH+="</g>";
  detH+="<line x1='0' y1='"+O+"' x2='400' y2='"+O+"' stroke='var(--ink)' stroke-width='2'/>";
  detH+="<line x1='"+O+"' y1='0' x2='"+O+"' y2='400' stroke='var(--ink)' stroke-width='2'/>";
  for(var j=-5;j<=5;j++){if(j===0)continue;
    detH+="<text x='"+(O+j*sc)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)' text-anchor='middle'>"+j+"</text>";
    detH+="<text x='"+(O-12)+"' y='"+(O-j*sc+4)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+j+"</text>";
  }
  detH+="<text x='"+(O-8)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)'>O</text>";
  detH+="<line x1='"+ex1.toFixed(1)+"' y1='"+ey1.toFixed(1)+"' x2='"+ex2.toFixed(1)+"' y2='"+ey2.toFixed(1)+"' stroke='var(--green)' stroke-width='3'/>";
  detH+="<circle cx='"+px1+"' cy='"+py1+"' r='5' fill='var(--green)'/>";
  detH+="<circle cx='"+px2+"' cy='"+py2+"' r='5' fill='var(--green)'/>";
  detH+="<text x='"+(px1+8)+"' y='"+(py1-6)+"' font-size='12' fill='var(--green)' font-weight='600'>(−4; "+fmt(y1)+")</text>";
  detH+="<text x='"+(px2-60)+"' y='"+(py2-6)+"' font-size='12' fill='var(--green)' font-weight='600'>(4; "+fmt(y2)+")</text>";
  detH+="</svg></div>";
  detH+="<p>Например: x = −4 → y = "+k+"·(−4) = "+fmt(y1)+"; x = 4 → y = "+k+"·4 = "+fmt(y2)+". Прямая проходит через O(0; 0).</p>";

  return [{
    type:"graph",
    q:q,
    k:k,
    kStr:kStr,
    tol:0.3,
    atext:"y = "+kStr+" (через O(0;0), k = "+k+")",
    sol:"y = "+kStr,
    hint:"Прямая y = kx проходит через начало координат. Выберите x = 2 → y = "+k+"·2 = "+(k*2),
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

  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="proporcii")return;
  }
  TZ.TOPICS.push({
    id:"proporcii",
    subject:"Математика",
    grade:"7 класс",
    title:"Прямая пропорциональность",
    variants:50,
    desc:"Интерактивный тренажёр по прямой пропорциональности y = kx. "
      +"Ученик сам выбирает две точки (кликом или через таблицу) и "
      +"проводит прямую кнопкой. До 3 попыток. 50 вариантов. "
      +"После выполнения — правильный график с подробным решением.",
    blocks:[{name:"Построение графика y = kx",gen:genProporcii,count:1}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={checkGraph:checkGraph,genProporcii:genProporcii};
}

})(typeof window!=="undefined"?window:globalThis);
