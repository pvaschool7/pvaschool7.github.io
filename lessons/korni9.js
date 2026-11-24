/* =====================================================================
   Тренажёр · 9 класс · Алгебра · Корни (радикалы)
   40 вариантов × 10 заданий (от простого к сложному).
   Прототипы: умножение/деление/вложенные корни, вынесение множителя.
   После выполнения — подробное пошаговое решение.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

/* ---------- Отрисовка корней как на скрине ----------
   nthroot(n, expr) — корень степени n из expr
   sqrt(expr) — квадратный корень
*/
function nthroot(n, expr){
  if(n===2)return "<span class='sqrt'><span class='rad'>√</span><span class='radicand'>"+expr+"</span></span>";
  return "<span class='nthroot'><span class='degree'>"+n+"</span><span class='rad'>√</span><span class='radicand'>"+expr+"</span></span>";
}
function sqrt(expr){return nthroot(2,expr);}
function sup(n){return "<sup>"+n+"</sup>";}
function frac(num,den){
  return "<span class='frac'><span class='num'>"+num+"</span><span class='den'>"+den+"</span></span>";
}

function step(title,html){
  return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";
}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(выберите верный ответ)</span>";

/* =====================================================================
   ТИП 1 (простой): Умножение корней одинаковой степени
   √a · √b = √(ab)
   ===================================================================== */
function genType1(rng){
  var a=ri(rng,2,12), b=ri(rng,2,12);
  /* НОД для возможного вынесения */
  var g=gcd2(a,b);
  var prod=a*b;
  /* Корень квадратный */
  var ans=nthroot(2, a*b);
  var qText="Выполните умножение: "+sqrt(a)+" · "+sqrt(b)+"."+NOTE;
  var det="";
  det+=step("Правило", "При умножении корней одинаковой степени: "+nthroot(2,"a")+" · "+nthroot(2,"b")+" = "+nthroot(2,"a·b")+".");
  det+=step("Решение", sqrt(a)+" · "+sqrt(b)+" = "+nthroot(2, a+"·"+b)+" = "+nthroot(2, prod)+".");
  /* Проверим, можно ли вынести множитель */
  var sq=findSquare(prod);
  if(sq>1){
    var rest=prod/(sq*sq);
    det+=step("Вынесем множитель", nthroot(2,prod)+" = "+nthroot(2, sq+"²·"+rest)+" = "+sq+(rest>1?nthroot(2,rest):"")+".");
    ans=sq+(rest>1?nthroot(2,rest):"");
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(2,prod), nthroot(2,a+b), sqrt(a)+"·"+sqrt(b)];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"√a·√b = √(ab)", detailed:det});
}

/* =====================================================================
   ТИП 2: Умножение корней разных степеней — ∛a · ⁵√a
   ===================================================================== */
function genType2(rng){
  var n1=pick(rng,[3,4,5]);
  var n2=pick(rng,[3,4,5]);
  while(n2===n1)n2=pick(rng,[3,4,5]);
  var L=lcm2(n1,n2);
  var k1=L/n1, k2=L/n2;
  /* ∛a · ⁵√a = a^(1/3) · a^(1/5) = a^(1/3 + 1/5) = a^((5+3)/15) = a^(8/15) = ¹⁵√(a⁸) */
  var expNum=k1+k2;
  var qText="Выполните умножение: "+nthroot(n1,"a")+" · "+nthroot(n2,"a")+"."+NOTE;
  var det="";
  det+=step("Приведём к общему показателю", nthroot(n1,"a")+" = a"+sup(frac(1,n1))+" = a"+sup(frac(k1,L))+" = "+nthroot(L,"a"+sup(k1))+".");
  det+=step("Аналогично", nthroot(n2,"a")+" = a"+sup(frac(1,n2))+" = a"+sup(frac(k2,L))+" = "+nthroot(L,"a"+sup(k2))+".");
  det+=step("Умножим", nthroot(L,"a"+sup(k1))+" · "+nthroot(L,"a"+sup(k2))+" = "+nthroot(L,"a"+sup(k1)+"·a"+sup(k2))+" = "+nthroot(L,"a"+sup(expNum))+".");
  var ans=nthroot(L,"a"+sup(expNum));
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(L,"a"+sup(k1*k2)), nthroot(n1*n2,"a"), nthroot(L,"a"+sup(k1+k2))+" (это правильный ответ)"];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Привести к общему показателю через НОК", detailed:det});
}

/* =====================================================================
   ТИП 3: Деление корней — ⁴√4 / ⁴√8
   ===================================================================== */
function genType3(rng){
  var n=pick(rng,[3,4,5]);
  var a=pick(rng,[2,3,4,5]);
  var b=a*pick(rng,[2,3,4]);
  /* √(a/b) = √a / √b */
  var qText="Выполните деление: "+nthroot(n,a)+" : "+nthroot(n,b)+"."+NOTE;
  var det="";
  det+=step("Правило", "При делении корней одинаковой степени: "+nthroot(n,"a")+":"+nthroot(n,"b")+" = "+nthroot(n,frac("a","b"))+".");
  det+=step("Решение", nthroot(n,a)+" : "+nthroot(n,b)+" = "+nthroot(n,frac(a,b))+".");
  /* Сократим дробь a/b */
  var g=gcd2(a,b);
  if(g>1){
    var na=a/g, nb=b/g;
    det+=step("Сократим дробь", frac(a,b)+" = "+frac(na,nb)+". Получим: "+nthroot(n,frac(na,nb))+".");
  }
  var ans=nthroot(n,frac(a/g,b/g));
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(n,a)+":"+nthroot(n,b), nthroot(n,frac(a,b)), frac(nthroot(n,a),nthroot(n,b))];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Деление корней = корень из дроби", detailed:det});
}

/* =====================================================================
   ТИП 4: Деление корней разных степеней — ³√100 / √10
   ===================================================================== */
function genType4(rng){
  var n1=pick(rng,[3,4]);
  var n2=2;
  var L=lcm2(n1,n2);
  var k1=L/n1, k2=L/n2;
  /* ³√a / √a = a^(1/3 - 1/2) — может быть отрицательная степень */
  /* Возьмём: ³√(a^k2) / √(a^k1) = L√(a^k2) / L√(a^k1) = L√(a^(k2-k1)) */
  /* Чтобы степень была положительной, k2>k1 */
  /* Для ³√100 / √10: L=6, k1=2, k2=3. 100=10², 10=10¹.
     ³√(10²) / √(10¹) = ⁶√(10⁶) / ⁶√(10³) = ⁶√(10⁶⁻³) = ⁶√(10³) = √10 */
  var base=10;
  var qText="Выполните деление: "+nthroot(n1,"100")+" : "+sqrt("10")+"."+NOTE;
  var det="";
  det+=step("Приведём к общему показателю", "НОК("+n1+", 2) = "+L+".");
  det+=step("Преобразуем", nthroot(n1,"100")+" = "+nthroot(n1,"10²")+" = "+nthroot(L,"10"+sup(2*k1))+".");
  det+=step("", sqrt("10")+" = "+nthroot(L,"10"+sup(1*k2))+".");
  det+=step("Разделим", nthroot(L,"10"+sup(2*k1))+":"+nthroot(L,"10"+sup(k2))+" = "+nthroot(L,"10"+sup(2*k1-k2))+".");
  var exp=2*k1-k2;
  /* Сократим степень */
  var g=gcd2(Math.abs(exp),L);
  var newExp=exp/g, newDeg=L/g;
  if(newDeg===1){
    det+=step("Упростим", nthroot(L,"10"+sup(exp))+" = 10"+sup(newExp)+" = 10.");
    var ans="10";
  }else if(newDeg===2 && newExp===1){
    det+=step("Упростим", nthroot(L,"10"+sup(exp))+" = "+sqrt("10")+".");
    var ans=sqrt("10");
  }else{
    det+=step("Упростим", nthroot(L,"10"+sup(exp))+" = "+nthroot(newDeg,"10"+sup(newExp))+".");
    var ans=nthroot(newDeg,"10"+sup(newExp));
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(L,"10"+sup(exp)), sqrt("10"), "10"];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Привести к общему показателю, потом разделить", detailed:det});
}

/* =====================================================================
   ТИП 5: Вложенные корни — ³√(∛a) = ⁹√a
   ===================================================================== */
function genType5(rng){
  var n1=pick(rng,[3,4,5]);
  var n2=pick(rng,[2,3,4]);
  var L=n1*n2;
  /* ³√(∛a) = a^(1/(3·3)) = a^(1/9) = ⁹√a */
  var qText="Упростите выражение: "+nthroot(n1, nthroot(n2,"a"))+"."+NOTE;
  var det="";
  det+=step("Представим через степени", nthroot(n2,"a")+" = a"+sup(frac(1,n2))+". Тогда "+nthroot(n1,"a"+sup(frac(1,n2)))+" = (a"+sup(frac(1,n2))+")"+sup(frac(1,n1))+" = a"+sup(frac(1,L))+".");
  det+=step("Вернём к корню", "a"+sup(frac(1,L))+" = "+nthroot(L,"a")+".");
  var ans=nthroot(L,"a");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(L,"a"+sup(n1)), nthroot(n1+n2,"a"), nthroot(n1,"a")+"·"+nthroot(n2,"a")];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Корень из корня = корень произведения степеней", detailed:det});
}

/* =====================================================================
   ТИП 6: Вложенные корни со степенью — ³√(⁴√(y¹⁰))
   ===================================================================== */
function genType6(rng){
  var n1=pick(rng,[3,4,5]);
  var n2=pick(rng,[2,3,4]);
  var L=n1*n2;
  /* Подберём степень подкоренного так, чтобы ответ был красивым */
  var exp=ri(rng,2,12);
  /* ³√(⁴√(y^exp)) = ³√(y^(exp/4)) = y^(exp/(4·3)) = y^(exp/12) = ¹²√(y^exp) */
  var qText="Упростите выражение: "+nthroot(n1, nthroot(n2,"y"+sup(exp)))+".."+NOTE;
  var det="";
  det+=step("Преобразуем внутренний корень", nthroot(n2,"y"+sup(exp))+" = y"+sup(frac(exp,n2))+".");
  det+=step("Преобразуем внешний корень", nthroot(n1,"y"+sup(frac(exp,n2)))+" = (y"+sup(frac(exp,n2))+")"+sup(frac(1,n1))+" = y"+sup(frac(exp,L))+".");
  /* Сократим дробь exp/L */
  var g=gcd2(exp,L);
  var newExp=exp/g, newDeg=L/g;
  if(g>1){
    det+=step("Сократим показатель", frac(exp,L)+" = "+frac(newExp,newDeg)+".");
    if(newDeg===1){
      det+=step("Вернём к корню", "y"+sup(newExp)+" = y"+sup(newExp)+".");
      var ans="y"+sup(newExp);
    }else{
      det+=step("Вернём к корню", "y"+sup(frac(newExp,newDeg))+" = "+nthroot(newDeg,"y"+sup(newExp))+".");
      var ans=nthroot(newDeg,"y"+sup(newExp));
    }
  }else{
    det+=step("Вернём к корню", "y"+sup(frac(exp,L))+" = "+nthroot(L,"y"+sup(exp))+".");
    var ans=nthroot(L,"y"+sup(exp));
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(L,"y"+sup(exp)), nthroot(n1+n2,"y"+sup(exp)), "y"+sup(exp)];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Внутренний корень → степень, потом внешний корень", detailed:det});
}

/* =====================================================================
   ТИП 7: Составной корень — √(a·⁴√a)
   ===================================================================== */
function genType7(rng){
  var n2=pick(rng,[3,4,5]);
  /* √(a·⁴√a) = √(a·a^(1/4)) = √(a^(1+1/4)) = √(a^(5/4)) = a^(5/8) = ⁸√(a⁵) */
  var L=2*n2;
  var expNum=n2+1; /* 1 + 1/n2 → числитель: n2+1, знаменатель: n2 → потом /2 → (n2+1)/(2n2) */
  var qText="Упростите выражение: "+sqrt("a · "+nthroot(n2,"a"))+"."+NOTE;
  var det="";
  det+=step("Преобразуем", nthroot(n2,"a")+" = a"+sup(frac(1,n2))+". Тогда a · a"+sup(frac(1,n2))+" = a"+sup(frac(n2+1,n2))+".");
  det+=step("Извлечём корень", sqrt("a"+sup(frac(n2+1,n2)))+" = (a"+sup(frac(n2+1,n2))+")"+sup(frac(1,2))+" = a"+sup(frac(n2+1,L))+".");
  /* Сократим */
  var g=gcd2(n2+1,L);
  var newExp=(n2+1)/g, newDeg=L/g;
  if(g>1){
    det+=step("Сократим", frac(n2+1,L)+" = "+frac(newExp,newDeg)+".");
    var ans=nthroot(newDeg,"a"+sup(newExp));
  }else{
    var ans=nthroot(L,"a"+sup(n2+1));
  }
  det+=step("Ответ", "a"+sup(frac((n2+1)/g, L/g))+" = "+ans+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(L,"a"+sup(n2+1)), sqrt("a")+"·"+nthroot(n2,"a"), nthroot(2*n2,"a")];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Внутренний корень → степень, потом внешний", detailed:det});
}

/* =====================================================================
   ТИП 8: Многоэтажный корень — √(x·√(x·√x))
   ===================================================================== */
function genType8(rng){
  /* √(x·√(x·√x)) = √(x·√(x·x^(1/2))) = √(x·√(x^(3/2))) = √(x·x^(3/4)) = √(x^(7/4)) = x^(7/8) = ⁸√(x⁷) */
  var qText="Упростите выражение: "+sqrt("x · "+sqrt("x · "+sqrt("x")))+"."+NOTE;
  var det="";
  det+=step("Начнём изнутри", sqrt("x")+" = x"+sup(frac(1,2))+".");
  det+=step("Следующий уровень", sqrt("x · x"+sup(frac(1,2)))+" = sqrt(x"+sup(frac(3,2))+") = x"+sup(frac(3,4))+".");
  det+=step("Внешний корень", sqrt("x · x"+sup(frac(3,4)))+" = sqrt(x"+sup(frac(7,4))+") = x"+sup(frac(7,8))+".");
  det+=step("Вернём к корню", "x"+sup(frac(7,8))+" = "+nthroot(8,"x"+sup(7))+".");
  var ans=nthroot(8,"x"+sup(7));
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, nthroot(8,"x"), sqrt("x"), nthroot(4,"x"+sup(3))];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Раскручивай изнутри наружу", detailed:det});
}

/* =====================================================================
   ТИП 9: Вынесение из-под корня — ³√(8x³y⁶/(27a¹²b⁹))
   ===================================================================== */
function genType9(rng){
  /* ³√(8x³y⁶/(27a¹²b⁹)) = ³√(8)/³√(27) · ³√(x³)/³√(a¹²) · ³√(y⁶)/³√(b⁹)
     = 2/3 · x/a⁴ · y²/b³ = 2xy²/(3a⁴b³) */
  var qText="Упростите выражение: "+nthroot(3, frac("8x"+sup(3)+"y"+sup(6), "27a"+sup(12)+"b"+sup(9)))+
    "."+NOTE;
  var det="";
  det+=step("Разобьём на множители", nthroot(3, frac("8x³y⁶","27a¹²b⁹"))+" = "+frac(nthroot(3,"8")+"·"+nthroot(3,"x³")+"·"+nthroot(3,"y⁶"), nthroot(3,"27")+"·"+nthroot(3,"a¹²")+"·"+nthroot(3,"b⁹"))+".");
  det+=step("Извлечём каждый корень", nthroot(3,"8")+"=2, "+nthroot(3,"27")+"=3, "+nthroot(3,"x³")+"=x, "+nthroot(3,"a¹²")+"=a⁴, "+nthroot(3,"y⁶")+"=y², "+nthroot(3,"b⁹")+"=b³.");
  det+=step("Соберём", frac("2 · x · y²","3 · a⁴ · b³")+" = "+frac("2xy²","3a⁴b³")+".");
  var ans=frac("2xy²","3a⁴b³");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, frac("2xy","3ab"), frac("8x³y⁶","27a¹²b⁹"), frac("2x³y⁶","3a¹²b⁹")];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Корень из дроби = дробь корней. Извлекай каждый множитель", detailed:det});
}

/* =====================================================================
   ТИП 10 (сложный): ⁴√(16a¹⁶b¹²/(81x²⁴b⁴))
   ===================================================================== */
function genType10(rng){
  /* ⁴√(16a¹⁶b¹²/(81x²⁴b⁴)) = ⁴√16/⁴√81 · ⁴√(a¹⁶)/⁴√(x²⁴) · ⁴√(b¹²)/⁴√(b⁴)
     = 2/3 · a⁴/x⁶ · b³/b = 2a⁴b²/(3x⁶) */
  var qText="Упростите выражение: "+nthroot(4, frac("16a"+sup(16)+"b"+sup(12), "81x"+sup(24)+"b"+sup(4)))+
    "."+NOTE;
  var det="";
  det+=step("Разобьём", nthroot(4, frac("16a¹⁶b¹²","81x²⁴b⁴"))+" = "+frac(nthroot(4,"16")+"·"+nthroot(4,"a¹⁶")+"·"+nthroot(4,"b¹²"), nthroot(4,"81")+"·"+nthroot(4,"x²⁴")+"·"+nthroot(4,"b⁴"))+".");
  det+=step("Извлечём", nthroot(4,"16")+"=2, "+nthroot(4,"81")+"=3, "+nthroot(4,"a¹⁶")+"=a⁴, "+nthroot(4,"x²⁴")+"=x⁶, "+nthroot(4,"b¹²")+"=b³, "+nthroot(4,"b⁴")+"=b.");
  det+=step("Соберём", frac("2·a⁴·b³","3·x⁶·b")+" = "+frac("2a⁴b²","3x⁶")+" (сократили b³/b = b²).");
  var ans=frac("2a⁴b²","3x⁶");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  var opts=[ans, frac("2a⁴b³","3x⁶b"), frac("4a⁴b³","9x⁶b"), frac("2ab","3x")];
  return mkMC({q:qText, c:ans, opts:opts, sol:ans, hint:"Корень 4-й степени: извлекай 4-е степени из каждого множителя", detailed:det});
}

/* ---------- утилиты ---------- */
function gcd2(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
function lcm2(a,b){return Math.abs(a*b)/gcd2(a,b);}
function findSquare(n){
  for(var i=2;i*i<=n;i++){
    if(n%(i*i)===0)return i;
  }
  return 1;
}

/* ---------- генератор варианта: 10 заданий от простого к сложному ---------- */
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
    if(TZ.TOPICS[i].id==="korni9")return;
  }
  TZ.TOPICS.push({
    id:"korni9",
    subject:"Математика",
    grade:"9 класс",
    title:"Корни (радикалы)",
    variants:40,
    desc:"Тренажёр по алгебре (9 класс): корни n-й степени. "+
      "10 заданий от простого к сложному: умножение и деление корней, "+
      "вложенные корни, многоэтажные корни, вынесение множителя из-под корня. "+
      "40 вариантов. После выполнения — подробное пошаговое решение.",
    blocks:[{name:"Корни (радикалы)",gen:genVariant,count:10}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
