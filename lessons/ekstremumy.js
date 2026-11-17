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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = "+fHtml+", x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:dStr},
      {title:"Критические точки",text:critStr+" — проверяем, какие попадают в ["+lo+"; "+hi+"]"},
      {title:"Значения функции",text:"Вычисляем f(x) в критических точках и на концах отрезка, выбираем наибольшее и наименьшее"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = "+fHtml+", x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = "+(3*a)+"x² + "+b+" = 0 → x = ±"+fmt(Math.sqrt(-b/(3*a)))},
      {title:"Значения функции",text:"Проверяем концы и критические точки в отрезке"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = "+fHtml+", x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = "+(4*a)+"x³ + "+(3*b)+"x² = x²("+(4*a)+"x + "+(3*b)+")"},
      {title:"Критические точки",text:"x = 0, x = "+fmtFrac(-3*b/(4*a))},
      {title:"Значения функции",text:"Проверяем концы и критические точки в отрезке"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = "+fHtml+", x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 4x³ − "+(2*A)+"x = 2x(2x² − "+A+")"},
      {title:"Критические точки",text:"x = 0, x = ±"+fmt(sq)},
      {title:"Значения функции",text:"Проверяем концы и критические точки в отрезке"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = ∛x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 1/(3∛x²) > 0 — функция возрастает"},
      {title:"Экстремумы",text:"max = f("+hi+") = ∛"+hi+" = "+fmt(ex.max)+", min = f("+lo+") = ∛"+lo+" = "+fmt(ex.min)}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = ⁵√x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 1/(5·⁵√x⁴) > 0 — функция возрастает"},
      {title:"Экстремумы",text:"max = f("+hi+") = ⁵√"+hi+" = "+fmt(ex.max)+", min = f("+lo+") = ⁵√"+lo+" = "+fmt(ex.min)}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и промежуток",text:"y = "+A+"√x − x, x ∈ (0; "+hi+"]"},
      {title:"Производная",text:"f'(x) = "+A+"/(2√x) − 1 = 0 → √x = "+A+"/2 → x = "+fmt(crit)},
      {title:"Значения",text:(crit<hi?"f("+fmt(crit)+") = "+fmt(f(crit))+" — максимум; ":"")+"f("+hi+") = "+fmt(f(hi))+" — проверяем конец"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и промежуток",text:"y = "+A+"√x − x, x ∈ (0; "+hi+"]"},
      {title:"Производная",text:"f'(x) = "+A+"/(2√x) − 1 = 0 → x = "+fmt(crit)},
      {title:"Значения",text:"f("+fmt(crit)+") = "+fmt(f(crit))+" — максимум; f("+hi+") = "+fmt(f(hi))+" — конец"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = eˣ − x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = eˣ − 1 = 0 → x = 0"},
      {title:"Значения",text:"f(0) = 1 − 0 = 1; f("+lo+") = e^"+lo+" − "+lo+" ≈ "+fmt(f(lo))+"; f("+hi+") = e^"+hi+" − "+hi+" ≈ "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = eˣ − xe, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = eˣ − e = 0 → x = 1"},
      {title:"Значения",text:"f(1) = e − e = 0; f("+lo+") ≈ "+fmt(f(lo))+"; f("+hi+") ≈ "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
  });
}
function gen5_8v(rng){
  var f=function(x){return Math.sin(2*x)-x;};
  var ex=findExtrema(f,-Math.PI,Math.PI);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = sin 2x − x на отрезке [−π; π]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = 2cos 2x − 1 = 0 → cos 2x = ½ → 2x = ±π/3",
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = sin 2x − x, x ∈ [−π; π]"},
      {title:"Производная",text:"f'(x) = 2cos 2x − 1 = 0 → cos 2x = ½ → x = ±π/6"},
      {title:"Значения",text:"f(π/6) ≈ "+fmt(f(Math.PI/6))+"; f(−π/6) ≈ "+fmt(f(-Math.PI/6))+"; f(±π) ≈ "+fmt(f(Math.PI))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
  });
}
function gen5_8g(rng){
  var f=function(x){return Math.cos(2*x)+x;};
  var ex=findExtrema(f,-Math.PI,Math.PI);
  return mkMaxmin({
    q:"Найдите наибольшее и наименьшее значения функции y = cos 2x + x на отрезке [−π; π]."+ROUND_NOTE,
    max:ex.max,min:ex.min,sol:"max = "+fmt(ex.max)+", min = "+fmt(ex.min),
    hint:"f'(x) = −2sin 2x + 1 = 0 → sin 2x = ½",
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = cos 2x + x, x ∈ [−π; π]"},
      {title:"Производная",text:"f'(x) = −2sin 2x + 1 = 0 → sin 2x = ½ → x = π/12, x = 5π/12"},
      {title:"Значения",text:"Проверяем критические точки и концы"}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = x³ − 3x², x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 3x² − 6x = 3x(x − 2) = 0 → x = 0, x = 2"},
      {title:"Значения",text:"f(0) = 0; f(2) = 8 − 12 = −4; f("+lo+") = "+fmt(f(lo))+"; f("+hi+") = "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = x³ + 3x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 3x² + 3 > 0 — функция возрастает"},
      {title:"Экстремумы на концах",text:"max = f("+hi+") = "+fmt(ex.max)+", min = f("+lo+") = "+fmt(ex.min)}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = 2x³ − 6x² + 9, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 6x² − 12x = 6x(x − 2) = 0 → x = 0, x = 2"},
      {title:"Значения",text:"f(0) = 9; f(2) = 16 − 24 + 9 = 1; f("+lo+") = "+fmt(f(lo))+"; f("+hi+") = "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = x³ − 3x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 3x² − 3 = 3(x² − 1) = 0 → x = ±1"},
      {title:"Значения",text:"f(1) = −2; f(−1) = 2; f("+lo+") = "+fmt(f(lo))+"; f("+hi+") = "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = 2x³ − x², x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 6x² − 2x = 2x(3x − 1) = 0 → x = 0, x = 1/3"},
      {title:"Значения",text:"f(0) = 0; f(1/3) = "+fmt(f(1/3))+"; f("+lo+") = "+fmt(f(lo))+"; f("+hi+") = "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = 2x³ + x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 6x² + 1 > 0 — функция возрастает"},
      {title:"Экстремумы на концах",text:"max = f("+hi+") = "+fmt(ex.max)+", min = f("+lo+") = "+fmt(ex.min)}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = 2x³ + 6x² + 8, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 6x² + 12x = 6x(x + 2) = 0 → x = 0, x = −2"},
      {title:"Значения",text:"f(0) = 8; f(−2) = "+fmt(f(-2))+"; f("+lo+") = "+fmt(f(lo))+"; f("+hi+") = "+fmt(f(hi))}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
    detailed:detSteps([
      {title:"Функция и отрезок",text:"y = x³ + 6x, x ∈ ["+lo+"; "+hi+"]"},
      {title:"Производная",text:"f'(x) = 3x² + 6 > 0 — функция возрастает"},
      {title:"Экстремумы на концах",text:"max = f("+hi+") = "+fmt(ex.max)+", min = f("+lo+") = "+fmt(ex.min)}
    ],"max = "+fmt(ex.max)+", min = "+fmt(ex.min))
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
