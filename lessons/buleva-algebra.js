/* =====================================================================
   ДЗ · 10 класс · Информатика (углублённый) · Булева алгебра
   Подключается ПОСЛЕ trenazher-data.js и добавляет ОДНУ тему в TZ.TOPICS:

   ДЗ «Булева алгебра: таблицы истинности» (10 кл, dz:true, 50 вариантов):
     10 заданий — на построение таблиц истинности для базовых операций
     (Конъюнкция ∧, Дизъюнкция ∨, Импликация →, Эквиваленция ↔,
     Исключающее ИЛИ ⊕) и смешанных выражений из 2–3 операций.
     Подсказки не показываются. Результат → XLSX и отправка учителю
     на Яндекс.Диск (папка «10 класс ДЗ булева алгебра»).
     После отправки — подробное решение с заполненной таблицей.

   Тип задания — "tt" (truth table): ученик вводит значения
   результирующего столбца F сверху вниз как строку из 0 и 1
   (например: «0001» для A ∧ B). Проверка — checkTT (добавляется в TZ).
   ===================================================================== */
(function(global){
"use strict";

/* ---------- вспомогательная арифметика и форматирование ---------- */
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* ---------- AST логического выражения ----------
   Узлы:
     {op:"var", name:"A"}                                  — переменная
     {op:"not", a:node}                                    — отрицание ¬A
     {op:"and"|"or"|"impl"|"equiv"|"xor", a:node, b:node}  — бинарная операция
-------------------------------------------------------------------- */
function v(name){return {op:"var",name:name};}
function not(a){return {op:"not",a:a};}
function and(a,b){return {op:"and",a:a,b:b};}
function or(a,b){return {op:"or",a:a,b:b};}
function impl(a,b){return {op:"impl",a:a,b:b};}
function equiv(a,b){return {op:"equiv",a:a,b:b};}
function xor(a,b){return {op:"xor",a:a,b:b};}

/* ---------- вычисление AST на наборе значений переменных ---------- */
function evalNode(n,env){
  if(n.op==="var")return env[n.name]?1:0;
  if(n.op==="not")return evalNode(n.a,env)?0:1;
  var a=evalNode(n.a,env), b=evalNode(n.b,env);
  if(n.op==="and")return (a&&b)?1:0;
  if(n.op==="or")return (a||b)?1:0;
  if(n.op==="impl")return (a===1&&b===0)?0:1;   /* ложь только при 1 → 0 */
  if(n.op==="equiv")return (a===b)?1:0;
  if(n.op==="xor")return (a!==b)?1:0;
  return 0;
}

/* ---------- строковое представление выражения (HTML и plain) ----------
   top=true — внешний уровень (без внешних скобок); false — подвыражение
   (нужны скобки вокруг бинарных операций). */
var SYM_HTML={and:"∧",or:"∨",impl:"→",equiv:"↔",xor:"⊕"};
var SYM_PLAIN={and:"∧",or:"∨",impl:"→",equiv:"↔",xor:"⊕"};
/* top=true — внешний уровень (без внешних скобок); false — подвыражение.
   Для ¬(expr): если expr — бинарная операция, её рендерим с top=true,
   чтобы внешние скобки от ¬ не дублировались скобками от бинарной операции. */
function nodeHtml(n,top){
  if(top===undefined)top=true;
  if(n.op==="var")return n.name;
  if(n.op==="not"){
    var c=n.a;
    if(c.op==="var")return "¬"+c.name;
    if(c.op==="not")return "¬"+nodeHtml(c,false);   /* ¬¬A без лишних скобок */
    return "¬("+nodeHtml(c,true)+")";             /* ¬(A ∨ B) — без двойных скобок */
  }
  var sym=SYM_HTML[n.op];
  var s=nodeHtml(n.a,false)+" "+sym+" "+nodeHtml(n.b,false);
  return top?s:"("+s+")";
}
function nodePlain(n,top){
  if(top===undefined)top=true;
  if(n.op==="var")return n.name;
  if(n.op==="not"){
    var c=n.a;
    if(c.op==="var")return "¬"+c.name;
    if(c.op==="not")return "¬"+nodePlain(c,false);
    return "¬("+nodePlain(c,true)+")";
  }
  var sym=SYM_PLAIN[n.op];
  var s=nodePlain(n.a,false)+" "+sym+" "+nodePlain(n.b,false);
  return top?s:"("+s+")";
}

/* ---------- подсчёт операций в AST ---------- */
function nodeOpCount(n){
  if(n.op==="var")return 0;
  if(n.op==="not")return 1+nodeOpCount(n.a);
  return 1+nodeOpCount(n.a)+nodeOpCount(n.b);
}

/* ---------- сбор переменных из AST (в порядке появления, без повторов) ---------- */
function nodeVars(n,out){
  if(!out)out=[];
  if(n.op==="var"){if(out.indexOf(n.name)<0)out.push(n.name);return out;}
  if(n.op==="not"){nodeVars(n.a,out);return out;}
  nodeVars(n.a,out);nodeVars(n.b,out);return out;
}

/* ---------- генерация строк таблицы истинности ----------
   Переменные сортируем по алфавиту — столбцы идут в порядке A, B, C.
   Для n переменных — 2^n строк; в строке i бит переменной V_j
   (старший бит — первая переменная A). */
function truthRows(varNames){
  var vs=varNames.slice().sort();
  var n=vs.length, count=Math.pow(2,n), rows=[];
  for(var i=0;i<count;i++){
    var row={};
    for(var j=0;j<n;j++){
      row[vs[j]]=(i>>(n-1-j))&1;
    }
    rows.push(row);
  }
  return {vars:vs,rows:rows};
}

/* ---------- вычисление результирующего столбца F ---------- */
function fColumn(node,rows){
  var s="";
  for(var i=0;i<rows.length;i++)s+=evalNode(node,rows[i]);
  return s;
}

/* ---------- HTML таблицы для задания (переменные заполнены, F — пусто) ---------- */
function questionTable(vars,rows){
  var h="<table class='tz-table-fill'>";
  h+="<tr>";
  for(var i=0;i<vars.length;i++)h+="<th>"+vars[i]+"</th>";
  h+="<th>F</th></tr>";
  for(var r=0;r<rows.length;r++){
    h+="<tr>";
    for(var i=0;i<vars.length;i++)h+="<td class='tx'>"+rows[r][vars[i]]+"</td>";
    h+="<td>?</td></tr>";
  }
  h+="</table>";
  return h;
}

/* ---------- HTML таблицы для разбора (переменные и F заполнены, F выделена) ---------- */
function solvedTable(vars,rows,fCol){
  var h="<table class='tz-table-fill tz-table-solved'>";
  h+="<tr>";
  for(var i=0;i<vars.length;i++)h+="<th>"+vars[i]+"</th>";
  h+="<th>F</th></tr>";
  for(var r=0;r<rows.length;r++){
    h+="<tr>";
    for(var i=0;i<vars.length;i++)h+="<td class='tx'>"+rows[r][vars[i]]+"</td>";
    h+="<td class='ty'>"+(fCol[r]||0)+"</td></tr>";
  }
  h+="</table>";
  return h;
}

/* ---------- читаемая строка ответа: «0, 0, 0, 1» ---------- */
function prettyCol(fCol){
  var arr=[];
  for(var i=0;i<fCol.length;i++)arr.push(fCol[i]);
  return arr.join(", ");
}

/* ---------- подпись операции (для подробного решения) ---------- */
var OP_RULES={
  and:"A ∧ B = 1 только если A = 1 и B = 1 (одновременно).",
  or:"A ∨ B = 0 только если A = 0 и B = 0; иначе 1.",
  not:"¬A = 1, если A = 0; ¬A = 0, если A = 1.",
  impl:"A → B = 0 только при A = 1, B = 0; во всех остальных случаях 1 (импликация ложна лишь тогда, когда из истины следует ложь).",
  equiv:"A ↔ B = 1, если значения A и B совпадают; иначе 0.",
  xor:"A ⊕ B = 1, если значения A и B различны; иначе 0 (сложение по модулю 2)."
};

/* ---------- сборка задания типа tt ---------- */
function mkTTTask(node,opts){
  opts=opts||{};
  var vnames=nodeVars(node);
  var tr=truthRows(vnames);
  var fCol=fColumn(node,tr.rows);
  var exprHtml=nodeHtml(node,true);
  var exprPlain=nodePlain(node,true);
  var qTable=questionTable(tr.vars,tr.rows);
  /* Число переменных и операций — для подписи задания */
  var nVars=tr.vars.length, nOps=nodeOpCount(node);
  var intro="Построй таблицу истинности для выражения <span class='dz-code'>F = "
    +exprHtml+"</span> "
    +"(<b>"+nVars+" "+pluralVars(nVars)+"</b>, "
    +nOps+" "+pluralOps(nOps)+"). "
    +"Значения переменных уже проставлены. Запиши значения <b>F</b> сверху вниз "
    +"без пробелов и запятых (например: <span class='dz-code'>0001</span>).";
  var q="<p class='task-intro'>"+intro+"</p>"+qTable;
  var detailed=buildDetailed(node,tr,fCol,exprHtml);
  return {
    type:"tt",
    q:q,
    ans:fCol,                  /* эталон: строка «0001» */
    atext:prettyCol(fCol),     /* для экрана: «0, 0, 0, 1» */
    sol:fCol,                  /* для XLSX — та же строка */
    unit:"F = ",
    placeholder:"напр.: 0001",
    /* подсказки НЕ показываем — поле hint пустое */
    hint:"",
    detailed:detailed,
    /* служебные поля для подробного решения */
    _expr:exprPlain,_nVars:nVars,_nOps:nOps
  };
}

/* ---------- подробное решение: правила + заполненная таблица ---------- */
function buildDetailed(node,tr,fCol,exprHtml){
  var used={};
  collectOps(node,used);
  var opList=Object.keys(used);
  var steps=[];
  steps.push("<b>Выражение:</b> <span class='dz-code'>F = "+exprHtml+"</span>. "
    +"Переменные: <b>"+tr.vars.join(", ")+"</b>; всего строк в таблице: "
    +"<b>"+tr.rows.length+"</b> (2<sup>"+tr.vars.length+"</sup>).");
  steps.push("<b>Используемые операции и их правила:</b>");
  for(var i=0;i<opList.length;i++){
    var op=opList[i];
    steps.push("&bull; "+OP_RULES[op]);
  }
  steps.push("Вычисляем F для каждой строки таблицы (подставляя значения переменных "
    +"и применяя правила операций по порядку, от внутренних подвыражений к внешним):");
  steps.push(solvedTable(tr.vars,tr.rows,fCol));
  steps.push("<b>Ответ:</b> значения столбца F сверху вниз: <span class='dz-code'>"
    +fCol+"</span> ("+prettyCol(fCol)+").");
  var h="<div class='dz-det'>";
  for(var i=0;i<steps.length;i++)h+="<p>"+steps[i]+"</p>";
  h+="</div>";
  return h;
}
/* Сбор множества использованных операций (для правил в разборе). */
function collectOps(n,out){
  if(!out)out={};
  if(n.op==="var")return out;
  if(n.op==="not"){out.not=true;collectOps(n.a,out);return out;}
  out[n.op]=true;
  collectOps(n.a,out);collectOps(n.b,out);
  return out;
}

/* ---------- русский язык: согласование числительных ----------
   «1 переменная», «2/3/4 переменные», «5+ переменных».
   «1 операция», «2/3/4 операции», «5+ операций». */
function pluralVars(n){
  var m10=n%10,m100=n%100;
  if(m10===1&&m100!==11)return"переменная";
  if(m10>=2&&m10<=4&&(m100<10||m100>=20))return"переменные";
  return"переменных";
}
function pluralOps(n){
  var m10=n%10,m100=n%100;
  if(m10===1&&m100!==11)return"операция";
  if(m10>=2&&m10<=4&&(m100<10||m100>=20))return"операции";
  return"операций";
}

/* ---------- генераторы 10 заданий ----------
   План на вариант (от простого к сложному):
     1) Конъюнкция ∧            — 1 операция, 2 переменные
     2) Дизъюнкция ∨            — 1 операция, 2 переменные
     3) Импликация →            — 1 операция, 2 переменные
     4) Эквиваленция ↔          — 1 операция, 2 переменные
     5) Исключающее ИЛИ ⊕       — 1 операция, 2 переменные
     6) Три операции, 2 переменные (¬ + 2 бинарные, или 3 бинарные)
     7) Три операции, 2 переменные (другие комбинации)
     8) Три операции, 3 переменные
     9) Три операции, 3 переменные
     10) Три операции, 3 переменные (наиболее сложные выражения)
   Все смешанные задания используют ровно 3 операции — требование «смешивать
   3 операции» выполнено для заданий 6–10. Подсказки не даются.
-------------------------------------------------------------------- */

/* Случайная пара различных переменных из [A,B,C]. Возвращает массив из двух имён. */
function pair2(rng){
  return shuf(rng,["A","B","C"]).slice(0,2);
}

/* Задания 1–5: одна базовая операция, 2 переменные. */
function genAnd(rng){
  var p=pair2(rng);
  return mkTTTask(and(v(p[0]),v(p[1])));
}
function genOr(rng){
  var p=pair2(rng);
  return mkTTTask(or(v(p[0]),v(p[1])));
}
function genImpl(rng){
  var p=pair2(rng);
  /* случайное направление импликации */
  if(rng()<0.5)return mkTTTask(impl(v(p[0]),v(p[1])));
  return mkTTTask(impl(v(p[1]),v(p[0])));
}
function genEquiv(rng){
  var p=pair2(rng);
  return mkTTTask(equiv(v(p[0]),v(p[1])));
}
function genXor(rng){
  var p=pair2(rng);
  return mkTTTask(xor(v(p[0]),v(p[1])));
}

/* Задание 6: 3 операции, 2 переменные. */
var POOL6=[
  function(rng){var p=pair2(rng);return and(impl(v(p[0]),v(p[1])),or(v(p[0]),v(p[1])));}, /* (A → B) ∧ (A ∨ B) */
  function(rng){var p=pair2(rng);return equiv(or(v(p[0]),v(p[1])),and(v(p[0]),v(p[1])));}, /* (A ∨ B) ↔ (A ∧ B) */
  function(rng){var p=pair2(rng);return and(xor(v(p[0]),v(p[1])),or(v(p[0]),v(p[1])));},   /* (A ⊕ B) ∧ (A ∨ B) */
  function(rng){var p=pair2(rng);return and(not(v(p[0])),impl(v(p[1]),v(p[0])));},         /* ¬A ∧ (B → A) */
  function(rng){var p=pair2(rng);return impl(and(v(p[0]),v(p[1])),not(v(p[0])));},         /* (A ∧ B) → ¬A */
  function(rng){var p=pair2(rng);return or(and(v(p[0]),v(p[1])),not(v(p[0])));},           /* (A ∧ B) ∨ ¬A */
  function(rng){var p=pair2(rng);return or(impl(v(p[0]),v(p[1])),not(v(p[1])));},          /* (A → B) ∨ ¬B */
  function(rng){var p=pair2(rng);return equiv(v(p[0]),or(v(p[1]),not(v(p[0]))));},         /* A ↔ (B ∨ ¬A) */
  function(rng){var p=pair2(rng);return and(not(v(p[0])),or(v(p[0]),v(p[1])));},           /* ¬A ∧ (A ∨ B) */
  function(rng){var p=pair2(rng);return or(not(v(p[0])),and(v(p[0]),v(p[1])));}            /* ¬A ∨ (A ∧ B) */
];
function genTask6(rng){
  return mkTTTask(pick(rng,POOL6)(rng));
}

/* Задание 7: 3 операции, 2 переменные (другой набор, чтобы задания 6 и 7 различались).
   Каждое выражение содержит ровно 3 операции в AST. */
var POOL7=[
  function(rng){var p=pair2(rng);return and(or(v(p[0]),v(p[1])),not(v(p[1])));},            /* (A ∨ B) ∧ ¬B */
  function(rng){var p=pair2(rng);return equiv(and(v(p[0]),v(p[1])),not(v(p[0])));},         /* (A ∧ B) ↔ ¬A */
  function(rng){var p=pair2(rng);return impl(or(v(p[0]),v(p[1])),not(v(p[0])));},           /* (A ∨ B) → ¬A */
  function(rng){var p=pair2(rng);return or(xor(v(p[0]),v(p[1])),not(v(p[0])));},            /* (A ⊕ B) ∨ ¬A */
  function(rng){var p=pair2(rng);return equiv(xor(v(p[0]),v(p[1])),not(v(p[0])));},         /* (A ⊕ B) ↔ ¬A */
  function(rng){var p=pair2(rng);return xor(impl(v(p[0]),v(p[1])),not(v(p[0])));},          /* (A → B) ⊕ ¬A */
  function(rng){var p=pair2(rng);return and(impl(v(p[0]),v(p[1])),impl(v(p[1]),v(p[0])));}, /* (A → B) ∧ (B → A) */
  function(rng){var p=pair2(rng);return and(not(v(p[1])),equiv(v(p[0]),v(p[1])));},         /* ¬B ∧ (A ↔ B) */
  function(rng){var p=pair2(rng);return or(not(and(v(p[0]),v(p[1]))),v(p[0]));},            /* ¬(A ∧ B) ∨ A */
  function(rng){var p=pair2(rng);return or(not(impl(v(p[0]),v(p[1]))),v(p[0]));}            /* ¬(A → B) ∨ A */
];
function genTask7(rng){
  return mkTTTask(pick(rng,POOL7)(rng));
}

/* Задания 8–10: 3 операции, 3 переменные (A, B, C).
   Каждый пул содержит выражения ровно с 3 операциями в AST. */
var POOL8=[
  function(rng){return and(not(v("A")),or(v("B"),v("C")));},        /* ¬A ∧ (B ∨ C) */
  function(rng){return and(not(or(v("A"),v("B"))),v("C"));},        /* ¬(A ∨ B) ∧ C */
  function(rng){return or(and(v("A"),v("B")),not(v("C")));},        /* (A ∧ B) ∨ ¬C */
  function(rng){return and(or(v("A"),v("B")),not(v("C")));},       /* (A ∨ B) ∧ ¬C */
  function(rng){return or(not(v("A")),and(v("B"),v("C")));},       /* ¬A ∨ (B ∧ C) */
  function(rng){return and(v("A"),or(not(v("B")),v("C")));},       /* A ∧ (¬B ∨ C) */
  function(rng){return or(and(v("A"),not(v("B"))),v("C"));},       /* (A ∧ ¬B) ∨ C */
  function(rng){return and(not(v("C")),or(v("A"),v("B")));}        /* ¬C ∧ (A ∨ B) */
];
var POOL9=[
  function(rng){return and(impl(v("A"),v("B")),not(v("C")));},     /* (A → B) ∧ ¬C */
  function(rng){return and(xor(v("A"),v("B")),not(v("C")));},      /* (A ⊕ B) ∧ ¬C */
  function(rng){return or(impl(v("A"),v("B")),not(v("C")));},      /* (A → B) ∨ ¬C */
  function(rng){return impl(or(v("A"),v("B")),not(v("C")));},      /* (A ∨ B) → ¬C */
  function(rng){return equiv(and(v("A"),v("B")),not(v("C")));},    /* (A ∧ B) ↔ ¬C */
  function(rng){return and(not(v("C")),impl(v("A"),v("B")));},     /* ¬C ∧ (A → B) */
  function(rng){return or(not(v("A")),impl(v("B"),v("C")));},      /* ¬A ∨ (B → C) */
  function(rng){return and(not(v("B")),xor(v("A"),v("C")));}       /* ¬B ∧ (A ⊕ C) */
];
var POOL10=[
  function(rng){return and(or(v("A"),v("B")),impl(v("B"),v("C")));},   /* (A ∨ B) ∧ (B → C) */
  function(rng){return and(impl(v("A"),v("B")),impl(v("B"),v("C")));}, /* (A → B) ∧ (B → C) */
  function(rng){return and(impl(v("A"),v("B")),or(v("A"),v("C")));},   /* (A → B) ∧ (A ∨ C) */
  function(rng){return and(not(v("A")),equiv(v("B"),v("C")));},        /* ¬A ∧ (B ↔ C) */
  function(rng){return and(or(v("A"),v("B")),xor(v("A"),v("C")));},    /* (A ∨ B) ∧ (A ⊕ C) */
  function(rng){return equiv(and(v("A"),v("B")),or(v("B"),v("C")));},  /* (A ∧ B) ↔ (B ∨ C) */
  function(rng){return xor(impl(v("A"),v("B")),and(v("B"),v("C")));},  /* (A → B) ⊕ (B ∧ C) */
  function(rng){return or(and(v("A"),v("B")),and(v("A"),v("C")));},    /* (A ∧ B) ∨ (A ∧ C) */
];

function genTask8(rng){return mkTTTask(pick(rng,POOL8)(rng));}
function genTask9(rng){return mkTTTask(pick(rng,POOL9)(rng));}
function genTask10(rng){return mkTTTask(pick(rng,POOL10)(rng));}

/* ---------- генератор варианта (10 заданий) ----------
   Порядок фиксирован (от простого к сложному); внутри каждого слота —
   случайный выбор из пула. Это даёт 50 уникальных вариантов при
   детерминированной генерации от номера варианта. */
function genBulevDz(rng){
  return [
    genAnd(rng),
    genOr(rng),
    genImpl(rng),
    genEquiv(rng),
    genXor(rng),
    genTask6(rng),
    genTask7(rng),
    genTask8(rng),
    genTask9(rng),
    genTask10(rng)
  ];
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
  /* добавим checkTT в TZ, если ещё нет */
  if(!TZ.checkTT)TZ.checkTT=checkTT;

  /* проверим, не зарегистрирована ли уже тема */
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="bulevadz")return;
  }
  TZ.TOPICS.push({
    id:"bulevadz",
    subject:"Информатика",
    grade:"10 класс",
    title:"Булева алгебра: таблицы истинности",
    dz:true,
    variants:50,
    level:"углублённый",
    sample:"",
    fileTitle:"Булева алгебра — таблицы истинности",
    filePrefix:"ДЗ_Булева_алгебра",
    diskFolder:"10 класс ДЗ булева алгебра",
    formIntro:"В каждом задании построй таблицу истинности для выражения F и впиши "
      +"значения результирующего столбца <b>F</b> сверху вниз как строку из 0 и 1 "
      +"без пробелов и запятых (например: <span class='dz-code'>0001</span>). "
      +"Переменные в таблице уже проставлены. Используй правила: "
      +"∧ — одновременно 1; ∨ — хотя бы одна 1; → — 0 только при 1→0; "
      +"↔ — значения совпадают; ⊕ — значения различны; ¬ — инверсия. "
      +"<b>Подсказки в заданиях не даются</b> — решение проверяй сам. "
      +"После отправки открывается подробное решение с заполненной таблицей.",
    desc:"Домашнее задание для 10 класса (углублённый уровень): 10 заданий, "
      +"50 вариантов — построение таблиц истинности для базовых операций "
      +"(Конъюнкция, Дизъюнкция, Импликация, Эквиваленция, Исключающее ИЛИ) "
      +"и смешанных выражений из 2–3 операций с 2–3 переменными. "
      +"Результат — XLSX и отправка учителю на Яндекс.Диск "
      +"(папка «10 класс ДЗ булева алгебра»). Подсказки не показываются.",
    blocks:[{name:"Таблицы истинности: базовые операции и смешанные выражения",gen:genBulevDz,count:10}]
  });
}

/* ---------- проверка столбца F ----------
   input — строка от ученика. Поддерживаемые форматы:
   «0001» / «0,0,0,1» / «0 0 0 1» / «0;0;0;1» / «0_0_0_1»
   Также «t»/«f» и «и»/«л» как 1/0 — приведём к строке 0/1.
   Возвращает true, если нормализованная строка совпадает с task.ans. */
function checkTT(input,task){
  if(!task||task.type!=="tt")return false;
  var s=String(input==null?"":input).trim();
  if(!s)return false;
  /* нормализация: убираем разделители и пробелы */
  s=s.replace(/[\s,;|_·.]/g,"");
  /* приводим к нижнему регистру для «л»/«и», «t»/«f» */
  s=s.toLowerCase();
  /* ложь/истина → 0/1 */
  s=s.replace(/л/g,"0").replace(/и/g,"1").replace(/f/g,"0").replace(/t/g,"1");
  /* контроль: остались только 0 и 1 */
  if(!/^[01]+$/.test(s))return false;
  /* длина должна совпадать с эталоном */
  if(s.length!==task.ans.length)return false;
  return s===task.ans;
}

register();

/* экспорт для автотестов в Node */
if(typeof module!=="undefined"&&module.exports){
  module.exports={
    genBulevDz:genBulevDz,
    checkTT:checkTT,
    evalNode:evalNode,
    nodeHtml:nodeHtml,
    nodePlain:nodePlain,
    nodeOpCount:nodeOpCount,
    nodeVars:nodeVars,
    truthRows:truthRows,
    fColumn:fColumn,
    mkTTTask:mkTTTask,
    /* операции */
    v:v,not:not,and:and,or:or,impl:impl,equiv:equiv,xor:xor
  };
}

})(typeof window!=="undefined"?window:globalThis);
