/* =====================================================================
   Тренажёр и ДЗ · 8 класс · Алгебра · Неполные квадратные уравнения
   Подключается ПОСЛЕ trenazher-data.js и добавляет ДВЕ темы в TZ.TOPICS:

   1) Тренажёр «Неполные квадратные уравнения» (8 кл, dz:false, 40 вариантов):
      10 заданий — 5 неполных квадратных (тип A: ax²+c=0; тип B: ax²+bx=0)
      и 5 сводящихся к неполным двух типов.
      После выполнения — подробное решение по каждому заданию.

   2) ДЗ «Уравнения, сводящиеся к неполным квадратным» (8 кл, dz:true,
      50 вариантов, diskFolder «8 класс алгебра ДЗ»):
      10 заданий — только уравнения, сводящиеся к неполным квадратным
      двух типов. Результат → XLSX и отправка учителю на Яндекс.Диск.
      После отправки — подробное решение.

   Тип задания — "roots": ученик вводит корни (через запятую) или
   «нет корней»/«корней нет»/«∅». Проверка — checkRoots (добавляется в TZ).
   ===================================================================== */
(function(global){
"use strict";

/* ---------- вспомогательная арифметика и форматирование ---------- */
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a||1;}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* Дробь num/den -> {num,den,str,sign} (сокращённая, den>0). */
function frac(n,d){
  if(d===0) d=1;
  var g=gcd(n,d);
  n=Math.round(n/g); d=Math.round(d/g);
  if(d<0){n=-n;d=-d;}
  var sign=n<0?"−":"";
  n=Math.abs(n);
  if(d===1) return {num:n,den:1,str:sign+n,sign:sign};
  return {num:n,den:d,str:sign+n+"/"+d,sign:sign};
}
/* Строка числа: целое -> "3"/"−3", дробь -> "1/2"/"−1/2" (точная, без «≈»). */
function nstr(x){
  if(Math.abs(x-Math.round(x))<1e-9){var r=Math.round(x);return (r<0?"−":"")+Math.abs(r);}
  /* точная дробь */
  var fr=frac(Math.round(x*1000),1000);
  return fr.sign+fr.num+(fr.den!==1?"/"+fr.den:"");
}
/* Строка дроби из {num,den}. sign может отсутствовать — вычисляем по знаку num. */
function rstr(r){
  var sign=r.sign;
  if(sign===undefined||sign===null) sign=(r.num<0)?"−":"";
  var n=Math.abs(r.num);
  return sign+n+(r.den!==1?"/"+r.den:"");
}
function rnum(r){return r.num/r.den;}
/* Строка одного корня (число или дробь): целое -> "3"/"−3", дробь -> "1/2"/"−1/2". */
function rootStr(x){
  if(Math.abs(x-Math.round(x))<1e-9){var r=Math.round(x);return (r<0?"−":"")+Math.abs(r);}
  var fr=frac(Math.round(x*1000),1000);
  return fr.sign+fr.num+(fr.den!==1?"/"+fr.den:"");
}
/* Строка всех корней с раздельным "x = " перед каждым:
   [-5,5] -> "x = −5, x = 5"; [0,-9] -> "x = 0, x = −9";
   [] -> "корней нет". */
function rootsStr(ans){
  if(!ans||!ans.length) return "корней нет";
  return ans.map(function(v){return "x = "+rootStr(v);}).join(", ");
}

/* ---------- форматирование многочлена ---------- */
/* coef = [{c, p}] — слагаемые; собираем строку с переменной x.
   html=true — использовать <sup> для степеней. */
function polyStr(coef,varn,html){
  var parts=[];
  for(var i=0;i<coef.length;i++){
    var c=coef[i].c, p=coef[i].p;
    if(c===0) continue;
    var sign=c<0?" − ":" + ";
    var ac=Math.abs(c);
    var term="";
    if(p===0){term=String(ac);}
    else if(p===1){
      if(ac===1) term=varn;
      else term=ac+varn;
    } else {
      if(ac===1) term=varn+(html?"<sup>"+p+"</sup>":"^"+p);
      else term=ac+varn+(html?"<sup>"+p+"</sup>":"^"+p);
    }
    parts.push((parts.length===0?(c<0?"−":""):sign)+term);
  }
  if(parts.length===0) return "0";
  return parts.join("");
}
/* Отдельный линейный член "ax" с учётом знака коэффициента: 1 -> "x", -1 -> "−x", 2 -> "2x". */
function lin(n){
  if(n===1) return "x";
  if(n===-1) return "−x";
  return (n<0?"−":"")+Math.abs(n)+"x";
}
/* Свободный член со знаком для вставки в "ax + b": b=3 -> " + 3", b=-3 -> " − 3". */
function signedConst(n){
  if(n===0) return "";
  return (n>0?" + ":" − ")+Math.abs(n);
}
/* Квадратичный член "ax²": 1 -> "x²", -1 -> "−x²", 2 -> "2x²". */
function quad(n){
  if(n===1) return "x²";
  if(n===-1) return "−x²";
  return (n<0?"−":"")+Math.abs(n)+"x²";
}

/* ---------- типы уравнений ---------- */
/* НЕПОЛНЫЕ — тип A: ax² + c = 0  (нет bx).
   Корни: x² = −c/a.
   Если −c/a > 0 → x = ±√(−c/a). Делаем −c/a полным квадратом k² (k целое).
   Если −c/a = 0 (c=0) → x = 0 (один корень, кратный 2) — избегаем, вырожденно.
   Если −c/a < 0 → корней нет. */
function genIncompleteA(rng){
  var a = pick(rng,[1,1,2,2,3,3,4,-1,-2,-3,-4]);
  var k = ri(rng,1,6);
  /* выбор: 2 корня (−c/a=k²>0) или корней нет (−c/a<0) */
  var hasTwo = rng()<0.65;
  var c, roots=[], ans=[];
  if(hasTwo){
    c = -a*k*k;            /* ax² + c = 0, c = −a·k² → x² = k² */
    roots = [{num:-k,den:1},{num:k,den:1}];
    ans = [-k, k];
  } else {
    /* корней нет: ax² + c = 0, c/a > 0 → x² = −c/a < 0 */
    var cc = pick(rng,[1,2,3,4,5,6,7]) * (a>0?1:-1);   /* c того же знака, что a */
    c = cc;
    roots = []; ans = [];
  }
  var eq = polyStr([{c:a,p:2},{c:c,p:0}],"x",true) + " = 0";
  var task = {
    q:"Реши уравнение: <span class='dz-code'>"+eq+"</span>",
    answer: ans,
    sol: rootsStr(ans),
    unit:"Корни: ",
    placeholder:"напр.: 3, −2  или  нет корней",
    hint: hasTwo? "Перенеси c вправо: x² = "+(-c/a)+", извлеки корень." : "x² = отрицательному числу — действительных корней нет.",
    detailed: detailedIncompleteA(a,c,ans,hasTwo)
  };
  return mkRootsTask(task);
}

/* НЕПОЛНЫЕ — тип B: ax² + bx = 0  (нет c). Выносим x: x·(ax + b) = 0.
   Корни: x = 0 и x = −b/a. */
function genIncompleteB(rng){
  var a = pick(rng,[1,2,2,3,3,4,-1,-2,-3,-4]);
  var b = ri(rng,-12,12);
  if(b===0) b = 2;       /* иначе вырождается в ax²=0 (один корень 0) */
  /* корень 2: x = −b/a */
  var g=gcd(-b,a);
  var r2={num:Math.round(-b/g),den:Math.round(a/g)};
  if(r2.den<0){r2.num=-r2.num;r2.den=-r2.den;}
  var ans = [0, rnum(r2)];
  var eq = polyStr([{c:a,p:2},{c:b,p:1}],"x",true) + " = 0";
  var task = {
    q:"Реши уравнение: <span class='dz-code'>"+eq+"</span>",
    answer: ans,
    sol: rootsStr(ans),
    unit:"Корни: ",
    placeholder:"напр.: 0, 2  или  нет корней",
    hint: "Вынеси общий множитель x за скобки: x·(ax + b) = 0.",
    detailed: detailedIncompleteB(a,b,r2)
  };
  return mkRootsTask(task);
}

/* СВОДЯЩИЕСЯ — тип 1 (→ ax² + c = 0): уравнение вида A·x² + B = C·x² + D.
   Перенос: (A−C)x² + (B−D) = 0. Корни x² = (D−B)/(A−C).
   Подбираем A,B,C,D так, чтобы (D−B)/(A−C) = k² (целый квадрат) или < 0. */
function genReduced1(rng){
  /* итог: (A−C)x² + (B−D) = 0, пусть p = A−C, q = B−D. Тогда px² + q = 0, x² = −q/p. */
  var hasTwo = rng()<0.7;
  var p, q, k;
  if(hasTwo){
    k = ri(rng,1,6);
    p = pick(rng,[1,2,3,4,-1,-2,-3,-4]);
    q = -p*k*k;                  /* x² = k² */
  } else {
    /* корней нет: q/p > 0 */
    p = pick(rng,[1,2,3,4,-1,-2,-3]);
    q = pick(rng,[1,2,3,4,5,6,7,8]) * (p>0?1:-1);   /* q того же знака, что p → q/p>0, x²=−q/p<0 */
  }
  /* разбиваем p = A−C, q = B−D на A,C и B,D */
  var A = ri(rng,1,8), C = A - p;
  var B = ri(rng,-8,8), D = B - q;
  /* собираем уравнение: A·x² + B = C·x² + D */
  var left = polyStr([{c:A,p:2},{c:B,p:0}],"x",true);
  var right = polyStr([{c:C,p:2},{c:D,p:0}],"x",true);
  var eq = left + " = " + right;
  var ans = hasTwo? [-k, k] : [];
  /* итоговое неполное: p·x² + q = 0 */
  var reduced = polyStr([{c:p,p:2},{c:q,p:0}],"x",true) + " = 0";
  var task = {
    q:"Реши уравнение: <span class='dz-code'>"+eq+"</span>",
    answer: ans,
    sol: rootsStr(ans),
    unit:"Корни: ",
    placeholder:"напр.: 3, −2  или  нет корней",
    hint: "Перенеси всё в левую часть и приведи подобные: получится неполное квадратное вида ax² + c = 0.",
    detailed: detailedReduced1(A,B,C,D,p,q,ans,hasTwo,eq,reduced)
  };
  return mkRootsTask(task);
}

/* СВОДЯЩИЕСЯ — тип 2 (→ ax² + bx = 0): уравнение вида A·x² + B·x = C·x.
   Перенос: A·x² + (B−C)·x = 0 → x·(A·x + B − C) = 0.
   Корни: x = 0 и x = (C−B)/A. */
function genReduced2(rng){
  var A = pick(rng,[1,2,2,3,3,4,-1,-2,-3,-4]);
  var r2val;             /* второй корень */
  /* подберём C,B так, чтобы (C−B)/A = r2val — целое или простая дробь */
  var r2num = ri(rng,-8,8); if(r2num===0) r2num=2;
  /* (C−B)/A = r2num → C−B = A·r2num */
  var C = ri(rng,-9,9);
  var B = C - A*r2num;
  /* итог: A·x² + (B−C)·x = 0; (B−C) = −A·r2num → A·x² − A·r2num·x = 0 */
  var r2 = {num:r2num, den:1};
  var ans = [0, rnum(r2)];
  /* уравнение: A·x² + B·x = C·x  (но если B=0, то A·x² = C·x — это тоже ок) */
  var left = polyStr([{c:A,p:2},{c:B,p:1}],"x",true);
  var right = polyStr([{c:C,p:1}],"x",true);
  var eq = left + " = " + right;
  /* итоговое неполное */
  var bc = B - C;        /* коэффициент при x */
  var reduced = polyStr([{c:A,p:2},{c:bc,p:1}],"x",true) + " = 0";
  var task = {
    q:"Реши уравнение: <span class='dz-code'>"+eq+"</span>",
    answer: ans,
    sol: rootsStr(ans),
    unit:"Корни: ",
    placeholder:"напр.: 0, 2  или  нет корней",
    hint: "Перенеси всё в левую часть, приведи подобные и вынеси x за скобки.",
    detailed: detailedReduced2(A,B,C,bc,r2,eq,reduced)
  };
  return mkRootsTask(task);
}

/* ---------- подробные решения (HTML) ---------- */
function detWrap(steps, answerLine){
  var h="<div class='dz-det'><p><b>Решение:</b></p>";
  for(var i=0;i<steps.length;i++){
    h+="<p>"+steps[i]+"</p>";
  }
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p></div>";
  return h;
}

function detailedIncompleteA(a,c,ans,hasTwo){
  var steps=[];
  steps.push("Это неполное квадратное уравнение вида <b>ax² + c = 0</b> (нет линейного члена bx).");
  steps.push("Перенесём свободный член в правую часть: <span class='dz-code'>"+quad(a)+" = "+(-c)+"</span>.");
  var rhs = -c/a;
  steps.push("Разделим обе части на "+a+": <span class='dz-code'>x² = "+nstr(rhs)+"</span>.");
  if(hasTwo){
    steps.push("Извлекаем квадратный корень: <span class='dz-code'>x = ±"+Math.abs(ans[0])+"</span>.");
    steps.push("<b>Правило:</b> если x² = k² и k ≠ 0, то уравнение имеет два корня: x = −k и x = k.");
  } else {
    steps.push("Правая часть отрицательна, а x² ≥ 0 при любом x. Поэтому <b>действительных корней нет</b>.");
    steps.push("<b>Правило:</b> уравнение x² = m при m < 0 не имеет действительных корней.");
  }
  return detWrap(steps, rootsStr(ans));
}

function detailedIncompleteB(a,b,r2){
  var steps=[];
  steps.push("Это неполное квадратное уравнение вида <b>ax² + bx = 0</b> (нет свободного члена c).");
  steps.push("Вынесем общий множитель x за скобки: <span class='dz-code'>x·("+lin(a)+signedConst(b)+") = 0</span>.");
  steps.push("Произведение равно нулю, когда хотя бы один множитель равен нулю:");
  steps.push("&nbsp;&nbsp;&nbsp;1) x = 0 — первый корень;");
  steps.push("&nbsp;&nbsp;&nbsp;2) "+lin(a)+signedConst(b)+" = 0 → x = "+rstr(r2)+" — второй корень.");
  steps.push("<b>Правило:</b> уравнение ax² + bx = 0 решают вынесением x за скобки и приравниванием каждого множителя к нулю; всегда один из корней x = 0.");
  return detWrap(steps, "x = 0, x = "+rstr(r2));
}

function detailedReduced1(A,B,C,D,p,q,ans,hasTwo,eq,reduced){
  var steps=[];
  steps.push("Перенесём все слагаемые в левую часть: <span class='dz-code'>"+polyStr([{c:A,p:2},{c:B,p:0},{c:-C,p:2},{c:-D,p:0}],"x",true)+" = 0</span>.");
  steps.push("Приведём подобные (сгруппируем x² и свободные): <span class='dz-code'>"+reduced+"</span>.");
  steps.push("Получили неполное квадратное уравнение вида <b>ax² + c = 0</b>.");
  steps.push("Перенесём c вправо и разделим на "+p+": <span class='dz-code'>x² = "+nstr(-q/p)+"</span>.");
  if(hasTwo){
    steps.push("Извлекаем корень: <span class='dz-code'>x = ±"+Math.abs(ans[0])+"</span>.");
    steps.push("<b>Правило:</b> уравнение, сводящееся к виду ax² + c = 0 с x² = k² > 0, имеет два корня x = ±k.");
  } else {
    steps.push("Правая часть отрицательна, поэтому <b>действительных корней нет</b>.");
    steps.push("<b>Правило:</b> если после приведения подобных получилось x² = m с m < 0, корней нет.");
  }
  return detWrap(steps, rootsStr(ans));
}

function detailedReduced2(A,B,C,bc,r2,eq,reduced){
  var steps=[];
  steps.push("Перенесём все слагаемые в левую часть: <span class='dz-code'>"+polyStr([{c:A,p:2},{c:B,p:1},{c:-C,p:1}],"x",true)+" = 0</span>.");
  steps.push("Приведём подобные при x: <span class='dz-code'>"+reduced+"</span>.");
  steps.push("Получили неполное квадратное уравнение вида <b>ax² + bx = 0</b>.");
  steps.push("Вынесем x за скобки: <span class='dz-code'>x·("+lin(A)+signedConst(bc)+") = 0</span>.");
  steps.push("Приравняем каждый множитель к нулю: x = 0 и "+lin(A)+signedConst(bc)+" = 0 → x = "+rstr(r2)+".");
  steps.push("<b>Правило:</b> уравнение, сводящееся к виду ax² + bx = 0, решают вынесением x за скобки; один корень всегда x = 0.");
  return detWrap(steps, "x = 0, x = "+rstr(r2));
}

/* ---------- сборка задания типа roots ---------- */
function mkRootsTask(t){
  /* answer: массив чисел (может быть пустым — корней нет) */
  return {
    type:"roots",
    q:t.q,
    answer:t.answer,
    sol:t.sol,
    atext:t.sol,
    unit:t.unit||"Корни: ",
    placeholder:t.placeholder||"напр.: 3, −2  или  нет корней",
    hint:t.hint||"",
    detailed:t.detailed||""
  };
}

/* ---------- генераторы вариантов ---------- */
/* Ключ набора корней задания (для проверки уникальности внутри варианта). */
function rootKey(t){var a=(t.answer||[]).slice().sort(function(x,y){return x-y;});return a.join(",");}
/* Генерация задания заданного типа с контролем уникальности корней.
   genFn — функция(rng)->task; seen — объект уже использованных ключей корней;
   noRootsCount — счётчик заданий «корней нет» в варианте; maxNoRoots — лимит.
   Возвращает task или null, если за maxTries попыток не удалось получить
   уникальный набор корней (тогда вызывающий код может заменить тип). */
function genUnique(genFn,rng,seen,maxNoRoots,noRootsCount,maxTries){
  maxTries=maxTries||40;
  for(var k=0;k<maxTries;k++){
    var t=genFn(rng);
    if(!t)continue;
    var key=rootKey(t);
    /* «корней нет» — не чаще одного раза на вариант */
    if(t.answer.length===0 && noRootsCount>=maxNoRoots) continue;
    if(seen[key]) continue;
    seen[key]=true;
    return t;
  }
  /* не удалось — берём последний, помечаем как использованный */
  var t=genFn(rng);
  if(t) seen[rootKey(t)]=true;
  return t;
}
/* Тренажёр: 10 заданий = 3 неполных A + 2 неполных B + 3 сводящихся тип 1 + 2 сводящихся тип 2.
   Внутри варианта наборы корней не повторяются; «корней нет» встречается максимум 1 раз. */
function genTrainer8(rng){
  var t=[],seen={},noRoots=0;
  var plan=[genIncompleteA,genIncompleteA,genIncompleteA,
            genIncompleteB,genIncompleteB,
            genReduced1,genReduced1,genReduced1,
            genReduced2,genReduced2];
  for(var i=0;i<plan.length;i++){
    var tk=genUnique(plan[i],rng,seen,1,noRoots);
    if(tk){
      if(tk.answer.length===0)noRoots++;
      t.push(tk);
    }
  }
  return shuf(rng,t);
}
/* ДЗ: 10 заданий = 5 сводящихся тип 1 + 5 сводящихся тип 2 (только сводящиеся, двух типов).
   Внутри варианта наборы корней не повторяются; «корней нет» максимум 1 раз. */
function genDz8(rng){
  var t=[],seen={},noRoots=0;
  var plan=[genReduced1,genReduced1,genReduced1,genReduced1,genReduced1,
            genReduced2,genReduced2,genReduced2,genReduced2,genReduced2];
  for(var i=0;i<plan.length;i++){
    var tk=genUnique(plan[i],rng,seen,1,noRoots);
    if(tk){
      if(tk.answer.length===0)noRoots++;
      t.push(tk);
    }
  }
  return shuf(rng,t);
}

/* ---------- регистрация тем ---------- */
function getTZ(){
  if(global.TZ && global.TZ.TOPICS) return global.TZ;
  if(typeof require==="function"){
    var paths=["./trenazher-data.js","../lessons/trenazher-data.js","/home/z/my-project/work/extracted/lessons/trenazher-data.js"];
    for(var i=0;i<paths.length;i++){
      try{ var tz=require(paths[i]); if(tz&&tz.TOPICS) return tz; }catch(e){}
    }
  }
  return null;
}
function register(){
  var TZ=getTZ();
  if(!TZ || !TZ.TOPICS) return;
  /* добавим checkRoots в TZ, если её ещё нет */
  if(!TZ.checkRoots) TZ.checkRoots=checkRoots;

  /* --- тема 1: тренажёр --- */
  var hasTr=false, hasDz=false;
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="uravneniya8") hasTr=true;
    if(TZ.TOPICS[i].id==="uravneniya8dz") hasDz=true;
  }
  if(!hasTr){
    TZ.TOPICS.push({
      id:"uravneniya8",
      subject:"Математика",
      grade:"8 класс",
      title:"Неполные квадратные уравнения",
      variants:40,
      desc:"Тренажёр по неполным квадратным уравнениям для 8 класса: 10 заданий, 40 вариантов. "
         +"Неполные уравнения вида ax² + c = 0 и ax² + bx = 0, а также уравнения, сводящиеся к ним "
         +"двух типов (приведение подобных и вынесение x за скобки). После выполнения — подробное "
         +"решение по каждому заданию.",
      blocks:[{name:"Неполные квадратные уравнения", gen:genTrainer8, count:10}]
    });
  }
  if(!hasDz){
    TZ.TOPICS.push({
      id:"uravneniya8dz",
      subject:"Математика",
      grade:"8 класс",
      title:"Уравнения, сводящиеся к неполным квадратным",
      dz:true,
      variants:50,
      diskFolder:"8 класс алгебра ДЗ",
      fileTitle:"Уравнения, сводящиеся к неполным квадратным",
      filePrefix:"ДЗ_Уравнения_8кл",
      formIntro:"В каждом задании реши уравнение, сводящееся к неполному квадратному, и впиши "
        +"корни в поле через запятую (например: <b>3, −2</b>). Если корней нет — напиши "
        +"<b>нет корней</b>. Дробные корни записывай через знак «/» (например, <b>1/2</b>). "
        +"После отправки открывается подробное решение.",
      desc:"Домашнее задание для 8 класса: 10 заданий, 50 вариантов — уравнения, сводящиеся к "
         +"неполным квадратным двух типов (к виду ax² + c = 0 и к виду ax² + bx = 0). "
         +"Результат — XLSX и отправка учителю на Яндекс.Диск (папка «8 класс алгебра ДЗ»).",
      blocks:[{name:"Уравнения, сводящиеся к неполным квадратным", gen:genDz8, count:10}]
    });
  }
}

/* ---------- проверка корней ----------
   input — строка от ученика. Поддерживаемые форматы:
   "3, -2" / "3; -2" / "3 -2" / "3 −2" / "3,−2"
   "нет корней" / "корней нет" / "нет решений" / "∅"
   Дроби: "1/2", "−1/2", "-3/4"
   Возвращает true, если множество корней совпадает с task.answer (с учётом порядка и повторов).
*/
function checkRoots(input, task){
  if(!task || task.type!=="roots") return false;
  var s=String(input==null?"":input).trim().toLowerCase();
  if(!s) return false;
  /* нормализация символов */
  s=s.replace(/\u2212/g,"-").replace(/−/g,"-").replace(/,/g," ").replace(/;/g," ");
  s=s.replace(/no/g,"").trim();
  /* "нет корней" и подобные */
  if(/^(корней нет|нет корней|нет решений|решений нет|нет решений нет|∅|\x18|o|0 корней)$/.test(s) || s==="" || s==="нет" || s==="нет корн"){
    return task.answer.length===0;
  }
  /* пытаемся разобрать числа/дроби */
  var toks=s.split(/\s+/).filter(Boolean);
  var nums=[];
  for(var i=0;i<toks.length;i++){
    var tk=toks[i];
    var m=tk.match(/^(-?\d+)\/(\d+)$/);
    if(m){ var n=parseInt(m[1],10), d=parseInt(m[2],10); if(d===0) return false; nums.push(n/d); continue; }
    m=tk.match(/^(-?\d+(?:\.\d+)?)$/);
    if(m){ nums.push(parseFloat(m[1])); continue; }
    /* не распознали токен — это не валидный ответ */
    return false;
  }
  if(nums.length===0) return task.answer.length===0;
  /* сравниваем множества (с допуском по точности) */
  if(nums.length!==task.answer.length) return false;
  var ans=task.answer.slice().sort(function(a,b){return a-b;});
  var got=nums.slice().sort(function(a,b){return a-b;});
  for(var k=0;k<ans.length;k++){
    if(Math.abs(got[k]-ans[k])>1e-6*(1+Math.abs(ans[k]))) return false;
  }
  return true;
}

register();

})(typeof window!=="undefined"?window:globalThis);
