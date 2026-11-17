/* =====================================================================
   Тренажёр · 11 класс · Математика (базовая) · Экстремумы функции
   По заданиям 5.6, 5.7, 5.8, 5.10, 5.11 учебника.
   40 вариантов × 20 заданий (5 блоков × 4 подпункта).
   Тип "maxmin": ученик вводит «max, min».
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
function fmtFrac(n){
  if(Math.abs(n-Math.round(n))<1e-6)return fmt(n);
  /* пробуем простые дроби со знаменателем до 12 */
  for(var d=2;d<=12;d++){
    var num=Math.round(n*d);
    if(Math.abs(num/d-n)<1e-6){
      return num+"/"+d;
    }
  }
  return fmt(n);
}

var ROUND_NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — два числа через запятую: наибольшее, наименьшее; округлите до сотых)</span>";

function mkMaxmin(opts){
  return {type:"maxmin",q:opts.q,max:opts.max,min:opts.min,sol:opts.sol,
    atext:opts.sol,hint:opts.hint||"",detailed:opts.detailed||"",unit:opts.unit||""};
}

/* ---------- численное нахождение экстремумов ----------
   f — функция, a,b — границы, шаг = (b-a)/N */
function findExtrema(f,a,b){
  var N=500,x=a,i,v,fv;
  var pts=[a]; /* проверяемые точки: концы + критические */
  var prev=f(a),dx=(b-a)/N;
  for(i=1;i<=N;i++){
    x=a+i*dx;
    v=f(x);
    /* если знак производной меняется — критическая точка (bisection) */
    if((v-prev)>0&&(i<N)&&f(x+dx)<v || (v-prev)<0&&(i<N)&&f(x+dx)>v){
      /* уточним бисекцией */
      var lo=a+(i-1)*dx,hi=a+i*dx;
      for(var k=0;k<30;k++){
        var mid=(lo+hi)/2;
        if(f(mid)<f(mid+dx*0.01))lo=mid;else hi=mid;
      }
      pts.push((lo+hi)/2);
    }
    prev=v;
  }
  pts.push(b);
  /* вычисляем значения и находим max/min */
  var maxV=-Infinity,minV=Infinity,maxX=a,minX=a;
  for(i=0;i<pts.length;i++){
    fv=f(pts[i]);
    if(fv>maxV){maxV=fv;maxX=pts[i];}
    if(fv<minV){minV=fv;minX=pts[i];}
  }
  return{max:maxV,min:minV,maxX:maxX,minX:minX,crits:pts};
}

/* ---------- detWrap ---------- */
function detSteps(items,answerLine){
  var h="";
  for(var i=0;i<items.length;i++){
    h+="<p><b>"+items[i].title+"</b></p>";
    if(items[i].text)h+="<p>"+items[i].text+"</p>";
  }
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p>";
  return h;
}

/* ---------- SVG-график функции на отрезке ----------
   Рисует график y=f(x) на [a;b], отмечает критические точки,
   подписывает max и min. Размер 400×320. */
function graphSVG(f,a,b,ex,fHtml){
  var W=400,H=320,padL=50,padR=20,padT=25,padB=45;
  var plotW=W-padL-padR,plotH=H-padT-padB;
  /* y-диапазон с запасом */
  var yLo=ex.min,yHi=ex.max;
  var yRange=yHi-yLo;
  if(yRange<0.01)yRange=1;
  yLo-=yRange*0.15; yHi+=yRange*0.15;
  var xRange=b-a;
  /* функции масштабирования */
  function sx(x){return padL+(x-a)/xRange*plotW;}
  function sy(y){return padT+plotH-(y-yLo)/(yHi-yLo)*plotH;}
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto'>";
  /* оси */
  h+="<line x1='"+padL+"' y1='"+(padT+plotH)+"' x2='"+(padL+plotW)+"' y2='"+(padT+plotH)+"' stroke='var(--ink)' stroke-width='2'/>";
  h+="<line x1='"+padL+"' y1='"+padT+"' x2='"+padL+"' y2='"+(padT+plotH)+"' stroke='var(--ink)' stroke-width='2'/>";
  /* подписи концов отрезка на оси x */
  h+="<text x='"+padL+"' y='"+(padT+plotH+16)+"' font-size='12' fill='var(--mute)' text-anchor='middle'>"+fmt(a)+"</text>";
  h+="<text x='"+(padL+plotW)+"' y='"+(padT+plotH+16)+"' font-size='12' fill='var(--mute)' text-anchor='middle'>"+fmt(b)+"</text>";
  h+="<text x='"+(padL-8)+"' y='"+(padT+plotH+16)+"' font-size='11' fill='var(--mute)' text-anchor='end'>x</text>";
  /* подписи y на оси */
  h+="<text x='"+(padL-8)+"' y='"+sy(yHi).toFixed(0)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+fmt(yHi)+"</text>";
  h+="<text x='"+(padL-8)+"' y='"+sy(yLo).toFixed(0)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+fmt(yLo)+"</text>";
  /* кривая функции — 100 точек */
  var N=100;
  var pts=[];
  for(var i=0;i<=N;i++){
    var x=a+i/N*xRange;
    var y=f(x);
    if(isFinite(y))pts.push(sx(x).toFixed(1)+","+sy(y).toFixed(1));
  }
  if(pts.length>1){
    h+="<polyline points='"+pts.join(" ")+"' fill='none' stroke='var(--blue)' stroke-width='2.5'/>";
  }
  /* критические точки (внутри отрезка) */
  for(var ci=1;ci<ex.crits.length-1;ci++){
    var cx=ex.crits[ci];
    if(cx>a+0.01&&cx<b-0.01){
      var cy=f(cx);
      h+="<circle cx='"+sx(cx).toFixed(1)+"' cy='"+sy(cy).toFixed(1)+"' r='4' fill='var(--yellow)' stroke='var(--ink)' stroke-width='1.5'/>";
    }
  }
  /* max — красная точка */
  h+="<circle cx='"+sx(ex.maxX).toFixed(1)+"' cy='"+sy(ex.max).toFixed(1)+"' r='6' fill='var(--red)' stroke='var(--card)' stroke-width='2'/>";
  h+="<text x='"+(sx(ex.maxX)+8).toFixed(0)+"' y='"+(sy(ex.max)-8).toFixed(0)+"' font-size='13' fill='var(--red)' font-weight='600'>max="+fmt(ex.max)+"</text>";
  /* min — зелёная точка */
  h+="<circle cx='"+sx(ex.minX).toFixed(1)+"' cy='"+sy(ex.min).toFixed(1)+"' r='6' fill='var(--green)' stroke='var(--card)' stroke-width='2'/>";
  h+="<text x='"+(sx(ex.minX)+8).toFixed(0)+"' y='"+(sy(ex.min)+16).toFixed(0)+"' font-size='13' fill='var(--green)' font-weight='600'>min="+fmt(ex.min)+"</text>";
  /* концы отрезка — точки */
  h+="<circle cx='"+sx(a).toFixed(1)+"' cy='"+sy(f(a)).toFixed(1)+"' r='4' fill='var(--ink)'/>";
  h+="<circle cx='"+sx(b).toFixed(1)+"' cy='"+sy(f(b)).toFixed(1)+"' r='4' fill='var(--ink)'/>";
  h+="</svg>";
  return h;
}

/* ---------- полное решение с графиком и таблицей значений ---------- */
function buildSolution(f,lo,hi,ex,fHtml,derivStr,critStr){
  /* таблица значений в кандидатах */
  var vals=[];
  for(var i=0;i<ex.crits.length;i++){
    var x=ex.crits[i];
    var v=f(x);
    var isMax=Math.abs(v-ex.max)<1e-6;
    var isMin=Math.abs(v-ex.min)<1e-6;
    vals.push({x:x,v:v,isMax:isMax,isMin:isMin});
  }
  var tableH="<table style='border-collapse:collapse;margin:8px auto;font-size:15px;font-family:Golos Text,sans-serif'>";
  tableH+="<tr><th style='border:1.5px solid var(--line);padding:4px 16px;background:var(--paper)'>x</th>"
    +"<th style='border:1.5px solid var(--line);padding:4px 16px;background:var(--paper)'>f(x)</th>"
    +"<th style='border:1.5px solid var(--line);padding:4px 16px;background:var(--paper)'>тип</th></tr>";
  for(var j=0;j<vals.length;j++){
    var v=vals[j];
    var type=v.isMax?"<b style='color:var(--red)'>max</b>":v.isMin?"<b style='color:var(--green)'>min</b>":"";
    tableH+="<tr><td style='border:1px solid var(--line);padding:3px 16px;text-align:center'>"+fmt(v.x)+"</td>"
      +"<td style='border:1px solid var(--line);padding:3px 16px;text-align:center'>"+fmt(v.v)+"</td>"
      +"<td style='border:1px solid var(--line);padding:3px 16px;text-align:center'>"+type+"</td></tr>";
  }
  tableH+="</table>";

  /* комментарий о знаках производной */
  var signComment="";
  var innerCrits=ex.crits.slice(1,-1); /* внутренние критические точки */
  if(innerCrits.length>0){
    signComment="<p>В точке x = "+fmt(innerCrits[0])+" производная меняет знак ";
    var leftVal=f(innerCrits[0]-0.1),rightVal=f(innerCrits[0]+0.1);
    if(leftVal<rightVal){
      signComment+="с «−» на «+» → это точка <b style='color:var(--green)'>минимума</b>.";
    } else {
      signComment+="с «+» на «−» → это точка <b style='color:var(--red)'>максимума</b>.";
    }
    signComment+=" Значение: f("+fmt(innerCrits[0])+") = "+fmt(f(innerCrits[0]))+".</p>";
  } else {
    signComment="<p>Критических точек внутри отрезка нет — функция монотонна. "
      +"Экстремумы достигаются на концах отрезка.</p>";
  }

  var detH="";
  detH+="<p><b>1. Функция и отрезок.</b> y = "+fHtml+", x ∈ ["+fmt(lo)+"; "+fmt(hi)+"].</p>";
  detH+="<p><b>2. Производная.</b> "+derivStr+".</p>";
  detH+="<p><b>3. Критические точки.</b> "+critStr+". Проверяем, какие попадают в отрезок ["+fmt(lo)+"; "+fmt(hi)+"].</p>";
  detH+=signComment;
  detH+="<p><b>4. Таблица значений.</b> Вычисляем f(x) во всех критических точках и на концах:</p>";
  detH+=tableH;
  detH+="<p><b>5. График функции.</b></p>";
  detH+="<div class='svg-center' style='margin:8px auto;max-width:420px'>"+graphSVG(f,lo,hi,ex,fHtml)+"</div>";
  detH+="<p><b>6. Вывод.</b> Наибольшее значение функции на отрезке: "
    +"<b style='color:var(--red)'>max = "+fmt(ex.max)+"</b> (достигается при x = "+fmt(ex.maxX)+"). "
    +"Наименьшее значение: <b style='color:var(--green)'>min = "+fmt(ex.min)+"</b> "
    +"(при x = "+fmt(ex.minX)+").</p>";
  return detH;
}

/* =====================================================================
   БЛОК 1 (5.6): Многочлены — 4 задания
-------------------------------------------------------------------- */
function gen5_6a(rng){
  var a=pick(rng,[2,3,-2,-3]);
  var b=-a*pick(rng,[1,2]);
  var lo=ri(rng,-4,-2),hi=ri(rng,2,4);
  var f=function(x){return a*x*x*x+b*x*x;};
  var ex=findExtrema(f,lo,hi);
  var fStr=a+"x³ + ("+b+")x²";
  var fHtml=a+"x<sup>3</sup> "+(b<0?"−":"+")+" "+Math.abs(b)+"x<sup>2</sup>";
  var dStr="f'(x) = "+(3*a)+"x² + "+(2*b)+"x = x("+(3*a)+"x + "+(2*b)+")";
  var critStr="x = 0, x = "+fmtFrac(-2*b/(3*a));
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = "+fHtml+" на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,
    sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"Найдите f'(x), приравняйте к нулю, проверьте концы и критические точки",
    detailed:buildSolution(f,lo,hi,ex,fHtml,dStr,critStr)
  });
}
function gen5_6b(rng){
  var a=pick(rng,[1,2,3,5,-1,-2,-3,-5]);
  var b=-a*pick(rng,[3,5,9,15]);
  var lo=ri(rng,-3,-1),hi=ri(rng,1,3);
  var f=function(x){return a*x*x*x+b*x;};
  var ex=findExtrema(f,lo,hi);
  var fHtml=a+"x<sup>3</sup> "+(b<0?"−":"+")+" "+Math.abs(b)+"x";
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = "+fHtml+" на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,
    sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 3ax² + b — квадратное уравнение",
    detailed:buildSolution(f,lo,hi,ex,fHtml,"f'(x) = "+(3*a)+"x² + "+b+" = 0 → x = ±"+fmt(Math.sqrt(-b/(3*a))),"x = ±"+fmt(Math.sqrt(-b/(3*a))))
  });
}
function gen5_6v(rng){
  var a=pick(rng,[2,3]);
  var b=pick(rng,[1,-1,2,-2]);
  var c=pick(rng,[5,7,10]);
  var lo=ri(rng,-3,-2),hi=ri(rng,2,3);
  var f=function(x){return a*Math.pow(x,4)+b*Math.pow(x,3)+c;};
  var ex=findExtrema(f,lo,hi);
  var fHtml=a+"x<sup>4</sup> "+(b<0?"−":"+")+" "+Math.abs(b)+"x<sup>3</sup> + "+c;
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = "+fHtml+" на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,
    sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 4ax³ + 3bx² = x²(4ax + 3b)",
    detailed:buildSolution(f,lo,hi,ex,fHtml,"f'(x) = "+(4*a)+"x³ + "+(3*b)+"x² = x²("+(4*a)+"x + "+(3*b)+")","x = 0, x = "+fmtFrac(-3*b/(4*a)))
  });
}
function gen5_6g(rng){
  var A=pick(rng,[4,5,6,8]);
  var lo=ri(rng,-5,-3),hi=ri(rng,3,5);
  var f=function(x){return Math.pow(x,4)-A*x*x;};
  var ex=findExtrema(f,lo,hi);
  var fHtml="x<sup>4</sup> − "+A+"x<sup>2</sup>";
  var sq=Math.sqrt(A/2);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = "+fHtml+" на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,
    sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 4x³ − "+(2*A)+"x = 2x(2x² − "+A+")",
    detailed:buildSolution(f,lo,hi,ex,fHtml,"f'(x) = 4x³ − "+(2*A)+"x = 2x(2x² − "+A+")","x = 0, x = ±"+fmt(sq))
  });
}
function genBlock1(rng){return [gen5_6a(rng),gen5_6b(rng),gen5_6v(rng),gen5_6g(rng)];}

/* =====================================================================
   БЛОК 2 (5.7): Функции с корнями — 4 задания
-------------------------------------------------------------------- */
function gen5_7a(rng){
  var lo=ri(rng,-3,-1),hi=ri(rng,1,3);
  var f=function(x){return Math.cbrt(x);};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = ∛x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"Функция монотонно возрастает — экстремумы на концах",
    detailed:buildSolution(f,lo,hi,ex,"∛x","f'(x) = 1/(3∛x²) > 0 — монотонно возрастает","нет (функция монотонна)")
  });
}
function gen5_7b(rng){
  var lo=ri(rng,-3,-1),hi=ri(rng,1,3);
  var f=function(x){return Math.sign(x)*Math.pow(Math.abs(x),1/5);};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = ⁵√x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"Функция монотонно возрастает — экстремумы на концах",
    detailed:buildSolution(f,lo,hi,ex,"⁵√x","f'(x) = 1/(5·⁵√x⁴) > 0 — монотонно возрастает","нет (функция монотонна)")
  });
}
function gen5_7v(rng){
  var A=ri(rng,3,5),hi=ri(rng,3,6);
  var f=function(x){return A*Math.sqrt(x)-x;};
  var ex=findExtrema(f,1e-9,hi); /* (0; hi] */
  var crit=A*A/4;
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = "+A+"√x − x на промежутке (0; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = "+A+"/(2√x) − 1 = 0 → x = "+fmt(crit),
    detailed:buildSolution(f,1e-9,hi,ex,A+"√x − x","f'(x) = "+A+"/(2√x) − 1 = 0 → x = "+fmt(crit),"x = "+fmt(crit))
  });
}
function gen5_7g(rng){
  var A=ri(rng,2,3),hi=ri(rng,2,3);
  var f=function(x){return A*Math.sqrt(x)-x;};
  var ex=findExtrema(f,1e-9,hi);
  var crit=A*A/4;
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = "+A+"√x − x на промежутке (0; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = "+A+"/(2√x) − 1 = 0 → x = "+fmt(crit),
    detailed:buildSolution(f,1e-9,hi,ex,A+"√x − x","f'(x) = "+A+"/(2√x) − 1 = 0 → x = "+fmt(crit),"x = "+fmt(crit))
  });
}
function genBlock2(rng){return [gen5_7a(rng),gen5_7b(rng),gen5_7v(rng),gen5_7g(rng)];}

/* =====================================================================
   БЛОК 3 (5.8): Показательные и тригонометрические — 4 задания
-------------------------------------------------------------------- */
function gen5_8a(rng){
  var lo=ri(rng,-3,-2),hi=ri(rng,2,3);
  var f=function(x){return Math.exp(x)-x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = eˣ − x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = eˣ − 1 = 0 → x = 0",
    detailed:buildSolution(f,lo,hi,ex,"eˣ − x","f'(x) = eˣ − 1 = 0 → x = 0","x = 0")
  });
}
function gen5_8b(rng){
  var lo=ri(rng,-2,-1),hi=ri(rng,2,3);
  var f=function(x){return Math.exp(x)-x*Math.E;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = eˣ − xe на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = eˣ − e = 0 → x = 1",
    detailed:buildSolution(f,lo,hi,ex,"eˣ − xe","f'(x) = eˣ − e = 0 → x = 1","x = 1")
  });
}
function gen5_8v(rng){
  var f=function(x){return Math.sin(2*x)-x;};
  var ex=findExtrema(f,-Math.PI,Math.PI);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = sin 2x − x на отрезке [−π; π]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 2cos 2x − 1 = 0 → cos 2x = ½ → 2x = ±π/3",
    detailed:buildSolution(f,-Math.PI,Math.PI,ex,"sin 2x − x","f'(x) = 2cos 2x − 1 = 0 → cos 2x = ½ → x = ±π/6","x = ±π/6")
  });
}
function gen5_8g(rng){
  var f=function(x){return Math.cos(2*x)+x;};
  var ex=findExtrema(f,-Math.PI,Math.PI);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = cos 2x + x на отрезке [−π; π]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = −2sin 2x + 1 = 0 → sin 2x = ½",
    detailed:buildSolution(f,-Math.PI,Math.PI,ex,"cos 2x + x","f'(x) = −2sin 2x + 1 = 0 → sin 2x = ½","x = π/12, x = 5π/12")
  });
}
function genBlock3(rng){return [gen5_8a(rng),gen5_8b(rng),gen5_8v(rng),gen5_8g(rng)];}

/* =====================================================================
   БЛОК 4 (5.10): Кубические функции — 4 задания
-------------------------------------------------------------------- */
function gen5_10a(rng){
  var lo=ri(rng,-2,-1),hi=ri(rng,2,4);
  var f=function(x){return x*x*x-3*x*x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = x³ − 3x² на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 3x² − 6x = 3x(x − 2)",
    detailed:buildSolution(f,lo,hi,ex,"x³ − 3x²","f'(x) = 3x² − 6x = 3x(x − 2) = 0","x = 0, x = 2")
  });
}
function gen5_10b(rng){
  var lo=ri(rng,-2,-1),hi=ri(rng,2,3);
  var f=function(x){return x*x*x+3*x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = x³ + 3x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 3x² + 3 > 0 — монотонно возрастает",
    detailed:buildSolution(f,lo,hi,ex,"x³ + 3x","f'(x) = 3x² + 3 > 0 — монотонно возрастает","нет (монотонна)")
  });
}
function gen5_10v(rng){
  var lo=ri(rng,-3,-1),hi=ri(rng,1,3);
  var f=function(x){return 2*x*x*x-6*x*x+9;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = 2x³ − 6x² + 9 на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 6x² − 12x = 6x(x − 2)",
    detailed:buildSolution(f,lo,hi,ex,"2x³ − 6x² + 9","f'(x) = 6x² − 12x = 6x(x − 2) = 0","x = 0, x = 2")
  });
}
function gen5_10g(rng){
  var lo=ri(rng,-3,-1),hi=ri(rng,2,4);
  var f=function(x){return x*x*x-3*x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = x³ − 3x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 3x² − 3 = 3(x² − 1)",
    detailed:buildSolution(f,lo,hi,ex,"x³ − 3x","f'(x) = 3x² − 3 = 3(x² − 1) = 0","x = ±1")
  });
}
function genBlock4(rng){return [gen5_10a(rng),gen5_10b(rng),gen5_10v(rng),gen5_10g(rng)];}

/* =====================================================================
   БЛОК 5 (5.11): Кубические функции — 4 задания
-------------------------------------------------------------------- */
function gen5_11a(rng){
  var lo=ri(rng,-2,-1),hi=ri(rng,1,2);
  var f=function(x){return 2*x*x*x-x*x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = 2x³ − x² на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 6x² − 2x = 2x(3x − 1)",
    detailed:buildSolution(f,lo,hi,ex,"2x³ − x²","f'(x) = 6x² − 2x = 2x(3x − 1) = 0","x = 0, x = 1/3")
  });
}
function gen5_11b(rng){
  var lo=ri(rng,-2,-1),hi=ri(rng,1,2);
  var f=function(x){return 2*x*x*x+x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = 2x³ + x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 6x² + 1 > 0 — монотонно возрастает",
    detailed:buildSolution(f,lo,hi,ex,"2x³ + x","f'(x) = 6x² + 1 > 0 — монотонно возрастает","нет (монотонна)")
  });
}
function gen5_11v(rng){
  var lo=ri(rng,-4,-2),hi=ri(rng,1,3);
  var f=function(x){return 2*x*x*x+6*x*x+8;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = 2x³ + 6x² + 8 на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 6x² + 12x = 6x(x + 2)",
    detailed:buildSolution(f,lo,hi,ex,"2x³ + 6x² + 8","f'(x) = 6x² + 12x = 6x(x + 2) = 0","x = 0, x = −2")
  });
}
function gen5_11g(rng){
  var lo=ri(rng,-3,-1),hi=ri(rng,1,2);
  var f=function(x){return x*x*x+6*x;};
  var ex=findExtrema(f,lo,hi);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = x³ + 6x на отрезке ["+lo+"; "+hi+"]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 3x² + 6 > 0 — монотонно возрастает",
    detailed:buildSolution(f,lo,hi,ex,"x³ + 6x","f'(x) = 3x² + 6 > 0 — монотонно возрастает","нет (монотонна)")
  });
}
function genBlock5(rng){return [gen5_11a(rng),gen5_11b(rng),gen5_11v(rng),gen5_11g(rng)];}

/* ---------- проверка maxmin ----------
   Ученик вводит: «5, -3» / «5; -3» / «5 -3» / «max=5, min=-3»
   Парсим два числа, проверяем max и min с точностью 0.1. */
function checkMaxmin(input,task){
  if(!task||task.type!=="maxmin")return false;
  var s=String(input==null?"":input).trim().toLowerCase();
  if(!s)return false;
  /* убираем «max=», «min=», «наиб=», «наим=» и т.п. */
  s=s.replace(/max\s*[=:]?\s*/g,"").replace(/min\s*[=:]?\s*/g,"");
  s=s.replace(/наиб\s*[=:]?\s*/g,"").replace(/наим\s*[=:]?\s*/g,"");
  s=s.replace(/\u2212/g,"-").replace(/,/g,".").replace(/[;\s|]+/g," ").trim();
  var toks=s.split(" ").filter(Boolean);
  if(toks.length<2)return false;
  var v1=parseFloat(toks[0]),v2=parseFloat(toks[1]);
  if(!isFinite(v1)||!isFinite(v2))return false;
  var tol=0.15;
  /* проверяем: одно число ≈ max, другое ≈ min (в любом порядке) */
  var ok1=Math.abs(v1-task.max)<=tol&&Math.abs(v2-task.min)<=tol;
  var ok2=Math.abs(v2-task.max)<=tol&&Math.abs(v1-task.min)<=tol;
  return ok1||ok2;
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
  if(!TZ.checkMaxmin)TZ.checkMaxmin=checkMaxmin;
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="ekstremumy")return;
  }
  TZ.TOPICS.push({
    id:"ekstremumy",
    subject:"Математика",
    grade:"11 класс",
    title:"Экстремумы функции (5.6–5.11)",
    variants:40,
    desc:"Тренажёр по нахождению наибольшего и наименьшего значений "
      +"функции на отрезке (задания 5.6, 5.7, 5.8, 5.10, 5.11). "
      +"20 заданий в 5 блоках: многочлены, корни, показательные "
      +"и тригонометрические функции, кубические функции. "
      +"40 вариантов. Ответ — два числа (max, min). "
      +"После выполнения — подробное решение с производной и критическими точками.",
    blocks:[
      {name:"Многочлены (5.6)",gen:genBlock1,count:4},
      {name:"Функции с корнями (5.7)",gen:genBlock2,count:4},
      {name:"Показательные и тригонометрические (5.8)",gen:genBlock3,count:4},
      {name:"Кубические функции (5.10)",gen:genBlock4,count:4},
      {name:"Кубические функции (5.11)",gen:genBlock5,count:4}
    ]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={checkMaxmin:checkMaxmin,findExtrema:findExtrema,
    genBlock1:genBlock1,genBlock2:genBlock2,genBlock3:genBlock3,
    genBlock4:genBlock4,genBlock5:genBlock5};
}

})(typeof window!=="undefined"?window:globalThis);
