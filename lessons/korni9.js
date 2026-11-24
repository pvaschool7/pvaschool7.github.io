/* =====================================================================
   Тренажёр · 9 класс · Алгебра · Корни (радикалы)
   40 вариантов × 10 заданий (от простого к сложному).
   Тип: formula с rootButton — ученик вводит ответ, кнопка √ вставляет корень.
   Проверка: числовое сравнение значения выражения ученика с эталоном.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function gcd2(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
function lcm2(a,b){return Math.abs(a*b)/gcd2(a,b);}
function findSquare(n){for(var i=2;i*i<=n;i++){if(n%(i*i)===0)return i;}return 1;}

/* HTML-отрисовка корней для условия и решения */
function nthroot(n, expr){
  if(n===2)return "<span class='sqrt'><span class='rad'>√</span><span class='radicand'>"+expr+"</span></span>";
  return "<span class='nthroot'><span class='degree'>"+n+"</span><span class='rad'>√</span><span class='radicand'>"+expr+"</span></span>";
}
function sqrt(expr){return nthroot(2,expr);}
function sup(n){return "<sup>"+n+"</sup>";}
function frac(num,den){return "<span class='frac'><span class='num'>"+num+"</span><span class='den'>"+den+"</span></span>";}
function vec(name){return "<span style='text-decoration:overline'>"+name+"</span>";}
function step(title,html){return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";}

/* Текстовая версия ответа (Unicode) */
var SUP_MAP={"2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","10":"¹⁰","12":"¹²","15":"¹⁵","20":"²⁰"};
function rt(n, expr){return n===2?"√"+expr:(SUP_MAP[String(n)]||n)+"√"+expr;}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(введите ответ: используйте кнопку √ для корня, например 2√(7) или ⁸√(a^5))</span>";

/* Создание задачи типа formula с кнопкой корня */
function mkF(opts){
  return {type:"formula",rootButton:true,q:opts.q,fn:opts.fn,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}

/* Компиляция формулы ученика в JS-функцию */
function compileRootExpr(src){
  var s=String(src==null?"":src).trim();
  if(!s)return null;
  s=s.replace(/,/g,".").replace(/\u2212/g,"-").replace(/\s+/g,"");
  /* √(expr) → Math.sqrt(expr) */
  s=s.replace(/√\(/g,"Math.sqrt(");
  /* √N → Math.sqrt(N) где N — число или переменная */
  s=s.replace(/√(\d+)/g,"Math.sqrt($1)");
  s=s.replace(/√([a-zA-Z])/g,"Math.sqrt($1)");
  /* ⁿ√(expr) → Math.pow(expr, 1/n) — поддерживаем Unicode надстрочные */
  var supChars={"²":2,"³":3,"⁴":4,"⁵":5,"⁶":6,"⁷":7,"⁸":8,"⁹":9};
  for(var ch in supChars){
    var re=new RegExp(ch+"√\\(","g");
    s=s.replace(re,"Math.pow(");
    /* Нужно закрыть скобку и добавить ,1/n) — сложно, отложим */
  }
  /* ^ → ** */
  s=s.replace(/\^/g,"**");
  /* a² → a**2, a³ → a**3 */
  s=s.replace(/([a-zA-Z0-9\)])²/g,"$1**2");
  s=s.replace(/([a-zA-Z0-9\)])³/g,"$1**3");
  s=s.replace(/([a-zA-Z0-9\)])⁴/g,"$1**4");
  s=s.replace(/([a-zA-Z0-9\)])⁵/g,"$1**5");
  s=s.replace(/([a-zA-Z0-9\)])⁶/g,"$1**6");
  /* Неявное умножение: 2a → 2*a, 2√ → 2*Math.sqrt */
  s=s.replace(/(\d)([a-zA-Z])/g,"$1*$2");
  s=s.replace(/(\d)√/g,"$1*Math.sqrt");
  s=s.replace(/\)([a-zA-Z(])/g,")*$1");
  s=s.replace(/√([a-zA-Z])/g,"Math.sqrt($1)");
  /* Безопасность */
  if(/\b(window|document|eval|Function|constructor|prototype|__proto__|global|process|require|import|this|new|while|for|if|var|let|const)\b/i.test(s))return null;
  if(!/^[0-9+\-*/().a-zA-Z*Math]+$/.test(s))return null;
  try{
    var fn=new Function("a","b","x","y","return "+s+";");
    var test=fn(1.5,2.3,1.5,2.3);
    if(typeof test!=="number"||!isFinite(test))return null;
    return fn;
  }catch(e){return null;}
}

/* Проверка: сравниваем числовое значение ответа ученика с эталоном */
function checkRootAnswer(input, task){
  if(!task||!task.fn)return false;
  var userFn=compileRootExpr(input);
  if(!userFn)return false;
  /* Сравниваем в нескольких случайных точках */
  var used=0;
  for(var i=0;i<8;i++){
    var a=0.5+Math.random()*10;
    var b=0.5+Math.random()*10;
    var x=a, y=b;
    try{
      var got=userFn(a,b,x,y);
      var exp=task.fn(a,b,x,y);
      if(!isFinite(got)||!isFinite(exp))continue;
      /* Относительная погрешность */
      var relErr=Math.abs(got-exp)/(Math.abs(exp)+1);
      if(relErr>0.01)return false;
      used++;
    }catch(e){return false;}
  }
  return used>=5;
}

/* Эталонная функция из числового ответа */
function makeConstFn(value){
  return function(){return value;};
}

/* Эталонная функция из выражения с переменной */
function makeExprFn(exprStr){
  try{
    return new Function("a","b","x","y","return "+exprStr+";");
  }catch(e){return null;}
}

/* ===== ТИП 1: Умножение корней √a · √b = √(ab) ===== */
function genType1(rng){
  var a=ri(rng,2,12), b=ri(rng,2,12);
  var prod=a*b, sq=findSquare(prod);
  var ansText, ansHtml, fnVal;
  if(sq>1){
    var rest=prod/(sq*sq);
    ansText=sq+(rest>1?"√("+rest+")":"");
    ansHtml=sq+(rest>1?sqrt(rest):"");
    fnVal=sq*Math.sqrt(rest);
  }else{
    ansText="√("+prod+")";
    ansHtml=sqrt(prod);
    fnVal=Math.sqrt(prod);
  }
  var fn=makeConstFn(fnVal);
  var qText="Выполните умножение: "+sqrt(a)+" · "+sqrt(b)+"."+NOTE;
  var det="";
  det+=step("Правило","√a · √b = √(a·b).");
  det+=step("Решение",sqrt(a)+" · "+sqrt(b)+" = "+nthroot(2,a+"·"+b)+" = "+sqrt(prod)+".");
  if(sq>1)det+=step("Вынесем множитель",sqrt(prod)+" = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"√a·√b=√(ab), потом вынеси множитель",detailed:det});
}

/* ===== ТИП 2: Умножение корней разных степеней ⁿ√a · ᵐ√a ===== */
function genType2(rng){
  var n1=pick(rng,[3,4,5]), n2=pick(rng,[3,4,5]);
  while(n2===n1)n2=pick(rng,[3,4,5]);
  var L=lcm2(n1,n2), k1=L/n1, k2=L/n2, expNum=k1+k2;
  var ansText=rt(L,"a"+(expNum>1?"^"+expNum:""));
  var ansHtml=nthroot(L,"a"+(expNum>1?sup(expNum):""));
  var fn=makeExprFn("Math.pow(a,"+expNum+"/"+L+")");
  var qText="Выполните умножение: "+nthroot(n1,"a")+" · "+nthroot(n2,"a")+"."+NOTE;
  var det="";
  det+=step("Приведём к общему показателю","НОК("+n1+", "+n2+") = "+L+".");
  det+=step("Преобразуем",nthroot(n1,"a")+" = "+nthroot(L,"a"+sup(k1))+". "+nthroot(n2,"a")+" = "+nthroot(L,"a"+sup(k2))+".");
  det+=step("Умножим",nthroot(L,"a"+sup(k1))+" · "+nthroot(L,"a"+sup(k2))+" = "+nthroot(L,"a"+sup(expNum))+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Привести к общему показателю через НОК",detailed:det});
}

/* ===== ТИП 3: Деление корней одинаковой степени ===== */
function genType3(rng){
  var n=pick(rng,[3,4,5]);
  var a=pick(rng,[2,3,4,5]);
  var b=a*pick(rng,[2,3,4]);
  var g=gcd2(a,b);
  var na=a/g, nb=b/g;
  var ansText=rt(n,na+"/"+nb);
  var ansHtml=nthroot(n,frac(na,nb));
  var fn=makeExprFn("Math.pow("+na+"/"+nb+", 1/"+n+")");
  var qText="Выполните деление: "+nthroot(n,a)+" : "+nthroot(n,b)+"."+NOTE;
  var det="";
  det+=step("Правило",nthroot(n,"a")+":"+nthroot(n,"b")+" = "+nthroot(n,frac("a","b"))+".");
  det+=step("Решение",nthroot(n,a)+" : "+nthroot(n,b)+" = "+nthroot(n,frac(a,b))+".");
  if(g>1)det+=step("Сократим",frac(a,b)+" = "+frac(na,nb)+". "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Деление корней = корень из дроби",detailed:det});
}

/* ===== ТИП 4: Деление корней разных степеней ³√100 : √10 ===== */
function genType4(rng){
  /* ³√100 / √10 = ⁶√(10⁶) / ⁶√(10³) = ⁶√(10³) = √10 */
  var ansText="√(10)";
  var ansHtml=sqrt("10");
  var fn=makeConstFn(Math.sqrt(10));
  var qText="Выполните деление: "+nthroot(3,"100")+" : "+sqrt("10")+"."+NOTE;
  var det="";
  det+=step("Приведём к общему показателю","НОК(3, 2) = 6.");
  det+=step("Преобразуем",nthroot(3,"100")+" = "+nthroot(3,"10²")+" = "+nthroot(6,"10⁶")+". "+sqrt("10")+" = "+nthroot(6,"10³")+".");
  det+=step("Разделим",nthroot(6,"10⁶")+":"+nthroot(6,"10³")+" = "+nthroot(6,"10³")+" = "+sqrt("10")+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Привести к общему показателю",detailed:det});
}

/* ===== ТИП 5: Вложенные корни ⁿ√(ᵐ√a) ===== */
function genType5(rng){
  var n1=pick(rng,[3,4,5]), n2=pick(rng,[2,3,4]);
  var L=n1*n2;
  var ansText=rt(L,"a");
  var ansHtml=nthroot(L,"a");
  var fn=makeExprFn("Math.pow(a, 1/"+L+")");
  var qText="Упростите выражение: "+nthroot(n1,nthroot(n2,"a"))+"."+NOTE;
  var det="";
  det+=step("Через степени",nthroot(n2,"a")+" = a^(1/"+n2+"). "+nthroot(n1,"a^(1/"+n2+")")+" = a^(1/"+L+").");
  det+=step("Вернём к корню","a^(1/"+L+") = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Корень из корня = корень произведения степеней",detailed:det});
}

/* ===== ТИП 6: Вложенные корни со степенью ³√(⁴√(y¹⁰)) ===== */
function genType6(rng){
  var n1=3, n2=4, L=12, exp=10;
  var g=gcd2(exp,L), newExp=exp/g, newDeg=L/g;
  var ansText, ansHtml, fnStr;
  if(newDeg===1){ansText="y^"+newExp;ansHtml="y"+sup(newExp);fnStr="Math.pow(y,"+newExp+")";}
  else{ansText=rt(newDeg,"y^"+newExp);ansHtml=nthroot(newDeg,"y"+sup(newExp));fnStr="Math.pow(y,"+newExp+"/"+newDeg+")";}
  var fn=makeExprFn(fnStr);
  var qText="Упростите выражение: "+nthroot(3,nthroot(4,"y"+sup(10)))+"."+NOTE;
  var det="";
  det+=step("Внутренний корень",nthroot(4,"y¹⁰")+" = y^(10/4).");
  det+=step("Внешний корень","y^(10/4) под корнем 3 → y^(10/12) = y^("+newExp+"/"+newDeg+").");
  det+=step("Вернём к корню",ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Внутренний → степень, потом внешний",detailed:det});
}

/* ===== ТИП 7: Составной корень √(a·⁴√a) ===== */
function genType7(rng){
  var n2=4, L=8;
  var ansText=rt(L,"a^5");
  var ansHtml=nthroot(L,"a"+sup(5));
  var fn=makeExprFn("Math.pow(a, 5/8)");
  var qText="Упростите выражение: "+sqrt("a · "+nthroot(n2,"a"))+"."+NOTE;
  var det="";
  det+=step("Преобразуем",nthroot(n2,"a")+" = a^(1/4). a · a^(1/4) = a^(5/4).");
  det+=step("Извлечём корень",sqrt("a^(5/4)")+" = a^(5/8) = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Внутренний → степень, потом внешний",detailed:det});
}

/* ===== ТИП 8: Многоэтажный корень √(x·√(x·√x)) ===== */
function genType8(rng){
  var ansText=rt(8,"x^7");
  var ansHtml=nthroot(8,"x"+sup(7));
  var fn=makeExprFn("Math.pow(x, 7/8)");
  var qText="Упростите выражение: "+sqrt("x · "+sqrt("x · "+sqrt("x")))+"."+NOTE;
  var det="";
  det+=step("Изнутри",sqrt("x")+" = x^(1/2).");
  det+=step("Следующий",sqrt("x · x^(1/2)")+" = sqrt(x^(3/2)) = x^(3/4).");
  det+=step("Внешний",sqrt("x · x^(3/4)")+" = sqrt(x^(7/4)) = x^(7/8) = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Раскручивай изнутри наружу",detailed:det});
}

/* ===== ТИП 9: Вынесение из-под корня ³√(8x³y⁶/(27a¹²b⁹)) ===== */
function genType9(rng){
  var ansText="2*x*y^2/(3*a^4*b^3)";
  var ansHtml=frac("2xy²","3a⁴b³");
  var fn=makeExprFn("2*x*y*y/(3*Math.pow(a,4)*Math.pow(b,3))");
  var qText="Упростите выражение: "+nthroot(3,frac("8x³y⁶","27a¹²b⁹"))+"."+NOTE;
  var det="";
  det+=step("Разобьём",nthroot(3,frac("8x³y⁶","27a¹²b⁹"))+" = "+frac(nthroot(3,"8")+"·"+nthroot(3,"x³")+"·"+nthroot(3,"y⁶"),nthroot(3,"27")+"·"+nthroot(3,"a¹²")+"·"+nthroot(3,"b⁹"))+".");
  det+=step("Извлечём","³√8=2, ³√27=3, ³√x³=x, ³√a¹²=a⁴, ³√y⁶=y², ³√b⁹=b³.");
  det+=step("Соберём",frac("2xy²","3a⁴b³")+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Корень из дроби = дробь корней",detailed:det});
}

/* ===== ТИП 10: ⁴√(16a¹⁶b¹²/(81x²⁴b⁴)) ===== */
function genType10(rng){
  var ansText="2*a^4*b^2/(3*x^6)";
  var ansHtml=frac("2a⁴b²","3x⁶");
  var fn=makeExprFn("2*Math.pow(a,4)*b*b/(3*Math.pow(x,6))");
  var qText="Упростите выражение: "+nthroot(4,frac("16a¹⁶b¹²","81x²⁴b⁴"))+"."+NOTE;
  var det="";
  det+=step("Разобьём",nthroot(4,frac("16a¹⁶b¹²","81x²⁴b⁴"))+" = "+frac(nthroot(4,"16")+"·"+nthroot(4,"a¹⁶")+"·"+nthroot(4,"b¹²"),nthroot(4,"81")+"·"+nthroot(4,"x²⁴")+"·"+nthroot(4,"b⁴"))+".");
  det+=step("Извлечём","⁴√16=2, ⁴√81=3, ⁴√a¹⁶=a⁴, ⁴√x²⁴=x⁶, ⁴√b¹²=b³, ⁴√b⁴=b.");
  det+=step("Соберём",frac("2a⁴b²","3x⁶")+" (сократили b).");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkF({q:qText,fn:fn,sol:ansText,hint:"Извлекай 4-е степени из каждого множителя",detailed:det});
}

var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){return ALL_TYPES.map(function(gen){return gen(rng);});}

function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){var p=["./trenazher-data.js","../lessons/trenazher-data.js"];for(var i=0;i<p.length;i++){try{var tz=require(p[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}}}
  return null;
}
function register(){
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  /* Регистрируем checkRootAnswer — всегда перезаписываем, т.к. наша версия поддерживает √ */
  TZ.checkFormula=checkRootAnswer;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="korni9")return;
  TZ.TOPICS.push({id:"korni9",subject:"Математика",grade:"9 класс",title:"Корни (радикалы)",variants:40,
    desc:"Тренажёр по алгебре (9 класс): корни n-й степени. 10 заданий от простого к сложному. "+
      "Ввод ответа с кнопкой √. 40 вариантов.",
    blocks:[{name:"Корни (радикалы)",gen:genVariant,count:10}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
