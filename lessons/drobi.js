/* =====================================================================
   Тренажёр · 8 класс · Алгебра · Сумма и разность дробей
   40 вариантов × 10 заданий.
   Тип: formula (ответ — формула вида a/b или a).
   После выполнения — подробное пошаговое решение с отрисовкой дробей.
   Переменные во всех задачах: a, b, c (для совместимости с checkFormula).
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}
function sign(n){return n<0?"−":"+";}
function absStr(n){return Math.abs(n);}

/* ---------- Отрисовка дроби ---------- */
function frac(num, den){
  return "<span class='frac'><span class='num'>"+num+"</span><span class='den'>"+den+"</span></span>";
}

/* ---------- Символьный движок: многочлен от a, b, c ---------- */
/* term = {c: coef, a: exp_a, b: exp_b, c: exp_c} */
function Pol(terms){this.terms=terms||[];}
Pol.C=function(c){return new Pol([{c:c,a:0,b:0,cv:0}]);};
Pol.A=function(e){return new Pol([{c:1,a:e,b:0,c:0}]);};
Pol.B=function(e){return new Pol([{c:1,a:0,b:e,c:0}]);};
Pol.Cv=function(e){return new Pol([{c:1,a:0,b:0,cv:e}]);};
Pol.prototype.copy=function(){return new Pol(this.terms.map(function(t){return {c:t.c,a:t.a,b:t.b,cv:t.cv};}));};
Pol.prototype.add=function(o){return new Pol(this.terms.concat(o.terms)).norm();};
Pol.prototype.sub=function(o){
  var n=o.terms.map(function(t){return {c:-t.c,a:t.a,b:t.b,cv:t.cv};});
  return new Pol(this.terms.concat(n)).norm();
};
Pol.prototype.mulMono=function(c,ae,be,ce){
  if(Math.abs(c)<1e-12)return new Pol([]);
  var n=this.terms.map(function(t){return {c:t.c*c,a:t.a+ae,b:t.b+be,cv:t.cv+ce};});
  return new Pol(n).norm();
};
Pol.prototype.mul=function(o){
  var r=new Pol([]);
  for(var i=0;i<o.terms.length;i++){
    r=r.add(this.mulMono(o.terms[i].c,o.terms[i].a,o.terms[i].b,o.terms[i].c));
  }
  return r;
};
Pol.prototype.norm=function(){
  var map={};
  this.terms.forEach(function(t){
    var key=t.a+','+t.b+','+t.cv;
    if(!map[key])map[key]={c:0,a:t.a,b:t.b,cv:t.cv};
    map[key].c+=t.c;
  });
  var arr=Object.keys(map).map(function(k){return map[k];});
  arr=arr.filter(function(t){return Math.abs(t.c)>1e-9;});
  arr.sort(function(x,y){
    if(y.a!==x.a)return y.a-x.a;
    if(y.b!==x.b)return y.b-x.b;
    return y.cv-x.cv;
  });
  return new Pol(arr);
};
Pol.prototype.isZero=function(){return this.terms.length===0;};
Pol.prototype.isConst=function(){return this.terms.length<=1 && (this.terms.length===0 || (this.terms[0].a===0&&this.terms[0].b===0&&this.terms[0].cv===0));};
Pol.prototype.constValue=function(){return this.terms.length===0?0:this.terms[0].c;};

/* Строковое представление для HTML (с <sup> для степеней) */
Pol.prototype.toHtml=function(){
  if(this.terms.length===0)return "0";
  var parts=[];
  for(var i=0;i<this.terms.length;i++){
    var t=this.terms[i];
    var hasVars=t.a>0||t.b>0||t.cv>0;
    var s="";
    if(t.c<0){
      s+=(i===0?"−":" − ");
      if(Math.abs(t.c)!==1||!hasVars)s+=Math.abs(t.c);
    }else{
      if(i>0)s+=" + ";
      if(t.c!==1||!hasVars)s+=t.c;
    }
    if(t.a>0){s+="a"; if(t.a>1)s+="<sup>"+t.a+"</sup>";}
    if(t.b>0){s+="b"; if(t.b>1)s+="<sup>"+t.b+"</sup>";}
    if(t.cv>0){s+="c"; if(t.cv>1)s+="<sup>"+t.cv+"</sup>";}
    parts.push(s);
  }
  return parts.join("");
};

/* Строковое представление для JS-функции (для new Function) */
Pol.prototype.toFnStr=function(){
  if(this.terms.length===0)return "0";
  var parts=[];
  for(var i=0;i<this.terms.length;i++){
    var t=this.terms[i];
    var s="("+t.c+")";
    if(t.a>0)s+="*Math.pow(a,"+t.a+")";
    if(t.b>0)s+="*Math.pow(b,"+t.b+")";
    if(t.cv>0)s+="*Math.pow(c,"+t.cv+")";
    parts.push(s);
  }
  return parts.join("+");
};

/* Сокращение дроби: num / den — если оба константы, делим на gcd */
function simplifyConst(num, den){
  if(num.isConst() && den.isConst()){
    var n=num.constValue(), d=den.constValue();
    if(d===0)return {num:num, den:den};
    if(n===0)return {num:Pol.C(0), den:Pol.C(1)};
    var g=gcd(Math.abs(n),Math.abs(d));
    n=n/g; d=d/g;
    if(d<0){n=-n; d=-d;}
    return {num:Pol.C(n), den:Pol.C(d)};
  }
  return {num:num, den:den};
}

/* Проверка: можно ли вынести общий множитель из всех термов полинома */
Pol.prototype.gcdCoef=function(){
  if(this.terms.length===0)return 0;
  var g=Math.abs(this.terms[0].c);
  for(var i=1;i<this.terms.length;i++){
    g=gcd(g,Math.abs(this.terms[i].c));
    if(g===1)break;
  }
  return g;
};

/* Найти общий мономный множитель для всех термов полинома */
function findCommonFactor(pol){
  if(pol.terms.length===0)return null;
  var g=Math.abs(pol.terms[0].c);
  var ae=pol.terms[0].a, be=pol.terms[0].b, ce=pol.terms[0].cv;
  for(var i=1;i<pol.terms.length;i++){
    g=gcd(g,Math.abs(pol.terms[i].c));
    ae=Math.min(ae,pol.terms[i].a);
    be=Math.min(be,pol.terms[i].b);
    ce=Math.min(ce,pol.terms[i].cv);
    if(g===1 && ae===0 && be===0 && ce===0)return null;
  }
  if(g===1 && ae===0 && be===0 && ce===0)return null;
  return {c:g,a:ae,b:be,cv:ce};
}

/* Полное сокращение дроби num/den */
function simplifyFraction(num, den){
  /* Случай констант */
  var sc=simplifyConst(num,den);
  if(sc.num!==num || sc.den!==den)return sc;
  /* Если den — моном, можно попытаться сократить */
  if(den.terms.length!==1)return {num:num, den:den};
  var dt=den.terms[0];
  var nf=findCommonFactor(num);
  if(!nf)return {num:num, den:den};
  /* Проверим, что den делится на nf */
  if(dt.c % nf.c !== 0)return {num:num, den:den};
  if(dt.a < nf.a || dt.b < nf.b || dt.cv < nf.cv)return {num:num, den:den};
  var newNum=num.mulMono(1/nf.c, -nf.a, -nf.b, -nf.cv);
  var newDen=den.mulMono(1/nf.c, -nf.a, -nf.b, -nf.cv);
  return {num:newNum, den:newDen, factor:nf};
}


/* ---------- Формирование задачи ---------- */
function mkF(opts){
  return {type:"formula",q:opts.q,fn:opts.fn,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}

/* Эталонная функция из Pol num и den */
function makeFn(numPol, denPol){
  var src="return ("+numPol.toFnStr()+")/("+denPol.toFnStr()+");";
  try{
    var fn=new Function("a","b","c",src);
    /* тест */
    var t=fn(1.5,2.3,0.7);
    if(typeof t!=="number"||!isFinite(t))return null;
    return fn;
  }catch(e){return null;}
}

/* ---------- Шаги решения ---------- */
function step(title, html){
  return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";
}

function fracHtml(numPol, denPol){
  /* Если знаменатель = 1 — показываем как целое выражение */
  if(denPol.isConst() && denPol.constValue()===1){
    if(numPol.isZero())return "0";
    return numPol.toHtml();
  }
  /* Если числитель = 0 — показываем 0 */
  if(numPol.isZero())return "0";
  return frac(numPol.toHtml(), denPol.toHtml());
}

/* =====================================================================
   ГЕНЕРАТОРЫ 10 ТИПОВ ЗАДАЧ
   ===================================================================== */

/* Тип 1: (k1·ab + k2)/(d1·a³) − (k3·b − k4·a)/(d2·a²)
   Прототип: (2xy−1)/4x³ − (3y−x)/6x²
   Общий знаменатель: lcm(d1,d2)·a³ */
function genType1(rng){
  var k1=pick(rng,[2,3,4]);
  var k2=pick(rng,[-1,-2,1,2]);
  var d1=pick(rng,[4,6]);
  var k3=pick(rng,[2,3]);
  var k4=pick(rng,[1,2]);
  var d2=pick(rng,[4,6]);
  /* DOKA: d1 ≠ d2 для нетривиального общего знаменателя */
  if(d1===d2){if(d1===4)d2=6;else d2=4;}

  /* Числители дробей */
  var n1=new Pol([{c:k1,a:1,b:1,cv:0},{c:k2,a:0,b:0,cv:0}]);
  var n2=new Pol([{c:k3,a:0,b:1,cv:0},{c:-k4,a:1,b:0,cv:0}]);
  var den1=new Pol([{c:d1,a:3,b:0,cv:0}]);
  var den2=new Pol([{c:d2,a:2,b:0,cv:0}]);

  /* Общий знаменатель: lcm(d1,d2) · a^3 */
  var L=lcm(d1,d2);
  var comDen=new Pol([{c:L,a:3,b:0,cv:0}]);
  /* Дополнительные множители */
  var m1=L/d1; /* числовая часть — a^0 (т.к. a^3 уже есть) */
  var m2a=L/d2; /* числовая часть */
  var m2aExp=1; /* a^1 (т.к. нужно поднять a^2 до a^3) */
  /* После домножения: n1' = n1 * m1; n2' = n2 * m2a * a^1 */
  var n1p=n1.mulMono(m1,0,0,0);
  var n2p=n2.mulMono(m2a,m2aExp,0,0);
  /* Числитель результата: n1p - n2p */
  var resNum=n1p.sub(n2p);
  var resDen=comDen;
  /* Проверим, не сокращается ли на a (если все термы num имеют a^? >= 1) */
  var minA=Infinity;
  resNum.terms.forEach(function(t){if(t.a<minA)minA=t.a;});
  if(minA>=1 && resDen.terms[0].a>=1){
    resNum=resNum.mulMono(1,-1,0,0); /* делим на a */
    resDen=resDen.mulMono(1,-1,0,0);
  }
  /* Сокращение на числовой множитель */
  var g=resNum.gcdCoef();
  var dg=resDen.terms[0].c;
  if(g>1 && dg%g===0){
    resNum=resNum.mulMono(1/g,0,0,0);
    resDen=resDen.mulMono(1/g,0,0,0);
  }

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType1(rng);

  /* Заголовок задания */
  var qText="Представьте в виде дроби: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml());
  /* Подсказка формата ответа */
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу, например <span class='dz-code'>(2*a-3)/(12*a^3)</span>)</span>";

  /* Пошаговое решение */
  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: "+den1.toHtml()+" и "+den2.toHtml()+". "+
    "НОК числовых коэффициентов "+d1+" и "+d2+" равно "+L+". "+
    "Степени a: 3 и 2 — берём наибольшую, a<sup>3</sup>. "+
    "Общий знаменатель: "+comDen.toHtml()+".");
  det+=step("Дополнительные множители",
    "Для первой дроби: "+comDen.toHtml()+" ÷ "+den1.toHtml()+" = "+m1+".<br/>"+
    "Для второй дроби: "+comDen.toHtml()+" ÷ "+den2.toHtml()+" = "+m2a+"·a.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+".");
  det+=step("Вычтем числители",
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(minA>=1){
    det+=step("Сократим на a",
      "Все слагаемые числителя содержат a, и знаменатель содержит a<sup>"+Math.max(1,resDen.terms[0].a+1)+"</sup>. Сократим на a.");
  }
  if(g>1 && dg%g===0){
    det+=step("Сократим на "+g,
      "Все коэффициенты числителя делятся на "+g+", и знаменатель тоже делится. Сократим.");
  }
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Приведите дроби к общему знаменателю", detailed:det});
}

/* Тип 2: (k1 + k2·b²)/(d1·a·b) + (k3·b³ + k4)/(d2·a·b²)
   Прототип: (1−b²)/3ab + (2b³−1)/6ab²
   Общий знаменатель: lcm(d1,d2)·a·b² */
function genType2(rng){
  var k1=pick(rng,[1,2]);
  var k2=pick(rng,[-1,-2,1]);
  var d1=pick(rng,[3,6]);
  var k3=pick(rng,[2,3]);
  var k4=pick(rng,[-1,1,-2]);
  var d2=pick(rng,[6,12]);
  if(d1===d2)d2=d1*2;
  if(gcd(d1,d2)===d1)d2=d1*2;

  /* (k1 + k2*b²)/(d1*a*b) — но в прототипе (1 − b²), так что k1=1, k2=-1 */
  var n1=new Pol([{c:k1,a:0,b:0,cv:0},{c:k2,a:0,b:2,cv:0}]);
  var den1=new Pol([{c:d1,a:1,b:1,cv:0}]);
  /* (k3*b³ + k4)/(d2*a*b²) */
  var n2=new Pol([{c:k3,a:0,b:3,cv:0},{c:k4,a:0,b:0,cv:0}]);
  var den2=new Pol([{c:d2,a:1,b:2,cv:0}]);

  /* Общий знаменатель: lcm(d1,d2)·a·b² */
  var L=lcm(d1,d2);
  var comDen=new Pol([{c:L,a:1,b:2,cv:0}]);
  var m1=L/d1; /* числовая часть, b^1 (т.к. b^1→b^2) */
  var m2=L/d2; /* только числовая */

  var n1p=n1.mulMono(m1,0,1,0); /* домножить на m1·b */
  var n2p=n2.mulMono(m2,0,0,0);
  var resNum=n1p.add(n2p);
  var resDen=comDen;
  /* Сокращение */
  var g=resNum.gcdCoef();
  var dg=resDen.terms[0].c;
  if(g>1 && dg%g===0){
    resNum=resNum.mulMono(1/g,0,0,0);
    resDen=resDen.mulMono(1/g,0,0,0);
  }

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType2(rng);

  var qText="Представьте в виде дроби: "+frac(n1.toHtml(),den1.toHtml())+" + "+frac(n2.toHtml(),den2.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу, например <span class='dz-code'>(...)/(...)</span>)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" + "+fracHtml(n2,den2));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: "+den1.toHtml()+" и "+den2.toHtml()+". "+
    "НОК("+d1+", "+d2+") = "+L+". Степени a: 1 и 1. Степени b: 1 и 2 — берём b<sup>2</sup>. "+
    "Общий знаменатель: "+comDen.toHtml()+".");
  det+=step("Дополнительные множители",
    "Для первой дроби: "+comDen.toHtml()+" ÷ "+den1.toHtml()+" = "+m1+"·b.<br/>"+
    "Для второй дроби: "+comDen.toHtml()+" ÷ "+den2.toHtml()+" = "+m2+".");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+".");
  det+=step("Сложим числители",
    "Числитель: ("+n1p.toHtml()+") + ("+n2p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(g>1 && dg%g===0){
    det+=step("Сократим на "+g, "Все коэффициенты делятся на "+g+". Сократим дробь.");
  }
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Приведите к общему знаменателю", detailed:det});
}

/* Тип 3: k1/(d1·a³) − k2/(d2·a⁵)
   Прототип: 1/3a³ − 2/5a⁵
   Общий знаменатель: lcm(d1,d2)·a⁵ */
function genType3(rng){
  var k1=pick(rng,[1,2,3]);
  var d1=pick(rng,[3,4,5]);
  var k2=pick(rng,[1,2,3]);
  var d2=pick(rng,[3,4,5]);
  if(d1===d2)d2=(d2===3?5:3);

  var n1=Pol.C(k1);
  var den1=new Pol([{c:d1,a:3,b:0,cv:0}]);
  var n2=Pol.C(k2);
  var den2=new Pol([{c:d2,a:5,b:0,cv:0}]);

  var L=lcm(d1,d2);
  var comDen=new Pol([{c:L,a:5,b:0,cv:0}]);
  var m1n=L/d1;
  var m1a=2;
  var m2n=L/d2;

  var n1p=n1.mulMono(m1n,m1a,0,0);
  var n2p=n2.mulMono(m2n,0,0,0);
  var resNum=n1p.sub(n2p);
  var resDen=comDen;
  var sim=simplifyConst(resNum,resDen);
  resNum=sim.num; resDen=sim.den;

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType3(rng);

  var qText="Представьте в виде дроби: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: "+den1.toHtml()+" и "+den2.toHtml()+". "+
    "НОК("+d1+", "+d2+") = "+L+". Степени a: 3 и 5 — берём a<sup>5</sup>. "+
    "Общий знаменатель: "+comDen.toHtml()+".");
  det+=step("Дополнительные множители",
    "Для первой дроби: "+comDen.toHtml()+" ÷ "+den1.toHtml()+" = "+m1n+"·a<sup>2</sup>.<br/>"+
    "Для второй дроби: "+comDen.toHtml()+" ÷ "+den2.toHtml()+" = "+m2n+".");
  det+=step("Приведём и вычтем",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+".<br/>"+
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(sim.num.isConst() && sim.den.isConst() && (sim.num.constValue()!==n1p.constValue() || sim.den.constValue()!==comDen.terms[0].c)){
    var g=simplifyConst(n1p.sub(n2p),comDen);
    var origG=gcd(Math.abs(n1p.sub(n2p).constValue()),Math.abs(comDen.terms[0].c));
    if(origG>1)det+=step("Сократим на "+origG, "Числитель и знаменатель делятся на "+origG+".");
  }
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — НОК числовых и a^5", detailed:det});
}

/* Тип 4: b²/(d1·x⁵) − b/(d2·x⁶) — здесь b→b, x→a
   Прототип: b²/6x⁵ − b/3x⁶ */
function genType4(rng){
  var d1=pick(rng,[4,6]);
  var d2=pick(rng,[3,4]);
  if(d1===d2){d2=(d1===3?4:3);}
  /* k1·b²/(d1·a⁵) − k2·b/(d2·a⁶) */
  var k1=1, k2=1; /* в прототипе 1·b² и 1·b */

  var n1=new Pol([{c:k1,a:0,b:2,cv:0}]);
  var den1=new Pol([{c:d1,a:5,b:0,cv:0}]);
  var n2=new Pol([{c:k2,a:0,b:1,cv:0}]);
  var den2=new Pol([{c:d2,a:6,b:0,cv:0}]);

  var L=lcm(d1,d2);
  var comDen=new Pol([{c:L,a:6,b:0,cv:0}]);
  var m1n=L/d1, m1a=1;
  var m2n=L/d2;

  var n1p=n1.mulMono(m1n,m1a,0,0);
  var n2p=n2.mulMono(m2n,0,0,0);
  var resNum=n1p.sub(n2p);
  var resDen=comDen;
  /* Сокращение на коэффициент (если возможно) */
  var g=resNum.gcdCoef();
  var dg=resDen.terms[0].c;
  if(g>1 && dg%g===0){
    resNum=resNum.mulMono(1/g,0,0,0);
    resDen=resDen.mulMono(1/g,0,0,0);
  }

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType4(rng);

  var qText="Представьте в виде дроби: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: "+den1.toHtml()+" и "+den2.toHtml()+". "+
    "НОК("+d1+", "+d2+") = "+L+". Степени a: 5 и 6 — берём a<sup>6</sup>. "+
    "Общий знаменатель: "+comDen.toHtml()+".");
  det+=step("Дополнительные множители",
    "Для первой дроби: "+m1n+"·a.<br/>Для второй дроби: "+m2n+".");
  det+=step("Приведём и вычтем",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+".<br/>"+
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(g>1 && dg%g===0){
    det+=step("Сократим на "+g, "Коэффициенты делятся на "+g+".");
  }
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — НОК·a^6", detailed:det});
}

/* Тип 5: 1/(a·b) + 1/(a·c) + 1/(b·c)
   Прототип: 1/ab + 1/ac + 1/bc
   Общий знаменатель: a·b·c */
function genType5(rng){
  /* 1/(a*b) + 1/(a*c) + 1/(b*c) */
  var n1=Pol.C(1);
  var den1=new Pol([{c:1,a:1,b:1,cv:0}]);
  var n2=Pol.C(1);
  var den2=new Pol([{c:1,a:1,b:0,cv:1}]);
  var n3=Pol.C(1);
  var den3=new Pol([{c:1,a:0,b:1,cv:1}]);

  var comDen=new Pol([{c:1,a:1,b:1,cv:1}]);
  /* Доп. множители: c для 1-й, b для 2-й, a для 3-й */
  var n1p=n1.mulMono(1,0,0,1); /* ·c */
  var n2p=n2.mulMono(1,0,1,0); /* ·b */
  var n3p=n3.mulMono(1,1,0,0); /* ·a */
  var resNum=n1p.add(n2p).add(n3p);
  var resDen=comDen;

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType5(rng);

  var qText="Преобразуйте в дробь выражение: "+frac(n1.toHtml(),den1.toHtml())+" + "+frac(n2.toHtml(),den2.toHtml())+" + "+frac(n3.toHtml(),den3.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" + "+fracHtml(n2,den2)+" + "+fracHtml(n3,den3));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: ab, ac, bc. Общий знаменатель: a·b·c.");
  det+=step("Дополнительные множители",
    "Для "+fracHtml(n1,den1)+": c.<br/>"+
    "Для "+fracHtml(n2,den2)+": b.<br/>"+
    "Для "+fracHtml(n3,den3)+": a.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+",<br/>"+
    fracHtml(n3,den3)+" = "+fracHtml(n3p,comDen)+".");
  det+=step("Сложим числители",
    "Числитель: "+n1p.toHtml()+" + "+n2p.toHtml()+" + "+n3p.toHtml()+" = "+_resNumBefore.toHtml()+".");
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — abc", detailed:det});
}

/* Тип 6: (a·b − b)/a − (a·b − a)/b − (a² − b²)/(a·b)
   Прототип 2б */
function genType6(rng){
  var n1=new Pol([{c:1,a:1,b:1,cv:0},{c:-1,a:0,b:1,cv:0}]); /* ab − b */
  var den1=new Pol([{c:1,a:1,b:0,cv:0}]); /* a */
  var n2=new Pol([{c:1,a:1,b:1,cv:0},{c:-1,a:1,b:0,cv:0}]); /* ab − a */
  var den2=new Pol([{c:1,a:0,b:1,cv:0}]); /* b */
  var n3=new Pol([{c:1,a:2,b:0,cv:0},{c:-1,a:0,b:2,cv:0}]); /* a² − b² */
  var den3=new Pol([{c:1,a:1,b:1,cv:0}]); /* ab */

  var comDen=new Pol([{c:1,a:1,b:1,cv:0}]); /* ab */
  /* Доп. множители: b для 1-й, a для 2-й, 1 для 3-й */
  var n1p=n1.mulMono(1,0,1,0); /* ·b → (ab-b)*b = ab²-b² */
  var n2p=n2.mulMono(1,1,0,0); /* ·a → (ab-a)*a = a²b-a² */
  var n3p=n3.mulMono(1,0,0,0); /* 1 */
  var resNum=n1p.sub(n2p).sub(n3p);
  var resDen=comDen;

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType6(rng);

  var qText="Преобразуйте в дробь выражение: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml())+" − "+frac(n3.toHtml(),den3.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2)+" − "+fracHtml(n3,den3));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: a, b, ab. Общий знаменатель: ab.");
  det+=step("Дополнительные множители",
    "Для "+fracHtml(n1,den1)+": b.<br/>"+
    "Для "+fracHtml(n2,den2)+": a.<br/>"+
    "Для "+fracHtml(n3,den3)+": 1.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+",<br/>"+
    fracHtml(n3,den3)+" = "+fracHtml(n3p,comDen)+".");
  det+=step("Вычтем числители",
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") − ("+n3p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — ab", detailed:det});
}

/* Тип 7: (b−a)/(ab) + (c−b)/(bc) − (c−a)/(ac)
   Прототип 2в */
function genType7(rng){
  var n1=new Pol([{c:1,a:0,b:1,cv:0},{c:-1,a:1,b:0,cv:0}]); /* b-a */
  var den1=new Pol([{c:1,a:1,b:1,cv:0}]);
  var n2=new Pol([{c:1,a:0,b:0,cv:1},{c:-1,a:0,b:1,cv:0}]); /* c-b */
  var den2=new Pol([{c:1,a:0,b:1,cv:1}]);
  var n3=new Pol([{c:1,a:0,b:0,cv:1},{c:-1,a:1,b:0,cv:0}]); /* c-a */
  var den3=new Pol([{c:1,a:1,b:0,cv:1}]);

  var comDen=new Pol([{c:1,a:1,b:1,cv:1}]); /* abc */
  /* Доп. множители: c для 1-й, a для 2-й, b для 3-й */
  var n1p=n1.mulMono(1,0,0,1);
  var n2p=n2.mulMono(1,1,0,0);
  var n3p=n3.mulMono(1,0,1,0);
  var resNum=n1p.add(n2p).sub(n3p);
  var resDen=comDen;

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType7(rng);

  var qText="Преобразуйте в дробь выражение: "+frac(n1.toHtml(),den1.toHtml())+" + "+frac(n2.toHtml(),den2.toHtml())+" − "+frac(n3.toHtml(),den3.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" + "+fracHtml(n2,den2)+" − "+fracHtml(n3,den3));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: ab, bc, ac. Общий знаменатель: abc.");
  det+=step("Дополнительные множители",
    "Для "+fracHtml(n1,den1)+": c.<br/>"+
    "Для "+fracHtml(n2,den2)+": a.<br/>"+
    "Для "+fracHtml(n3,den3)+": b.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+",<br/>"+
    fracHtml(n3,den3)+" = "+fracHtml(n3p,comDen)+".");
  det+=step("Сложим/вычтем числители",
    "Числитель: ("+n1p.toHtml()+") + ("+n2p.toHtml()+") − ("+n3p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — abc", detailed:det});
}

/* Тип 8: (3ab+2b²)/(ab) − (a+2b)/a + (a−2b)/b
   Прототип 2г */
function genType8(rng){
  var k1=pick(rng,[3,4,5]);
  var k2=pick(rng,[2,3]);
  var k3=pick(rng,[1,2]);
  var k4=pick(rng,[2,3]);
  var k5=pick(rng,[1,2]);
  var k6=pick(rng,[2,3]);
  /* (k1·ab + k2·b²)/(ab) − (k3·a + k4·b)/a + (k5·a − k6·b)/b */
  var n1=new Pol([{c:k1,a:1,b:1,cv:0},{c:k2,a:0,b:2,cv:0}]);
  var den1=new Pol([{c:1,a:1,b:1,cv:0}]);
  var n2=new Pol([{c:k3,a:1,b:0,cv:0},{c:k4,a:0,b:1,cv:0}]);
  var den2=new Pol([{c:1,a:1,b:0,cv:0}]);
  var n3=new Pol([{c:k5,a:1,b:0,cv:0},{c:-k6,a:0,b:1,cv:0}]);
  var den3=new Pol([{c:1,a:0,b:1,cv:0}]);

  var comDen=new Pol([{c:1,a:1,b:1,cv:0}]); /* ab */
  var n1p=n1.mulMono(1,0,0,0);
  var n2p=n2.mulMono(1,0,1,0);
  var n3p=n3.mulMono(1,1,0,0);
  var resNum=n1p.sub(n2p).add(n3p);
  var resDen=comDen;

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType8(rng);

  var qText="Преобразуйте в дробь выражение: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml())+" + "+frac(n3.toHtml(),den3.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2)+" + "+fracHtml(n3,den3));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: ab, a, b. Общий знаменатель: ab.");
  det+=step("Дополнительные множители",
    "Для "+fracHtml(n1,den1)+": 1.<br/>"+
    "Для "+fracHtml(n2,den2)+": b.<br/>"+
    "Для "+fracHtml(n3,den3)+": a.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+",<br/>"+
    fracHtml(n3,den3)+" = "+fracHtml(n3p,comDen)+".");
  det+=step("Выполним действия с числителями",
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") + ("+n3p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — ab", detailed:det});
}

/* Тип 9: (a−b)/(ab) − (a−c)/(ac)
   Прототип 3а (x−y)/xy − (x−z)/xz */
function genType9(rng){
  var n1=new Pol([{c:1,a:1,b:0,cv:0},{c:-1,a:0,b:1,cv:0}]); /* a-b */
  var den1=new Pol([{c:1,a:1,b:1,cv:0}]);
  var n2=new Pol([{c:1,a:1,b:0,cv:0},{c:-1,a:0,b:0,cv:1}]); /* a-c */
  var den2=new Pol([{c:1,a:1,b:0,cv:1}]);

  var comDen=new Pol([{c:1,a:1,b:1,cv:1}]); /* abc */
  var n1p=n1.mulMono(1,0,0,1); /* ·c */
  var n2p=n2.mulMono(1,0,1,0); /* ·b */
  var resNum=n1p.sub(n2p);
  var resDen=comDen;

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType9(rng);

  var qText="Выполните вычитание дробей: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: ab и ac. Общий знаменатель: abc.");
  det+=step("Дополнительные множители",
    "Для "+fracHtml(n1,den1)+": c.<br/>"+
    "Для "+fracHtml(n2,den2)+": b.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+".");
  det+=step("Вычтем числители",
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — abc", detailed:det});
}

/* Тип 10: (a−2b)/(d·b) − (b−2a)/(d·a)
   Прототип 3б (a−2b)/3b − (b−2a)/3a */
function genType10(rng){
  var k1=pick(rng,[2,3]);
  var k2=pick(rng,[2,3]);
  var d=pick(rng,[3,4,5]);
  /* (a − k1·b)/(d·b) − (b − k2·a)/(d·a) */
  var n1=new Pol([{c:1,a:1,b:0,cv:0},{c:-k1,a:0,b:1,cv:0}]);
  var den1=new Pol([{c:d,a:0,b:1,cv:0}]);
  var n2=new Pol([{c:1,a:0,b:1,cv:0},{c:-k2,a:1,b:0,cv:0}]);
  var den2=new Pol([{c:d,a:1,b:0,cv:0}]);

  var comDen=new Pol([{c:d,a:1,b:1,cv:0}]); /* d·a·b */
  /* Доп. множители: a для 1-й, b для 2-й */
  var n1p=n1.mulMono(1,1,0,0);
  var n2p=n2.mulMono(1,0,1,0);
  var resNum=n1p.sub(n2p);
  var resDen=comDen;
  /* Сокращение */
  var g=resNum.gcdCoef();
  var dg=resDen.terms[0].c;
  if(g>1 && dg%g===0){
    resNum=resNum.mulMono(1/g,0,0,0);
    resDen=resDen.mulMono(1/g,0,0,0);
  }
  /* На ab, если в знаменателе есть ab */
  var minA=Infinity, minB=Infinity;
  resNum.terms.forEach(function(t){if(t.a<minA)minA=t.a; if(t.b<minB)minB=t.b;});
  if(minA>=1 && minB>=1){
    resNum=resNum.mulMono(1,-1,-1,0);
    resDen=resDen.mulMono(1,-1,-1,0);
  }

  /* Сохраняем числитель до упрощения для отображения в решении */
  var _resNumBefore=resNum.copy();
  /* Финальное упрощение дроби */
  var _sim=simplifyFraction(resNum,resDen);
  var _simFactor=_sim.factor||null;
  var _simStr="";
  if(_simFactor){
    if(_simFactor.c>1)_simStr+=_simFactor.c;
    if(_simFactor.a>0){_simStr+="a"; if(_simFactor.a>1)_simStr+="<sup>"+_simFactor.a+"</sup>";}
    if(_simFactor.b>0){_simStr+="b"; if(_simFactor.b>1)_simStr+="<sup>"+_simFactor.b+"</sup>";}
    if(_simFactor.cv>0){_simStr+="c"; if(_simFactor.cv>1)_simStr+="<sup>"+_simFactor.cv+"</sup>";}
    resNum=_sim.num; resDen=_sim.den;
  }

  var fn=makeFn(resNum,resDen);
  if(!fn)return genType10(rng);

  var qText="Выполните вычитание дробей: "+frac(n1.toHtml(),den1.toHtml())+" − "+frac(n2.toHtml(),den2.toHtml());
  var note=" <span style='color:var(--mute);font-size:14px'>(введите формулу)</span>";

  var det="";
  det+=step("Запишем исходное выражение", fracHtml(n1,den1)+" − "+fracHtml(n2,den2));
  det+=step("Найдём общий знаменатель",
    "Знаменатели: "+den1.toHtml()+" и "+den2.toHtml()+". Общий знаменатель: "+comDen.toHtml()+".");
  det+=step("Дополнительные множители",
    "Для "+fracHtml(n1,den1)+": a.<br/>"+
    "Для "+fracHtml(n2,den2)+": b.");
  det+=step("Приведём к общему знаменателю",
    fracHtml(n1,den1)+" = "+fracHtml(n1p,comDen)+",<br/>"+
    fracHtml(n2,den2)+" = "+fracHtml(n2p,comDen)+".");
  det+=step("Вычтем числители",
    "Числитель: ("+n1p.toHtml()+") − ("+n2p.toHtml()+") = "+_resNumBefore.toHtml()+".");
  if(minA>=1&&minB>=1){
    det+=step("Сократим на ab", "В числителе все слагаемые содержат ab, сократим со знаменателем.");
  }
  if(g>1 && dg%g===0){
    det+=step("Сократим на "+g, "Коэффициенты делятся на "+g+".");
  }
  if(_simFactor){
    det+=step("Сократим на "+_simStr, "Числитель и знаменатель имеют общий множитель "+_simStr+". Сократим дробь.");
  }
  det+="<p><b>Ответ:</b> "+fracHtml(resNum,resDen)+"</p>";

  return mkF({q:qText+note, fn:fn, sol:fracHtml(resNum,resDen), hint:"Общий знаменатель — d·a·b", detailed:det});
}

/* ---------- генератор варианта: 10 заданий в случайном порядке ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){
  var types=shuf(rng,[0,1,2,3,4,5,6,7,8,9]);
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
    if(TZ.TOPICS[i].id==="drobi")return;
  }
  TZ.TOPICS.push({
    id:"drobi",
    subject:"Математика",
    grade:"8 класс",
    title:"Сумма и разность дробей",
    variants:40,
    desc:"Тренажёр по алгебре (8 класс): сумма и разность рациональных дробей. "
      +"10 заданий: приведение к общему знаменателю, сложение и вычитание дробей "
      +"с одной и несколькими переменными. 40 вариантов. "
      +"После выполнения — подробное пошаговое решение с отрисовкой дробей.",
    blocks:[{name:"Сумма и разность дробей",gen:genVariant,count:10}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
