/* =====================================================================
   Тренажёр · 9 класс · Математика (геометрия) · Окружности и дуги секторов
   10 заданий в 3 блоках, 20 вариантов. С чертежами SVG и пошаговыми решениями.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function sinD(a){return Math.sin(a*Math.PI/180);}
function cosD(a){return Math.cos(a*Math.PI/180);}

var ACUTE=[30,45,60];
var APEX=[30,45,60,90,120];

function fmt(n){
  if(Math.abs(n-Math.round(n))<1e-9)return String(Math.round(n));
  return n.toFixed(2);
}

var ROUND_NOTE=" <span style='color:var(--mute);font-size:14px'>(π≈3,14; √2≈1,41; √3≈1,73; ответ — десятичная дробь, округлите до сотых)</span>";
var FORMULA_NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — формула; используйте a, b, c, h, r, alpha; π или pi; √(…) или sqrt(…); ^ для степени; × — звёздочка *)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,unit:opts.unit||"",sol:opts.sol,hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkFormula(opts){
  return {type:"formula",q:opts.q,fn:opts.fn,atext:opts.atext,sol:opts.sol,hint:opts.hint||"",detailed:opts.detailed||""};
}

/* ---------- пошаговое решение с чертежом ----------
   items: [{title, text, svg?}] — каждый элемент = один шаг
   answerLine: строка ответа */
function detSteps(items, answerLine){
  var h="";
  for(var i=0;i<items.length;i++){
    h+="<p><b>Шаг "+(i+1)+". "+items[i].title+"</b></p>";
    if(items[i].text)h+="<p>"+items[i].text+"</p>";
    if(items[i].svg)h+="<div class='svg-center' style='margin:10px 0'>"+items[i].svg+"</div>";
  }
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p>";
  return h;
}

/* =====================================================================
   SVG-ЧЕРТЕЖИ
-------------------------------------------------------------------- */

/* Правильный треугольник + описанная окружность */
function svgEqTriCirc(aLabel){
  return "<svg width='240' height='210' viewBox='0 0 240 210' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>"
    +"<circle cx='120' cy='125' r='68' fill='rgba(47,111,208,.08)' stroke='var(--blue)' stroke-width='2'/>"
    +"<polygon points='120,57 61,158 179,158' fill='rgba(255,255,255,.85)' stroke='var(--ink)' stroke-width='2.5'/>"
    +"<line x1='120' y1='125' x2='120' y2='57' stroke='var(--blue)' stroke-width='1.5' stroke-dasharray='4,3'/>"
    +"<text x='128' y='95' font-size='13' fill='var(--blue)' font-weight='600'>R</text>"
    +"<text x='120' y='175' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+aLabel+"</text>"
    +"<circle cx='120' cy='125' r='2.5' fill='var(--blue)'/>"
    +"</svg>";
}

/* Прямоугольный треугольник + описанная окружность (гипотенуза = диаметр) */
function svgRightTriCirc(aLabel,bLabel){
  return "<svg width='250' height='220' viewBox='0 0 250 220' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>"
    +"<circle cx='125' cy='115' r='78' fill='rgba(47,111,208,.08)' stroke='var(--blue)' stroke-width='2'/>"
    +"<polygon points='55,185 195,185 55,45' fill='rgba(255,255,255,.85)' stroke='var(--ink)' stroke-width='2.5'/>"
    +"<path d='M 55 175 L 65 175 L 65 185' fill='none' stroke='var(--ink)' stroke-width='2'/>"
    +"<text x='125' y='200' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+aLabel+"</text>"
    +"<text x='42' y='118' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+bLabel+"</text>"
    +"<text x='140' y='108' font-size='14' fill='var(--red)' font-weight='600' transform='rotate(-49 140 108)'>c</text>"
    +"<line x1='55' y1='185' x2='195' y2='45' stroke='var(--red)' stroke-width='1' stroke-dasharray='3,3' opacity='0.5'/>"
    +"</svg>";
}

/* Квадрат + вписанная окружность */
function svgSquareInscribed(aLabel){
  return "<svg width='220' height='220' viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>"
    +"<rect x='60' y='60' width='100' height='100' fill='rgba(255,255,255,.85)' stroke='var(--ink)' stroke-width='2.5'/>"
    +"<circle cx='110' cy='110' r='50' fill='rgba(76,175,80,.1)' stroke='var(--green)' stroke-width='2'/>"
    +"<line x1='110' y1='110' x2='110' y2='160' stroke='var(--green)' stroke-width='1.5' stroke-dasharray='4,3'/>"
    +"<text x='118' y='140' font-size='13' fill='var(--green)' font-weight='600'>r</text>"
    +"<text x='110' y='178' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+aLabel+"</text>"
    +"</svg>";
}

/* Прямоугольник + описанная окружность (диагональ = диаметр) */
function svgRectCirc(aLabel,bLabel){
  return "<svg width='260' height='200' viewBox='0 0 260 200' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>"
    +"<circle cx='130' cy='100' r='82' fill='rgba(47,111,208,.08)' stroke='var(--blue)' stroke-width='2'/>"
    +"<rect x='55' y='55' width='150' height='90' fill='rgba(255,255,255,.85)' stroke='var(--ink)' stroke-width='2.5'/>"
    +"<line x1='55' y1='55' x2='205' y2='145' stroke='var(--red)' stroke-width='1.5' stroke-dasharray='4,3'/>"
    +"<text x='130' y='162' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+aLabel+"</text>"
    +"<text x='42' y='104' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+bLabel+"</text>"
    +"<text x='142' y='95' font-size='14' fill='var(--red)' font-weight='600' transform='rotate(31 142 95)'>d</text>"
    +"</svg>";
}

/* Правильный треугольник + вписанная окружность */
function svgEqTriInscribed(aLabel){
  return "<svg width='240' height='210' viewBox='0 0 240 210' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>"
    +"<polygon points='120,57 61,158 179,158' fill='rgba(255,255,255,.85)' stroke='var(--ink)' stroke-width='2.5'/>"
    +"<circle cx='120' cy='135' r='34' fill='rgba(76,175,80,.1)' stroke='var(--green)' stroke-width='2'/>"
    +"<line x1='120' y1='135' x2='120' y2='158' stroke='var(--green)' stroke-width='1.5' stroke-dasharray='4,3'/>"
    +"<text x='128' y='152' font-size='13' fill='var(--green)' font-weight='600'>r</text>"
    +"<text x='120' y='175' font-size='15' fill='var(--ink)' text-anchor='middle' font-weight='600'>"+aLabel+"</text>"
    +"</svg>";
}

/* Сектор круга: радиус R, угол alpha° */
function svgSector(rLabel,alphaLabel,arcLabel){
  var cx=120,cy=145,R=72;
  /* первая сторона: вверх */
  var x1=cx, y1=cy-R;
  /* вторая сторона: под углом alpha вправо от первой */
  var ang=(-90+30)*Math.PI/180; /* фиксированный угол 30° для красоты */
  var x2=cx+R*Math.cos(ang), y2=cy+R*Math.sin(ang);
  var largeArc=0;
  return "<svg width='240' height='200' viewBox='0 0 240 200' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif'>"
    +"<path d='M "+cx+" "+cy+" L "+x1+" "+y1+" A "+R+" "+R+" 0 "+largeArc+" 1 "+x2+" "+y2+" Z' fill='rgba(47,111,208,.12)' stroke='var(--blue)' stroke-width='2'/>"
    +"<text x='"+(cx-8)+"' y='"+(cy-R/2)+"' font-size='14' fill='var(--blue)' font-weight='600'>"+rLabel+"</text>"
    +"<text x='"+(cx+5)+"' y='"+(cy+16)+"' font-size='14' fill='var(--red)' font-weight='600'>"+alphaLabel+"</text>"
    +"<text x='"+(cx+R/2+5)+"' y='"+(cy-R/3)+"' font-size='13' fill='var(--ink)' font-weight='600'>"+arcLabel+"</text>"
    +"<circle cx='"+cx+"' cy='"+cy+"' r='2.5' fill='var(--blue)'/>"
    +"</svg>";
}

/* =====================================================================
   БЛОК 1: ВЫЧИСЛИТЕЛЬНЫЕ ЗАДАЧИ (тип "dec")
-------------------------------------------------------------------- */

/* 1. Длина описанной окружности: правильный треугольник, сторона a → C = 2πa/√3 */
function genCircEquilateral(rng){
  var a=ri(rng,4,12);
  var R=a/Math.sqrt(3);
  var C=2*Math.PI*R;
  var exact="2π·"+a+"/√3";
  return mkDec({
    q:"Найдите длину окружности, описанной около правильного треугольника со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = a/√3; C = 2πR",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Правильный треугольник со стороной <b>a = "+a+" см</b> вписан в окружность. Нужно найти длину <b>описанной</b> окружности C = 2πR.",svg:svgEqTriCirc("a = "+a)},
      {title:"Радиус описанной окружности",text:"Для правильного треугольника: <b>R = a/√3</b>. Подставляем: R = "+a+"/√3 ≈ "+fmt(R)+" см."},
      {title:"Длина окружности",text:"<b>C = 2πR</b> = 2π·"+fmt(R)+" ≈ <b>"+fmt(C)+"</b> см."}
    ], exact+" ≈ "+fmt(C)+" см")
  });
}

/* 2. Длина описанной окружности: прямоугольный треугольник, катеты a, b → C = π·√(a²+b²) */
function genCircRightTri(rng){
  var a=ri(rng,3,10),b=ri(rng,3,10);
  if(a===b)b=a+1;
  var c=Math.sqrt(a*a+b*b);
  var C=Math.PI*c;
  var exact="π·√("+a+"²+"+b+"²) = π·"+fmt(c);
  return mkDec({
    q:"Найдите длину окружности, описанной около прямоугольного треугольника с катетами a = <b>"+a+"</b> см и b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = c/2, где c = √(a²+b²); C = πc",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Прямоугольный треугольник с катетами <b>a = "+a+" см</b> и <b>b = "+b+" см</b>. Центр описанной окружности — середина гипотенузы (прямой угол опирается на диаметр).",svg:svgRightTriCirc("a = "+a,"b = "+b)},
      {title:"Гипотенуза",text:"<b>c = √(a² + b²)</b> = √("+a*a+" + "+b*b+") = √"+(a*a+b*b)+" ≈ "+fmt(c)+" см."},
      {title:"Радиус",text:"<b>R = c/2</b> (половина гипотенузы) = "+fmt(c/2)+" см."},
      {title:"Длина окружности",text:"<b>C = 2πR = πc</b> = π·"+fmt(c)+" ≈ <b>"+fmt(C)+"</b> см."}
    ], exact+" ≈ "+fmt(C)+" см")
  });
}

/* 3. Длина вписанной окружности: квадрат, сторона a → C = πa */
function genCircSquare(rng){
  var a=ri(rng,3,12);
  var r=a/2;
  var C=Math.PI*a;
  var exact="π·"+a;
  return mkDec({
    q:"Найдите длину окружности, вписанной в квадрат со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"r = a/2; C = πa",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Квадрат со стороной <b>a = "+a+" см</b>. Вписанная окружность касается середины каждой стороны, её диаметр равен стороне квадрата.",svg:svgSquareInscribed("a = "+a)},
      {title:"Радиус",text:"<b>r = a/2</b> = "+a+"/2 = "+r+" см."},
      {title:"Длина окружности",text:"<b>C = 2πr = πa</b> = π·"+a+" ≈ <b>"+fmt(C)+"</b> см."}
    ], exact+" ≈ "+fmt(C)+" см")
  });
}

/* 4. Площадь описанного круга: прямоугольник, стороны a, b → S = π(a²+b²)/4 */
function genAreaRect(rng){
  var a=ri(rng,3,10),b=ri(rng,3,10);
  if(a===b)b=a+1;
  var d2=a*a+b*b;
  var d=Math.sqrt(d2);
  var R=d/2;
  var S=Math.PI*R*R;
  var exact="π·("+a+"²+"+b+"²)/4 = π·"+d2+"/4";
  return mkDec({
    q:"Найдите площадь круга, описанного около прямоугольника со сторонами a = <b>"+a+"</b> см и b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"d = √(a²+b²); R = d/2; S = π(a²+b²)/4",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Прямоугольник со сторонами <b>a = "+a+" см</b> и <b>b = "+b+" см</b>. Центр описанной окружности — точка пересечения диагоналей; радиус R = d/2.",svg:svgRectCirc("a = "+a,"b = "+b)},
      {title:"Диагональ",text:"<b>d = √(a² + b²)</b> = √("+a*a+" + "+b*b+") = √"+d2+" ≈ "+fmt(d)+" см."},
      {title:"Радиус",text:"<b>R = d/2</b> = "+fmt(R)+" см."},
      {title:"Площадь круга",text:"<b>S = πR² = π·d²/4 = π(a²+b²)/4</b> = π·"+d2+"/4 ≈ <b>"+fmt(S)+"</b> см²."}
    ], exact+" ≈ "+fmt(S)+" см²")
  });
}

/* 5. Площадь вписанного круга: равносторонний треугольник, сторона a → S = πa²/12 */
function genAreaEquilateral(rng){
  var a=ri(rng,3,12);
  var r=a*Math.sqrt(3)/6;
  var S=Math.PI*r*r;
  var exact="π·"+a*a+"/12";
  return mkDec({
    q:"Найдите площадь круга, вписанного в равносторонний треугольник со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"r = a√3/6; S = πa²/12",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Равносторонний треугольник со стороной <b>a = "+a+" см</b>. Вписанная окружность касается середины каждой стороны; центр — точка пересечения биссектрис.",svg:svgEqTriInscribed("a = "+a)},
      {title:"Радиус вписанной окружности",text:"<b>r = a√3/6</b> = "+a+"·√3/6 ≈ "+fmt(r)+" см."},
      {title:"Площадь круга",text:"<b>S = πr² = πa²/12</b> = π·"+a*a+"/12 ≈ <b>"+fmt(S)+"</b> см²."}
    ], exact+" ≈ "+fmt(S)+" см²")
  });
}

function genBlock1(rng){
  return [genCircEquilateral(rng),genCircRightTri(rng),genCircSquare(rng),genAreaRect(rng),genAreaEquilateral(rng)];
}

/* =====================================================================
   БЛОК 2: ЗАДАЧИ ОБЩЕГО ВИДА (тип "formula")
-------------------------------------------------------------------- */

/* 6. Общий вид: C = π·√(a²+b²) */
function genFormula1(rng){
  var exact="π·√(a²+b²)";
  return mkFormula({
    q:"Найдите длину окружности, описанной около прямоугольного треугольника с катетами <b>a</b> и <b>b</b>. Ответ запишите формулой."+FORMULA_NOTE,
    fn:function(a,b,c,h,r,alpha){return Math.PI*Math.sqrt(a*a+b*b);},
    atext:exact,sol:exact,
    hint:"R = c/2, c = √(a²+b²); C = πc",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Прямоугольный треугольник с катетами <b>a</b> и <b>b</b>. Центр описанной окружности — середина гипотенузы.",svg:svgRightTriCirc("a","b")},
      {title:"Гипотенуза",text:"По теореме Пифагора: <b>c = √(a² + b²)</b>."},
      {title:"Радиус",text:"<b>R = c/2</b> (половина гипотенузы)."},
      {title:"Длина окружности",text:"<b>C = 2πR = πc = π·√(a²+b²)</b>."}
    ], exact)
  });
}

/* 7. Общий вид: S = π(a²+b²)/4 */
function genFormula2(rng){
  var exact="π·(a²+b²)/4";
  return mkFormula({
    q:"Найдите площадь круга, описанного около прямоугольника со сторонами <b>a</b> и <b>b</b>. Ответ запишите формулой."+FORMULA_NOTE,
    fn:function(a,b,c,h,r,alpha){return Math.PI*(a*a+b*b)/4;},
    atext:exact,sol:exact,
    hint:"d = √(a²+b²); R = d/2; S = π(a²+b²)/4",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Прямоугольник со сторонами <b>a</b> и <b>b</b>. Диагональ d = √(a²+b²) является диаметром описанной окружности.",svg:svgRectCirc("a","b")},
      {title:"Диагональ",text:"<b>d = √(a² + b²)</b>."},
      {title:"Радиус",text:"<b>R = d/2</b>."},
      {title:"Площадь круга",text:"<b>S = πR² = π·d²/4 = π(a²+b²)/4</b>."}
    ], exact)
  });
}

function genBlock2(rng){
  return [genFormula1(rng),genFormula2(rng)];
}

/* =====================================================================
   БЛОК 3: ДУГИ И СЕКТОРА (тип "dec")
-------------------------------------------------------------------- */

/* 8. Прямая: даны r и α, найти l = π·r·α/180 */
function genArc1(rng){
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;
  var exact="π·"+r+"·"+alpha+"/180";
  return mkDec({
    q:"Дуга сектора (прямая задача). Радиус круга R = <b>"+r+"</b> см, градусная мера дуги α = <b>"+alpha+"°</b>. Найдите длину дуги."+ROUND_NOTE,
    a:l,unit:"см",sol:exact+" ≈ "+fmt(l)+" см",
    hint:"l = π·R·α/180",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Сектор круга: радиус <b>R = "+r+" см</b>, центральный угол <b>α = "+alpha+"°</b>. Найти длину дуги l.",svg:svgSector("R = "+r,alpha+"°","l = ?")},
      {title:"Формула длины дуги",text:"<b>l = π·R·α / 180°</b> — доля длины полной окружности (2πR), соответствующая углу α."},
      {title:"Подстановка",text:"l = π·"+r+"·"+alpha+" / 180 = π·"+(r*alpha/180)+" ≈ <b>"+fmt(l)+"</b> см."}
    ], exact+" ≈ "+fmt(l)+" см")
  });
}

/* 9. Обратная: даны r и l, найти α = 180·l/(π·r) */
function genArc2(rng){
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;
  var exact="180·"+fmt(l)+"/(π·"+r+")";
  return mkDec({
    q:"Дуга сектора (обратная задача). Радиус дуги R = <b>"+r+"</b> см, длина дуги l ≈ <b>"+fmt(l)+"</b> см. Найдите градусную меру дуги."+ROUND_NOTE,
    a:alpha,unit:"°",sol:exact+" ≈ "+fmt(alpha)+"°",
    hint:"α = 180·l/(π·R)",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Даны радиус <b>R = "+r+" см</b> и длина дуги <b>l ≈ "+fmt(l)+" см</b>. Найти центральный угол α.",svg:svgSector("R = "+r,"α = ?","l ≈ "+fmt(l))},
      {title:"Выражаем α",text:"Из формулы <b>l = π·R·α/180</b> выразим α: <b>α = 180·l / (π·R)</b>."},
      {title:"Подстановка",text:"α = 180·"+fmt(l)+" / (π·"+r+") ≈ <b>"+fmt(alpha)+"°</b>."}
    ], exact+" ≈ "+fmt(alpha)+"°")
  });
}

/* 10. Обратная: даны α и l, найти r = 180·l/(π·α) */
function genArc3(rng){
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;
  var exact="180·"+fmt(l)+"/(π·"+alpha+")";
  return mkDec({
    q:"Дуга сектора (обратная задача). Градусная мера дуги α = <b>"+alpha+"°</b>, длина дуги l ≈ <b>"+fmt(l)+"</b> см. Найдите радиус."+ROUND_NOTE,
    a:r,unit:"см",sol:exact+" ≈ "+fmt(r)+" см",
    hint:"R = 180·l/(π·α)",
    detailed:detSteps([
      {title:"Анализ задачи",text:"Даны центральный угол <b>α = "+alpha+"°</b> и длина дуги <b>l ≈ "+fmt(l)+" см</b>. Найти радиус R.",svg:svgSector("R = ?",alpha+"°","l ≈ "+fmt(l))},
      {title:"Выражаем R",text:"Из формулы <b>l = π·R·α/180</b> выразим R: <b>R = 180·l / (π·α)</b>."},
      {title:"Подстановка",text:"R = 180·"+fmt(l)+" / (π·"+alpha+") ≈ <b>"+fmt(r)+"</b> см."}
    ], exact+" ≈ "+fmt(r)+" см")
  });
}

function genBlock3(rng){
  return [genArc1(rng),genArc2(rng),genArc3(rng)];
}

/* ---------- проверка десятичного ответа ---------- */
function checkDec(input,answer){
  if(answer==null||!isFinite(answer))return false;
  var s=String(input==null?"":input).trim();
  if(!s)return false;
  s=s.replace(/,/g,".").replace(/\u2212/g,"-").replace(/\s+/g,"");
  if(!/^-?\d+(\.\d+)?$/.test(s))return false;
  var v=parseFloat(s);
  if(!isFinite(v))return false;
  var tol=Math.max(0.1,0.01*Math.abs(answer));
  return Math.abs(v-answer)<=tol;
}

/* ---------- проверка формулы ---------- */
function compileFormula(src){
  var s=String(src==null?"":src).trim();
  if(!s)return null;
  s=s.replace(/,/g,".");
  s=s.replace(/\u2212/g,"-");
  s=s.replace(/[\u00B7\u2022\u00D7\u2219]/g,"*");
  s=s.replace(/\u00B2/g,"^2").replace(/\u00B3/g,"^3");
  s=s.replace(/\s+/g,"");
  s=s.replace(/π/g,"("+Math.PI+")");
  s=s.replace(/pi/gi,"("+Math.PI+")");
  s=s.replace(/√\(/g,"sqrt(");
  s=s.replace(/√([a-z])/gi,"sqrt($1)");
  s=s.replace(/√([0-9])/g,"sqrt($1)");
  s=s.replace(/\^/g,"**");
  s=s.replace(/\bsqrt\b/gi,"Math.sqrt");
  s=s.replace(/\bsin\b/gi,"Math.sin");
  s=s.replace(/\bcos\b/gi,"Math.cos");
  s=s.replace(/\btan\b/gi,"Math.tan");
  s=s.replace(/\btg\b/gi,"Math.tan");
  s=s.replace(/(\d)([a-zA-Z(])/g,"$1*$2");
  s=s.replace(/\)([a-zA-Z0-9(])/g,")*$1");
  if(/\b(window|document|eval|Function|constructor|prototype|__proto__|global|process|require|import|this|new|while|for|if|var|let|const)\b/i.test(s))return null;
  if(!/^[0-9+\-*/().a-zA-Z]+$/.test(s))return null;
  try{
    var fn=new Function("a","b","c","h","r","alpha","return "+s);
    var test=fn(1,2,3,4,5,60);
    if(typeof test!=="number"||!isFinite(test))return null;
    return fn;
  }catch(e){return null;}
}

function checkFormula(input,task){
  if(!task||task.type!=="formula"||!task.fn)return false;
  var fn=compileFormula(input);
  if(!fn)return false;
  var used=0;
  for(var i=0;i<8;i++){
    var a=0.5+Math.random()*10,b=0.5+Math.random()*10,c=0.5+Math.random()*10;
    var h=0.5+Math.random()*10,r=0.5+Math.random()*10,alpha=15+Math.random()*150;
    try{
      var got=fn(a,b,c,h,r,alpha),exp=task.fn(a,b,c,h,r,alpha);
      if(!isFinite(got)||!isFinite(exp))continue;
      if(Math.abs(got-exp)>0.01*(1+Math.abs(exp)))return false;
      used++;
    }catch(e){return false;}
  }
  return used>=5;
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
  if(!TZ.checkDec)TZ.checkDec=checkDec;
  if(!TZ.checkFormula)TZ.checkFormula=checkFormula;
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="okruzhnosti")return;
  }
  TZ.TOPICS.push({
    id:"okruzhnosti",subject:"Математика",grade:"9 класс",
    title:"Окружности и дуги секторов",variants:20,
    desc:"Тренажёр по геометрии (9 класс): длина и площадь вписанных "
      +"и описанных окружностей для треугольников и четырёхугольников, "
      +"задачи общего вида (ответ-формула), прямые и обратные задачи "
      +"на дуги секторов. 10 заданий в 3 блоках, 20 вариантов. "
      +"Каждое задание — с чертежом SVG и пошаговым решением.",
    blocks:[
      {name:"Вычислительные задачи",gen:genBlock1,count:5},
      {name:"Задачи общего вида",gen:genBlock2,count:2},
      {name:"Дуги и сектора",gen:genBlock3,count:3}
    ]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={checkDec:checkDec,checkFormula:checkFormula,
    genBlock1:genBlock1,genBlock2:genBlock2,genBlock3:genBlock3,
    sinD:sinD,cosD:cosD,fmt:fmt,compileFormula:compileFormula};
}

})(typeof window!=="undefined"?window:globalThis);
