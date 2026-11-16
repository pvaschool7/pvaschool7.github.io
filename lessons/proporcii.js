/* =====================================================================
   Тренажёр · 7–9 класс · Математика · Прямая пропорциональность
   Интерактивное построение графика y = kx мышкой или тачскрином.
   50 вариантов. До 3 попыток. Точка (0;0) — по умолчанию.
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
  /* таблица */
  h+="<table class='tz-graph-table' style='border-collapse:collapse;margin:10px auto;font-size:16px;font-family:Golos Text,sans-serif'>";
  h+="<tr><th style='border:1.5px solid var(--line);padding:6px 18px;background:var(--paper)'>x</th>"
    +"<th style='border:1.5px solid var(--line);padding:6px 18px;background:var(--paper)'>y</th></tr>";
  h+="<tr><td style='border:1.5px solid var(--line);padding:6px 18px;text-align:center;color:var(--mute)'>0</td>"
    +"<td style='border:1.5px solid var(--line);padding:6px 18px;text-align:center;color:var(--mute)'>0</td></tr>";
  h+="<tr><td style='border:1.5px solid var(--line);padding:4px 10px;text-align:center'>"
    +"<input id='tz-graph-x' type='text' inputmode='decimal' style='width:60px;text-align:center;font-size:16px;border:2px solid var(--blue);border-radius:6px;padding:3px' placeholder='x'></td>"
    +"<td style='border:1.5px solid var(--line);padding:4px 10px;text-align:center'>"
    +"<input id='tz-graph-y' type='text' inputmode='decimal' style='width:60px;text-align:center;font-size:16px;border:2px solid var(--blue);border-radius:6px;padding:3px' placeholder='y'></td></tr>";
  h+="</table>";
  h+="<p style='font-size:14px;color:var(--mute);margin:4px 0 0'>Точка (0;0) уже поставлена. Введите x и y второй точки в таблицу или кликните на плоскости.</p>";
  /* кнопки */
  h+="<div style='display:flex;gap:10px;justify-content:center;margin-top:8px'>";
  h+="<button class='btn sm' type='button' id='tz-graph-check' style='background:var(--blue);color:var(--on-accent)'>Проверить</button>";
  h+="<button class='btn ghost sm' type='button' id='tz-graph-reset'>Сбросить</button>";
  h+="</div>";
  /* сообщение о результате */
  h+="<p id='tz-graph-msg' style='font-size:15px;font-weight:600;text-align:center;margin:8px 0 0;min-height:1.2em'></p>";
  h+="</div>";
  return h;
}

/* ---------- настройка интерактивного графика ---------- */
function setupGraphInteraction(svg, task, g, state, updateBar){
  if(!svg)return;
  var layer=svg.querySelector("#tz-graph-layer");
  var clickTarget=svg.querySelector("#tz-graph-click");
  var checkBtn=document.getElementById("tz-graph-check");
  var resetBtn=document.getElementById("tz-graph-reset");
  var xInput=document.getElementById("tz-graph-x");
  var yInput=document.getElementById("tz-graph-y");
  var msgEl=document.getElementById("tz-graph-msg");
  var O=200, sc=40, SIZE=400;
  /* p1 = (0,0) — по умолчанию */
  var p1={x:0,y:0};
  var p2=null;
  var attempts=0;
  var maxAttempts=3;
  var answered=false;

  /* восстановление */
  if(state&&state.ans&&state.ans[g]&&state.ans[g].p1){
    p1=state.ans[g].p1;
    p2=state.ans[g].p2;
    attempts=state.ans[g].attempts||0;
    answered=!!state.ans[g].answered;
    if(p2){
      if(xInput)xInput.value=fmt(p2.x);
      if(yInput)yInput.value=fmt(p2.y);
    }
    updateGraph();
  }

  function p2m(px,py){return{x:(px-O)/sc, y:(O-py)/sc};}
  function m2p(mx,my){return{px:O+mx*sc, py:O-my*sc};}

  function updateGraph(){
    if(!layer)return;
    var html="";
    /* линия */
    if(p2){
      var a=m2p(p1.x,p1.y), b=m2p(p2.x,p2.y);
      var dx=b.px-a.px, dy=b.py-a.py;
      if(Math.abs(dx)>0.01||Math.abs(dy)>0.01){
        var ts=[],t1=-a.px/dx,t2=(SIZE-a.px)/dx,t3=-a.py/dy,t4=(SIZE-a.py)/dy;
        if(isFinite(t1))ts.push(t1);if(isFinite(t2))ts.push(t2);
        if(isFinite(t3))ts.push(t3);if(isFinite(t4))ts.push(t4);
        ts.sort(function(a,b){return a-b;});
        if(ts.length>=2){
          html+="<line x1='"+(a.px+dx*ts[0]).toFixed(1)+"' y1='"+(a.py+dy*ts[0]).toFixed(1)+"' x2='"+(a.px+dx*ts[ts.length-1]).toFixed(1)+"' y2='"+(a.py+dy*ts[ts.length-1]).toFixed(1)+"' stroke='var(--blue)' stroke-width='2.5' opacity='0.8'/>";
        }
      }
    }
    /* точка (0,0) — всегда */
    var p0=m2p(p1.x,p1.y);
    html+="<circle cx='"+p0.px.toFixed(1)+"' cy='"+p0.py.toFixed(1)+"' r='7' fill='var(--blue)' stroke='var(--card)' stroke-width='2.5'/>";
    html+="<text x='"+(p0.px+10)+"' y='"+(p0.py-8)+"' font-size='11' fill='var(--blue)' font-weight='600'>(0; 0)</text>";
    /* вторая точка */
    if(p2){
      var pp=m2p(p2.x,p2.y);
      html+="<circle cx='"+pp.px.toFixed(1)+"' cy='"+pp.py.toFixed(1)+"' r='7' fill='var(--blue)' stroke='var(--card)' stroke-width='2.5'/>";
      html+="<text x='"+(pp.px+10)+"' y='"+(pp.py-8)+"' font-size='11' fill='var(--blue)' font-weight='600'>("+fmt(p2.x)+"; "+fmt(p2.y)+")</text>";
    }
    layer.innerHTML=html;
  }

  function saveAns(){
    var prev=state&&state.ans?state.ans[g]:null;
    var wasAnswered=prev&&prev.answered;
    var nowAnswered=answered;
    if(state&&state.ans){
      state.ans[g]={p1:p1, p2:p2, attempts:attempts, answered:answered, correct:answered&&(function(){
        if(!p2)return false;
        var dx=p2.x-p1.x;
        if(Math.abs(dx)<0.01)return false;
        var k=(p2.y-p1.y)/dx;
        var b=p1.y-k*p1.x;
        var tol=task.tol||0.3;
        return Math.abs(k-task.k)<=tol&&Math.abs(b)<=tol;
      })()};
      if(!wasAnswered&&nowAnswered)state.answered++;
      if(wasAnswered&&!nowAnswered&&state.answered>0)state.answered--;
    }
    if(updateBar)updateBar();
  }

  function setPoint2(mx,my){
    /* округление до 0.5 */
    mx=Math.round(mx*2)/2;
    my=Math.round(my*2)/2;
    if(mx<-5)mx=-5;if(mx>5)mx=5;
    if(my<-5)my=-5;if(my>5)my=5;
    p2={x:mx,y:my};
    if(xInput)xInput.value=fmt(mx);
    if(yInput)yInput.value=fmt(my);
    updateGraph();
    if(msgEl)msgEl.textContent="";
  }

  function handlePoint(clientX,clientY){
    if(answered)return;
    var rect=svg.getBoundingClientRect();
    var px=(clientX-rect.left)*(SIZE/rect.width);
    var py=(clientY-rect.top)*(SIZE/rect.height);
    var m=p2m(px,py);
    setPoint2(m.x,m.y);
  }

  function handleCheck(){
    if(answered)return;
    /* читаем из таблицы, если клика не было */
    if(!p2&&xInput&&yInput){
      var xv=parseFloat(String(xInput.value).replace(",","."));
      var yv=parseFloat(String(yInput.value).replace(",","."));
      if(isFinite(xv)&&isFinite(yv))setPoint2(xv,yv);
    }
    if(!p2){
      if(msgEl)msgEl.textContent="Введите координаты второй точки или кликните на плоскости.";
      if(msgEl)msgEl.style.color="var(--red)";
      return;
    }
    attempts++;
    var dx=p2.x-p1.x;
    var correct=false;
    if(Math.abs(dx)>=0.01){
      var k=(p2.y-p1.y)/dx;
      var b=p1.y-k*p1.x;
      var tol=task.tol||0.3;
      correct=Math.abs(k-task.k)<=tol&&Math.abs(b)<=tol;
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
        p2=null;
        if(xInput)xInput.value="";
        if(yInput)yInput.value="";
        updateGraph();
      }
    }
    saveAns();
  }

  /* события */
  if(clickTarget){
    clickTarget.addEventListener("click",function(e){handlePoint(e.clientX,e.clientY);});
    clickTarget.addEventListener("touchstart",function(e){
      e.preventDefault();
      if(e.touches&&e.touches[0])handlePoint(e.touches[0].clientX,e.touches[0].clientY);
    },{passive:false});
  }
  if(checkBtn)checkBtn.addEventListener("click",handleCheck);
  if(resetBtn){
    resetBtn.addEventListener("click",function(){
      if(answered)return;
      p2=null;
      if(xInput)xInput.value="";
      if(yInput)yInput.value="";
      if(msgEl)msgEl.textContent="";
      updateGraph();
    });
  }
  /* ввод в таблицу → точка на графике */
  if(xInput&&yInput){
    var onInput=function(){
      var xv=parseFloat(String(xInput.value).replace(",","."));
      var yv=parseFloat(String(yInput.value).replace(",","."));
      if(isFinite(xv)&&isFinite(yv)){
        setPoint2(xv,yv);
      } else {
        p2=null;
        updateGraph();
      }
    };
    xInput.addEventListener("input",onInput);
    yInput.addEventListener("input",onInput);
    /* Enter в таблице → проверка */
    yInput.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();handleCheck();}});
  }
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
    +"<p class='task-intro' style='font-size:15px;color:var(--mute)'>Точка O(0;0) уже поставлена. "
    +"Введите координаты второй точки в таблицу или кликните на координатной плоскости. "
    +"Затем нажмите «Проверить». У вас до 3 попыток.</p>"
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
    hint:"Прямая y = kx проходит через (0;0). Выберите x = 2 → y = "+k+"·2 = "+(k*2),
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
      +"Ученик строит график: точка O(0;0) уже поставлена, вторую точку "
      +"можно ввести в таблицу или кликнуть на координатной плоскости. "
      +"До 3 попыток. 50 вариантов. После выполнения — правильный график "
      +"с подробным решением.",
    blocks:[{name:"Построение графика y = kx",gen:genProporcii,count:1}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={checkGraph:checkGraph,genProporcii:genProporcii};
}

})(typeof window!=="undefined"?window:globalThis);
