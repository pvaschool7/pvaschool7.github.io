/* =====================================================================
   Тренажёр · 9 класс · Математика (геометрия) · Окружности и дуги секторов
   Подключается ПОСЛЕ trenazher-data.js и добавляет ОДНУ тему в TZ.TOPICS:

   Тренажёр «Окружности и дуги секторов» (9 кл, 20 вариантов):
     19 заданий в 5 блоках — каждый подпункт (а, б, в, г, д) задач
     1104, 1105, 1116, 1117 учебника выделен как отдельное задание.
     Плюс 3 задания на дуги сектора (прямая и обратные задачи, по образцу
     задачи 1113).

   Блок 1 (1104): длина описанной окружности — 5 заданий (а–д)
   Блок 2 (1105): длина вписанной окружности — 4 задания (а–г)
   Блок 3 (1116): площадь описанного круга — 3 задания (а–в)
   Блок 4 (1117): площадь вписанного круга — 4 задания (а–г)
   Блок 5: дуги и сектора — 3 задания (прямая + 2 обратные)

   Тип задания — "dec": ученик вводит десятичную дробь, проверка — checkDec
   (добавляется в TZ) с относительной погрешностью 1 % (минимум 0,1).
   После выполнения — подробное решение по каждому заданию с формулой,
   подстановкой и точным ответом.
   ===================================================================== */
(function(global){
"use strict";

/* ---------- вспомогательные функции ---------- */
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* Тригонометрия в градусах */
function sinD(a){return Math.sin(a*Math.PI/180);}
function cosD(a){return Math.cos(a*Math.PI/180);}

/* Углы для генерации (красивые значения) */
var ACUTE=[30,45,60];          /* острые углы */
var APEX=[30,45,60,90,120];    /* углы при вершине */

/* Форматирование числа: целое → без дробной части, иначе 2 знака */
function fmt(n){
  if(Math.abs(n-Math.round(n))<1e-9)return String(Math.round(n));
  return n.toFixed(2);
}
/* Форматирование с символом π: coef·π → «3π» / «π/2» / «2π/3» */
function fmtPi(num,den){
  /* num/den · π */
  den=den||1;
  var g=gcd(Math.abs(num),Math.abs(den));
  num=Math.round(num/g);den=Math.round(den/g);
  if(den<0){num=-num;den=-den;}
  var sign=num<0?"−":"";
  num=Math.abs(num);
  var coef;
  if(num===0)return "0";
  if(den===1)coef=num===1?"π":num+"π";
  else coef=num===1?"π/"+den:num+"π/"+den;
  return sign+coef;
}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a||1;}

/* Форматирование иррационального: k·√v */
function fmtSqrt(k,v){
  /* k·√v */
  if(v===1)return fmt(k);
  if(k===0)return "0";
  var sign=k<0?"−":"";
  k=Math.abs(k);
  if(k===1)return sign+"√"+v;
  /* пытаемся упростить: если v содержит квадрат */
  for(var f=2;f*f<=v;f++){
    if(v%(f*f)===0){
      var nv=v/(f*f);
      k=k*f;
      return fmtSqrt((sign==="-"?-1:1)*k,nv);
    }
  }
  return sign+k+"√"+v;
}

/* Обёртка подробного решения — возвращает ВНУТРЕННОСТЬ блока .dz-det
   (саму обёртку <div class='dz-det'> добавляет тренажёр в разборе). */
function detWrap(steps, answerLine){
  var h="<p><b>Решение:</b></p>";
  for(var i=0;i<steps.length;i++)h+="<p>"+steps[i]+"</p>";
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p>";
  return h;
}

/* Стандартная сноска про округление */
var ROUND_NOTE=" <span style='color:var(--mute);font-size:14px'>(π≈3,14; √2≈1,41; √3≈1,73; ответ — десятичная дробь, округлите до сотых)</span>";

/* Создание задания типа dec */
function mkDec(opts){
  return {
    type:"dec",
    q:opts.q,
    a:opts.a,                /* десятичный ответ */
    unit:opts.unit||"",
    sol:opts.sol,            /* точный ответ строкой */
    hint:opts.hint||"",
    detailed:opts.detailed||""
  };
}

/* =====================================================================
   Блок 1 (1104): Длина окружности, описанной около...
   а) правильный треугольник, сторона a → C = 2π·a/√3
   б) прямоугольный треугольник, катеты a, b → C = π·√(a²+b²)
   в) равнобедренный треугольник, основание a, боковая сторона b → C = 2π·b²/√(4b²−a²)
   г) прямоугольник, меньшая сторона a, острый угол α между диагоналями → C = π·a/sin(α/2)
   д) правильный шестиугольник, площадь S = (3√3/2)·a² → C = 2π·a
-------------------------------------------------------------------- */
function gen1104a(rng){
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
    q:"№ 1104 (а). Найдите длину окружности, описанной около правильного треугольника со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = a/√3; C = 2πR",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1104b(rng){
  var a=ri(rng,3,10),b=ri(rng,3,10);
  if(a===b)b=a+1;
  var c=Math.sqrt(a*a+b*b);
  var C=Math.PI*c;
  var exact="π·√("+a+"²+"+b+"²) = π·"+fmt(c);
  var steps=[
    "Для прямоугольного треугольника с катетами <b>a</b> и <b>b</b> гипотенуза <b>c = √(a²+b²)</b>, а радиус описанной окружности <b>R = c/2</b> (прямой угол опирается на диаметр).",
    "c = √("+a+"²+"+b+"²) = √("+a*a+"+"+b*b+") = √"+(a*a+b*b)+" ≈ "+fmt(c)+" см.",
    "R = c/2 = "+fmt(c/2)+" см.",
    "Длина окружности: <b>C = 2πR = πc</b> = π·"+fmt(c)+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1104 (б). Найдите длину окружности, описанной около прямоугольного треугольника с катетами a = <b>"+a+"</b> см и b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = c/2, где c = √(a²+b²); C = πc",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1104v(rng){
  var b=ri(rng,4,10),a;
  /* основание a < 2b (строгое неравенство треугольника) */
  do{a=ri(rng,2,2*b-2);}while(a>=2*b);
  var R=b*b/Math.sqrt(4*b*b-a*a);
  var C=2*Math.PI*R;
  var exact="2π·"+b+"²/√(4·"+b+"²−"+a+"²)";
  var steps=[
    "Для равнобедренного треугольника с основанием <b>a</b> и боковой стороной <b>b</b> радиус описанной окружности: <b>R = b²/√(4b²−a²)</b>.",
    "Подставляем a = "+a+", b = "+b+": R = "+b*b+"/√(4·"+b*b+"−"+a*a+") = "+b*b+"/√"+(4*b*b-a*a)+" ≈ "+fmt(R)+" см.",
    "Длина окружности: <b>C = 2πR</b> = 2π·"+fmt(R)+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1104 (в). Найдите длину окружности, описанной около равнобедренного треугольника с основанием a = <b>"+a+"</b> см и боковой стороной b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = b²/√(4b²−a²); C = 2πR",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1104g(rng){
  var a=ri(rng,3,10);
  var alpha=pick(rng,ACUTE);
  var halfSin=sinD(alpha/2);
  var R=a/(2*halfSin);
  var C=Math.PI*a/halfSin;
  var exact="π·"+a+"/sin("+alpha/2+"°)";
  var steps=[
    "Диагонали прямоугольника равны и точкой пересечения делятся пополам. Центр описанной окружности — точка пересечения диагоналей, радиус <b>R = d/2</b>.",
    "Из прямоугольного треугольника (половина диагонали + меньшая сторона a + угол α/2 между полудиагоналями): <b>d = a/sin(α/2)</b>, значит R = a/(2·sin(α/2)).",
    "Подставляем a = "+a+", α = "+alpha+"°: sin("+(alpha/2)+"°) ≈ "+fmt(halfSin)+", R = "+a+"/(2·"+fmt(halfSin)+") ≈ "+fmt(R)+" см.",
    "Длина окружности: <b>C = 2πR = πa/sin(α/2)</b> = π·"+a+"/"+fmt(halfSin)+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1104 (г). Найдите длину окружности, описанной около прямоугольника с меньшей стороной a = <b>"+a+"</b> см и острым углом α = <b>"+alpha+"°</b> между диагоналями."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"R = a/(2·sin(α/2)); C = πa/sin(α/2)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1104d(rng){
  /* правильный шестиугольник, площадь S = (3√3/2)·a²; a = √(2S/(3√3)) */
  var a=pick(rng,[2,4,6,8,10]);
  var S=(3*Math.sqrt(3)/2)*a*a;
  var R=a; /* для правильного шестиугольника R = a */
  var C=2*Math.PI*R;
  var exact="2π·"+a;
  var steps=[
    "Площадь правильного шестиугольника со стороной <b>a</b>: <b>S = (3√3/2)·a²</b>.",
    "Из уравнения S = "+fmt(S)+" = (3√3/2)·a² выразим сторону: a² = 2·"+fmt(S)+"/(3√3) = "+fmt(S*2/(3*Math.sqrt(3)))+", a = "+a+" см.",
    "Для правильного шестиугольника <b>R = a</b> = "+a+" см.",
    "Длина окружности: <b>C = 2πR</b> = 2π·"+a+" ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1104 (д). Найдите длину окружности, описанной около правильного шестиугольника, площадь которого равна <b>"+fmt(S)+"√3</b> см²."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"S = (3√3/2)·a²; для правильного шестиугольника R = a",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function genBlock1(rng){
  return [gen1104a(rng),gen1104b(rng),gen1104v(rng),gen1104g(rng),gen1104d(rng)];
}

/* =====================================================================
   Блок 2 (1105): Длина окружности, вписанной в...
   а) квадрат, сторона a → C = πa
   б) равнобедренный прямоугольный треугольник, гипотенуза c → C = πc(√2−1)
   в) прямоугольный треугольник, гипотенуза c, острый угол α → C = πc(sin α + cos α − 1)
   г) равнобедренный треугольник, угол при основании α, высота h → C = 2πh·cos α/(1+cos α)
-------------------------------------------------------------------- */
function gen1105a(rng){
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
    q:"№ 1105 (а). Найдите длину окружности, вписанной в квадрат со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"r = a/2; C = πa",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1105b(rng){
  var c=ri(rng,5,15);
  var r=c*(Math.SQRT2-1)/2;
  var C=Math.PI*c*(Math.SQRT2-1);
  var exact="π·"+c+"·(√2−1)";
  var steps=[
    "Равнобедренный прямоугольный треугольник с гипотенузой <b>c</b> имеет катеты a = b = c/√2.",
    "Радиус вписанной окружности: <b>r = (a + b − c)/2</b> = (c/√2 + c/√2 − c)/2 = c(√2−1)/2.",
    "r = "+c+"·(√2−1)/2 ≈ "+fmt(r)+" см.",
    "Длина окружности: <b>C = 2πr = πc(√2−1)</b> = π·"+c+"·(√2−1) ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1105 (б). Найдите длину окружности, вписанной в равнобедренный прямоугольный треугольник с гипотенузой c = <b>"+c+"</b> см."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"r = (a+b−c)/2 = c(√2−1)/2; C = πc(√2−1)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1105v(rng){
  var c=ri(rng,5,15);
  var alpha=pick(rng,ACUTE);
  var sa=sinD(alpha),ca=cosD(alpha);
  var r=c*(sa+ca-1)/2;
  var C=Math.PI*c*(sa+ca-1);
  var exact="π·"+c+"·(sin "+alpha+"° + cos "+alpha+"° − 1)";
  var steps=[
    "Катеты прямоугольного треугольника с гипотенузой <b>c</b> и острым углом α: a = c·sin α, b = c·cos α.",
    "Радиус вписанной окружности: <b>r = (a + b − c)/2 = c·(sin α + cos α − 1)/2</b>.",
    "Подставляем c = "+c+", α = "+alpha+"°: r = "+c+"·("+fmt(sa)+"+"+fmt(ca)+"−1)/2 = "+c+"·"+fmt(sa+ca-1)+"/2 ≈ "+fmt(r)+" см.",
    "Длина окружности: <b>C = 2πr = πc(sin α + cos α − 1)</b> ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1105 (в). Найдите длину окружности, вписанной в прямоугольный треугольник с гипотенузой c = <b>"+c+"</b> см и острым углом α = <b>"+alpha+"°</b>."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"r = c·(sin α + cos α − 1)/2; C = πc(sin α + cos α − 1)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function gen1105g(rng){
  var h=ri(rng,3,10);
  var alpha=pick(rng,ACUTE);
  var ca=cosD(alpha);
  var r=h*ca/(1+ca);
  var C=2*Math.PI*r;
  var exact="2π·"+h+"·cos "+alpha+"°/(1+cos "+alpha+"°)";
  var steps=[
    "В равнобедренном треугольнике с углом α при основании и высотой <b>h</b> к основанию: основание a = 2h/tg α, боковая сторона b = h/sin α.",
    "Площадь S = (1/2)·a·h = h²/tg α; полупериметр p = (2b + a)/2 = h/sin α + h/tg α.",
    "Радиус вписанной окружности: <b>r = S/p</b>. После упрощения: <b>r = h·cos α/(1 + cos α)</b>.",
    "Подставляем h = "+h+", α = "+alpha+"°: r = "+h+"·"+fmt(ca)+"/(1+"+fmt(ca)+") ≈ "+fmt(r)+" см.",
    "Длина окружности: <b>C = 2πr</b> ≈ <b>"+fmt(C)+"</b> см."
  ];
  return mkDec({
    q:"№ 1105 (г). Найдите длину окружности, вписанной в равнобедренный треугольник с углом при основании α = <b>"+alpha+"°</b> и высотой h = <b>"+h+"</b> см, проведённой к основанию."+ROUND_NOTE,
    a:C,unit:"см",sol:exact+" ≈ "+fmt(C)+" см",
    hint:"r = h·cos α/(1 + cos α); C = 2πr",
    detailed:detWrap(steps, exact+" ≈ "+fmt(C)+" см")
  });
}
function genBlock2(rng){
  return [gen1105a(rng),gen1105b(rng),gen1105v(rng),gen1105g(rng)];
}

/* =====================================================================
   Блок 3 (1116): Площадь круга, описанного около...
   а) прямоугольник, стороны a, b → S = π(a²+b²)/4
   б) прямоугольный треугольник, катет a, противолежащий угол α → S = πa²/(4sin²α)
   в) равнобедренный треугольник, основание a, высота h → S = π(a²+4h²)²/(64h²)
-------------------------------------------------------------------- */
function gen1116a(rng){
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
    q:"№ 1116 (а). Найдите площадь круга, описанного около прямоугольника со сторонами a = <b>"+a+"</b> см и b = <b>"+b+"</b> см."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"d = √(a²+b²); R = d/2; S = π(a²+b²)/4",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function gen1116b(rng){
  var a=ri(rng,3,10);
  var alpha=pick(rng,ACUTE);
  var sa=sinD(alpha);
  var c=a/sa;
  var R=c/2;
  var S=Math.PI*R*R;
  var exact="π·"+a*a+"/(4·sin²"+alpha+"°)";
  var steps=[
    "В прямоугольном треугольнике с катетом <b>a</b> и противолежащим углом α: гипотенуза c = a/sin α.",
    "Радиус описанной окружности <b>R = c/2 = a/(2sin α)</b> (половина гипотенузы).",
    "Подставляем a = "+a+", α = "+alpha+"°: c = "+a+"/"+fmt(sa)+" ≈ "+fmt(c)+" см; R ≈ "+fmt(R)+" см.",
    "Площадь круга: <b>S = πR² = πa²/(4sin²α)</b> = π·"+a*a+"/(4·"+fmt(sa*sa)+") ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"№ 1116 (б). Найдите площадь круга, описанного около прямоугольного треугольника с катетом a = <b>"+a+"</b> см и противолежащим углом α = <b>"+alpha+"°</b>."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"c = a/sin α; R = c/2; S = πa²/(4sin²α)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function gen1116v(rng){
  var a=ri(rng,4,10),h=ri(rng,3,10);
  /* R = (a² + 4h²)/(8h) ; S = π·R² */
  var num=a*a+4*h*h;
  var R=num/(8*h);
  var S=Math.PI*R*R;
  var exact="π·("+a+"²+4·"+h+"²)²/(64·"+h+"²)";
  var steps=[
    "Равнобедренный треугольник с основанием a и высотой h: боковая сторона b = √((a/2)² + h²) = √(a²/4 + h²).",
    "Площадь треугольника S_тр = ah/2. Радиус описанной окружности: <b>R = (a·b²)/(4·S_тр) = (a² + 4h²)/(8h)</b>.",
    "Подставляем a = "+a+", h = "+h+": R = ("+a*a+" + "+(4*h*h)+")/(8·"+h+") = "+num+"/"+(8*h)+" ≈ "+fmt(R)+" см.",
    "Площадь круга: <b>S = πR²</b> = π·("+fmt(R)+")² ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"№ 1116 (в). Найдите площадь круга, описанного около равнобедренного треугольника с основанием a = <b>"+a+"</b> см и высотой h = <b>"+h+"</b> см, проведённой к основанию."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"R = (a²+4h²)/(8h); S = πR²",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function genBlock3(rng){
  return [gen1116a(rng),gen1116b(rng),gen1116v(rng)];
}

/* =====================================================================
   Блок 4 (1117): Площадь круга, вписанного в...
   а) равносторонний треугольник, сторона a → S = πa²/12
   б) прямоугольный треугольник, катет a, прилежащий угол α → S = πa²(cos α + sin α − 1)²/(4cos²α)
   в) равнобедренный треугольник, боковая сторона a, угол α противолежащий основанию → S = πa²·sin²α / (4(1+sin(α/2))²)
   г) равнобедренная трапеция, большее основание a, острый угол α → S = πa²(1−cos α)/(4(1+cos α))
-------------------------------------------------------------------- */
function gen1117a(rng){
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
    q:"№ 1117 (а). Найдите площадь круга, вписанного в равносторонний треугольник со стороной a = <b>"+a+"</b> см."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"r = a√3/6; S = πa²/12",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function gen1117b(rng){
  var a=ri(rng,3,10);
  var alpha=pick(rng,ACUTE);
  var ca=cosD(alpha),sa=sinD(alpha);
  var b=a*sa/ca;            /* второй катет = a·tg α */
  var c=a/ca;               /* гипотенуза = a/cos α */
  var r=(a+b-c)/2;
  var S=Math.PI*r*r;
  var exact="π·"+a*a+"·(cos "+alpha+"°+sin "+alpha+"°−1)²/(4·cos²"+alpha+"°)";
  var steps=[
    "Катеты прямоугольного треугольника с катетом a (прилежащим к углу α): a = "+a+", b = a·tg α = "+fmt(b)+", гипотенуза c = a/cos α ≈ "+fmt(c)+" см.",
    "Радиус вписанной окружности: <b>r = (a + b − c)/2</b>. После подстановки и упрощения: <b>r = a·(cos α + sin α − 1)/(2cos α)</b>.",
    "Подставляем a = "+a+", α = "+alpha+"°: r = "+a+"·("+fmt(ca)+"+"+fmt(sa)+"−1)/(2·"+fmt(ca)+") = "+a+"·"+fmt(ca+sa-1)+"/"+fmt(2*ca)+" ≈ "+fmt(r)+" см.",
    "Площадь круга: <b>S = πr²</b> ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"№ 1117 (б). Найдите площадь круга, вписанного в прямоугольный треугольник с катетом a = <b>"+a+"</b> см и прилежащим к нему острым углом α = <b>"+alpha+"°</b>."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"b = a·tg α; c = a/cos α; r = (a+b−c)/2; S = πr²",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function gen1117v(rng){
  var a=ri(rng,3,10);
  var alpha=pick(rng,APEX);    /* угол при вершине, противолежащий основанию */
  var half=alpha/2;
  var sh=sinD(half),ch=cosD(half);
  var r=a*sinD(alpha)/(2*(1+sh));
  var S=Math.PI*r*r;
  var exact="π·"+a*a+"·sin²"+alpha+"°/(4·(1+sin("+(half)+"°))²)";
  var steps=[
    "В равнобедренном треугольнике с боковой стороной a и углом α при вершине: высота h = a·cos(α/2), основание = 2a·sin(α/2).",
    "Площадь треугольника S_тр = (1/2)·a²·sin α; полупериметр p = a + a·sin(α/2) = a·(1 + sin(α/2)).",
    "Радиус вписанной окружности: <b>r = S_тр/p = a·sin α/(2·(1 + sin(α/2)))</b>.",
    "Подставляем a = "+a+", α = "+alpha+"°: r = "+a+"·"+fmt(sinD(alpha))+"/(2·(1+"+fmt(sh)+")) ≈ "+fmt(r)+" см.",
    "Площадь круга: <b>S = πr²</b> ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"№ 1117 (в). Найдите площадь круга, вписанного в равнобедренный треугольник с боковой стороной a = <b>"+a+"</b> см и углом α = <b>"+alpha+"°</b>, противолежащим основанию."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"r = a·sin α/(2·(1+sin(α/2))); S = πr²",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function gen1117g(rng){
  var a=ri(rng,5,12);
  var alpha=pick(rng,ACUTE);
  var ca=cosD(alpha);
  var r=a*sinD(alpha)/(2*(1+ca));
  var S=Math.PI*r*r;
  /* упрощённая форма: S = π·a²·(1−cos α)/(4·(1+cos α)) */
  var exact="π·"+a*a+"·(1−cos "+alpha+"°)/(4·(1+cos "+alpha+"°))";
  var steps=[
    "В равнобедренной трапеции с вписанной окружностью сумма оснований равна сумме боковых сторон: a + b = 2c.",
    "Высота h = c·sin α; из (a−b)/2 = c·cos α и a+b = 2c находим c = a/(1+cos α), h = a·sin α/(1+cos α).",
    "Радиус вписанной окружности <b>r = h/2 = a·sin α/(2·(1+cos α))</b>.",
    "Используя тождество sin²α = (1−cos α)(1+cos α), получаем <b>S = πr² = πa²(1−cos α)/(4(1+cos α))</b>.",
    "Подставляем a = "+a+", α = "+alpha+"°: r ≈ "+fmt(r)+" см; S ≈ <b>"+fmt(S)+"</b> см²."
  ];
  return mkDec({
    q:"№ 1117 (г). Найдите площадь круга, вписанного в равнобедренную трапецию с бóльшим основанием a = <b>"+a+"</b> см и острым углом α = <b>"+alpha+"°</b>."+ROUND_NOTE,
    a:S,unit:"см²",sol:exact+" ≈ "+fmt(S)+" см²",
    hint:"r = a·sin α/(2(1+cos α)); S = πa²(1−cos α)/(4(1+cos α))",
    detailed:detWrap(steps, exact+" ≈ "+fmt(S)+" см²")
  });
}
function genBlock4(rng){
  return [gen1117a(rng),gen1117b(rng),gen1117v(rng),gen1117g(rng)];
}

/* =====================================================================
   Блок 5: Дуги и сектора (3 задания — прямая и обратные задачи)
   1) Даны r и α (градусы), найти длину дуги l = π·r·α/180  (прямая)
   2) Даны r и l, найти α = 180·l/(π·r)  (обратная, как № 1113)
   3) Даны α и l, найти r = 180·l/(π·α)  (обратная)
-------------------------------------------------------------------- */
function genArc1(rng){
  /* прямая задача: даны r и α, найти l */
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
function genArc2(rng){
  /* обратная задача (как № 1113): даны r и l, найти α */
  var r=ri(rng,5,20);
  var alpha=pick(rng,APEX);
  var l=Math.PI*r*alpha/180;  /* вычисляем l из красивого α */
  var exact="180·"+fmt(l)+"/(π·"+r+")";
  var steps=[
    "Из формулы длины дуги <b>l = π·R·α/180</b> выразим градусную меру: <b>α = 180·l/(π·R)</b>.",
    "Подставляем R = "+r+" см, l ≈ "+fmt(l)+" см: α = 180·"+fmt(l)+"/(π·"+r+") = "+fmt(180*l/(Math.PI*r))+"·180/(π·"+r+") ≈ <b>"+fmt(alpha)+"°</b>."
  ];
  return mkDec({
    q:"Дуга сектора (обратная задача, по образцу № 1113). Радиус дуги R = <b>"+r+"</b> см, длина дуги l ≈ <b>"+fmt(l)+"</b> см. Найдите градусную меру дуги."+ROUND_NOTE,
    a:alpha,unit:"°",sol:exact+" ≈ "+fmt(alpha)+"°",
    hint:"α = 180·l/(π·R)",
    detailed:detWrap(steps, exact+" ≈ "+fmt(alpha)+"°")
  });
}
function genArc3(rng){
  /* обратная задача: даны α и l, найти r */
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
function genBlock5(rng){
  return [genArc1(rng),genArc2(rng),genArc3(rng)];
}

/* ---------- проверка десятичного ответа с относительной погрешностью ----------
   input — строка от ученика («21,77», «21.77», «−5,3»).
   Принимаются запятая и точка как десятичный разделитель, знак минус или −.
   Погрешность: max(0,1; 1% от |answer|) — это покрывает и округление
   до сотых, и использование π≈3,14 вместо 3,14159. */
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

/* ---------- регистрация темы ---------- */
function getTZ(){
  if(global.TZ && global.TZ.TOPICS) return global.TZ;
  if(typeof require==="function"){
    var paths=["./trenazher-data.js","../lessons/trenazher-data.js"];
    for(var i=0;i<paths.length;i++){
      try{var tz=require(paths[i]);if(tz&&tz.TOPICS) return tz;}catch(e){}
    }
  }
  return null;
}
function register(){
  var TZ=getTZ();
  if(!TZ||!TZ.TOPICS)return;
  if(!TZ.checkDec)TZ.checkDec=checkDec;

  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="okruzhnosti")return;
  }
  TZ.TOPICS.push({
    id:"okruzhnosti",
    subject:"Математика",
    grade:"9 класс",
    title:"Окружности и дуги секторов",
    variants:20,
    desc:"Тренажёр по геометрии (9 класс) по задачам 1104, 1105, 1116, 1117, 1113: "
      +"длина и площадь вписанных и описанных окружностей для треугольников, "
      +"четырёхугольников и правильных многоугольников, плюс прямые и обратные "
      +"задачи на дуги секторов. Каждый подпункт (а, б, в, г, д) — отдельное "
      +"задание; всего 19 заданий в 5 блоках, 20 вариантов. "
      +"Ответ — десятичная дробь (π≈3,14; √2≈1,41; √3≈1,73; округляйте до сотых). "
      +"После выполнения — подробное решение с формулой и подстановкой.",
    blocks:[
      {name:"Длина описанной окружности (№ 1104)",gen:genBlock1,count:5},
      {name:"Длина вписанной окружности (№ 1105)",gen:genBlock2,count:4},
      {name:"Площадь описанного круга (№ 1116)",gen:genBlock3,count:3},
      {name:"Площадь вписанного круга (№ 1117)",gen:genBlock4,count:4},
      {name:"Дуги и сектора (№ 1113 и обратные задачи)",gen:genBlock5,count:3}
    ]
  });
}

register();

/* экспорт для автотестов в Node */
if(typeof module!=="undefined"&&module.exports){
  module.exports={
    checkDec:checkDec,
    genBlock1:genBlock1,genBlock2:genBlock2,genBlock3:genBlock3,
    genBlock4:genBlock4,genBlock5:genBlock5,
    sinD:sinD,cosD:cosD,fmt:fmt
  };
}

})(typeof window!=="undefined"?window:globalThis);
