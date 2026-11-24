/* =====================================================================
   Тренажёр · 6 класс · Математика · Задачи на дроби и проценты
   40 вариантов × 10 заданий (от простого к сложному).
   После выполнения — подробное пошаговое решение с чертежами SVG.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}

function fmt(n){
  if(n===null||!isFinite(n))return "—";
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  return n.toFixed(2).replace(".",",");
}
function fmtF(n){
  /* Дробь для отображения */
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  return n.toFixed(2).replace(".",",");
}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число, можно десятичную дробь)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function step(title,html){
  return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";
}
function frac(num,den){
  return "<span class='frac'><span class='num'>"+num+"</span><span class='den'>"+den+"</span></span>";
}

/* ---------- SVG: отрезок, разделённый на части ---------- */
function svgSegment(parts, total, labels, title){
  var W=500,H=140,padX=30,padY=55;
  var segW=W-2*padX;
  var y=45;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  if(title)h+="<text x='"+(W/2)+"' y='18' font-size='13' fill='#666' font-weight='600' text-anchor='middle'>"+title+"</text>";
  var x=padX;
  for(var i=0;i<parts.length;i++){
    var w=segW*parts[i];
    h+="<rect x='"+x.toFixed(1)+"' y='"+y+"' width='"+w.toFixed(1)+"' height='28' fill='rgba(47,111,208,"+(0.10+i*0.08)+")' stroke='#1a1a1a' stroke-width='1.5'/>";
    if(labels&&labels[i]){
      var lx=x+w/2;
      /* Разбиваем label на строки по \n */
      var lines=String(labels[i]).split("\\n");
      for(var li=0;li<lines.length;li++){
        h+="<text x='"+lx.toFixed(0)+"' y='"+(y-8-li*14)+"' font-size='11' fill='#1a1a1a' font-weight='600' text-anchor='middle'>"+lines[li]+"</text>";
      }
    }
    x+=w;
  }
  /* Скобка всего */
  h+="<line x1='"+padX+"' y1='"+(y+36)+"' x2='"+(padX+segW)+"' y2='"+(y+36)+"' stroke='#1a1a1a' stroke-width='1.5'/>";
  h+="<line x1='"+padX+"' y1='"+(y+33)+"' x2='"+padX+"' y2='"+(y+39)+"' stroke='#1a1a1a' stroke-width='1.5'/>";
  h+="<line x1='"+(padX+segW)+"' y1='"+(y+33)+"' x2='"+(padX+segW)+"' y2='"+(y+39)+"' stroke='#1a1a1a' stroke-width='1.5'/>";
  h+="<text x='"+(padX+segW/2)+"' y='"+(y+52)+"' font-size='13' fill='#1a1a1a' font-weight='700' text-anchor='middle'>"+total+"</text>";
  h+="</svg>";
  return h;
}

/* =====================================================================
   ТИП 1 (простой): Найти число по дроби
   Прототип: "5½ м составляет 3/11 длины столба. Найдите всю длину."
   ===================================================================== */
function genType1(rng){
  var d=pick(rng,[3,4,5,6,7,8,9,11]);
  var n=ri(rng,1,d-1);
  /* часть = k * (n/d), где k — целое или смешанное */
  var wholeNum=ri(rng,2,12);
  var partFrac = wholeNum; /* наземная часть — целое число */
  if(rng()<0.4){ /* иногда смешанное */
    var half=pick(rng,[2,3,4]);
    partFrac = wholeNum + 1/half;
  }
  /* часть = (n/d) * всё → всё = часть / (n/d) = часть * d / n */
  var answer = partFrac * d / n;
  /* Проверим, что ответ красивый */
  if(Math.abs(answer-Math.round(answer))>0.01 && answer*100!=Math.round(answer*100)){
    /* попробуем другие параметры */
    partFrac = n * ri(rng,1,5); /* часть, кратная n */
    answer = partFrac * d / n;
  }
  var partStr = fmt(partFrac);
  var qText = "Найдите длину столба, если его наземная часть равна "+partStr+" м, а в землю врыто "+frac(n,d)+" его длины."+NOTE;
  var det = "";
  det += step("Анализ условия", "Наземная часть столба составляет "+partStr+" м. Это "+frac(1,1)+" − "+frac(n,d)+" = "+frac(d-n,d)+" всей длины столба.");
  det += step("Решение", "Пусть вся длина столба — x метров. Тогда наземная часть: x · "+frac(d-n,d)+" = "+partStr+".<br/>"+
    "Отсюда: x = "+partStr+" ÷ "+frac(d-n,d)+" = "+partStr+" · "+frac(d,d-n)+" = "+fmt(answer)+" (м).");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" м</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" м", hint:"Наземная часть = (1 − n/d) · вся длина", detailed:det});
}

/* =====================================================================
   ТИП 2: Найти число по проценту
   Прототип: "24% товара = 57.6 р. Сколько стоил товар?"
   ===================================================================== */
function genType2(rng){
  var p=pick(rng,[8,12,15,20,24,25,30,40]);
  var mult=pick(rng,[10,12,20,24,30]);
  var value=p*mult/100*Math.ceil(100/p); /* значение, чтобы ответ был красивый */
  /* value = p% от X → X = value * 100 / p */
  /* Подберём value так, чтобы X было целым */
  var X=ri(rng,100,500);
  value = X*p/100;
  /* Округлим value до сотых */
  value = Math.round(value*100)/100;
  X = value*100/p;
  var qText = "Во время распродажи цена на товар уменьшилась на "+p+" %, и уменьшение цены составило "+fmt(value)+" р. Сколько стоил товар до распродажи?"+NOTE;
  var det = "";
  det += step("Анализ условия", "Снижение цены на "+p+"% составило "+fmt(value)+" р. Значит, "+p+"% от первоначальной цены равны "+fmt(value)+" р.");
  det += step("Решение", "Пусть первоначальная цена — x рублей.<br/>"+
    p+"% от x = "+fmt(value)+".<br/>"+
    "0,"+(p<10?"0":"")+p+" · x = "+fmt(value)+".<br/>"+
    "x = "+fmt(value)+" ÷ "+(p/100)+" = "+fmt(value)+" · 100 / "+p+" = <b>"+fmt(X)+"</b> (р).");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(X)+" р</span></p>";
  return mkDec({q:qText, a:X, sol:fmt(X)+" р", hint:p+"% от числа = значение → число = значение × 100 ÷ p", detailed:det});
}

/* =====================================================================
   ТИП 3: Найти число по десятичной дроби
   Прототип: "1.55 ч = 0.62 всего фильма."
   ===================================================================== */
function genType3(rng){
  var k=pick(rng,[0.25,0.4,0.5,0.62,0.56,0.75,0.8]);
  /* Подберём значение так, чтобы ответ был красивым */
  var X=ri(rng,2,20);
  if(k===0.62)X=ri(rng,2,5);
  var value=k*X;
  value=Math.round(value*100)/100;
  X=value/k;
  var context=pick(rng,[
    ["фильма","ч","продолжительность фильма"],
    ["приусадебного участка","соток","площадь приусадебного участка"],
    ["участка","га","площадь участка"],
    ["маршрута","км","длину всего маршрута"]
  ]);
  var qText = "Первая часть "+context[0]+" составляет "+fmt(value)+" "+context[1]+", что составляет "+fmtF(k)+" "+context[0]+". Найдите "+context[2]+"."+NOTE;
  var det = "";
  det += step("Анализ условия", fmt(value)+" "+context[1]+" — это "+fmtF(k)+" от всего "+context[0]+".");
  det += step("Решение", "Пусть всё "+context[0]+" — x.<br/>"+
    fmtF(k)+" · x = "+fmt(value)+".<br/>"+
    "x = "+fmt(value)+" ÷ "+fmtF(k)+" = <b>"+fmt(X)+"</b> ("+context[1]+").");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(X)+" "+context[1]+"</span></p>";
  return mkDec({q:qText, a:X, sol:fmt(X)+" "+context[1], hint:"k × число = значение → число = значение ÷ k", detailed:det});
}

/* =====================================================================
   ТИП 4: Найти целое по остатку (дроби)
   Прототип: "4/9 израсходовано, осталось 36 т."
   ===================================================================== */
function genType4(rng){
  var d=pick(rng,[5,7,9,11,12]);
  var n=ri(rng,1,d-1);
  /* осталось = (d-n)/d * всё → всё = осталось * d / (d-n) */
  var rem=ri(rng,10,60);
  var answer = rem * d / (d-n);
  /* Проверим, что ответ целое */
  if(Math.abs(answer-Math.round(answer))>0.01){
    rem = (d-n) * ri(rng,2,10);
    answer = rem * d / (d-n);
  }
  var context=pick(rng,[
    ["сена было заготовлено на зиму","т","сена"],
    ["муки было на складе","кг","муки"],
    ["воды в баке","л","воды"],
    ["топлива в баке","л","топлива"]
  ]);
  var qText = "После того как "+frac(n,d)+" заготовленного "+context[0]+" было израсходовано, осталось "+rem+" "+context[1]+". Сколько "+context[2]+" было заготовлено?"+NOTE;
  var det = "";
  det += step("Анализ условия", "Израсходовано "+frac(n,d)+" всего "+context[2]+". Значит, осталась "+frac(d-n,d)+" часть.");
  det += step("Решение", frac(d-n,d)+" всего "+context[2]+" = "+rem+" "+context[1]+".<br/>"+
    "Пусть всего было x "+context[1]+".<br/>"+
    frac(d-n,d)+" · x = "+rem+".<br/>"+
    "x = "+rem+" ÷ "+frac(d-n,d)+" = "+rem+" · "+frac(d,d-n)+" = <b>"+fmt(answer)+"</b> ("+context[1]+").");
  /* SVG чертёж */
  var parts=[n/d,(d-n)/d];
  det += "<div class='svg-center'>"+svgSegment(parts, "Всего: "+fmt(answer)+" "+context[1], [n+"/"+d, (d-n)+"/"+d+" = "+rem], context[2])+"</div>";
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" "+context[1]+"</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" "+context[1], hint:"Остаток = (1 − n/d) · всё", detailed:det});
}

/* =====================================================================
   ТИП 5: Найти целое по проценту и остатку
   Прототип: (подобен типу 4, но с процентами)
   ===================================================================== */
function genType5(rng){
  var p=pick(rng,[20,25,30,35,40,45,60]);
  var remPct=100-p;
  var rem=ri(rng,10,100);
  /* ответ = rem * 100 / remPct */
  var answer = rem * 100 / remPct;
  if(Math.abs(answer-Math.round(answer))>0.01){
    rem = remPct * ri(rng,1,5);
    answer = rem * 100 / remPct;
  }
  var context=pick(rng,[
    ["участка","соток","участка"],
    ["поля","га","поля"],
    ["леса","га","леса"]
  ]);
  var qText = "На "+context[0]+" "+rem+" "+context[1]+" занимает огород, что составляет "+fmtF(p/100)+" "+context[0]+". Чему равна площадь "+context[0]+"?"+NOTE;
  var det = "";
  det += step("Анализ условия", p+"% "+context[0]+" = "+rem+" "+context[1]+". Значит, "+p+"% = 0,"+(p<10?"0":"")+p+".");
  det += step("Решение", "Пусть площадь "+context[0]+" — x "+context[1]+".<br/>"+
    "0,"+(p<10?"0":"")+p+" · x = "+rem+".<br/>"+
    "x = "+rem+" ÷ 0,"+(p<10?"0":"")+p+" = "+rem+" · 100 / "+p+" = <b>"+fmt(answer)+"</b> ("+context[1]+").");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" "+context[1]+"</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" "+context[1], hint:p+"% = 0,"+(p<10?"0":"")+p+" → x = значение ÷ дробь", detailed:det});
}

/* =====================================================================
   ТИП 6: Состав сплава
   Прототип: "60% медь, 25% цинк, остальное никель. Никель = 1.8 кг."
   ===================================================================== */
function genType6(rng){
  var p1=pick(rng,[40,50,55,60]);
  var p2=pick(rng,[20,25,30,35]);
  var p3=100-p1-p2;
  var mass3=ri(rng,1,5);
  if(p3<=0||p3>25)p3=15;
  p1=60;p2=25;p3=15; /* как в прототипе */
  mass3=pick(rng,[1.2,1.5,1.8,2.4,3.0]);
  var answer = mass3*100/p3;
  var qText = "Мельхиоровый сплав содержит "+p1+"% меди, "+p2+"% цинка, а остальную часть — никель. Какую массу имел "+pick(rng,["самовар","чайник","поднос"])+" из этого сплава, если масса никеля в нём составляла "+fmt(mass3)+" кг?"+NOTE;
  var det = "";
  det += step("Анализ состава", "Медь: "+p1+"%, цинк: "+p2+"%, никель: 100 − "+p1+" − "+p2+" = "+p3+"%.");
  /* SVG: круговая диаграмма не нужна, отрезок */
  var parts=[p1/100,p2/100,p3/100];
  det += "<div class='svg-center'>"+svgSegment(parts, "Масса: "+fmt(answer)+" кг", ["медь "+p1+"%","цинк "+p2+"%","никель "+p3+"% = "+fmt(mass3)+" кг"], "Состав сплава")+"</div>";
  det += step("Решение", p3+"% массы сплава = "+fmt(mass3)+" кг.<br/>"+
    "0,"+(p3<10?"0":"")+p3+" · x = "+fmt(mass3)+".<br/>"+
    "x = "+fmt(mass3)+" ÷ 0,"+(p3<10?"0":"")+p3+" = "+fmt(mass3)+" · 100 / "+p3+" = <b>"+fmt(answer)+"</b> (кг).");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" кг</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" кг", hint:"Никель = (100−p1−p2)% от массы", detailed:det});
}

/* =====================================================================
   ТИП 7: Вклад под проценты
   Прототип: "6% годовых, прибыль 148.4 тыс. р."
   ===================================================================== */
function genType7(rng){
  var p=pick(rng,[4,5,6,8,10]);
  var profit=pick(rng,[12.0,14.8,24.0,30.0,40.0,148.4]);
  var answer = profit*100/p;
  /* Подберём для красивого ответа */
  answer = ri(rng,200,500);
  profit = answer*p/100;
  profit = Math.round(profit*10)/10;
  answer = profit*100/p;
  var qText = "Вкладчик положил деньги в банк под "+p+"% годовых и в конце года получил "+fmt(profit)+" тыс. р. прибыли. Какая сумма была положена в банк?"+NOTE;
  var det = "";
  det += step("Анализ условия", p+"% годовых — это прибыль от вложенной суммы. Прибыль = "+fmt(profit)+" тыс. р.");
  det += step("Решение", p+"% от суммы вклада = "+fmt(profit)+" тыс. р.<br/>"+
    "0,"+(p<10?"0":"")+p+" · x = "+fmt(profit)+".<br/>"+
    "x = "+fmt(profit)+" ÷ 0,"+(p<10?"0":"")+p+" = "+fmt(profit)+" · 100 / "+p+" = <b>"+fmt(answer)+"</b> (тыс. р).");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" тыс. р</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" тыс. р", hint:p+"% от вклада = прибыль → вклад = прибыль × 100 ÷ p", detailed:det});
}

/* =====================================================================
   ТИП 8: Три бригады (2 этапа)
   Прототип: "1-я 35%, 2-я 60% остатка, 3-я 520."
   ===================================================================== */
function genType8(rng){
  var p1=pick(rng,[25,30,35,40]);
  var p2=pick(rng,[40,50,55,60]);
  var rem3=ri(rng,100,600);
  /* остаток после 1-й: (1-p1/100) */
  /* остаток после 2-й: (1-p1/100)*(1-p2/100) */
  /* rem3 = всего * (1-p1/100)*(1-p2/100) */
  var frac3=(100-p1)/100*(100-p2)/100;
  var answer = rem3/frac3;
  if(Math.abs(answer-Math.round(answer))>0.01){
    /* подберём rem3 так, чтобы ответ был целым */
    answer = ri(rng,1000,5000);
    rem3 = Math.round(answer*frac3);
  }
  var context=pick(rng,[
    ["саженцев ели","саженцев","посадили"],
    ["саженцев деревьев","саженцев","посадили"],
    ["километров дороги","км","отремонтировали"]
  ]);
  var qText = "Три бригады "+context[2]+" "+context[0]+". Первая бригада выполнила "+p1+"% всех "+context[1]+", вторая — "+p2+"% оставшихся "+context[1]+", а третья — остальные "+rem3+" "+context[1]+". Сколько всего "+context[1]+" "+context[2]+"?"+NOTE;
  var det = "";
  det += step("Анализ условия", "1-я бригада: "+p1+"% всех "+context[1]+".<br/>"+
    "Осталось после 1-й: "+(100-p1)+"% = 0,"+(100-p1<10?"0":"")+(100-p1)+".<br/>"+
    "2-я бригада: "+p2+"% от остатка.<br/>"+
    "Осталось после 2-й: 0,"+(100-p1<10?"0":"")+(100-p1)+" · "+(100-p2)+"% = "+frac3.toFixed(4)+".");
  /* SVG */
  var part1=p1/100;
  var part2=(100-p1)/100*p2/100;
  var part3=frac3;
  var parts=[part1,part2,part3];
  det += "<div class='svg-center'>"+svgSegment(parts, "Всего: "+fmt(answer)+" "+context[1], ["1-я: "+p1+"%","2-я: "+p2+"% остатка","3-я: "+rem3], "Распределение по бригадам")+"</div>";
  det += step("Решение", "Третья бригада "+context[2]+" "+frac3.toFixed(4)+" всех "+context[1]+" = "+rem3+".<br/>"+
    "Пусть всего — x.<br/>"+
    frac3.toFixed(4)+" · x = "+rem3+".<br/>"+
    "x = "+rem3+" ÷ "+frac3.toFixed(4)+" = <b>"+fmt(answer)+"</b> ("+context[1]+").");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" "+context[1]+"</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" "+context[1], hint:"Остаток после двух бригад = (1−p1/100)·(1−p2/100)", detailed:det});
}

/* =====================================================================
   ТИП 9: Многоэтапная задача (лесник)
   Прототип: "проехал 18.6 км, потом 5/6 пройденного, осталось 4/15 всего."
   ===================================================================== */
function genType9(rng){
  var d1=pick(rng,[5,6]);
  var n1=d1-1;
  var d2=pick(rng,[12,15]);
  var n2=ri(rng,2,d2-2);
  var firstDist=ri(rng,10,30);
  /* 1-й этап: firstDist км */
  /* 2-й этап: firstDist * n1/d1 */
  var secondDist = firstDist * n1 / d1;
  /* пройдено: firstDist + secondDist */
  var traveled = firstDist + secondDist;
  /* осталось: n2/d2 * всего */
  /* traveled = (1 - n2/d2) * всего */
  /* всего = traveled / (1 - n2/d2) = traveled * d2 / (d2 - n2) */
  var answer = traveled * d2 / (d2 - n2);
  /* Округлим */
  answer = Math.round(answer*10)/10;
  firstDist = Math.round(firstDist*10)/10;
  var qText = "Лесник, объезжая верхом на лошади лесные угодья, сначала проехал "+fmt(firstDist)+" км до сторожки, затем ещё "+frac(n1,d1)+" пройденного пути. После этого ему осталось проехать "+frac(n2,d2)+" всего пути. Сколько километров составляет весь путь лесника?"+NOTE;
  var det = "";
  det += step("Анализ условия", "1-й этап: "+fmt(firstDist)+" км.<br/>"+
    "2-й этап: "+frac(n1,d1)+" от 1-го этапа.<br/>"+
    "Осталось: "+frac(n2,d2)+" всего пути.");
  det += step("Найдём 2-й этап", frac(n1,d1)+" · "+fmt(firstDist)+" = "+fmt(secondDist)+" (км).");
  det += step("Найдём пройденный путь", fmt(firstDist)+" + "+fmt(secondDist)+" = "+fmt(traveled)+" (км).");
  det += step("Найдём весь путь", "Пройдено: "+fmt(traveled)+" = (1 − "+frac(n2,d2)+") · весь путь = "+frac(d2-n2,d2)+" · весь путь.<br/>"+
    frac(d2-n2,d2)+" · x = "+fmt(traveled)+".<br/>"+
    "x = "+fmt(traveled)+" ÷ "+frac(d2-n2,d2)+" = "+fmt(traveled)+" · "+frac(d2,d2-n2)+" = <b>"+fmt(answer)+"</b> (км).");
  /* SVG: отрезок пути */
  var p1=firstDist/answer;
  var p2=secondDist/answer;
  var p3=1-p1-p2;
  var parts=[p1,p2,p3];
  det += "<div class='svg-center'>"+svgSegment(parts, "Весь путь: "+fmt(answer)+" км", [fmt(firstDist)+" км", fmt(secondDist)+" км", n2+"/"+d2], "Путь лесника")+"</div>";
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+" км</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer)+" км", hint:"Пройденный путь = (1 − n2/d2) · весь путь", detailed:det});
}

/* =====================================================================
   ТИП 10 (сложный): Найти число через два условия
   Прототип: "45% числа = 28% от 180."
   ===================================================================== */
function genType10(rng){
  var p1=pick(rng,[35,40,45,50,55]);
  var p2=pick(rng,[20,25,28,30,35]);
  var num=ri(rng,100,300);
  /* p1% от X = p2% от num → X = num * p2 / p1 */
  var answer = num * p2 / p1;
  if(Math.abs(answer-Math.round(answer))>0.01){
    /* подберём num так, чтобы ответ был целым */
    num = p1 * ri(rng,2,5) / gcd(p1,p2);
    num = Math.round(num * p2 / gcd(p1,p2));
    answer = num * p2 / p1;
  }
  var qText = "Найдите число, если "+p1+"% этого числа составляют "+p2+"% от числа "+num+"."+NOTE;
  var det = "";
  det += step("Анализ условия", p1+"% от искомого числа x = "+p2+"% от "+num+".");
  det += step("Найдём правую часть", p2+"% от "+num+" = 0,"+(p2<10?"0":"")+p2+" · "+num+" = "+fmt(num*p2/100)+".");
  det += step("Решим уравнение", p1+"% от x = "+fmt(num*p2/100)+".<br/>"+
    "0,"+(p1<10?"0":"")+p1+" · x = "+fmt(num*p2/100)+".<br/>"+
    "x = "+fmt(num*p2/100)+" ÷ 0,"+(p1<10?"0":"")+p1+" = "+fmt(num*p2/100)+" · 100 / "+p1+" = <b>"+fmt(answer)+"</b>.");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+fmt(answer)+"</span></p>";
  return mkDec({q:qText, a:answer, sol:fmt(answer), hint:p1+"% × x = "+p2+"% × "+num+" → x = "+num+"×"+p2+"÷"+p1, detailed:det});
}

/* ---------- генератор варианта: 10 задач от простого к сложному ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){
  return ALL_TYPES.map(function(gen){return gen(rng);});
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
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="protsenty6")return;
  }
  TZ.TOPICS.push({
    id:"protsenty6",
    subject:"Математика",
    grade:"6 класс",
    title:"Задачи на дроби и проценты",
    variants:40,
    desc:"Тренажёр по математике (6 класс): текстовые задачи на дроби, "+
      "проценты и десятичные дроби. 10 заданий от простого к сложному: "+
      "нахождение числа по части, по проценту, состав сплава, вклады, "+
      "задачи на три бригады, многоэтапные задачи. 40 вариантов. "+
      "После выполнения — подробное пошаговое решение с чертежами SVG.",
    blocks:[{name:"Задачи на дроби и проценты",gen:genVariant,count:10}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
