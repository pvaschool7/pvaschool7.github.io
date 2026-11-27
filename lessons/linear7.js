/* =====================================================================
   Тренажёр · 7 класс · Математика · Линейная функция y = kx + b
   40 вариантов × 10 заданий (от простого к сложному).
   Задание 9 — интерактивное построение графика (как в proporcii.js).
   В решениях — чертежи координатной плоскости с прямой.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function fmt(n){
  if(n===null||!isFinite(n))return "—";
  if(Math.abs(n-Math.round(n))<1e-9)return String(Math.round(n));
  /* дроби 0.5 → 0,5; 1.25 → 1,25 */
  return n.toFixed(2).replace(/0$/,"").replace(".",",");
}
function fracStr(n){
  /* отображаем 0.5 как 0,5; -1.5 как −1,5; 2 как 2 */
  if(Math.abs(n-Math.round(n))<1e-9){
    var r=Math.round(n);
    return r<0?"−"+Math.abs(r):String(r);
  }
  var s=n.toFixed(2).replace(/0$/,"").replace(".","").replace(/,$/,"");
  return n<0?"−"+Math.abs(n):String(n).replace(".",",");
}

/* Форматирование k для строки y = kx + b */
function kStr(k){
  if(k===1)return "";
  if(k===-1)return "−";
  if(k===0)return "0";
  var s;
  if(Math.abs(k-Math.round(k))<1e-9){
    s=Math.abs(k).toString();
    return k<0?"−"+s:s;
  }
  /* 0.5 → 0,5 */
  s=Math.abs(k).toFixed(2).replace(/0$/,"").replace(".","").replace(/,$/,"");
  return k<0?"−"+s:s;
}
/* Полная строка y = kx + b */
function fullStr(k,b){
  var ks=kStr(k);
  var s="y = "+ks+"x";
  if(b===0)return s;
  if(b>0){
    if(Math.abs(b-Math.round(b))<1e-9)return s+" + "+Math.round(b);
    return s+" + "+b.toFixed(2).replace(/0$/,"").replace(".",",");
  }else{
    var abs=Math.abs(b);
    if(Math.abs(abs-Math.round(abs))<1e-9)return s+" − "+Math.round(abs);
    return s+" − "+abs.toFixed(2).replace(/0$/,"").replace(".",",");
  }
}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число, десятичная дробь через запятую)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,sol:opts.sol,unit:opts.unit||"",
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function step(title,html){return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";}

/* ============ SVG координатной плоскости (статичный чертёж) ============ */
/* Рисует прямую y = kx + b на координатной плоскости 400×400 */
function linearGraph(k,b,labelPoints){
  labelPoints=labelPoints||false;
  var S=400, O=200, sc=40;
  var h="<svg width='"+S+"' height='"+S+"' viewBox='0 0 "+S+" "+S+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
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
  /* прямая y = kx + b. Берём x = -5 и x = 5 */
  var x1=-5, y1=k*x1+b, x2=5, y2=k*x2+b;
  /* Ограничиваем y в пределах [-5, 5] — обрезаем прямую по границам */
  var px1=O+x1*sc, py1=O-y1*sc, px2=O+x2*sc, py2=O-y2*sc;
  /* Если прямая выходит за границы — обрезаем */
  h+="<line x1='"+px1.toFixed(1)+"' y1='"+py1.toFixed(1)+"' x2='"+px2.toFixed(1)+"' y2='"+py2.toFixed(1)+"' stroke='var(--green)' stroke-width='3' opacity='0.85'/>";
  /* Точка пересечения с осью Oy: (0, b) */
  if(Math.abs(b)<=5){
    var py=O-b*sc;
    h+="<circle cx='"+O+"' cy='"+py.toFixed(1)+"' r='5' fill='var(--blue)'/>";
    if(labelPoints){
      h+="<text x='"+(O+10)+"' y='"+(py-6).toFixed(1)+"' font-size='12' fill='var(--blue)' font-weight='600'>(0; "+fmt(b)+")</text>";
    }
  }
  /* Точка пересечения с осью Ox: (-b/k, 0) если k != 0 */
  if(Math.abs(k)>0.01){
    var x0=-b/k;
    if(Math.abs(x0)<=5){
      var px0=O+x0*sc;
      h+="<circle cx='"+px0.toFixed(1)+"' cy='"+O+"' r='5' fill='var(--red)'/>";
      if(labelPoints){
        h+="<text x='"+(px0+8).toFixed(1)+"' y='"+(O+18)+"' font-size='12' fill='var(--red)' font-weight='600'>("+fmt(x0)+"; 0)</text>";
      }
    }
  }
  h+="</svg>";
  return h;
}

/* ============ ТИПЫ 1-10: задания от простого к сложному ============ */

/* Тип 1: Найти y по x — простое */
function genT1(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5]);
  var b=ri(rng,-4,4);
  var x=ri(rng,-4,4);
  if(x===0)x=2;
  var y=k*x+b;
  var q="<p>Функция задана формулой <b>"+fullStr(k,b)+"</b>. Найдите значение y при x = "+fmt(x)+".</p>"+NOTE;
  var det="";
  det+=step("Подставляем x в формулу","y = "+kStr(k)+"·("+fmt(x)+") + "+(b>=0?"":"− "+Math.abs(b))+" = "+fmt(k*x)+" + "+fmt(b)+" = <b>"+fmt(y)+"</b>.");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p>Точка ("+fmt(x)+"; "+fmt(y)+") лежит на прямой.</p>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>y = "+fmt(y)+"</span></p>";
  return mkDec({q:q,a:y,sol:fmt(y),hint:"Подставьте x в формулу y = kx + b",detailed:det});
}

/* Тип 2: Найти x по y */
function genT2(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5]);
  while(Math.abs(k)<0.01)k=pick(rng,[1,2,-1,-2,3,-3]);
  var b=ri(rng,-4,4);
  /* выбираем x, вычисляем y */
  var x=ri(rng,-4,4);
  if(x===0)x=2;
  var y=k*x+b;
  var q="<p>Функция задана формулой <b>"+fullStr(k,b)+"</b>. При каком значении x значение функции равно "+fmt(y)+"?</p>"+NOTE;
  var det="";
  det+=step("Решаем уравнение",fmt(y)+" = "+kStr(k)+"·x + "+(b>=0?fmt(b):"− "+Math.abs(b))+".");
  det+=step("Переносим b",kStr(k)+"·x = "+fmt(y)+" "+(b>=0?"− ":"+ ")+fmt(Math.abs(b))+" = "+fmt(y-b)+".");
  det+=step("Делим","x = "+fmt(y-b)+" / "+fmt(k)+" = <b>"+fmt(x)+"</b>.");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p>При y = "+fmt(y)+" значение x = "+fmt(x)+".</p>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>x = "+fmt(x)+"</span></p>";
  return mkDec({q:q,a:x,sol:fmt(x),hint:"Решите уравнение y = kx + b относительно x",detailed:det});
}

/* Тип 3: Принадлежность точки (mc) */
function genT3(rng){
  var k=pick(rng,[1,2,-1,0.5,-0.5,3,-2]);
  var b=ri(rng,-4,4);
  /* Случайно: точка принадлежит или нет */
  var belongs=pick(rng,[true,false]);
  var x=ri(rng,-4,4);
  if(x===0)x=2;
  var yExact=k*x+b;
  var y;
  if(belongs){
    y=yExact;
  }else{
    /* меняем y на 1-2 */
    y=yExact+pick(rng,[1,-1,2,-2]);
  }
  var correct=belongs?"Да, проходит":"Нет, не проходит";
  var q="<p>Проходит ли график функции <b>"+fullStr(k,b)+"</b> через точку A("+fmt(x)+"; "+fmt(y)+")?</p>";
  var det="";
  det+=step("Подставляем координаты","y = "+kStr(k)+"·("+fmt(x)+") + "+(b>=0?fmt(b):"− "+Math.abs(b))+" = "+fmt(k*x)+" + "+fmt(b)+" = "+fmt(yExact)+".");
  if(belongs){
    det+=step("Сравниваем","Получили y = "+fmt(yExact)+", что совпадает с координатой точки A. <b>График проходит через точку A.</b>");
  }else{
    det+=step("Сравниваем","Получили y = "+fmt(yExact)+", а у точки A координата y = "+fmt(y)+". Значения не совпадают → <b>график не проходит через точку A</b>.");
  }
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,false)+"</div>";
  det+="<p>Точка A("+fmt(x)+"; "+fmt(y)+") "+(belongs?"лежит":"не лежит")+" на прямой.</p>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+correct+"</span></p>";
  return mkMC({q:q,c:correct,opts:[correct,correct==="Да, проходит"?"Нет, не проходит":"Да, проходит"],
    sol:correct,hint:"Подставьте координаты точки в формулу и сравните y",detailed:det});
}

/* Тип 4: Найти k по точке и b */
function genT4(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5,1.5,-1.5]);
  var b=ri(rng,-4,4);
  var x=ri(rng,-4,4);
  if(x===0)x=2;
  var y=k*x+b;
  var q="<p>График функции y = kx "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+" проходит через точку ("+fmt(x)+"; "+fmt(y)+"). Найдите коэффициент k.</p>"+NOTE;
  var det="";
  det+=step("Подставляем точку",fmt(y)+" = k·"+fmt(x)+" "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+".");
  det+=step("Решаем",fmt(y)+" "+(b>=0?"− ":"+ ")+fmt(Math.abs(b))+" = k·"+fmt(x)+". k·"+fmt(x)+" = "+fmt(y-b)+".");
  det+=step("Делим","k = "+fmt(y-b)+" / "+fmt(x)+" = <b>"+fmt(k)+"</b>.");
  det+=step("Формула","y = "+fullStr(k,b)+".");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>k = "+fmt(k)+"</span></p>";
  return mkDec({q:q,a:k,sol:fmt(k),hint:"Подставьте точку в y = kx + b и решите относительно k",detailed:det});
}

/* Тип 5: Найти b по точке и k */
function genT5(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5]);
  var b=ri(rng,-5,5);
  var x=ri(rng,-4,4);
  if(x===0)x=2;
  var y=k*x+b;
  var q="<p>График функции y = "+kStr(k)+"x + b проходит через точку ("+fmt(x)+"; "+fmt(y)+"). Найдите b.</p>"+NOTE;
  var det="";
  det+=step("Подставляем точку",fmt(y)+" = "+kStr(k)+"·"+fmt(x)+" + b.");
  det+=step("Решаем","b = "+fmt(y)+" "+(k*x>=0?"− ":"+ ")+fmt(Math.abs(k*x))+" = <b>"+fmt(b)+"</b>.");
  det+=step("Формула","y = "+fullStr(k,b)+".");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p>b — это точка пересечения графика с осью Oy (при x = 0).</p>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>b = "+fmt(b)+"</span></p>";
  return mkDec({q:q,a:b,sol:fmt(b),hint:"Подставьте точку в y = kx + b и найдите b",detailed:det});
}

/* Тип 6: Точка пересечения с осью Ox */
function genT6(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5,1.5,-1.5]);
  while(Math.abs(k)<0.01)k=pick(rng,[1,2,-1,-2,3,-3]);
  var b=ri(rng,-5,5);
  /* x = -b/k */
  var x0=-b/k;
  /* Чтобы x0 было целым или полуцелым, подберём k и b */
  if(Math.abs(x0-Math.round(x0))>0.01 && Math.abs(2*x0-Math.round(2*x0))>0.01){
    /* подбираем b так чтобы -b/k было целым */
    b=-k*ri(rng,-4,4);
    x0=-b/k;
  }
  var q="<p>Найдите координаты точки пересечения графика функции <b>"+fullStr(k,b)+"</b> с осью Ox.</p>"+NOTE;
  /* Ответ — x-координата (y=0) */
  var ans=x0;
  var det="";
  det+=step("На оси Ox","y = 0. Подставляем в формулу: 0 = "+kStr(k)+"·x "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+".");
  det+=step("Решаем",kStr(k)+"·x = "+(b>=0?"− ":"+ ")+fmt(Math.abs(b))+". x = "+fmt(-b)+" / "+fmt(k)+" = <b>"+fmt(x0)+"</b>.");
  det+=step("Точка","Точка пересечения с осью Ox: ("+fmt(x0)+"; 0).");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p>Красная точка — пересечение с Ox, синяя — с Oy.</p>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>("+fmt(x0)+"; 0)</span></p>";
  return mkDec({q:q,a:ans,sol:fmt(x0),hint:"На оси Ox y = 0. Решите 0 = kx + b",detailed:det});
}

/* Тип 7: Точка пересечения с осью Oy */
function genT7(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5]);
  var b=ri(rng,-5,5);
  /* y = b при x = 0 */
  var q="<p>Найдите координаты точки пересечения графика функции <b>"+fullStr(k,b)+"</b> с осью Oy.</p>"+NOTE;
  var det="";
  det+=step("На оси Oy","x = 0. Подставляем в формулу: y = "+kStr(k)+"·0 "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+" = <b>"+fmt(b)+"</b>.");
  det+=step("Точка","Точка пересечения с осью Oy: (0; "+fmt(b)+").");
  det+=step("Свойство","Коэффициент b — это всегда точка пересечения графика с осью Oy.");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>(0; "+fmt(b)+")</span></p>";
  return mkDec({q:q,a:b,sol:fmt(b),hint:"На оси Oy x = 0. Тогда y = b",detailed:det});
}

/* Тип 8: Точка пересечения двух прямых */
function genT8(rng){
  /* y = k1·x + b1 и y = k2·x + b2; k1 ≠ k2 */
  var k1=pick(rng,[1,2,-1,3,-2,0.5]);
  var k2=pick(rng,[1,2,-1,3,-2,0.5]);
  while(k2===k1)k2=pick(rng,[1,2,-1,3,-2,0.5]);
  var b1=ri(rng,-5,5), b2=ri(rng,-5,5);
  while(b2===b1)b2=ri(rng,-5,5);
  /* x = (b2 - b1)/(k1 - k2) */
  var x=(b2-b1)/(k1-k2);
  var y=k1*x+b1;
  /* Чтобы x был целым или полуцелым */
  if(Math.abs(x-Math.round(x))>0.01 && Math.abs(2*x-Math.round(2*x))>0.01){
    /* подберём b1, b2 чтобы x = целое */
    x=ri(rng,-4,4);
    y=ri(rng,-4,4);
    b1=y-k1*x;
    b2=y-k2*x;
  }
  var q="<p>Найдите координаты точки пересечения графиков функций <b>"+fullStr(k1,b1)+"</b> и <b>"+fullStr(k2,b2)+"</b>.</p>"+NOTE;
  var det="";
  det+=step("Приравниваем правые части",kStr(k1)+"x "+(b1>=0?"+ ":"− ")+fmt(Math.abs(b1))+" = "+kStr(k2)+"x "+(b2>=0?"+ ":"− ")+fmt(Math.abs(b2))+".");
  det+=step("Решаем",kStr(k1)+"x − "+kStr(k2)+"x = "+(b2>=0?"":"− ")+fmt(Math.abs(b2))+" "+(b1>=0?"− ":"+ ")+fmt(Math.abs(b1))+".");
  det+=step("Группируем","("+fmt(k1)+" − "+fmt(k2)+")x = "+fmt(b2-b1)+". x = "+fmt(b2-b1)+" / "+fmt(k1-k2)+" = <b>"+fmt(x)+"</b>.");
  det+=step("Подставляем в любую формулу","y = "+kStr(k1)+"·"+fmt(x)+" "+(b1>=0?"+ ":"− ")+fmt(Math.abs(b1))+" = <b>"+fmt(y)+"</b>.");
  det+=step("Точка","Точка пересечения: ("+fmt(x)+"; "+fmt(y)+").");
  /* Чертёж с двумя прямыми */
  var S=400, O=200, sc=40;
  var dsvg="<svg width='"+S+"' height='"+S+"' viewBox='0 0 "+S+" "+S+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  dsvg+="<g stroke='var(--line)' stroke-width='1' opacity='0.5'>";
  for(var i=-5;i<=5;i++){if(i===0)continue;
    dsvg+="<line x1='"+(O+i*sc)+"' y1='0' x2='"+(O+i*sc)+"' y2='"+S+"'/>";
    dsvg+="<line x1='0' y1='"+(O+i*sc)+"' x2='"+S+"' y2='"+(O+i*sc)+"'/>";
  }
  dsvg+="</g>";
  dsvg+="<line x1='0' y1='"+O+"' x2='"+S+"' y2='"+O+"' stroke='var(--ink)' stroke-width='2'/>";
  dsvg+="<line x1='"+O+"' y1='0' x2='"+O+"' y2='"+S+"' stroke='var(--ink)' stroke-width='2'/>";
  /* первая прямая */
  var x1=-5, y1=k1*x1+b1, x2=5, y2=k1*x2+b1;
  dsvg+="<line x1='"+(O+x1*sc)+"' y1='"+(O-y1*sc)+"' x2='"+(O+x2*sc)+"' y2='"+(O-y2*sc)+"' stroke='var(--blue)' stroke-width='3' opacity='0.85'/>";
  /* вторая прямая */
  var y3=k2*x1+b2, y4=k2*x2+b2;
  dsvg+="<line x1='"+(O+x1*sc)+"' y1='"+(O-y3*sc)+"' x2='"+(O+x2*sc)+"' y2='"+(O-y4*sc)+"' stroke='var(--green)' stroke-width='3' opacity='0.85'/>";
  /* точка пересечения */
  if(Math.abs(x)<=5&&Math.abs(y)<=5){
    dsvg+="<circle cx='"+(O+x*sc).toFixed(1)+"' cy='"+(O-y*sc).toFixed(1)+"' r='6' fill='var(--red)'/>";
    dsvg+="<text x='"+((O+x*sc)+10).toFixed(1)+"' y='"+((O-y*sc)-6).toFixed(1)+"' font-size='12' fill='var(--red)' font-weight='600'>("+fmt(x)+"; "+fmt(y)+")</text>";
  }
  dsvg+="</svg>";
  det+="<div class='svg-center' style='max-width:420px'>"+dsvg+"</div>";
  det+="<p>Синяя прямая — "+fullStr(k1,b1)+". Зелёная — "+fullStr(k2,b2)+". Красная точка — пересечение.</p>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>("+fmt(x)+"; "+fmt(y)+")</span></p>";
  /* Ответ — x (для dec-типа) */
  return mkDec({q:q,a:x,sol:"("+fmt(x)+"; "+fmt(y)+")",hint:"Приравняйте k1·x + b1 = k2·x + b2 и решите",detailed:det});
}

/* Тип 9: Интерактивное построение графика y = kx + b */
function genT9(rng){
  var k=pick(rng,[1,2,-1,-2,3,-3,0.5,-0.5]);
  var b=ri(rng,-4,4);
  var kS=kStr(k);
  var fullS=fullStr(k,b);
  /* Используем graphSVG из proporcii.js (через TZ) */
  var graphSvgFn=global.__graphSvgProporcii;
  var q;
  if(graphSvgFn){
    q="<p>Постройте график линейной функции <b>y = "+fullS+"</b>.</p>";
    q+="<p class='task-intro' style='font-size:15px;color:var(--mute)'>Подумайте, через какие две точки проходит график. ";
    q+="Зажмите мышку (или палец) на координатной плоскости и проведите прямую.</p>";
    q+=graphSvgFn();
  }else{
    /* fallback если graphSVG недоступен */
    q="<p>Постройте график линейной функции <b>y = "+fullS+"</b>. Какие две точки лежат на графике?</p>";
  }
  var det="";
  det+="<p>Линейная функция <b>y = "+fullS+"</b> — прямая с угловым коэффициентом <b>k = "+fmt(k)+"</b> и <b>b = "+fmt(b)+"</b>.</p>";
  det+="<p>Для построения выберем две точки:</p>";
  var xA=0, yA=b;
  var xB=2, yB=k*2+b;
  det+="<p>• При x = 0: y = "+kS+"·0 "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+" = <b>"+fmt(yA)+"</b> → точка (0; "+fmt(yA)+").</p>";
  det+="<p>• При x = 2: y = "+kS+"·2 "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+" = "+fmt(k*2)+" "+(b>=0?"+ ":"− ")+fmt(Math.abs(b))+" = <b>"+fmt(yB)+"</b> → точка (2; "+fmt(yB)+").</p>";
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>y = "+fullS+"</span></p>";
  return {
    type:"graph",q:q,k:k,b:b,kStr:kS,tol:0.4,
    atext:fullS,sol:fullS,
    hint:"При x=0 → y=b="+fmt(b)+". При x=2 → y="+fmt(yB),
    detailed:det
  };
}

/* Тип 10: Определить функцию по графику (mc) */
function genT10(rng){
  /* Дан график через две точки, нужно выбрать формулу */
  var k=pick(rng,[1,-1,2,-2,0.5,-0.5]);
  var b=ri(rng,-3,3);
  /* 4 варианта ответа */
  var correct=fullStr(k,b);
  var opts=[correct];
  /* неправильные варианты */
  var wrongKs=[k+1,k-1,-k,k*2];
  var wrongBs=[b+1,b-1,-b,b+2];
  for(var i=0;i<3;i++){
    var wk=wrongKs[i], wb=wrongBs[i];
    if(wk===k&&wb===b)wk=wk+1;
    opts.push(fullStr(wk,wb));
  }
  /* Перемешиваем */
  for(var j=opts.length-1;j>0;j--){
    var jj=Math.floor(rng()*(j+1));
    var t=opts[j];opts[j]=opts[jj];opts[jj]=t;
  }
  /* Убираем дубликаты */
  var uniq={};
  var finalOpts=[];
  for(var o=0;o<opts.length;o++){
    if(!uniq[opts[o]]){uniq[opts[o]]=true;finalOpts.push(opts[o]);}
  }
  while(finalOpts.length<4){
    finalOpts.push("y = "+(ri(rng,-3,3))+"x + "+ri(rng,-3,3));
  }
  opts=finalOpts.slice(0,4);
  if(opts.indexOf(correct)<0)opts[0]=correct;

  /* Чертёж графика без обозначения точек пересечения (чтобы ученик сам определил) */
  var S=400, O=200, sc=40;
  var qsvg="<svg width='"+S+"' height='"+S+"' viewBox='0 0 "+S+" "+S+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  qsvg+="<g stroke='var(--line)' stroke-width='1' opacity='0.5'>";
  for(var i=-5;i<=5;i++){if(i===0)continue;
    qsvg+="<line x1='"+(O+i*sc)+"' y1='0' x2='"+(O+i*sc)+"' y2='"+S+"'/>";
    qsvg+="<line x1='0' y1='"+(O+i*sc)+"' x2='"+S+"' y2='"+(O+i*sc)+"'/>";
  }
  qsvg+="</g>";
  qsvg+="<line x1='0' y1='"+O+"' x2='"+S+"' y2='"+O+"' stroke='var(--ink)' stroke-width='2'/>";
  qsvg+="<line x1='"+O+"' y1='0' x2='"+O+"' y2='"+S+"' stroke='var(--ink)' stroke-width='2'/>";
  for(var j=-5;j<=5;j++){if(j===0)continue;
    qsvg+="<text x='"+(O+j*sc)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)' text-anchor='middle'>"+j+"</text>";
    qsvg+="<text x='"+(O-12)+"' y='"+(O-j*sc+4)+"' font-size='11' fill='var(--mute)' text-anchor='end'>"+j+"</text>";
  }
  qsvg+="<text x='"+(O-8)+"' y='"+(O+14)+"' font-size='11' fill='var(--mute)'>O</text>";
  qsvg+="<text x='"+(S-8)+"' y='"+(O-8)+"' font-size='13' fill='var(--ink)' font-weight='600'>x</text>";
  qsvg+="<text x='"+(O+8)+"' y='14' font-size='13' fill='var(--ink)' font-weight='600'>y</text>";
  /* прямая */
  var x1=-5, y1=k*x1+b, x2=5, y2=k*x2+b;
  qsvg+="<line x1='"+(O+x1*sc)+"' y1='"+(O-y1*sc)+"' x2='"+(O+x2*sc)+"' y2='"+(O-y2*sc)+"' stroke='var(--blue)' stroke-width='3'/>";
  qsvg+="</svg>";

  var q="<p>На рисунке изображён график линейной функции. Выберите формулу, которая задаёт эту функцию.</p>";
  q+="<div class='svg-center' style='max-width:380px'>"+qsvg+"</div>";

  var det="";
  det+=step("Анализ графика","Прямая пересекает ось Oy в точке (0; "+fmt(b)+"). Значит, <b>b = "+fmt(b)+"</b>.");
  /* Возьмём точку x=2 */
  var yAt2=k*2+b;
  det+=step("Вторая точка","При x = 2 значение y = "+fmt(yAt2)+". Подставляем в y = kx + "+fmt(b)+": "+fmt(yAt2)+" = k·2 + "+fmt(b)+".");
  det+=step("Находим k","2k = "+fmt(yAt2-b)+". k = "+fmt(yAt2-b)+" / 2 = <b>"+fmt(k)+"</b>.");
  det+=step("Формула","y = "+correct+".");
  det+="<div class='svg-center' style='max-width:420px'>"+linearGraph(k,b,true)+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+correct+"</span></p>";
  return mkMC({q:q,c:correct,opts:opts,sol:correct,
    hint:"b = точка пересечения с Oy; k = (y2-y1)/(x2-x1)",detailed:det});
}

/* ============ ГЕНЕРАЦИЯ ВАРИАНТА ============ */
var ALL_TYPES=[genT1,genT2,genT3,genT4,genT5,genT6,genT7,genT8,genT9,genT10];
function genVariant(rng){return ALL_TYPES.map(function(gen){return gen(rng);});}

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
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  /* Берём graphSVG из proporcii.js если он уже зарегистрирован */
  if(TZ.graphSvgFn)global.__graphSvgProporcii=TZ.graphSvgFn;
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="linear7")return;
  }
  TZ.TOPICS.push({
    id:"linear7",
    subject:"Математика",
    grade:"7 класс",
    title:"Линейная функция",
    variants:40,
    desc:"Тренажёр по алгебре (7 класс): линейная функция y = kx + b. 10 заданий от простого к сложному: вычисление y по x и обратно, принадлежность точки, нахождение k и b, точки пересечения с осями и двух прямых, построение графика и определение функции по графику. В каждом решении — чертёж координатной плоскости.",
    blocks:[{name:"Линейная функция",gen:genVariant,count:10}]
  });
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
