/* =====================================================================
   Тренажёр · тема «Неравенства» (математика, 9 класс)
   Подключается ПОСЛЕ trenazher-data.js и добавляет тему в TZ.TOPICS.

   25 заданий, 40 вариантов. Вариант детерминирован (зерно из номера).
   Типы неравенств (по запросу):
     - Полные квадратные (6 шт): дискриминант >0, =0, <0 — все встречаются.
     - Линейные (4 шт).
     - Неполные квадратные двух типов (4 шт):
         · тип A: ax² + c (без bx) — один корень x=0 и один из c/a;
         · тип B: ax² + bx = x·(ax+b) — корни 0 и −b/a.
     - Дробно-рациональные квадратные (5 шт): числитель — квадратный
       трёхчлен, знаменатель — линейный.
     - Распадающиеся (6 шт): произведение линейных/квадратичных множителей,
       в т.ч. дробно-рациональные (знаменатель ≠ 0).
   Строгость (≤, ≥ vs <, >) — случайно.

   Ответ — выбор из 4 вариантов (type "mc"). После завершения — подробное
   решение с чертежом на оси x (SVG): точки закрашенные/выколотые, знаки,
   штриховка решения, правила. Чертёж строится функцией axisSvg(...).
   ===================================================================== */
(function(global){
"use strict";

/* ---------- вспомогательная арифметика и форматирование ---------- */
function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a||1;}
/* НОК для общего знаменателя при сложении дробей */
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}

/* Дробь -> красивая строка. Возвращает {num,den,str,sign} где sign ∈ {"","−"}. */
function frac(n,d){
  if(d===0) d=1;
  var g=gcd(n,d);
  n=Math.round(n/g); d=Math.round(d/g);
  if(d<0){n=-n;d=-d;}
  var sign=n<0?"−":"";
  n=Math.abs(n);
  if(d===1) return {num:n,den:1,str:sign+n,sign:sign};
  return {num:n,den:d,str:sign+texFrac(n,d),sign:sign};
}
function texFrac(n,d){return "<span class='fr'>("+n+")/("+d+")</span>";}
/* "математическая" строка дроби для вопросов (без TeX, просто a/b) */
function fstr(n,d){var f=frac(n,d);return f.sign+f.num+(f.den!==1?"/"+f.den:"");}
/* строка числа: целое или дробь в виде a/b */
function nstr(x){if(Math.abs(x-Math.round(x))<1e-9){var r=Math.round(x);return (r<0?"−":"")+Math.abs(r);} return fstr(Math.round(x*1000),1000);}

/* корни квадратного уравнения a·x²+b·x+c=0; возвращает {d, r1, r2, hasRoots, roots[]}
   r1≤r2 — рациональные корни (если есть), иначе корни как {num,den} */
function quadRoots(a,b,c){
  var D=b*b-4*a*c;
  if(D<0) return {d:D, roots:[], hasRoots:false};
  if(D===0){
    // x = -b/(2a)
    var num=-b, den=2*a, g=gcd(num,den);
    num=Math.round(num/g);den=Math.round(den/g);
    if(den<0){num=-num;den=-den;}
    var r={num:num,den:den};
    return {d:0, roots:[r,r], hasRoots:true};
  }
  var sD=Math.sqrt(D);
  // проверим, является ли D полным квадратом (целые корни)
  var isD=Math.abs(sD-Math.round(sD))<1e-9;
  if(isD){
    var r1n=-b-Math.round(sD), r2n=-b+Math.round(sD), den=2*a;
    var g1=gcd(r1n,den), g2=gcd(r2n,den);
    var r1={num:Math.round(r1n/g1),den:Math.round(den/g1)};
    var r2={num:Math.round(r2n/g2),den:Math.round(den/g2)};
    if(r1.den<0){r1.num=-r1.num;r1.den=-r1.den;}
    if(r2.den<0){r2.num=-r2.num;r2.den=-r2.den;}
    var arr=[r1,r2].sort(cmpR);
    return {d:D, roots:arr, hasRoots:true};
  }
  // иррациональные корни — для тренажёра 9 кл избегаем, вернём как есть
  return {d:D, roots:null, hasRoots:true, irr:true};
}
function cmpR(r1,r2){return valR(r1)-valR(r2);}
function valR(r){return r.num/r.den;}
function rstr(r){return fstr(r.num,r.den);}
/* значение как число с плавающей точкой */
function rnum(r){return r.num/r.den;}

/* ---------- знак неравенства ---------- */
/* sym: "<", "≤", ">", "≥"  и  side: 0 (правая часть f(x) ... 0) */
function randSign(rng){
  var strict=rng()<0.5;
  var less=rng()<0.5;
  return strict?(less?"<":">"):(less?"≤":"≥");
}
function isStrict(s){return s==="<"||s===">";}
function isLess(s){return s==="<"||s==="≤";}
function flipStrict(s){return s==="<"?">":s==="≤"?"≥":s===">"?"<":"≤";}

/* ---------- множество решений и его строковое представление ----------
   solution — массив интервалов: {a:{num,den}|null, b:{num,den}|null, aIncl:bool, bIncl:bool}
   null = бесконечность. Строится из "точек оси" и знака.
*/
function intervalStr(sol){
  var parts=sol.map(function(iv){
    var left= iv.a===null?"(−∞" : (iv.aIncl?"[":"(")+rstr(iv.a);
    var right= iv.b===null?"+∞)" : rstr(iv.b)+(iv.bIncl?"]":")");
    return left+"; "+right;
  });
  return parts.join(" ∪ ");
}
/* объединение подряд идущих касающихся интервалов */
function mergeTouching(sol){
  if(sol.length<2) return sol;
  var out=[sol[0]];
  for(var i=1;i<sol.length;i++){
    var prev=out[out.length-1], cur=sol[i];
    if(prev.b!==null && cur.a!==null && Math.abs(rnum(prev.b)-rnum(cur.a))<1e-9 && prev.bIncl===cur.aIncl){
      // сливаем
      prev.b=cur.b; prev.bIncl=cur.bIncl;
    } else out.push(cur);
  }
  return out;
}

/* ---------- генерация: построение «точек на оси» ----------
   points: массив {r:{num,den}, kind:"numerator"|"denominator", incl:bool}
     incl=true -> точка закрашивается (включается в ответ), если она входит в решение
     kind="denominator" -> точка всегда выколотая (x ≠ ...)
   sign — знак неравенства (знак функции, который ищем)
   Возвращает {solution, intervals_str, allPoints (отсортированные), signs (на интервалах)}
*/
function buildSolution(points, sign, leadingSign){
  /* leadingSign: +1 или -1 — дополнительный знак (например, знак коэффициента
     при x² для квадратного трёхчлена, или знак a для линейного). По умолчанию +1.
     Учитывается как дополнительный множитель знака на каждом интервале. */
  if(typeof leadingSign!=="number") leadingSign=1;
  // сортируем точки по значению
  var pts=points.slice().sort(function(p1,p2){return rnum(p1.r)-rnum(p2.r);});
  // интервалы между точками + за пределами
  var breaks=[null].concat(pts.map(function(p){return p.r;})).concat([null]);
  // интервал = (breaks[i], breaks[i+1])
  var signOfInt=[];
  for(var i=0;i<breaks.length-1;i++){
    // берём середину интервала
    var lo=breaks[i], hi=breaks[i+1];
    var mid;
    if(lo===null && hi===null) mid=0;
    else if(lo===null) mid=rnum(hi)-1;
    else if(hi===null) mid=rnum(lo)+1;
    else mid=(rnum(lo)+rnum(hi))/2;
    // знак произведения (x−root) для каждой точки: для numerator — множитель (x−r),
    // для denominator — (x−r) в знаменателе (знак тот же, но точка выколота)
    var sgn=leadingSign;
    for(var k=0;k<points.length;k++){
      var p=points[k];
      sgn*= ((mid - rnum(p.r))>0?1:((mid - rnum(p.r))<0?-1:0));
    }
    signOfInt.push(sgn);
  }
  // решение: интервалы, где signOfInt соответствует запрошенному знаку
  var want;
  if(sign==="<"||sign==="≤") want=-1;
  else want=+1;
  var sol=[];
  for(var i=0;i<breaks.length-1;i++){
    if(signOfInt[i]===want || (signOfInt[i]===0 && (sign==="≤"||sign==="≥"))){
      // границы интервала
      var lo=breaks[i], hi=breaks[i+1];
      var aIncl=false, bIncl=false;
      // левая граница: если lo — это точка-нуль числителя и знак нестрогий -> включаем
      if(lo!==null){
        var pL=pts.filter(function(p){return Math.abs(rnum(p.r)-rnum(lo))<1e-9;})[0];
        if(pL && pL.kind==="numerator" && !isStrict(sign)) aIncl=true;
      }
      if(hi!==null){
        var pH=pts.filter(function(p){return Math.abs(rnum(p.r)-rnum(hi))<1e-9;})[0];
        if(pH && pH.kind==="numerator" && !isStrict(sign)) bIncl=true;
      }
      sol.push({a:lo, b:hi, aIncl:aIncl, bIncl:bIncl});
    }
  }
  sol=mergeTouching(sol);
  // нормализация строки ответа
  var str=intervalStr(sol);
  if(sol.length===0) str="∅";
  else if(sol.length===1 && sol[0].a===null && sol[0].b===null) str="(−∞; +∞)";
  return {solution:sol, str:str, points:pts, signs:signOfInt, breaks:breaks};
}

/* ---------- SVG-чертёж оси ----------
   points: отсортированные {r, kind, incl}
   solution: массив интервалов (для штриховки)
   signs: знаки на интервалах (для подписи)
   Возвращает строку SVG.
*/
function axisSvg(points, solution, signs){
  // диапазон значений: все точки ± запас
  var vals=points.map(function(p){return rnum(p.r);});
  var mn, mx;
  if(vals.length){
    mn=Math.min.apply(null,vals); mx=Math.max.apply(null,vals);
  } else { mn=-1; mx=1; }
  var pad=Math.max(1, (mx-mn)*0.25);
  mn-=pad; mx+=pad;
  // Округлим до целых для подписей делений, добавим 0 если внутри
  var lo=Math.floor(mn), hi=Math.ceil(mx);
  if(lo>0) lo=0; if(hi<0) hi=0;
  // ширина в "единицах"
  var W=560, H=150;
  var axisY=95;
  var margin=42;
  var scale=(W-2*margin)/(hi-lo);
  function xpx(v){return margin+(v-lo)*scale;}
  // SVG строки собираем
  var s="<svg class='tz-axis' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='Чертёж на оси x'>";
  // фон
  s+="<rect x='0' y='0' width='"+W+"' height='"+H+"' fill='none'/>";
  // штриховка решения (полосы над/под осью)
  solution.forEach(function(iv){
    var x1 = iv.a===null? margin : xpx(rnum(iv.a));
    var x2 = iv.b===null? W-margin : xpx(rnum(iv.b));
    // штриховка — диагональные линии
    s+="<rect x='"+x1+"' y='"+(axisY-26)+"' width='"+(x2-x1)+"' height='18' fill='#3a7bd5' fill-opacity='0.16'/>";
    // толстая линия-маркер решения сверху
    s+="<line x1='"+x1+"' y1='"+(axisY-26)+"' x2='"+x2+"' y2='"+(axisY-26)+"' stroke='#3a7bd5' stroke-width='3' stroke-linecap='round'/>";
    // если включающая граница — закрашенный конец; если нет — открытый
    if(iv.a!==null){
      if(iv.aIncl) s+="<circle cx='"+x1+"' cy='"+(axisY-26)+"' r='4' fill='#3a7bd5'/>";
      else s+="<circle cx='"+x1+"' cy='"+(axisY-26)+"' r='4' fill='#fff' stroke='#3a7bd5' stroke-width='2'/>";
    }
    if(iv.b!==null){
      if(iv.bIncl) s+="<circle cx='"+x2+"' cy='"+(axisY-26)+"' r='4' fill='#3a7bd5'/>";
      else s+="<circle cx='"+x2+"' cy='"+(axisY-26)+"' r='4' fill='#fff' stroke='#3a7bd5' stroke-width='2'/>";
    }
  });
  // ось x
  s+="<line x1='"+(margin-12)+"' y1='"+axisY+"' x2='"+(W-margin+18)+"' y2='"+axisY+"' stroke='#2b6cb0' stroke-width='2'/>";
  // стрелка
  s+="<polygon points='"+(W-margin+18)+","+(axisY-6)+" "+(W-margin+28)+","+axisY+" "+(W-margin+18)+","+(axisY+6)+"' fill='#2b6cb0'/>";
  // подпись x
  s+="<text x='"+(W-margin+34)+"' y='"+(axisY+5)+"' font-size='16' font-style='italic' fill='#2b6cb0'>x</text>";
  // деления и подписи целых чисел в диапазоне
  for(var v=lo; v<=hi; v++){
    var xp=xpx(v);
    s+="<line x1='"+xp+"' y1='"+(axisY-4)+"' x2='"+xp+"' y2='"+(axisY+4)+"' stroke='#9aa' stroke-width='1'/>";
    s+="<text x='"+xp+"' y='"+(axisY+22)+"' font-size='12' text-anchor='middle' fill='#7a8896'>"+v+"</text>";
  }
  // точки-корни
  points.forEach(function(p){
    var xp=xpx(rnum(p.r));
    var col = p.kind==="denominator" ? "#c0392b" : "#2b6cb0";
    var filled = (p.kind==="denominator")?false:p.incl;
    if(filled){
      s+="<circle cx='"+xp+"' cy='"+axisY+"' r='5.5' fill='"+col+"'/>";
    } else {
      s+="<circle cx='"+xp+"' cy='"+axisY+"' r='5.5' fill='#fff' stroke='"+col+"' stroke-width='2.2'/>";
    }
    // подпись точки
    var lbl=rstr(p.r);
    s+="<text x='"+xp+"' y='"+(axisY-14)+"' font-size='13' text-anchor='middle' fill='"+col+"'>"+lbl+"</text>";
    // знак на интервалах — подписываем над осью (знак функции)
  });
  // знаки функции на интервалах
  var breaks=[null].concat(points.map(function(p){return p.r;})).concat([null]);
  for(var i=0;i<breaks.length-1;i++){
    var lo2=breaks[i], hi2=breaks[i+1];
    var mid;
    if(lo2===null && hi2===null) mid=0;
    else if(lo2===null) mid=rnum(hi2)-0.6;
    else if(hi2===null) mid=rnum(lo2)+0.6;
    else mid=(rnum(lo2)+rnum(hi2))/2;
    var xmid=xpx(mid);
    var sg=signs[i];
    var st = sg>0?"+":(sg<0?"−":"0");
    // волнообразная кривая знаков (змейка)
    var ytop = axisY-38;
    var ybot = axisY+38;
    // простая подпись знака
    s+="<text x='"+xmid+"' y='"+(sg>0?ytop:ybot)+"' font-size='15' font-weight='700' text-anchor='middle' fill='#5a6b7d'>"+st+"</text>";
    // дуга-змейка (показывает распределение знаков)
    var x1d = lo2===null? margin : xpx(rnum(lo2));
    var x2d = hi2===null? W-margin : xpx(rnum(hi2));
    var yd = sg>0 ? axisY-22 : axisY+22;
    s+="<path d='M "+x1d+" "+axisY+" Q "+xmid+" "+yd+" "+x2d+" "+axisY+"' stroke='#5a6b7d' stroke-width='1.4' fill='none' opacity='0.55'/>";
  }
  s+="</svg>";
  return s;
}

/* ---------- построение «detailed» (HTML с чертежом и правилами) ---------- */
function detailedHtml(cfg){
  /* cfg: {ineq, fStr, kind, points, sol, signVariant, extraRule} */
  var p=cfg.points, sol=cfg.sol;
  var h="";
  h+="<div class='dz-det'>";
  h+="<p><b>Решение:</b></p>";
  if(cfg.intro) h+="<p>"+cfg.intro+"</p>";
  if(cfg.fStr) h+="<p>Рассмотрим функцию: <span class='dz-code'>"+cfg.fStr+"</span>.</p>";
  if(cfg.domain) h+="<p><b>Область определения:</b> "+cfg.domain+"</p>";
  if(cfg.roots) h+="<p><b>Нули:</b> "+cfg.roots+"</p>";
  if(cfg.dInfo) h+="<p><b>Дискриминант:</b> "+cfg.dInfo+"</p>";
  h+="<p>Отмечаем на оси x корни числителя (закрашенные, если неравенство нестрогое) и корни знаменателя (всегда выколотые — на них функция не определена). Определяем знаки функции на интервалах методом интервалов.</p>";
  h+="<p>"+axisSvg(p, sol.solution, sol.signs)+"</p>";
  h+="<p>Решение — те интервалы, где знак функции соответствует знаку неравенства.</p>";
  if(cfg.rule) h+="<p><b>Правило:</b> "+cfg.rule+"</p>";
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+sol.str+"</span></p>";
  h+="</div>";
  return h;
}

/* ---------- генерация вариантов ответа (mc) ----------
   sol.str — правильный. Строим 3 неправильных, отличающихся скобками/границами/объединением.
*/
function distractors(sol, rng, allRoots){
  var correct=sol.str;
  var res=[correct];
  // генерируем варианты: перевернуть включение границ, убрать часть решения, добавить лишнее
  // 1) "противоположное" по знаку
  var opp = oppositeSolution(sol);
  if(opp && opp!==correct) res.push(opp);
  // 2) сделать все границы круглыми
  var allRound = roundAll(sol);
  if(allRound && allRound!==correct && !~res.indexOf(allRound)) res.push(allRound);
  // 3) сделать все квадратными
  var allSquare = squareAll(sol);
  if(allSquare && allSquare!==correct && !~res.indexOf(allSquare)) res.push(allSquare);
  // 4) только "левую" часть
  var leftOnly = leftPart(sol);
  if(leftOnly && leftOnly!==correct && !~res.indexOf(leftOnly)) res.push(leftOnly);
  // 5) объединение с добавлением лишнего интервала
  var extra = addExtraInterval(sol, allRoots, rng);
  if(extra && extra!==correct && !~res.indexOf(extra)) res.push(extra);
  // уникальные, берем первые 4, перемешиваем
  var uniq=[];
  for(var i=0;i<res.length && uniq.length<4;i++){if(!~uniq.indexOf(res[i])) uniq.push(res[i]);}
  // если меньше 4 — добавим "всё R" или пустое
  var candidates=["(−∞; +∞)", "решений нет", "x ∈ ∅", "[0; +∞)", "(−∞; 0]"];
  for(var j=0;j<candidates.length && uniq.length<4;j++){
    if(!~uniq.indexOf(candidates[j])) uniq.push(candidates[j]);
  }
  // перемешиваем
  var shuffled=[];
  var order=[];
  for(var k=0;k<uniq.length;k++) order.push(k);
  // детерминированный shuffle
  for(var m=order.length-1;m>0;m--){var jj=Math.floor(rng()*(m+1));var t=order[m];order[m]=order[jj];order[jj]=t;}
  for(var n=0;n<order.length;n++) shuffled.push(uniq[order[n]]);
  return {opts:shuffled, c:correct};
}
function oppositeSolution(sol){
  // меняем знак решения: включение <-> исключение (где можно)
  try{
    var parts=sol.solution.map(function(iv){
      var aIncl=!iv.aIncl, bIncl=!iv.bIncl;
      // но бесконечности всегда круглые
      if(iv.a===null) aIncl=false;
      if(iv.b===null) bIncl=false;
      var left= iv.a===null?"(−∞" : (aIncl?"[":"(")+rstr(iv.a);
      var right= iv.b===null?"+∞)" : rstr(iv.b)+(bIncl?"]":")");
      return left+"; "+right;
    });
    return parts.join(" ∪ ");
  }catch(e){return null;}
}
function roundAll(sol){
  try{
    var parts=sol.solution.map(function(iv){
      var left= iv.a===null?"(−∞" : "("+rstr(iv.a);
      var right= iv.b===null?"+∞)" : rstr(iv.b)+")";
      return left+"; "+right;
    });
    return parts.join(" ∪ ");
  }catch(e){return null;}
}
function squareAll(sol){
  try{
    var parts=sol.solution.map(function(iv){
      var left= iv.a===null?"(−∞" : "["+rstr(iv.a);
      var right= iv.b===null?"+∞)" : rstr(iv.b)+"]";
      return left+"; "+right;
    });
    return parts.join(" ∪ ");
  }catch(e){return null;}
}
function leftPart(sol){
  try{
    if(sol.solution.length===0) return null;
    var iv=sol.solution[0];
    var left= iv.a===null?"(−∞" : (iv.aIncl?"[":"(")+rstr(iv.a);
    var right= iv.b===null?"+∞)" : rstr(iv.b)+(iv.bIncl?"]":")");
    return left+"; "+right;
  }catch(e){return null;}
}
function addExtraInterval(sol, allRoots, rng){
  try{
    if(!allRoots || allRoots.length===0) return null;
    var base=sol.str;
    var r=allRoots[Math.floor(rng()*allRoots.length)];
    var rs=rstr(r);
    // добавим выколотый интервал вокруг другого корня
    return base+" ∪ ("+rs+"; "+rs+")";
  }catch(e){return null;}
}

/* =====================================================================
   ГЕНЕРАТОРЫ НЕРАВЕНСТВ (возвращают по 1 заданию)
   ===================================================================== */

/* общий сборщик задания */
function mkTask(ineqStr, points, sign, cfg){
  var sol=buildSolution(points, sign, cfg.leadingSign||1);
  var dc=distractors(sol, cfg.rng, points.map(function(p){return p.r;}));
  // точка-нуль числителя получает incl = !strict (закрашена, если нестрогое)
  points.forEach(function(p){
    if(p.kind==="numerator") p.incl = !isStrict(sign);
  });
  var fullCfg={
    ineq:ineqStr, fStr:cfg.fStr, domain:cfg.domain, roots:cfg.roots, dInfo:cfg.dInfo,
    intro:cfg.intro, rule:cfg.rule,
    points:points, sol:sol
  };
  return {type:"mc", q:cfg.q, c:dc.c, opts:dc.opts,
          hint:cfg.hint||"Разложи на множители и примени метод интервалов",
          detailed:detailedHtml(fullCfg)};
}

/* ---- 1. Полные квадратные (6 шт) ----
   ax² + bx + c sign 0. Контролируем D: >0, =0, <0.
   r1, r2 — целые корни (для D>0); для D=0 — один корень; для D<0 — нет корней.
*/
function genFullQuadratic(rng, forceD){
  // выбираем знак a (положительный — стандарт, иногда отрицательный)
  var a = pick(rng,[1,1,1,2,2,3,-1,-1,-2]);
  // 3 категории: D>0, D=0, D<0
  var cat = forceD || pick(rng,[">0","=0","<0"]);
  var b, c, roots=[], D;
  if(cat===">0"){
    // два разных целых корня r1<r2, a>0 или a<0
    var r1 = ri(rng,-4,4), r2;
    do{ r2 = ri(rng,-4,4); }while(r2===r1);
    if(r1>r2){var t=r1;r1=r2;r2=t;}
    // b = -a(r1+r2), c = a*r1*r2
    b = -a*(r1+r2); c = a*r1*r2;
    D = b*b-4*a*c; // D>0 по построению
    roots=[{num:r1,den:1},{num:r2,den:1}];
  } else if(cat==="=0"){
    // один корень r0 (кратный)
    var r0 = ri(rng,-4,4);
    b = -2*a*r0; c = a*r0*r0;
    D = 0;
    roots=[{num:r0,den:1},{num:r0,den:1}];
  } else {
    // D<0: нет действительных корней. Берём a>0, c/a>0, и подберём b так, чтобы D<0
    // простой способ: a=1, c=k>0, b=0 -> D=-4k<0. Или b маленькое.
    a = pick(rng,[1,1,2,-1,-2]);
    if(a>0){
      c = pick(rng,[1,2,3,4,5]) * (rng()<0.5?1:1);
      b = ri(rng,-2,2);
      while(b*b-4*a*c>=0) b = ri(rng,-3,3);
    } else {
      c = -pick(rng,[1,2,3,4,5]);
      b = ri(rng,-2,2);
      while(b*b-4*a*c>=0) b = ri(rng,-3,3);
    }
    D = b*b-4*a*c;
    roots=[];
  }
  var sign = randSign(rng);
  // формула многочлена строкой
  var polyStr = polyToStr(a,b,c,"x");
  var ineqStr = polyStr+" "+sign+" 0";
  var points = roots.map(function(r){return {r:r, kind:"numerator", incl:!isStrict(sign)};});
  var cfg={
    q:"Реши неравенство: <span class='dz-code'>"+ineqStr+"</span>",
    fStr:"f(x) = "+polyStr,
    roots: roots.length? "f(x) = 0 при x = "+roots.map(rstr).join(", ") : "действительных корней нет",
    dInfo: "D = b² − 4ac = "+D+(cat==="=0"?" (= 0, один корень)":(cat===">0"?" (> 0, два корня)":(cat==="<0"?" (< 0, корней нет)":""))),
    intro: cat==="<0"?"Квадратный трёхчлен не имеет действительных корней (D < 0), поэтому он сохраняет знак коэффициента при x² на всей числовой прямой.":null,
    rule: ruleFor(cat, sign, a),
    leadingSign: a>0?1:-1,
    rng:rng
  };
  return mkTask(ineqStr, points, sign, cfg);
}

function ruleFor(cat, sign, a){
  if(cat==="<0"){
    // нет корней; знак f = знак a (ведь f(x)=a(x-x1)(x-x2) -> но нет корней)
    // фактически: f(x) = a·(...) где (...) всегда > 0 (если a и c одного знака и D<0)
    // Знак f на R = знак a (при D<0 и a,c одного знака — f всегда того же знака, что a)
    var aSign = a>0?"+":"−";
    // ищем подходящий знак неравенства: если a>0 и ищем f>0 -> вся ось; f<0 -> пусто
    if(aSign==="+" && (sign===">"||sign==="≥")) return "D < 0 и a > 0, поэтому f(x) > 0 при всех x. Неравенство выполнено всюду: x ∈ (−∞; +∞).";
    if(aSign==="+" && (sign==="<"||sign==="≤")) return "D < 0 и a > 0, поэтому f(x) > 0 при всех x. Неравенство f(x) "+sign+" 0 решений не имеет: x ∈ ∅.";
    if(aSign==="−" && (sign===">"||sign==="≥")) return "D < 0 и a < 0, поэтому f(x) < 0 при всех x. Неравенство f(x) "+sign+" 0 решений не имеет: x ∈ ∅.";
    if(aSign==="−" && (sign==="<"||sign==="≤")) return "D < 0 и a < 0, поэтому f(x) < 0 при всех x. Неравенство выполнено всюду: x ∈ (−∞; +∞).";
  }
  if(cat==="=0"){
    // один корень, f = a(x-x0)². Знак f = знак a (кроме точки x0, где f=0)
    var aSign2 = a>0?"+":"−";
    if(aSign2==="+" && (sign===">" )) return "f(x) = a·(x − x₀)², a > 0, поэтому f(x) ≥ 0 всюду и f(x) = 0 только при x = x₀. Строгое f(x) > 0 выполнено при всех x ≠ x₀.";
    if(aSign2==="+" && (sign==="≥")) return "f(x) = a·(x − x₀)², a > 0, f(x) ≥ 0 всюду. Неравенство f(x) ≥ 0 выполнено при всех x: x ∈ (−∞; +∞).";
    if(aSign2==="+" && (sign==="<" )) return "f(x) = a·(x − x₀)², a > 0, f(x) ≥ 0 всюду. Строгое f(x) < 0 решений не имеет: x ∈ ∅.";
    if(aSign2==="+" && (sign==="≤")) return "f(x) = a·(x − x₀)², a > 0, f(x) ≥ 0 всюду, f(x) = 0 только при x = x₀. Неравенство f(x) ≤ 0 выполнено только при x = x₀.";
    if(aSign2==="−" && (sign===">" )) return "f(x) = a·(x − x₀)², a < 0, f(x) ≤ 0 всюду. Строгое f(x) > 0 решений не имеет: x ∈ ∅.";
    if(aSign2==="−" && (sign==="≥")) return "f(x) = a·(x − x₀)², a < 0, f(x) ≤ 0 всюду, f(x) = 0 только при x = x₀. Неравенство f(x) ≥ 0 выполнено только при x = x₀.";
    if(aSign2==="−" && (sign==="<" )) return "f(x) = a·(x − x₀)², a < 0, f(x) ≤ 0 всюду. Строгое f(x) < 0 выполнено при всех x ≠ x₀.";
    if(aSign2==="−" && (sign==="≤")) return "f(x) = a·(x − x₀)², a < 0, f(x) ≤ 0 всюду. Неравенство f(x) ≤ 0 выполнено при всех x: x ∈ (−∞; +∞).";
  }
  return "Раскладываем квадратный трёхчлен на множители a·(x − x₁)·(x − x₂), отмечаем корни на оси, определяем знаки на интервалах и выбираем те, где знак функции соответствует знаку неравенства. Закрашиваем корни, если неравенство нестрогое (≤, ≥); выкалываем — если строгое (<, >).";
}

/* ---- 2. Линейные (4 шт) ----
   ax + b sign 0. Простой: один корень x0 = -b/a.
*/
function genLinear(rng){
  var a = ri(rng,-7,7); if(a===0) a=1;
  var b = ri(rng,-9,9);
  // корень x0 = -b/a
  var x0 = -b/a;
  // представим как дробь
  var g=gcd(Math.round(-b),a);
  var r={num:Math.round(-b/g), den:Math.round(a/g)};
  if(r.den<0){r.num=-r.num;r.den=-r.den;}
  var sign=randSign(rng);
  // при делении на отрицательный a знак меняется... но мы через построение решения
  // решение: ax+b sign 0 -> x sign (-b/a), но если a<0 знак翻转
  // построим через "точки на оси" (одна точка — корень)
  var points=[{r:r, kind:"numerator", incl:!isStrict(sign)}];
  // формула: линейное ax + b (a — при x, b — свободный)
  var polyStr=polyToStr(0,a,b,"x");
  var ineqStr=polyStr+" "+sign+" 0";
  var cfg={
    q:"Реши неравенство: <span class='dz-code'>"+ineqStr+"</span>",
    fStr:"f(x) = "+polyStr,
    roots:"f(x) = 0 при x = "+rstr(r),
    intro:"Линейное неравенство. Находим корень f(x) = 0 и определяем знак линейной функции по обе стороны от него.",
    rule: a<0?"Коэффициент при x отрицательный (a < 0), поэтому при делении на a знак неравенства меняется на противоположный. Функция f(x) = ax + b убывает: слева от корня она положительна, справа — отрицательна.":"Коэффициент при x положительный (a > 0), функция f(x) = ax + b возрастает: слева от корня она отрицательна, справа — положительна.",
    leadingSign: a>0?1:-1,
    rng:rng
  };
  return mkTask(ineqStr, points, sign, cfg);
}

/* ---- 3. Неполные квадратные (4 шт): тип A — ax² + c (без bx); тип B — ax² + bx (вынесен x) ---- */
function genIncompleteA(rng){
  // ax² + c sign 0. Корни: x = ±sqrt(-c/a) если -c/a>0; либо нет, либо один (c=0)
  // делаем так, чтобы корни были целыми: a=1, c=-k² -> корни ±k
  var a = pick(rng,[1,1,2,3,-1,-2,-3]);
  var k = ri(rng,1,4);
  var c = -a*k*k; // тогда ax²+c = a(x²-k²)=a(x-k)(x+k)
  var sign=randSign(rng);
  // корни -k, +k (как {num,den})
  var r1={num:-k,den:1}, r2={num:k,den:1};
  var points=[{r:r1,kind:"numerator",incl:!isStrict(sign)},{r:r2,kind:"numerator",incl:!isStrict(sign)}];
  var polyStr=polyToStr(a,0,c,"x");
  var ineqStr=polyStr+" "+sign+" 0";
  var cfg={
    q:"Реши неравенство: <span class='dz-code'>"+ineqStr+"</span>",
    fStr:"f(x) = "+polyStr+" = "+a+"·(x − "+k+")·(x + "+k+")",
    roots:"f(x) = 0 при x = −"+k+", x = "+k,
    intro:"Неполное квадратное неравенство вида ax² + c (без линейного члена). Раскладываем на множители как разность квадратов: ax² + c = a·(x − k)·(x + k), где k² = −c/a.",
    rule: ruleFor(null, sign, a),
    leadingSign: a>0?1:-1,
    rng:rng
  };
  return mkTask(ineqStr, points, sign, cfg);
}

function genIncompleteB(rng){
  // ax² + bx = x·(ax + b). Корни: 0 и -b/a
  var a = pick(rng,[1,1,2,2,3,-1,-2,-3]);
  var b = ri(rng,-7,7);
  if(b===0) b=2;
  // корень 2: x = -b/a
  var g=gcd(-b,a);
  var r2={num:Math.round(-b/g),den:Math.round(a/g)};
  if(r2.den<0){r2.num=-r2.num;r2.den=-r2.den;}
  var r1={num:0,den:1};
  var sign=randSign(rng);
  var points=[{r:r1,kind:"numerator",incl:!isStrict(sign)},{r:r2,kind:"numerator",incl:!isStrict(sign)}];
  var polyStr=polyToStr(a,b,0,"x"); // ax²+bx = x(ax+b)
  var ineqStr=polyStr+" "+sign+" 0";
  var factorStr = "x·("+a+"x + "+b+")";
  var cfg={
    q:"Реши неравенство: <span class='dz-code'>"+ineqStr+"</span>",
    fStr:"f(x) = "+polyStr+" = "+factorStr,
    roots:"f(x) = 0 при x = 0, x = "+rstr(r2),
    intro:"Неполное квадратное неравенство вида ax² + bx (без свободного члена). Выносим общий множитель x: ax² + bx = x·(ax + b). Корни: x = 0 и x = −b/a.",
    rule:"Раскладываем на линейные множители, отмечаем оба корня на оси и определяем знаки произведения на трёх интервалах методом интервалов.",
    leadingSign: a>0?1:-1,
    rng:rng
  };
  return mkTask(ineqStr, points, sign, cfg);
}

/* ---- 4. Дробно-рациональные квадратные (5 шт) ----
   числитель — квадратный трёхчлен (с целыми корнями), знаменатель — линейный.
*/
function genRationalQuadratic(rng){
  // числитель: a(x-r1)(x-r2), a>0 обычно
  var a = pick(rng,[1,1,2,-1,-2]);
  var r1 = ri(rng,-4,4), r2;
  do{ r2 = ri(rng,-4,4); }while(r2===r1);
  if(r1>r2){var t=r1;r1=r2;r2=t;}
  var b = -a*(r1+r2), c = a*r1*r2;
  // знаменатель: линейный (dx + e), корень x0 = -e/d, не равный r1,r2
  var d = pick(rng,[1,1,2,-1,-2]);
  var e = ri(rng,-5,5);
  var x0 = {num:Math.round(-e),den:Math.round(d)};
  var g=gcd(x0.num,x0.den); x0.num=Math.round(x0.num/g); x0.den=Math.round(x0.den/g);
  if(x0.den<0){x0.num=-x0.num;x0.den=-x0.den;}
  // если x0 совпадает с r1 или r2 — меняем e
  var tries=0;
  while((Math.abs(rnum(x0)-r1)<1e-9 || Math.abs(rnum(x0)-r2)<1e-9) && tries<20){
    e=ri(rng,-5,5); x0={num:Math.round(-e),den:Math.round(d)};
    g=gcd(x0.num,x0.den); x0.num=Math.round(x0.num/g);x0.den=Math.round(x0.den/g);
    if(x0.den<0){x0.num=-x0.num;x0.den=-x0.den;}
    tries++;
  }
  var sign=randSign(rng);
  var points=[
    {r:{num:r1,den:1}, kind:"numerator", incl:!isStrict(sign)},
    {r:{num:r2,den:1}, kind:"numerator", incl:!isStrict(sign)},
    {r:x0, kind:"denominator", incl:false}
  ];
  var numStr = polyToStr(a,b,c,"x");
  var denStr = polyToStr(0,d,e,"x");
  var ineqStr = "("+numStr+") / ("+denStr+") "+sign+" 0";
  var cfg={
    q:"Реши неравенство: <span class='dz-code'>"+ineqStr+"</span>",
    fStr:"f(x) = "+numStr+" / ("+denStr+")",
    domain:"знаменатель ≠ 0, поэтому x ≠ "+rstr(x0),
    roots:"числитель = 0 при x = "+r1+", x = "+r2,
    intro:"Дробно-рациональное неравенство. Решаем методом интервалов: числитель раскладываем на множители, знаменатель даём точку, выколотую всегда (на ней функция не определена).",
    rule:"Корни знаменателя всегда выколоты (они не входят в ОДЗ), корни числителя закрашиваем, если неравенство нестрогое, и выкалываем, если строгое. Знак дроби на каждом интервале определяем по знакам числителя и знаменателя.",
    leadingSign: (a*d>0)?1:-1,
    rng:rng
  };
  return mkTask(ineqStr, points, sign, cfg);
}

/* ---- 5. Распадающиеся (6 шт) ----
   произведение двух линейных множителей (x-p)(x-q) sign 0 — это и есть
   "распадающееся" квадратное. Чередуем: обычное (только числитель) и
   дробно-рациональное (со знаменателем).
*/
function genFactored(rng, withDenominator){
  var p1 = ri(rng,-4,4), p2;
  do{ p2 = ri(rng,-4,4); }while(p2===p1);
  if(p1>p2){var t=p1;p1=p2;p2=t;}
  var sign=randSign(rng);
  var points=[
    {r:{num:p1,den:1}, kind:"numerator", incl:!isStrict(sign)},
    {r:{num:p2,den:1}, kind:"numerator", incl:!isStrict(sign)}
  ];
  var numStr = "(x − "+p1+")(x − "+p2+")";
  var ineqStr, domain=null, fStr, intro, rule;
  if(withDenominator){
    // добавим знаменатель-линейный, корень не равный p1,p2
    var dd = pick(rng,[1,1,2,-1,-2]);
    var ee = ri(rng,-5,5);
    var x0={num:Math.round(-ee),den:Math.round(dd)};
    var g=gcd(x0.num,x0.den); x0.num=Math.round(x0.num/g);x0.den=Math.round(x0.den/g);
    if(x0.den<0){x0.num=-x0.num;x0.den=-x0.den;}
    var tries=0;
    while((Math.abs(rnum(x0)-p1)<1e-9 || Math.abs(rnum(x0)-p2)<1e-9) && tries<20){
      ee=ri(rng,-5,5); x0={num:Math.round(-ee),den:Math.round(dd)};
      g=gcd(x0.num,x0.den);x0.num=Math.round(x0.num/g);x0.den=Math.round(x0.den/g);
      if(x0.den<0){x0.num=-x0.num;x0.den=-x0.den;}
      tries++;
    }
    points.push({r:x0, kind:"denominator", incl:false});
    var denStr = polyToStr(0,dd,ee,"x");
    ineqStr = numStr+" / ("+denStr+") "+sign+" 0";
    fStr = "f(x) = "+numStr+" / ("+denStr+")";
    domain = "знаменатель ≠ 0, поэтому x ≠ "+rstr(x0);
    intro="Распадающееся дробно-рациональное неравенство: числитель уже разложен на линейные множители, знаменатель линейный. Решаем методом интервалов.";
    rule="Корни числителя закрашиваем при нестрогом неравенстве и выкалываем при строгом; корень знаменателя всегда выколот (ОДЗ). Знак дроби = произведение знаков всех линейных множителей.";
  } else {
    ineqStr = numStr+" "+sign+" 0";
    fStr = "f(x) = "+numStr;
    intro="Распадающееся неравенство: произведение двух линейных множителей. Решаем методом интервалов — это проще, чем раскрывать скобки.";
    rule="Произведение двух множителей (x − p)(x − q) меняет знак в каждой точке-корне. Отмечаем оба корня на оси, определяем знаки на трёх интервалах, выбираем те, где знак соответствует неравенству. Корни закрашиваем при ≤/≥ и выкалываем при </>.";
  }
  var cfg={
    q:"Реши неравенство: <span class='dz-code'>"+ineqStr+"</span>",
    fStr:fStr, domain:domain,
    roots:"нули числителя: x = "+p1+", x = "+p2,
    intro:intro, rule:rule,
    leadingSign: withDenominator? (dd>0?1:-1) : 1,
    rng:rng
  };
  return mkTask(ineqStr, points, sign, cfg);
}

/* ---------- строка многочлена ax²+bx+c ---------- */
function polyToStr(a,b,c,varn){
  var parts=[];
  // x²
  if(a!==0){
    if(a===1) parts.push(varn+"²");
    else if(a===-1) parts.push("−"+varn+"²");
    else parts.push(a+varn+"²");
  }
  // x
  if(b!==0){
    var bs = b>0? (parts.length?"+ ":"") : "− ";
    var bv = Math.abs(b);
    if(bv===1) parts.push(bs+varn);
    else parts.push(bs+bv+varn);
  }
  // c
  if(c!==0){
    var cs = c>0? (parts.length?"+ ":"") : "− ";
    parts.push(cs+Math.abs(c));
  }
  if(parts.length===0) return "0";
  return parts.join(" ");
}

/* =====================================================================
   ОСНОВНОЙ ГЕНЕРАТОР: 25 заданий на вариант
   ===================================================================== */
function genNeravenstva(rng){
  var tasks=[];
  // 1) Полные квадратные — 6 шт, обязательно все типы D (>0, =0, <0) встречаются
  var dCats=["=0","<0",">0",">0",">0",">0"]; // гарантируем все три
  dCats = shuf2(rng, dCats);
  for(var i=0;i<6;i++) tasks.push(genFullQuadratic(rng, dCats[i]));
  // 2) Линейные — 4 шт
  for(var j=0;j<4;j++) tasks.push(genLinear(rng));
  // 3) Неполные квадратные — 4 шт (по 2 каждого типа)
  for(var k=0;k<2;k++) tasks.push(genIncompleteA(rng));
  for(var k2=0;k2<2;k2++) tasks.push(genIncompleteB(rng));
  // 4) Дробно-рациональные квадратные — 5 шт
  for(var m=0;m<5;m++) tasks.push(genRationalQuadratic(rng));
  // 5) Распадающиеся — 6 шт (3 обычных, 3 дробно-рациональных)
  for(var n=0;n<3;n++) tasks.push(genFactored(rng, false));
  for(var n2=0;n2<3;n2++) tasks.push(genFactored(rng, true));
  return tasks;
}
function shuf2(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* ---------- регистрация темы ---------- */
function getTZ(){
  /* TZ может быть:
     - в браузере: globalThis.TZ (== window.TZ), установлено trenazher-data.js
     - в Node через require: тот же объект, но trenazher-data.js записал его
       в module.exports (т.к. его IIFE получает this=module.exports в CJS).
       Поэтому пытаемся и globalThis.TZ, и require(trenazher-data.js).
  */
  if(global.TZ && global.TZ.TOPICS) return global.TZ;
  if(typeof require==="function"){
    try{
      /* пробуем несколько типичных путей к data-файлу */
      var paths=["./trenazher-data.js","../lessons/trenazher-data.js","/home/z/my-project/work/extracted/lessons/trenazher-data.js"];
      for(var i=0;i<paths.length;i++){
        try{ var tz=require(paths[i]); if(tz&&tz.TOPICS) return tz; }catch(e){}
      }
    }catch(e){}
  }
  return null;
}
function register(){
  var TZ=getTZ();
  if(!TZ || !TZ.TOPICS) return;
  // не добавляем дважды
  for(var i=0;i<TZ.TOPICS.length;i++){
    if(TZ.TOPICS[i].id==="neravenstva") return;
  }
  TZ.TOPICS.push({
    id:"neravenstva",
    subject:"Математика",
    grade:"9 класс",
    title:"Неравенства (метод интервалов)",
    variants:40,
    desc:"Тренажёр по неравенствам для 9 класса: 25 заданий, 40 вариантов. Полные и неполные квадратные, линейные, дробно-рациональные и распадающиеся неравенства — строгие и нестрогие. После выполнения — подробное решение с чертежами на оси x и правилами.",
    blocks:[
      {name:"Неравенства", gen:genNeravenstva, count:25}
    ]
  });
}
register();

})(typeof window!=="undefined"?window:globalThis);
