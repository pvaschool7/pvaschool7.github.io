/* =====================================================================
   Тренажёр · 11 класс · Информатика · ЕГЭ задание 9
   100 вариантов × 1 задание. Анализ электронных таблиц.
   После выполнения — подробное пошаговое решение с Python-кодом.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* ---------- Утилиты для чисел ---------- */
function isEven(n){return n%2===0;}
function isOdd(n){return Math.abs(n%2)===1;}
function countEven(row){return row.filter(isEven).length;}
function countOdd(row){return row.filter(isOdd).length;}
function sumEven(row){return row.filter(isEven).reduce(function(s,n){return s+n;},0);}
function sumOdd(row){return row.filter(isOdd).reduce(function(s,n){return s+n;},0);}
function prodEven(row){var p=1;row.forEach(function(n){if(isEven(n))p*=n;});return p;}
function prodOdd(row){var p=1;row.forEach(function(n){if(isOdd(n))p*=n;});return p;}
function sum(row){return row.reduce(function(s,n){return s+n;},0);}
function max(row){return Math.max.apply(null,row);}
function min(row){return Math.min.apply(null,row);}
function sorted(row){return row.slice().sort(function(a,b){return a-b;});}
function countOf(row,v){return row.filter(function(n){return n===v;}).length;}
function hasRepeat(row){return row.some(function(v){return countOf(row,v)>1;});}
function exactlyOneRepeat(row){
  /* ровно одно число повторяется дважды, остальные различны */
  var reps={};
  row.forEach(function(v){reps[v]=(reps[v]||0)+1;});
  var counts=Object.keys(reps).map(function(k){return reps[k];});
  /* должно быть: одно число со count=2, остальные с count=1 */
  var twos=counts.filter(function(c){return c===2;}).length;
  var ones=counts.filter(function(c){return c===1;}).length;
  return twos===1 && ones===row.length-2;
}
function pairSumGreaterThan(row,target){
  for(var i=0;i<row.length;i++){
    for(var j=i+1;j<row.length;j++){
      if(row[i]+row[j]>target)return true;
    }
  }
  return false;
}
function pairSumLessThan(row,target){
  for(var i=0;i<row.length;i++){
    for(var j=i+1;j<row.length;j++){
      if(row[i]+row[j]<target)return true;
    }
  }
  return false;
}

/* ---------- Генерация таблицы ---------- */
function genTable(rng, rows, cols, minVal, maxVal){
  var t=[];
  for(var r=0;r<rows;r++){
    var row=[];
    for(var c=0;c<cols;c++){
      row.push(ri(rng,minVal,maxVal));
    }
    t.push(row);
  }
  return t;
}

/* ---------- Отрисовка таблицы HTML ---------- */
function renderTable(table, maxRows){
  maxRows = maxRows || table.length;
  var n = Math.min(table.length, maxRows);
  var h="<div class='ege9-table-wrap'><table class='ege9-table'><thead><tr><th>№</th>";
  /* Заголовки столбцов */
  for(var c=0;c<table[0].length;c++){
    h+="<th>"+String.fromCharCode(65+c)+"</th>";
  }
  h+="</tr></thead><tbody>";
  for(var r=0;r<n;r++){
    h+="<tr><td class='row-num'>"+(r+1)+"</td>";
    for(var c=0;c<table[r].length;c++){
      h+="<td>"+table[r][c]+"</td>";
    }
    h+="</tr>";
  }
  h+="</tbody></table></div>";
  if(table.length > n){
    h+="<p style='color:var(--mute);font-size:13px'>… показано "+n+" из "+table.length+" строк.</p>";
  }
  return h;
}

/* ---------- 10 типов условий ---------- */
/* Каждый тип: {desc, pythonCheck, checkFn, genParams} */

var TYPES = [
  /* Тип 1: чётных больше нечётных */
  {
    desc: function(p){return "количество чётных чисел в строке больше количества нечётных";},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(СУММПРОИЗВ(--(ОСТАТ(A1:"+lastCol+"1;2)=0))>СУММПРОИЗВ(--(ОСТАТ(A1:"+lastCol+"1;2)=1));1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "СУММПРОИЗВ(--(ОСТАТ(A1:"+lastCol+"1;2)=0)) считает чётные числа в строке. Знак -- преобразует ИСТИНА/ЛОЖЬ в 1/0. Аналогично для нечётных (ОСТАТ=1).";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    evens = 0\n    odds = 0\n    for x in a:\n        if x % 2 == 0:\n            evens += 1\n        else:\n            odds += 1\n    if evens > odds:\n        count += 1\nprint(count)"},
    check: function(row){return countEven(row) > countOdd(row);}
  },
  /* Тип 2: сумма чётных больше суммы нечётных */
  {
    desc: function(p){return "сумма чётных чисел больше суммы нечётных";},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(СУММПРОИЗВ(A1:"+lastCol+"1;--(ОСТАТ(A1:"+lastCol+"1;2)=0))>СУММПРОИЗВ(A1:"+lastCol+"1;--(ОСТАТ(A1:"+lastCol+"1;2)=1));1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "СУММПРОИЗВ(A1:"+lastCol+"1;--(ОСТАТ(A1:"+lastCol+"1;2)=0)) считает сумму чётных чисел (умножает значение на 1 если чётное, на 0 если нечётное).";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    s_even = 0\n    s_odd = 0\n    for x in a:\n        if x % 2 == 0:\n            s_even += x\n        else:\n            s_odd += x\n    if s_even > s_odd:\n        count += 1\nprint(count)"},
    check: function(row){return sumEven(row) > sumOdd(row);}
  },
  /* Тип 3: наибольшее меньше суммы остальных */
  {
    desc: function(p){return "наибольшее из чисел строки меньше суммы трёх остальных";},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(МАКС(A1:"+lastCol+"1)<СУММ(A1:"+lastCol+"1)-МАКС(A1:"+lastCol+"1);1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "СУММ(A1:"+lastCol+"1)-МАКС(...) — это сумма всех чисел без наибольшего. Если МАКС меньше этой суммы — условие выполнено.";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    mx = max(a)\n    s = sum(a) - mx\n    if mx < s:\n        count += 1\nprint(count)"},
    check: function(row){var mx=max(row);var s=sum(row)-mx;return mx < s;}
  },
  /* Тип 4: ровно одно число повторяется дважды */
  {
    desc: function(p){return "ровно одно число в строке повторяется дважды, остальные числа различны";},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(СУММПРОИЗВ(--(СЧЁТЕСЛИ(A1:"+lastCol+"1;A1:"+lastCol+"1)=2))=2;1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "СЧЁТЕСЛИ(A1:"+lastCol+"1;A1:"+lastCol+"1) — для каждой ячейки считает сколько раз её значение встречается. Сравниваем с 2. СУММПРОИЗВ(--(...)=2) считает сколько чисел встречаются ровно 2 раза. Должно быть ровно 2 (одно число повторяется дважды = 2 ячейки со count=2).";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    povt = 0\n    for x in a:\n        if a.count(x) == 2:\n            povt += 1\n    if povt == 2:\n        count += 1\nprint(count)"},
    check: function(row){return exactlyOneRepeat(row);}
  },
  /* Тип 5: пара чисел с суммой больше заданного */
  {
    desc: function(p){return "хотя бы одна пара чисел в строке даёт в сумме больше "+p.target;},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(НАИБОЛЬШИЙ(A1:"+lastCol+"1;1)+НАИБОЛЬШИЙ(A1:"+lastCol+"1;2)>"+p.target+";1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "Если сумма двух наибольших чисел больше "+p.target+", значит хотя бы одна пара даёт сумму больше "+p.target+". НАИБОЛЬШИЙ(диапазон;1) — наибольшее, НАИБОЛЬШИЙ(диапазон;2) — второе по величине.";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    a.sort()\n    if a[-1] + a[-2] > "+p.target+":\n        count += 1\nprint(count)"},
    check: function(row){var s=sorted(row);return s[s.length-1]+s[s.length-2] > this.target;}
  },
  /* Тип 6: квадрат суммы больше произведения */
  {
    desc: function(p){return "квадрат суммы всех чисел строки больше их произведения, умноженного на 2";},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(СУММ(A1:"+lastCol+"1)^2>2*ПРОИЗВЕД(A1:"+lastCol+"1);1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "СУММ(A1:"+lastCol+"1)^2 — квадрат суммы. ПРОИЗВЕД(...) — произведение всех чисел.";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    s = sum(a)\n    p = 1\n    for x in a:\n        p *= x\n    if s*s > 2*p:\n        count += 1\nprint(count)"},
    check: function(row){var s=sum(row);var p=row.reduce(function(acc,n){return acc*n;},1);return s*s > 2*p;}
  },
  /* Тип 7: сумма наибольшего и наименьшего больше N */
  {
    desc: function(p){return "сумма наибольшего и наименьшего чисел строки больше "+p.target;},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(МАКС(A1:"+lastCol+"1)+МИН(A1:"+lastCol+"1)>"+p.target+";1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "МАКС(...) + МИН(...) — сумма наибольшего и наименьшего чисел в строке. Сравниваем с "+p.target+".";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    if max(a) + min(a) > "+p.target+":\n        count += 1\nprint(count)"},
    check: function(row){return max(row) + min(row) > this.target;}
  },
  /* Тип 8: среднее арифметическое больше N */
  {
    desc: function(p){return "среднее арифметическое чисел строки больше "+p.target;},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(СРЗНАЧ(A1:"+lastCol+"1)>"+p.target+";1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "СРЗНАЧ(A1:"+lastCol+"1) — среднее арифметическое чисел строки. Сравниваем с "+p.target+".";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    if sum(a) / len(a) > "+p.target+":\n        count += 1\nprint(count)"},
    check: function(row){return sum(row)/row.length > this.target;}
  },
  /* Тип 9: произведение чётных больше произведения нечётных */
  {
    desc: function(p){return "произведение чётных чисел строки больше произведения нечётных";},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(ПРОИЗВЕД(ЕСЛИ(ОСТАТ(A1:"+lastCol+"1;2)=0;A1:"+lastCol+"1;1))>ПРОИЗВЕД(ЕСЛИ(ОСТАТ(A1:"+lastCol+"1;2)=1;A1:"+lastCol+"1;1));1;0)  (формула массива — нажмите Ctrl+Shift+Enter)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "ЕСЛИ(ОСТАТ(A1:"+lastCol+"1;2)=0; A1:"+lastCol+"1; 1) — для чётных чисел берёт само число, для нечётных — 1. ПРОИЗВЕД(...) — произведение. Это формула массива, вводится через Ctrl+Shift+Enter.";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    p_even = 1\n    p_odd = 1\n    for x in a:\n        if x % 2 == 0:\n            p_even *= x\n        else:\n            p_odd *= x\n    if p_even > p_odd:\n        count += 1\nprint(count)"},
    check: function(row){
      var pe=prodEven(row), po=prodOdd(row);
      if(po===0)return pe>0;
      return pe > po;
    }
  },
  /* Тип 10: сумма чисел делится на N */
  {
    desc: function(p){return "сумма всех чисел строки делится нацело на "+p.target;},
    calcFormula: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "=ЕСЛИ(ОСТАТ(СУММ(A1:"+lastCol+"1);"+p.target+")=0;1;0)";
    },
    calcExplain: function(p){
      var lastCol = String.fromCharCode(64+p.cols);
      return "ОСТАТ(СУММ(...); "+p.target+") — остаток от деления суммы на "+p.target+". Если равен 0 — делится нацело.";
    },
    pyCode: function(p){return "count = 0\nfor line in open('9.txt'):\n    a = list(map(int, line.split()))\n    if sum(a) % "+p.target+" == 0:\n        count += 1\nprint(count)"},
    check: function(row){return sum(row) % this.target === 0;}
  }
];

/* ---------- Формирование задачи ---------- */
function mkTask(opts){
  return {type:"num",q:opts.q,a:opts.a,unit:opts.unit||"",
    hint:opts.hint||"",detailed:opts.detailed||""};
}

function step(title, html){
  return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";
}

/* ---------- Генератор задания ---------- */
function genTask(rng, typeIdx, params, variantNum){
  var type = TYPES[typeIdx];
  var cols = params.cols;
  var rows = params.rows;
  var minV = params.minV;
  var maxV = params.maxV;
  /* Свойство target для типов, где нужно */
  if(params.target !== undefined){
    type.target = params.target;
  }
  
  /* Генерируем таблицу (10000 строк — для вычисления ответа) */
  var table = genTable(rng, rows, cols, minV, maxV);
  
  /* Вычисляем ответ */
  var answer = 0;
  var matchingRows = [];
  table.forEach(function(row, i){
    if(type.check(row)){
      answer++;
      matchingRows.push(i);
    }
  });
  
  /* Формируем условие — БЕЗ таблицы, с номером варианта и ссылкой на ODT */
  var condDesc = type.desc(params);
  var fileLink = "";
  if(typeof global!=="undefined" && global.EGE9_LINKS && global.EGE9_LINKS[variantNum]){
    fileLink = "<a href='"+global.EGE9_LINKS[variantNum]+"' target='_blank' class='btn sm' style='margin:6px 0'>Открыть файл задания (ODT) →</a>";
  }
  var qText = "<div style='background:#eef5ff;border:1px solid #b3d1f7;border-radius:8px;padding:10px 14px;margin-bottom:12px'>"+
    "<b>Вариант "+variantNum+"</b> · Файл электронной таблицы содержит в каждой строке "+cols+
    " натуральных чисел (всего "+rows+" строк).</div>"+
    fileLink+
    "<p>Определите количество строк таблицы, для которых выполнено условие:<br/>"+
    "<b>"+condDesc+"</b>.</p>"+
    "<p>В ответе запишите только число.</p>";
  /* Таблицу в задании НЕ показываем — ученик работает с ODT файлом */
  
  /* Формируем подробное решение */
  var det = "";
  det += step("Анализ условия", "Нужно проверить каждую строку таблицы (всего "+rows+" строк) на условие: <b>"+condDesc+"</b>. "+"Подсчитаем количество строк, где условие выполняется.");
  
  /* Решение 1: в OpenOffice Calc */
  var lastCol = String.fromCharCode(64+params.cols);
  var firstRow = 1, lastRow = params.rows;
  var resultCol = String.fromCharCode(65+params.cols); /* следующий столбец после данных */
  var calcFormula = type.calcFormula(params);
  var calcExplain = type.calcExplain(params);
  det += step("Решение 1. В OpenOffice Calc", 
    "<p>В столбце <b>"+resultCol+"</b> для каждой строки запишите формулу проверки условия.</p>"+
    "<p>В ячейку <b>"+resultCol+"1</b> введите:</p>"+
    "<pre class='calc-formula'>"+calcFormula+"</pre>"+
    "<p>"+calcExplain+"</p>"+
    "<p>Скопируйте формулу вниз до ячейки <b>"+resultCol+lastRow+"</b> (двойной щелчок по маркеру заполнения).</p>"+
    "<p>В отдельной ячейке посчитайте сумму столбца <b>"+resultCol+"</b>:</p>"+
    "<pre class='calc-formula'>=СУММ("+resultCol+firstRow+":"+resultCol+lastRow+")</pre>"+
    "<p>Это и есть ответ: количество строк, удовлетворяющих условию.</p>"
  );
  
  /* Решение 2: на Python */
  det += step("Решение 2. На Python", 
    "<p>Простой Python-код для подсчёта (11 класс):</p>"+
    "<pre>"+type.pyCode(params)+"</pre>"+
    "<p>Файл 9.txt должен содержать таблицу чисел (числа в строке через пробел).</p>"
  );
  
  /* Найдём 2-3 примера строк (подходящих и не подходящих) */
  det += step("Примеры проверки строк", "");
  var examples = [];
  /* Найдём первую подходящую и первую неподходящую */
  var yes = -1, no = -1;
  for(var i=0;i<table.length && (yes<0 || no<0);i++){
    if(type.check(table[i])){
      if(yes<0)yes=i;
    }else{
      if(no<0)no=i;
    }
  }
  var examplesHtml = "";
  if(yes>=0){
    examplesHtml += "<p><b>Строка "+(yes+1)+"</b> (условие выполняется): числа ["+table[yes].join(", ")+"].</p>";
  }
  if(no>=0){
    examplesHtml += "<p><b>Строка "+(no+1)+"</b> (условие не выполняется): числа ["+table[no].join(", ")+"].</p>";
  }
  det += examplesHtml;
  
  det += step("Подсчёт", "Программа проходит по всем "+rows+" строкам, проверяет условие и увеличивает счётчик. "+"Подходящих строк: <b>"+answer+"</b>.");
  det += "<p><b>Ответ:</b> <span class='dz-code'>"+answer+"</span></p>";
  
  return mkTask({q:qText, a:answer, hint:"Проверь каждую строку на условие", detailed:det});
}

/* ---------- Генератор варианта: 1 задание ---------- */
function genVariant(rng, variantNum){
  /* Случайно выбираем тип задачи */
  var typeIdx = ri(rng, 0, TYPES.length-1);
  /* Случайные параметры */
  var cols = pick(rng, [5, 6, 7]);
  var rows = 10000; /* фиксированное количество строк — как в ODT файлах */
  var minV = 1;
  var maxV = ri(rng, 30, 100);
  /* Для типов с target — выбираем значение, которое даст ~30-70% совпадений */
  var target;
  if(typeIdx === 4){ /* пара с суммой > target — средняя пара ~ (minV+maxV) */
    target = Math.round((minV + maxV) * 0.8 + ri(rng, -10, 10));
  }else if(typeIdx === 6){ /* сумма max+min > target — средняя ~ minV+maxV */
    target = Math.round((minV + maxV) * 0.8 + ri(rng, -10, 10));
  }else if(typeIdx === 7){ /* среднее > target — среднее значение ~ (minV+maxV)/2 */
    target = Math.round((minV + maxV) / 2 * 0.85 + ri(rng, -5, 5));
  }else if(typeIdx === 9){ /* сумма делится на target */
    target = pick(rng, [3, 5, 7, 9, 11]);
  }
  /* variantNum передаётся из buildVariant — это номер варианта (1..100) */
  if(!variantNum)variantNum = ri(rng, 1, 100);
  return [genTask(rng, typeIdx, {cols:cols, rows:rows, minV:minV, maxV:maxV, target:target}, variantNum)];
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
    if(TZ.TOPICS[i].id==="ege9")return;
  }
  TZ.TOPICS.push({
    id:"ege9",
    subject:"Информатика",
    grade:"11 класс",
    title:"ЕГЭ · Задание 9 · Анализ таблиц",
    variants:100,
    desc:"Тренажёр по информатике (11 класс): ЕГЭ задание 9 — анализ электронных таблиц. "+
      "10 типов задач: подсчёт строк с условиями на чётность, сумму, наибольшее, "+
      "повторяющиеся числа, пары, среднее, делимость. 100 вариантов. "+
      "После выполнения — подробное пошаговое решение с Python-кодом.",
    blocks:[{name:"ЕГЭ · Задание 9",gen:genVariant,count:1}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,TYPES:TYPES,genTask:genTask};
}

})(typeof window!=="undefined"?window:globalThis);
