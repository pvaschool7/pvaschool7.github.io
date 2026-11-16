/* =====================================================================
   Тренажёр · 9 класс · Математика (геометрия) · Окружности и дуги секторов
   Подключается ПОСЛЕ trenazher-data.js и добавляет ОДНУ тему в TZ.TOPICS:

   Тренажёр «Окружности и дуги секторов» (9 кл, 20 вариантов):
     10 заданий в 3 блоках:
       Блок 1: Вычислительные задачи (5 заданий — числовой ответ)
       Блок 2: Задачи общего вида (2 задания — ответ-формула)
       Блок 3: Дуги и сектора (3 задания — прямая и обратные задачи)

   Типы заданий:
     "dec" — десятичный ответ, проверка checkDec (отн. погрешность 1 %)
     "formula" — ответ-формула в переменных a, b, c, h, r, alpha;
                 проверка checkFormula (вычисление в случайных точках)

   После выполнения — подробное решение по каждому заданию.
   ===================================================================== */
(function(global){
"use strict";

/* ---------- вспомогательные функции ---------- */
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}

/* Тригонометрия в градусах */
function sinD(a){return Math.sin(a*Math.PI/180);}
function cosD(a){return Math.cos(a*Math.PI/180);}

var ACUTE=[30,45,60];
var APEX=[30,45,60,90,120];

function fmt(n){
  if(Math.abs(n-Math.round(n))<1e-9)return String(Math.round(n));
  return n.toFixed(2);
}

function detWrap(steps, answerLine){
  var h="<p><b>Решение:</b></p>";
  for(var i=0;i<steps.length;i++)h+="<p>"+steps[i]+"</p>";
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p>";
  return h;
}

var ROUND_NOTE=" <span style='color:var(--mute);font-size:14px'>(π≈3,14; √2≈1,41; √3≈1,73; ответ — десятичная дробь, округлите до сотых)</span>";
var FORMULA_NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — формула; используйте a, b, c, h, r, alpha; π или pi; √(…) или sqrt(…); ^ для степени; × — звёздочка *)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,unit:opts.unit||"",sol:opts.sol,hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkFormula(opts){
  return {type:"formula",q:opts.q,fn:opts.fn,atext:opts.atext,sol:opts.sol,hint:opts.hint||"",detailed:opts.detailed||""};
}

/* =====================================================================
   ВЫЧИСЛИТЕЛЬНЫЕ ЗАДАЧИ (числовой ответ, тип "dec")
-------------------------------------------------------------------- */

/* Длина описанной окружности: правильный треугольник, сторона a → C = 2πa/√3 */
function genCircEquilateral(rng){
  var a=ri(rng,4,12);
  var R=a/Math.sqrt(3);
  var C=2*Math.PI*R;
  var exact="2π·"+a+"/√3";
  var steps=[
    "Для правильного треугольника со стороной <b>a</b> радиус описанной окружности: <b>R = a/√3</b>.",
    "Подставляем a = "+a+": R = "+a+"/√3 ≈ "+fmt(R)+" см.",
    "Длина окружности: <b>C = 2πR</b> = 2π·"+fmt(R)+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"Найдите длину окружности, описанной около правильного треугольника со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = a/√3; C = 2πR",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}

/* Длина описанной окружности: прямоугольный треугольник, катеты a, b → C = π·√(a²+b²) */
function genCircRightTri(rng){
  var a=ri(rng,3,10),b=ri(rng,3,10);
  if(a===b)b=a+1;
  var c=Math.sqrt(a*a+b*b);
  var C=Math.PI*c;
  var exact="π·√("+a+"²+"+b+"²) = π·"+fmt(c);
  var steps=[
    "Для прямоугольного треугольника с катетами <b>a</b> и <b>b</b> гипотенуза <b>c = √(a²+b²)</b>, а радиус описанной окружности <b>R = c/2</b> (прямой угол опирается на диаметр).",
    "c = √("+a*a+"+"+b*b+") = √"+(a*a+b*b)+" ≈ "+fmt(c)+" см.",
    "R = c/2 = "+fmt(c/2)+" см.",
    "Длина окружности: <b>C = 2πR = πc</b> = π·"+fmt(c)+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"Найдите длину окружности, описанной около прямоугольного треугольника с катетами a = <b>"+a+"</b> см и b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = c/2, где c = √(a²+b²); C = πc",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}

/* Длина вписанной окружности: квадрат, сторона a → C = πa */
function genCircSquare(rng){
  var a=ri(rng,3,12);
  var r=a/2;
  var C=Math.PI*a;
  var exact="π·"+a;
  var steps=[
    "Для квадрата со стороной <b>a</b> радиус вписанной окружности <b>r = a/2</b>.",
    "r = "+a+"/2 = "+r+" см.",
    "Длина окружности: <b>C = 2πr = πa</b> = π·"+a+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"Найдите длину окружности, вписанной в квадрат со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"r = a/2; C = πa",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}

/* Площадь описанного круга: прямоугольник, стороны a, b → S = π(a²+b²)/4 */
function genAreaRect(rng){
  var a=ri(rng,3,10),b=ri(rng,3,10);
  if(a===b)b=a+1;
  var d2=a*a+b*b;
  var d=Math.sqrt(d2);
  var R=d/2;
  var S=Math.PI*R*R;
  var exact="π·("+a+"²+"+b+"²)/4 = π·"+d2+"/4";
  var steps=[
    "Диагональ прямоугольника <b>d = √(a²+b²)</b>; центр описанной окружности — точка пересечения диагоналей, R = d/2.",
    "d = √("+a*a+"+"+b*b+") = √"+d2+" ≈ "+fmt(d)+" см; R = "+fmt(R)+" см.",
    "Площадь круга: <b>S = πR² = π·d²/4 = π(a²+b²)/4</b> = π·"+d2+"/4 ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"Найдите площадь круга, описанного около прямоугольника со сторонами a = <b>"+a+"</b> см и b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"d = √(a²+b²); R = d/2; S = π(a²+b²)/4",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}

/* Площадь вписанного круга: равносторонний треугольник, сторона a → S = πa²/12 */
function genAreaEquilateral(rng){
  var a=ri(rng,3,12);
  var r=a*Math.sqrt(3)/6;
  var S=Math.PI*r*r;
  var exact="π·"+a*a+"/12";
  var steps=[
    "Радиус вписанной окружности равностороннего треугольника со стороной a: <b>r = a√3/6</b>.",
    "Подставляем a = "+a+": r = "+a+"·√3/6 ≈ "+fmt(r)+" см.",
    "Площадь круга: <b>S = πr² = πa²/12</b> = π·"+a*a+"/12 ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"Найдите площадь круга, вписанного в равносторонний треугольник со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"r = a√3/6; S = πa²/12",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}

function genBlock1(rng){
  return [genCircEquilateral(rng),genCircRightTri(rng),genCircSquare(rng),genAreaRect(rng),genAreaEquilateral(rng)];
}

/* =====================================================================
   ЗАДАЧИ ОБЩЕГО ВИДА (ответ — формула, тип "formula")
   Переменные: a, b, c, h, r, alpha
-------------------------------------------------------------------- */

/* Общий вид 1: длина описанной окружности прямоугольного треугольника
   с катетами a и b → C = π·√(a²+b²) */
function genFormula1(rng){
  var exact="π·√(a²+b²)";
  var steps=[
    "В прямоугольном треугольнике с катетами <b>a</b> и <b>b</b> гипотенуза <b>c = √(a²+b²)</b>.",
    "Радиус описанной окружности <b>R = c/2</b> (половина гипотенузы).",
    "Длина окружности: <b>C = 2πR = πc = π·√(a²+b²)</b>."
  ];
  return mkFormula({
    q:"Найдите длину окружности, описанной около прямоугольного треугольника с катетами <b>a</b> и <b>b</b>. Ответ запишите формулой."+FORMULA_NOTE,
    fn:function(a,b,c,h,r,alpha){return Math.PI*Math.sqrt(a*a+b*b);},
    atext:exact,
    sol:exact,
    hint:"R = c/2, c = √(a²+b²); C = πc",
    detailed:detWrap(steps, exact)
  });
}

/* Общий вид 2: площадь описанного круга около прямоугольника
   со сторонами a и b → S = π(a²+b²)/4 */
function genFormula2(rng){
  var exact="π·(a²+b²)/4";
  var steps=[
    "Диагональ прямоугольника <b>d = √(a²+b²)</b>; центр описанной окружности — точка пересечения диагоналей, <b>R = d/2</b>.",
    "Площадь круга: <b>S = πR² = π·d²/4 = π(a²+b²)/4</b>."
  ];
  return mkFormula({
    q:"Найдите площадь круга, описанного около прямоугольника со сторонами <b>a</b> и <b>b</b>. Ответ запишите формулой."+FORMULA_NOTE,
    fn:function(a,b,c,h,r,alpha){return Math.PI*(a*a+b*b)/4;},
    atext:exact,
    sol:exact,
    hint:"d = √(a²+b²); R = d/2; S = πR² = π(a²+b²)/4",
    detailed:detWrap(steps, exact)
  });
}

function genBlock2(rng){
  return [genFormula1(rng),genFormula2(rng)];
}

/* =====================================================================
   ДУГИ И СЕКТОРА (3 задания: прямая и обратные задачи)
-------------------------------------------------------------------- */

/* Прямая: даны r и α, найти l = π·r·α/180 */
function genArc1(rng){
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;
  var exact="π·"+r+"·"+alpha+"/180";
  var steps=[
    "Длина дуги окружности: <b>l = π·R·α/180</b>, где R — радиус, α — градусная мера дуги.",
    "Подставляем R = "+r+" см, α = "+alpha+"°: l = π·"+r+"·"+alpha+"/180 = π·"+(r*alpha/180)+" ≈ <b>"+fmt(l)+"</b> см."
  ];
  return mkDec({
    q:"Дуга сектора (прямая задача). Радиус круга R = <b>"+r+"</b> см, градусная мера дуги α = <b>"+alpha+"°</b>. Найдите длину дуги."+ROUND_NOTE,
    a:l,unit:"см",sol:exact+" ≈ "+fmt(l)+" см",
    hint:"l = π·R·α/180",
    detailed:detWrap(steps, exact+" ≈ "+fmt(l)+" см")
  });
}

/* Обратная: даны r и l, найти α = 180·l/(π·r) */
function genArc2(rng){
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;
  var exact="180·"+fmt(l)+"/(π·"+r+")";
  var steps=[
    "Из формулы длины дуги <b>l = π·R·α/180</b> выразим градусную меру: <b>α = 180·l/(π·R)</b>.",
    "Подставляем R = "+r+" см, l ≈ "+fmt(l)+" см: α = 180·"+fmt(l)+"/(π·"+r+") ≈ <b>"+fmt(alpha)+"°</b>."
  ];
  return mkDec({
    q:"Дуга сектора (обратная задача). Радиус дуги R = <b>"+r+"</b> см, длина дуги l ≈ <b>"+fmt(l)+"</b> см. Найдите градусную меру дуги."+ROUND_NOTE,
    a:alpha,unit:"°",sol:exact+" ≈ "+fmt(alpha)+"°",
    hint:"α = 180·l/(π·R)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(alpha)+"°")
  });
}

/* Обратная: даны α и l, найти r = 180·l/(π·α) */
function genArc3(rng){
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;
  var exact="180·"+fmt(l)+"/(π·"+alpha+")";
  var steps=[
    "Из формулы длины дуги <b>l = π·R·α/180</b> выразим радиус: <b>R = 180·l/(π·α)</b>.",
    "Подставляем α = "+alpha+"°, l ≈ "+fmt(l)+" см: R = 180·"+fmt(l)+"/(π·"+alpha+") ≈ <b>"+fmt(r)+"</b> см."
  ];
  return mkDec({
    q:"Дуга сектора (обратная задача). Градусная мера дуги α = <b>"+alpha+"°</b>, длина дуги l ≈ <b>"+fmt(l)+"</b> см. Найдите радиус."+ROUND_NOTE,
    a:r,unit:"см",sol:exact+" ≈ "+fmt(r)+" см",
    hint:"R = 180·l/(π·α)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(r)+" см")
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

/* ---------- проверка формулы (многопараметрическое выражение) ----------
   input — строка-формула от ученика. Поддерживаемые переменные: a, b, c, h, r, alpha.
   Константы: π или pi. Функции: √(...) или sqrt(...), sin, cos, tan (в радианах),
   tg. Степень: ^. Неявное умножение: 2a → 2*a.
   Проверка: вычисляем формулу ученика и эталон в 8 случайных точках и сравниваем. */
function compileFormula(src){
  var s=String(src==null?"":src).trim();
  if(!s)return null;
  /* нормализация */
  s=s.replace(/,/g,".");
  s=s.replace(/\u2212/g,"-");
  s=s.replace(/[\u00B7\u2022\u00D7\u2219]/g,"*"); /* · • × ∙ → * */
  s=s.replace(/\u00B2/g,"^2").replace(/\u00B3/g,"^3");
  s=s.replace(/\s+/g,"");
  /* π и pi → числовое значение */
  s=s.replace(/π/g,"("+Math.PI+")");
  s=s.replace(/pi/gi,"("+Math.PI+")");
  /* √( → sqrt( ; √a → sqrt(a) ; √3 → sqrt(3) — полную подстановку Math.sqrt
     сделаем ниже, чтобы не дублировать */
  s=s.replace(/√\(/g,"sqrt(");
  s=s.replace(/√([a-z])/gi,"sqrt($1)");
  s=s.replace(/√([0-9])/g,"sqrt($1)");
  /* степени */
  s=s.replace(/\^/g,"**");
  /* функции → Math.X */
  s=s.replace(/\bsqrt\b/gi,"Math.sqrt");
  s=s.replace(/\bsin\b/gi,"Math.sin");
  s=s.replace(/\bcos\b/gi,"Math.cos");
  s=s.replace(/\btan\b/gi,"Math.tan");
  s=s.replace(/\btg\b/gi,"Math.tan");
  /* неявное умножение: цифра-буква, цифра-скобка, )буква, )цифра, )скобка */
  s=s.replace(/(\d)([a-zA-Z(])/g,"$1*$2");
  s=s.replace(/\)([a-zA-Z0-9(])/g,")*$1");
  /* безопасность: запрет опасных идентификаторов */
  if(/\b(window|document|eval|Function|constructor|prototype|__proto__|global|process|require|import|this|new|while|for|if|var|let|const)\b/i.test(s))return null;
  /* только разрешённые символы */
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
    var a=0.5+Math.random()*10;
    var b=0.5+Math.random()*10;
    var c=0.5+Math.random()*10;
    var h=0.5+Math.random()*10;
    var r=0.5+Math.random()*10;
    var alpha=15+Math.random()*150;
    try{
      var got=fn(a,b,c,h,r,alpha);
      var exp=task.fn(a,b,c,h,r,alpha);
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
    id:"okruzhnosti",
    subject:"Математика",
    grade:"9 класс",
    title:"Окружности и дуги секторов",
    variants:20,
    desc:"Тренажёр по геометрии (9 класс): длина и площадь вписанных "
      +"и описанных окружностей для треугольников и четырёхугольников, "
      +"задачи общего вида (ответ-формула), прямые и обратные задачи "
      +"на дуги секторов. 10 заданий в 3 блоках, 20 вариантов. "
      +"После выполнения — подробное решение с формулой и подстановкой.",
    blocks:[
      {name:"Вычислительные задачи",gen:genBlock1,count:5},
      {name:"Задачи общего вида",gen:genBlock2,count:2},
      {name:"Дуги и сектора",gen:genBlock3,count:3}
    ]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={
    checkDec:checkDec,checkFormula:checkFormula,
    genBlock1:genBlock1,genBlock2:genBlock2,genBlock3:genBlock3,
    sinD:sinD,cosD:cosD,fmt:fmt,compileFormula:compileFormula
  };
}

})(typeof window!=="undefined"?window:globalThis);
