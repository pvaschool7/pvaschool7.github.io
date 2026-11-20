/* =====================================================================
   Тренажёр · 6 класс · Математика · Деление смешанных чисел
   40 вариантов × 12 заданий.
   Тип: formula (ответ — число, можно вводить как a/b, a.5 или a b/c).
   После выполнения — подробное пошаговое решение с отрисовкой дробей.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}
function fmt(n){return String(n).replace(".",",");}

/* ---------- Отрисовка дроби и смешанного числа ---------- */
function frac(num, den){
  return "<span class='frac'><span class='num'>"+num+"</span><span class='den'>"+den+"</span></span>";
}
function mixed(whole, num, den){
  if(num===0)return String(whole);
  return "<span class='mixed'><span class='whole'>"+whole+"</span>"+frac(num, den)+"</span>";
}

/* ---------- Класс Frac: дробь num/den ---------- */
function Frac(num, den){
  this.num = num;
  this.den = den || 1;
  this.simplify();
}
Frac.prototype.simplify = function(){
  if(this.den < 0){this.num = -this.num; this.den = -this.den;}
  if(this.den === 0)this.den = 1;
  var g = gcd(Math.abs(this.num), this.den);
  if(g > 1){this.num = Math.round(this.num/g); this.den = Math.round(this.den/g);}
  return this;
};
Frac.prototype.toMixed = function(){
  var sign = this.num < 0 ? -1 : 1;
  var n = Math.abs(this.num);
  var whole = Math.floor(n / this.den);
  var rem = n - whole * this.den;
  return {whole: sign * whole, num: rem, den: this.den};
};
Frac.prototype.toNumber = function(){return this.num / this.den;};
Frac.prototype.mul = function(o){return new Frac(this.num * o.num, this.den * o.den);};
Frac.prototype.div = function(o){return new Frac(this.num * o.den, this.den * o.num);};
Frac.prototype.add = function(o){
  var l = lcm(this.den, o.den);
  return new Frac(this.num * (l/this.den) + o.num * (l/o.den), l);
};
Frac.prototype.sub = function(o){
  var l = lcm(this.den, o.den);
  return new Frac(this.num * (l/this.den) - o.num * (l/o.den), l);
};
Frac.prototype.pow = function(n){
  var num = Math.pow(this.num, n);
  var den = Math.pow(this.den, n);
  return new Frac(num, den);
};
Frac.prototype.copy = function(){return new Frac(this.num, this.den);};
Frac.prototype.equals = function(o){return this.num===o.num && this.den===o.den;};
Frac.prototype.isInt = function(){return this.den === 1;};
Frac.prototype.isZero = function(){return this.num === 0;};

Frac.prototype.toHtml = function(){
  /* Для ответа: показываем как смешанное, если неправильная */
  if(this.den === 1)return String(this.num);
  if(Math.abs(this.num) >= this.den){
    var m = this.toMixed();
    if(m.num === 0)return String(m.whole);
    return mixed(m.whole, m.num, m.den);
  }
  return frac(this.num, this.den);
};

Frac.prototype.toImproperHtml = function(){
  /* Как неправильную дробь */
  if(this.den === 1)return String(this.num);
  return frac(this.num, this.den);
};

Frac.prototype.toDecStr = function(){
  /* Десятичная запись */
  var v = this.num / this.den;
  return fmt(v.toFixed(v === Math.floor(v) ? 0 : (Math.abs(v*10-Math.round(v*10))<0.01 ? 1 : 2)));
};

Frac.fromMixed = function(w, n, d){
  var sign = (w < 0) ? -1 : 1;
  w = Math.abs(w); n = Math.abs(n);
  return new Frac(sign * (w * d + n), d);
};
Frac.fromInt = function(n){return new Frac(n, 1);};
Frac.fromDec = function(s){
  s = String(s).replace(",", ".");
  var parts = s.split(".");
  if(parts.length === 1)return new Frac(parseInt(s, 10) || 0, 1);
  var intPart = parseInt(parts[0] || "0", 10);
  var decPart = parts[1];
  var den = Math.pow(10, decPart.length);
  var num = parseInt(decPart, 10) || 0;
  var sign = intPart < 0 ? -1 : 1;
  return new Frac(sign * (Math.abs(intPart) * den + num), den);
};

/* ---------- Утилиты для генерации "красивых" дробей ---------- */
/* Случайная правильная дробь a/b, 1 <= a < b <= maxB, gcd(a,b)=1 */
function randProperFrac(rng, maxB){
  for(var i=0;i<30;i++){
    var b = ri(rng, 2, maxB);
    var a = ri(rng, 1, b-1);
    var g = gcd(a, b);
    a = a/g; b = b/g;
    if(b <= maxB && a < b)return new Frac(a, b);
  }
  return new Frac(1, 2);
}
/* Случайное смешанное число w a/b, w >= 1 */
function randMixed(rng, maxW, maxB){
  for(var i=0;i<30;i++){
    var w = ri(rng, 1, maxW);
    var b = ri(rng, 2, maxB);
    var a = ri(rng, 1, b-1);
    var g = gcd(a, b);
    a = a/g; b = b/g;
    if(b <= maxB && a < b)return {w: w, a: a, b: b, frac: Frac.fromMixed(w, a, b)};
  }
  return {w: 1, a: 1, b: 2, frac: Frac.fromMixed(1, 1, 2)};
}

/* ---------- Шаги решения ---------- */
function step(title, html){
  return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";
}

/* ---------- Формирование задачи ---------- */
function mkF(opts){
  return {type:"formula",q:opts.q,fn:opts.fn,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function makeConstFn(value){
  /* Эталонная функция возвращает константу */
  try{
    var fn=new Function("a","b","c","return "+value+";");
    var t=fn(1,2,3);
    if(typeof t!=="number"||!isFinite(t))return null;
    return fn;
  }catch(e){return null;}
}
var NOTE=" <span style='color:var(--mute);font-size:14px'>(введите число, например <span class='dz-code'>3/2</span> или <span class='dz-code'>1.5</span>)</span>";

/* =====================================================================
   ГЕНЕРАТОРЫ 12 ТИПОВ ЗАДАЧ
   ===================================================================== */

/* Тип 1: Деление двух дробей: a/b : c/d
   Прототип: 5/4 : 2/15 */
function genType1(rng){
  for(var attempt=0;attempt<30;attempt++){
    var a=ri(rng,2,9), b=ri(rng,3,12);
    var c=ri(rng,2,9), d=ri(rng,3,12);
    /* Упрощаем, если есть общие множители в a,b или c,d */
    var g1=gcd(a,b); a/=g1; b/=g1;
    var g2=gcd(c,d); c/=g2; d/=g2;
    if(b===d || a===c)continue;
    var f1=new Frac(a,b), f2=new Frac(c,d);
    var res=f1.div(f2);
    if(res.den>20)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Найдите частное: "+frac(a,b)+" : "+frac(c,d)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", frac(a,b)+" : "+frac(c,d));
    det+=step("Заменим деление на умножение",
      "Чтобы разделить на дробь, нужно умножить на обратную: "+
      frac(a,b)+" : "+frac(c,d)+" = "+frac(a,b)+" · "+frac(d,c)+".");
    det+=step("Перемножим числители и знаменатели",
      "Числитель: "+a+" · "+d+" = "+(a*d)+".<br/>Знаменатель: "+b+" · "+c+" = "+(b*c)+".<br/>"+
      "Получаем: "+frac(a*d,b*c)+".");
    /* Сокращение */
    var g=gcd(Math.abs(a*d), b*c);
    if(g>1){
      var n2=(a*d)/g, d2=(b*c)/g;
      det+=step("Сократим на "+g, frac(a*d,b*c)+" = "+frac(n2,d2)+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Деление на дробь = умножение на обратную", detailed:det});
  }
  return genType1(rng);
}

/* Тип 2: Деление дроби на целое: a/b : k
   Прототип: 64/125 : 4 */
function genType2(rng){
  for(var attempt=0;attempt<30;attempt++){
    var k=ri(rng,2,9);
    var b=ri(rng,3,12);
    var a=ri(rng,1,b-1);
    var g=gcd(a,b); a/=g; b/=g;
    if(b>15)continue;
    var f1=new Frac(a,b), f2=Frac.fromInt(k);
    var res=f1.div(f2);
    if(res.den>20)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Найдите частное: "+frac(a,b)+" : "+k+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", frac(a,b)+" : "+k);
    det+=step("Представим целое как дробь",
      k+" = "+frac(k,1)+". Тогда "+frac(a,b)+" : "+frac(k,1)+".");
    det+=step("Заменим деление на умножение",
      frac(a,b)+" · "+frac(1,k)+".");
    det+=step("Перемножим",
      "Числитель: "+a+" · 1 = "+a+".<br/>Знаменатель: "+b+" · "+k+" = "+(b*k)+".<br/>"+
      "Получаем: "+frac(a,b*k)+".");
    var g2=gcd(Math.abs(a), b*k);
    if(g2>1){
      det+=step("Сократим на "+g2, frac(a,b*k)+" = "+frac(a/g2,(b*k)/g2)+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Целое представь как k/1", detailed:det});
  }
  return genType2(rng);
}

/* Тип 3: Деление целого на дробь: k : a/b
   Прототип: 9 : 3/4 */
function genType3(rng){
  for(var attempt=0;attempt<30;attempt++){
    var k=ri(rng,2,15);
    var b=ri(rng,2,9);
    var a=ri(rng,1,b-1);
    var g=gcd(a,b); a/=g; b/=g;
    var f1=Frac.fromInt(k), f2=new Frac(a,b);
    var res=f1.div(f2);
    if(res.den>20 && !res.isInt())continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Найдите частное: "+k+" : "+frac(a,b)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", k+" : "+frac(a,b));
    det+=step("Представим целое как дробь",
      k+" = "+frac(k,1)+". Тогда "+frac(k,1)+" : "+frac(a,b)+".");
    det+=step("Заменим деление на умножение",
      frac(k,1)+" · "+frac(b,a)+".");
    det+=step("Перемножим",
      "Числитель: "+k+" · "+b+" = "+(k*b)+".<br/>Знаменатель: 1 · "+a+" = "+a+".<br/>"+
      "Получаем: "+frac(k*b,a)+".");
    var g2=gcd(Math.abs(k*b), a);
    if(g2>1){
      det+=step("Сократим на "+g2, frac(k*b,a)+" = "+frac((k*b)/g2,a/g2)+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Умножь на обратную дробь", detailed:det});
  }
  return genType3(rng);
}

/* Тип 4: Деление целых чисел: k : m (дробный ответ)
   Прототип: 9 : 4 */
function genType4(rng){
  for(var attempt=0;attempt<30;attempt++){
    var k=ri(rng,3,15);
    var m=ri(rng,2,9);
    if(k % m === 0)continue; /* нужен дробный ответ */
    var g=gcd(k,m);
    if(g===k || g===m)continue;
    var res=new Frac(k,m);
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Найдите частное: "+k+" : "+m+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", k+" : "+m);
    det+=step("Представим как дробь",
      k+" : "+m+" = "+frac(k,m)+".");
    var g2=gcd(k,m);
    if(g2>1){
      det+=step("Сократим на "+g2, frac(k,m)+" = "+frac(k/g2,m/g2)+".");
    }
    /* Если неправильная — представим как смешанное */
    if(res.num >= res.den){
      var mm=res.toMixed();
      if(mm.num>0){
        det+=step("Выделим целую часть",
          res.toImproperHtml()+" = "+res.toHtml()+" (целая часть "+mm.whole+", остаток "+frac(mm.num,mm.den)+").");
      }
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Запиши как дробь k/m и сократи", detailed:det});
  }
  return genType4(rng);
}

/* Тип 5: Деление двух смешанных чисел
   Прототип: 1 3/7 : 1 1/14 */
function genType5(rng){
  for(var attempt=0;attempt<40;attempt++){
    var m1=randMixed(rng, 3, 9);
    var m2=randMixed(rng, 3, 9);
    var res=m1.frac.div(m2.frac);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Найдите частное: "+mixed(m1.w,m1.a,m1.b)+" : "+mixed(m2.w,m2.a,m2.b)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", mixed(m1.w,m1.a,m1.b)+" : "+mixed(m2.w,m2.a,m2.b));
    det+=step("Переведём смешанные в неправильные дроби",
      mixed(m1.w,m1.a,m1.b)+" = "+m1.w+"·"+m1.b+"+"+m1.a+" = "+frac(m1.frac.num, m1.b)+".<br/>"+
      mixed(m2.w,m2.a,m2.b)+" = "+m2.w+"·"+m2.b+"+"+m2.a+" = "+frac(m2.frac.num, m2.b)+".");
    det+=step("Заменим деление на умножение",
      frac(m1.frac.num, m1.b)+" : "+frac(m2.frac.num, m2.b)+" = "+
      frac(m1.frac.num, m1.b)+" · "+frac(m2.b, m2.frac.num)+".");
    det+=step("Перемножим",
      "Числитель: "+m1.frac.num+" · "+m2.b+" = "+(m1.frac.num*m2.b)+".<br/>"+
      "Знаменатель: "+m1.b+" · "+m2.frac.num+" = "+(m1.b*m2.frac.num)+".<br/>"+
      "Получаем: "+frac(m1.frac.num*m2.b, m1.b*m2.frac.num)+".");
    /* Сокращение */
    var rawNum=m1.frac.num*m2.b, rawDen=m1.b*m2.frac.num;
    var g=gcd(Math.abs(rawNum), rawDen);
    if(g>1){
      det+=step("Сократим на "+g, frac(rawNum, rawDen)+" = "+frac(rawNum/g, rawDen/g)+".");
    }
    /* Выделение целой части */
    if(res.num >= res.den && !res.isInt()){
      var mm=res.toMixed();
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Смешанные → неправильные дроби", detailed:det});
  }
  return genType5(rng);
}

/* Тип 6: Деление смешанных и умножение на целое: m a/b : n c/d · k
   Прототип: 7 2/9 : 4 1/3 · 9 */
function genType6(rng){
  for(var attempt=0;attempt<40;attempt++){
    var m1=randMixed(rng, 3, 9);
    var m2=randMixed(rng, 2, 7);
    var k=ri(rng,2,9);
    /* res = m1 / m2 * k */
    var res=m1.frac.div(m2.frac).mul(Frac.fromInt(k));
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Выполните действия: "+mixed(m1.w,m1.a,m1.b)+" : "+mixed(m2.w,m2.a,m2.b)+" · "+k+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", mixed(m1.w,m1.a,m1.b)+" : "+mixed(m2.w,m2.a,m2.b)+" · "+k);
    det+=step("Переведём смешанные в неправильные дроби",
      mixed(m1.w,m1.a,m1.b)+" = "+frac(m1.frac.num, m1.b)+".<br/>"+
      mixed(m2.w,m2.a,m2.b)+" = "+frac(m2.frac.num, m2.b)+".");
    det+=step("Выполним деление",
      frac(m1.frac.num, m1.b)+" : "+frac(m2.frac.num, m2.b)+" = "+
      frac(m1.frac.num, m1.b)+" · "+frac(m2.b, m2.frac.num)+" = "+
      frac(m1.frac.num*m2.b, m1.b*m2.frac.num)+".");
    var r1num=m1.frac.num*m2.b, r1den=m1.b*m2.frac.num;
    var g1=gcd(Math.abs(r1num), r1den);
    if(g1>1){
      r1num/=g1; r1den/=g1;
      det+=step("Сократим на "+g1, "Получим: "+frac(r1num, r1den)+".");
    }
    det+=step("Умножим на "+k,
      frac(r1num, r1den)+" · "+k+" = "+frac(r1num*k, r1den)+".");
    var g2=gcd(Math.abs(r1num*k), r1den);
    if(g2>1){
      det+=step("Сократим на "+g2, frac(r1num*k, r1den)+" = "+frac(r1num*k/g2, r1den/g2)+".");
    }
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Сначала деление, потом умножение", detailed:det});
  }
  return genType6(rng);
}

/* Тип 7: Двойное деление: m a/b : c/d : n e/f
   Прототип: 5 3/7 : 8/21 : 2 3/8 */
function genType7(rng){
  for(var attempt=0;attempt<40;attempt++){
    var m1=randMixed(rng, 2, 7);
    var f2=randProperFrac(rng, 9);
    var m3=randMixed(rng, 2, 7);
    var res=m1.frac.div(f2).div(m3.frac);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Выполните действия: "+mixed(m1.w,m1.a,m1.b)+" : "+frac(f2.num,f2.den)+" : "+mixed(m3.w,m3.a,m3.b)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", mixed(m1.w,m1.a,m1.b)+" : "+frac(f2.num,f2.den)+" : "+mixed(m3.w,m3.a,m3.b));
    det+=step("Переведём смешанные в неправильные",
      mixed(m1.w,m1.a,m1.b)+" = "+frac(m1.frac.num, m1.b)+".<br/>"+
      mixed(m3.w,m3.a,m3.b)+" = "+frac(m3.frac.num, m3.b)+".");
    det+=step("Первое деление",
      frac(m1.frac.num, m1.b)+" : "+frac(f2.num, f2.den)+" = "+
      frac(m1.frac.num, m1.b)+" · "+frac(f2.den, f2.num)+" = "+
      frac(m1.frac.num*f2.den, m1.b*f2.num)+".");
    var r1n=m1.frac.num*f2.den, r1d=m1.b*f2.num;
    var g1=gcd(Math.abs(r1n), r1d);
    if(g1>1){r1n/=g1; r1d/=g1; det+=step("Сократим на "+g1, frac(r1n*g1, r1d*g1)+" = "+frac(r1n, r1d)+".");}
    det+=step("Второе деление",
      frac(r1n, r1d)+" : "+frac(m3.frac.num, m3.b)+" = "+
      frac(r1n, r1d)+" · "+frac(m3.b, m3.frac.num)+" = "+
      frac(r1n*m3.b, r1d*m3.frac.num)+".");
    var r2n=r1n*m3.b, r2d=r1d*m3.frac.num;
    var g2=gcd(Math.abs(r2n), r2d);
    if(g2>1){det+=step("Сократим на "+g2, frac(r2n, r2d)+" = "+frac(r2n/g2, r2d/g2)+".");}
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Деление выполняется слева направо", detailed:det});
  }
  return genType7(rng);
}

/* Тип 8: Умножение и деление: m a/b · n c/d : p e/f
   Прототип: 1 11/21 · 3 8/9 : 1 7/9 */
function genType8(rng){
  for(var attempt=0;attempt<40;attempt++){
    var m1=randMixed(rng, 2, 7);
    var m2=randMixed(rng, 2, 7);
    var m3=randMixed(rng, 2, 7);
    var res=m1.frac.mul(m2.frac).div(m3.frac);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Выполните действия: "+mixed(m1.w,m1.a,m1.b)+" · "+mixed(m2.w,m2.a,m2.b)+" : "+mixed(m3.w,m3.a,m3.b)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", mixed(m1.w,m1.a,m1.b)+" · "+mixed(m2.w,m2.a,m2.b)+" : "+mixed(m3.w,m3.a,m3.b));
    det+=step("Переведём смешанные в неправильные",
      mixed(m1.w,m1.a,m1.b)+" = "+frac(m1.frac.num, m1.b)+".<br/>"+
      mixed(m2.w,m2.a,m2.b)+" = "+frac(m2.frac.num, m2.b)+".<br/>"+
      mixed(m3.w,m3.a,m3.b)+" = "+frac(m3.frac.num, m3.b)+".");
    det+=step("Умножение первых двух дробей",
      frac(m1.frac.num, m1.b)+" · "+frac(m2.frac.num, m2.b)+" = "+
      frac(m1.frac.num*m2.frac.num, m1.b*m2.b)+".");
    var r1n=m1.frac.num*m2.frac.num, r1d=m1.b*m2.b;
    var g1=gcd(Math.abs(r1n), r1d);
    if(g1>1){r1n/=g1; r1d/=g1; det+=step("Сократим на "+g1, frac(r1n*g1, r1d*g1)+" = "+frac(r1n, r1d)+".");}
    det+=step("Деление на третью дробь",
      frac(r1n, r1d)+" : "+frac(m3.frac.num, m3.b)+" = "+
      frac(r1n, r1d)+" · "+frac(m3.b, m3.frac.num)+" = "+
      frac(r1n*m3.b, r1d*m3.frac.num)+".");
    var r2n=r1n*m3.b, r2d=r1d*m3.frac.num;
    var g2=gcd(Math.abs(r2n), r2d);
    if(g2>1){det+=step("Сократим на "+g2, frac(r2n, r2d)+" = "+frac(r2n/g2, r2d/g2)+".");}
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Умножение и деление — слева направо", detailed:det});
  }
  return genType8(rng);
}

/* Тип 9: Сложное со скобками: (a/b + c/d) : m/n
   Прототип: (2 2/3 + 1 5/6) : 4 1/2 */
function genType9(rng){
  for(var attempt=0;attempt<40;attempt++){
    var m1=randMixed(rng, 2, 7);
    var m2=randMixed(rng, 2, 7);
    var m3=randMixed(rng, 2, 7);
    var sumF=m1.frac.add(m2.frac);
    var res=sumF.div(m3.frac);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Вычислите: ("+mixed(m1.w,m1.a,m1.b)+" + "+mixed(m2.w,m2.a,m2.b)+") : "+mixed(m3.w,m3.a,m3.b)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", "("+mixed(m1.w,m1.a,m1.b)+" + "+mixed(m2.w,m2.a,m2.b)+") : "+mixed(m3.w,m3.a,m3.b));
    det+=step("Переведём смешанные в неправильные",
      mixed(m1.w,m1.a,m1.b)+" = "+frac(m1.frac.num, m1.b)+".<br/>"+
      mixed(m2.w,m2.a,m2.b)+" = "+frac(m2.frac.num, m2.b)+".<br/>"+
      mixed(m3.w,m3.a,m3.b)+" = "+frac(m3.frac.num, m3.b)+".");
    /* Сложение в скобках */
    var L=lcm(m1.b, m2.b);
    var s1n=m1.frac.num*(L/m1.b), s2n=m2.frac.num*(L/m2.b);
    det+=step("Сложим в скобках (общий знаменатель "+L+")",
      frac(m1.frac.num, m1.b)+" + "+frac(m2.frac.num, m2.b)+" = "+
      frac(s1n, L)+" + "+frac(s2n, L)+" = "+frac(s1n+s2n, L)+".");
    var sg=gcd(Math.abs(s1n+s2n), L);
    if(sg>1){
      det+=step("Сократим на "+sg, frac(s1n+s2n, L)+" = "+frac((s1n+s2n)/sg, L/sg)+".");
    }
    det+=step("Разделим на "+mixed(m3.w,m3.a,m3.b),
      sumF.toImproperHtml()+" : "+frac(m3.frac.num, m3.b)+" = "+
      sumF.toImproperHtml()+" · "+frac(m3.b, m3.frac.num)+" = "+
      frac(sumF.num*m3.b, sumF.den*m3.frac.num)+".");
    var g2=gcd(Math.abs(sumF.num*m3.b), sumF.den*m3.frac.num);
    if(g2>1){det+=step("Сократим на "+g2, frac(sumF.num*m3.b, sumF.den*m3.frac.num)+" = "+frac(sumF.num*m3.b/g2, sumF.den*m3.frac.num/g2)+".");}
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Сначала действия в скобках", detailed:det});
  }
  return genType9(rng);
}

/* Тип 10: Со степенью: ((m a/b)^2 - c/d) : e/f
   Прототип: ((1 1/2)³ − 3/4) : 7/8 — здесь квадрат */
function genType10(rng){
  for(var attempt=0;attempt<40;attempt++){
    var m1=randMixed(rng, 1, 4);
    if(m1.w>3)continue; /* чтобы квадрат был не слишком большой */
    var f2=randProperFrac(rng, 9);
    var f3=randProperFrac(rng, 9);
    var sq=m1.frac.pow(2);
    var diff=sq.sub(f2);
    if(diff.isZero())continue;
    var res=diff.div(f3);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Найдите значение выражения: (("+mixed(m1.w,m1.a,m1.b)+")² − "+frac(f2.num,f2.den)+") : "+frac(f3.num,f3.den)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", "(("+mixed(m1.w,m1.a,m1.b)+")² − "+frac(f2.num,f2.den)+") : "+frac(f3.num,f3.den));
    det+=step("Переведём смешанное в неправильную дробь",
      mixed(m1.w,m1.a,m1.b)+" = "+frac(m1.frac.num, m1.b)+".");
    det+=step("Возведём в квадрат",
      "("+frac(m1.frac.num, m1.b)+")² = "+frac(m1.frac.num+"²", m1.b+"²")+" = "+frac(m1.frac.num*m1.frac.num, m1.b*m1.b)+".");
    /* Сокращение квадрата */
    var sqN=m1.frac.num*m1.frac.num, sqD=m1.b*m1.b;
    var g1=gcd(sqN, sqD);
    if(g1>1){sqN/=g1; sqD/=g1; det+=step("Сократим на "+g1, frac(sqN*g1, sqD*g1)+" = "+frac(sqN, sqD)+".");}
    /* Вычитание */
    var L=lcm(sqD, f2.den);
    var d1n=sqN*(L/sqD), d2n=f2.num*(L/f2.den);
    det+=step("Вычтем "+frac(f2.num,f2.den)+" (общий знаменатель "+L+")",
      frac(sqN, sqD)+" − "+frac(f2.num, f2.den)+" = "+
      frac(d1n, L)+" − "+frac(d2n, L)+" = "+frac(d1n-d2n, L)+".");
    var diffF=new Frac(d1n-d2n, L);
    var dg=gcd(Math.abs(d1n-d2n), L);
    if(dg>1){det+=step("Сократим на "+dg, frac(d1n-d2n, L)+" = "+frac((d1n-d2n)/dg, L/dg)+".");}
    /* Деление */
    det+=step("Разделим на "+frac(f3.num, f3.den),
      diffF.toImproperHtml()+" : "+frac(f3.num, f3.den)+" = "+
      diffF.toImproperHtml()+" · "+frac(f3.den, f3.num)+" = "+
      frac(diffF.num*f3.den, diffF.den*f3.num)+".");
    var g2=gcd(Math.abs(diffF.num*f3.den), diffF.den*f3.num);
    if(g2>1){det+=step("Сократим на "+g2, frac(diffF.num*f3.den, diffF.den*f3.num)+" = "+frac(diffF.num*f3.den/g2, diffF.den*f3.num/g2)+".");}
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Сначала возведи в квадрат, потом вычти, потом раздели", detailed:det});
  }
  return genType10(rng);
}

/* Тип 11: Отношение сумм: (m a/b + c/d) : (e/f - g h/i)
   Прототип: (4 1/3 + 2 3/15) : (4 1/5 − 1 8/25) */
function genType11(rng){
  for(var attempt=0;attempt<50;attempt++){
    var m1=randMixed(rng, 2, 7);
    var f2=randProperFrac(rng, 9);
    var f3=randProperFrac(rng, 9);
    var m4=randMixed(rng, 2, 7);
    var numF=m1.frac.add(f2);
    /* Знаменатель: m4 - f3 (смешанное минус правильная дробь — всегда положительно) */
    var denF=m4.frac.sub(f3);
    if(denF.isZero() || denF.num<=0)continue;
    var res=numF.div(denF);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Выполните действия: ("+mixed(m1.w,m1.a,m1.b)+" + "+frac(f2.num,f2.den)+") : ("+mixed(m4.w,m4.a,m4.b)+" − "+frac(f3.num,f3.den)+")"+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", "("+mixed(m1.w,m1.a,m1.b)+" + "+frac(f2.num,f2.den)+") : ("+mixed(m4.w,m4.a,m4.b)+" − "+frac(f3.num,f3.den)+")");
    det+=step("Переведём смешанные в неправильные",
      mixed(m1.w,m1.a,m1.b)+" = "+frac(m1.frac.num, m1.b)+".<br/>"+
      mixed(m4.w,m4.a,m4.b)+" = "+frac(m4.frac.num, m4.b)+".");
    /* Числитель: сложение */
    var L1=lcm(m1.b, f2.den);
    var n1n=m1.frac.num*(L1/m1.b), n2n=f2.num*(L1/f2.den);
    det+=step("Сложим в числителе (общий знаменатель "+L1+")",
      frac(m1.frac.num, m1.b)+" + "+frac(f2.num, f2.den)+" = "+
      frac(n1n, L1)+" + "+frac(n2n, L1)+" = "+frac(n1n+n2n, L1)+".");
    var sg1=gcd(Math.abs(n1n+n2n), L1);
    if(sg1>1){det+=step("Сократим на "+sg1, frac(n1n+n2n, L1)+" = "+frac((n1n+n2n)/sg1, L1/sg1)+".");}
    /* Знаменатель: вычитание (m4 - f3) */
    var L2=lcm(m4.b, f3.den);
    var d1n=m4.frac.num*(L2/m4.b), d2n=f3.num*(L2/f3.den);
    det+=step("Вычтем в знаменателе (общий знаменатель "+L2+")",
      frac(m4.frac.num, m4.b)+" − "+frac(f3.num, f3.den)+" = "+
      frac(d1n, L2)+" − "+frac(d2n, L2)+" = "+frac(d1n-d2n, L2)+".");
    var sg2=gcd(Math.abs(d1n-d2n), L2);
    if(sg2>1){det+=step("Сократим на "+sg2, frac(d1n-d2n, L2)+" = "+frac((d1n-d2n)/sg2, L2/sg2)+".");}
    /* Деление */
    det+=step("Разделим числитель на знаменатель",
      numF.toImproperHtml()+" : "+denF.toImproperHtml()+" = "+
      numF.toImproperHtml()+" · "+frac(denF.den, denF.num)+" = "+
      frac(numF.num*denF.den, numF.den*denF.num)+".");
    var g3=gcd(Math.abs(numF.num*denF.den), numF.den*denF.num);
    if(g3>1){det+=step("Сократим на "+g3, frac(numF.num*denF.den, numF.den*denF.num)+" = "+frac(numF.num*denF.den/g3, numF.den*denF.num/g3)+".");}
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Сначала числитель, потом знаменатель, потом деление", detailed:det});
  }
  return genType11(rng);
}

/* Тип 12: С десятичными дробями: (a/b + 0,5 + c/d) : m n/k
   Прототип: (1/6 + 0,5 + 1/8) : 3 1/6 */
function genType12(rng){
  for(var attempt=0;attempt<40;attempt++){
    var f1=randProperFrac(rng, 9);
    var dec=pick(rng, ["0,5","0,25","0,125","0,2","0,4","0,75"]);
    var decF=Frac.fromDec(dec);
    var f3=randProperFrac(rng, 9);
    var m4=randMixed(rng, 2, 7);
    var sumF=f1.add(decF).add(f3);
    if(sumF.isZero())continue;
    var res=sumF.div(m4.frac);
    if(res.den>20 && !res.isInt())continue;
    if(res.isZero() || Math.abs(res.num)>50)continue;
    var fn=makeConstFn(res.toNumber());
    if(!fn)continue;
    var qText="Вычислите: ("+frac(f1.num,f1.den)+" + "+dec+" + "+frac(f3.num,f3.den)+") : "+mixed(m4.w,m4.a,m4.b)+NOTE;
    var det="";
    det+=step("Запишем исходное выражение", "("+frac(f1.num,f1.den)+" + "+dec+" + "+frac(f3.num,f3.den)+") : "+mixed(m4.w,m4.a,m4.b));
    det+=step("Переведём десятичную дробь в обыкновенную",
      dec+" = "+frac(decF.num, decF.den)+".");
    det+=step("Переведём смешанное в неправильную дробь",
      mixed(m4.w,m4.a,m4.b)+" = "+frac(m4.frac.num, m4.b)+".");
    /* Сложение трёх дробей */
    var L=lcm(lcm(f1.den, decF.den), f3.den);
    var s1n=f1.num*(L/f1.den), s2n=decF.num*(L/decF.den), s3n=f3.num*(L/f3.den);
    det+=step("Сложим в скобках (общий знаменатель "+L+")",
      frac(f1.num, f1.den)+" + "+frac(decF.num, decF.den)+" + "+frac(f3.num, f3.den)+" = "+
      frac(s1n, L)+" + "+frac(s2n, L)+" + "+frac(s3n, L)+" = "+frac(s1n+s2n+s3n, L)+".");
    var sg=gcd(Math.abs(s1n+s2n+s3n), L);
    if(sg>1){det+=step("Сократим на "+sg, frac(s1n+s2n+s3n, L)+" = "+frac((s1n+s2n+s3n)/sg, L/sg)+".");}
    /* Деление */
    det+=step("Разделим на "+mixed(m4.w,m4.a,m4.b),
      sumF.toImproperHtml()+" : "+frac(m4.frac.num, m4.b)+" = "+
      sumF.toImproperHtml()+" · "+frac(m4.b, m4.frac.num)+" = "+
      frac(sumF.num*m4.b, sumF.den*m4.frac.num)+".");
    var g2=gcd(Math.abs(sumF.num*m4.b), sumF.den*m4.frac.num);
    if(g2>1){det+=step("Сократим на "+g2, frac(sumF.num*m4.b, sumF.den*m4.frac.num)+" = "+frac(sumF.num*m4.b/g2, sumF.den*m4.frac.num/g2)+".");}
    if(res.num >= res.den && !res.isInt()){
      det+=step("Выделим целую часть", res.toImproperHtml()+" = "+res.toHtml()+".");
    }
    det+="<p><b>Ответ:</b> "+res.toHtml()+"</p>";
    return mkF({q:qText, fn:fn, sol:res.toHtml(), hint:"Десятичную дробь переведи в обыкновенную", detailed:det});
  }
  return genType12(rng);
}

/* ---------- генератор варианта: 12 заданий в случайном порядке ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10,genType11,genType12];
function genVariant(rng){
  var types=shuf(rng,[0,1,2,3,4,5,6,7,8,9,10,11]);
  return types.map(function(idx){return ALL_TYPES[idx](rng);});
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
    if(TZ.TOPICS[i].id==="smeshnye-delenie")return;
  }
  TZ.TOPICS.push({
    id:"smeshnye-delenie",
    subject:"Математика",
    grade:"6 класс",
    title:"Деление смешанных чисел",
    variants:40,
    desc:"Тренажёр по математике (6 класс): действие деления смешанных чисел. "
      +"12 заданий: деление дробей, смешанных чисел, десятичных дробей, "
      +"возведение в степень, отношения сумм. 40 вариантов. "
      +"После выполнения — подробное пошаговое решение с отрисовкой дробей.",
    blocks:[{name:"Деление смешанных чисел",gen:genVariant,count:12}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
