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
function gcd2(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
function lcm2(a,b){return Math.abs(a*b)/gcd2(a,b);}
function findSquare(n){for(var i=2;i*i<=n;i++){if(n%(i*i)===0)return i;}return 1;}

/* HTML-отрисовка корней (для q и detailed) */
function nthroot(n, expr){
  if(n===2)return "<span class='sqrt'><span class='rad'>√</span><span class='radicand'>"+expr+"</span></span>";
  return "<span class='nthroot'><span class='degree'>"+n+"</span><span class='rad'>√</span><span class='radicand'>"+expr+"</span></span>";
}
function sqrt(expr){return nthroot(2,expr);}
function sup(n){return "<sup>"+n+"</sup>";}
function frac(num,den){return "<span class='frac'><span class='num'>"+num+"</span><span class='den'>"+den+"</span></span>";}

/* Текстовые версии (Unicode, для opts/c — БЕЗ HTML) */
var SUP_MAP={"2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹","10":"¹⁰","12":"¹²","15":"¹⁵","20":"²⁰"};
function rt(n, expr){
  if(n===2)return "√"+expr;
  return (SUP_MAP[String(n)]||String(n))+"√"+expr;
}
function ft(num,den){return num+"/"+den;}

function step(title,html){return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(выберите верный ответ)</span>";

/* ===== ТИП 1: Умножение корней одинаковой степени ===== */
function genType1(rng){
  var a=ri(rng,2,12), b=ri(rng,2,12);
  var prod=a*b, sq=findSquare(prod);
  var ansText, ansHtml;
  if(sq>1){
    var rest=prod/(sq*sq);
    ansText=sq+(rest>1?"√"+rest:"");
    ansHtml=sq+(rest>1?sqrt(rest):"");
  }else{
    ansText="√"+prod; ansHtml=sqrt(prod);
  }
  var qText="Выполните умножение: "+sqrt(a)+" · "+sqrt(b)+"."+NOTE;
  var det="";
  det+=step("Правило","√a · √b = √(a·b).");
  det+=step("Решение",sqrt(a)+" · "+sqrt(b)+" = "+nthroot(2,a+"·"+b)+" = "+sqrt(prod)+".");
  if(sq>1)det+=step("Вынесем множитель",sqrt(prod)+" = "+nthroot(2,sq+"²·"+rest)+" = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  var wrong1="√"+prod;
  var wrong2="√"+(a+b);
  var wrong3="√"+a+"·√"+b;
  return mkMC({q:qText,c:ansText,opts:[ansText,wrong1,wrong2,wrong3],sol:ansText,hint:"√a·√b=√(ab)",detailed:det});
}

/* ===== ТИП 2: Умножение корней разных степеней ===== */
function genType2(rng){
  var n1=pick(rng,[3,4,5]), n2=pick(rng,[3,4,5]);
  while(n2===n1)n2=pick(rng,[3,4,5]);
  var L=lcm2(n1,n2), k1=L/n1, k2=L/n2, expNum=k1+k2;
  var ansText=rt(L,"a"+(expNum>1?SUP_MAP[String(expNum)]||expNum:""));
  var ansHtml=nthroot(L,"a"+(expNum>1?sup(expNum):""));
  var qText="Выполните умножение: "+nthroot(n1,"a")+" · "+nthroot(n2,"a")+"."+NOTE;
  var det="";
  det+=step("Приведём к общему показателю","НОК("+n1+", "+n2+") = "+L+".");
  det+=step("Преобразуем",nthroot(n1,"a")+" = "+nthroot(L,"a"+sup(k1))+". "+nthroot(n2,"a")+" = "+nthroot(L,"a"+sup(k2))+".");
  det+=step("Умножим",nthroot(L,"a"+sup(k1))+" · "+nthroot(L,"a"+sup(k2))+" = "+nthroot(L,"a"+sup(expNum))+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  var w1=rt(L,"a"+(k1*k2>1?SUP_MAP[String(k1*k2)]||k1*k2:""));
  var w2=rt(n1*n2,"a");
  var w3=rt(L,"a"+(expNum>1?SUP_MAP[String(expNum)]||expNum:""));
  return mkMC({q:qText,c:ansText,opts:[ansText,w1,w2,w3],sol:ansText,hint:"Привести к общему показателю через НОК",detailed:det});
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
  var qText="Выполните деление: "+nthroot(n,a)+" : "+nthroot(n,b)+"."+NOTE;
  var det="";
  det+=step("Правило",nthroot(n,"a")+":"+nthroot(n,"b")+" = "+nthroot(n,frac("a","b"))+".");
  det+=step("Решение",nthroot(n,a)+" : "+nthroot(n,b)+" = "+nthroot(n,frac(a,b))+".");
  if(g>1)det+=step("Сократим",frac(a,b)+" = "+frac(na,nb)+". Получим: "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,rt(n,a+"/"+b),rt(n,a)+":"+rt(n,b),na+"/"+nb],sol:ansText,hint:"Деление корней = корень из дроби",detailed:det});
}

/* ===== ТИП 4: Деление корней разных степеней ===== */
function genType4(rng){
  var n1=3, L=6, k1=2, k2=3;
  /* ³√100 / √10 = ⁶√(10⁶) / ⁶√(10³) = ⁶√(10³) = √10 */
  var exp=2*k1-k2; /* 4-3=1 */
  var g=gcd2(Math.abs(exp),L);
  var newExp=exp/g, newDeg=L/g;
  var ansText, ansHtml;
  if(newDeg===1){ansText="10";ansHtml="10";}
  else if(newDeg===2&&newExp===1){ansText="√10";ansHtml=sqrt("10");}
  else{ansText=rt(newDeg,"10"+(newExp>1?SUP_MAP[String(newExp)]||newExp:""));ansHtml=nthroot(newDeg,"10"+(newExp>1?sup(newExp):""));}
  var qText="Выполните деление: "+nthroot(3,"100")+" : "+sqrt("10")+"."+NOTE;
  var det="";
  det+=step("Приведём к общему показателю","НОК(3, 2) = 6.");
  det+=step("Преобразуем",nthroot(3,"100")+" = "+nthroot(3,"10²")+" = "+nthroot(6,"10"+sup(2*k1))+". "+sqrt("10")+" = "+nthroot(6,"10"+sup(k2))+".");
  det+=step("Разделим",nthroot(6,"10"+sup(2*k1))+":"+nthroot(6,"10"+sup(k2))+" = "+nthroot(6,"10"+sup(exp))+".");
  det+=step("Упростим",ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,"√10","10",rt(6,"10")],sol:ansText,hint:"Привести к общему показателю",detailed:det});
}

/* ===== ТИП 5: Вложенные корни ===== */
function genType5(rng){
  var n1=pick(rng,[3,4,5]), n2=pick(rng,[2,3,4]);
  var L=n1*n2;
  var ansText=rt(L,"a");
  var ansHtml=nthroot(L,"a");
  var qText="Упростите выражение: "+nthroot(n1,nthroot(n2,"a"))+"."+NOTE;
  var det="";
  det+=step("Через степени",nthroot(n2,"a")+" = a^("+ft(1,n2)+"). Тогда "+nthroot(n1,"a^("+ft(1,n2)+")")+" = a^("+ft(1,L)+").");
  det+=step("Вернём к корню","a^("+ft(1,L)+") = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,rt(L,"a"+n1),rt(n1+n2,"a"),rt(n1,"a")+"·"+rt(n2,"a")],sol:ansText,hint:"Корень из корня = корень произведения степеней",detailed:det});
}

/* ===== ТИП 6: Вложенные корни со степенью ===== */
function genType6(rng){
  var n1=3, n2=4, L=12;
  var exp=10;
  var g=gcd2(exp,L);
  var newExp=exp/g, newDeg=L/g; /* 10/2=5, 12/2=6 */
  var ansText, ansHtml;
  if(newDeg===1){ansText="y"+(SUP_MAP[String(newExp)]||newExp);ansHtml="y"+sup(newExp);}
  else{ansText=rt(newDeg,"y"+(newExp>1?SUP_MAP[String(newExp)]||newExp:""));ansHtml=nthroot(newDeg,"y"+(newExp>1?sup(newExp):""));}
  var qText="Упростите выражение: "+nthroot(3,nthroot(4,"y"+sup(10)))+"."+NOTE;
  var det="";
  det+=step("Внутренний корень",nthroot(4,"y¹⁰")+" = y^("+ft(10,4)+").");
  det+=step("Внешний корень",nthroot(3,"y^("+ft(10,4)+")")+" = y^("+ft(10,12)+").");
  if(g>1)det+=step("Сократим",ft(10,12)+" = "+ft(newExp,newDeg)+".");
  det+=step("Вернём к корню",ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,rt(L,"y¹⁰"),rt(n1+n2,"y¹⁰"),"y¹⁰"],sol:ansText,hint:"Внутренний → степень, потом внешний",detailed:det});
}

/* ===== ТИП 7: Составной корень — √(a·⁴√a) ===== */
function genType7(rng){
  var n2=4, L=8;
  /* √(a·⁴√a) = √(a^(1+1/4)) = √(a^(5/4)) = a^(5/8) = ⁸√(a⁵) */
  var ansText=rt(L,"a⁵");
  var ansHtml=nthroot(L,"a"+sup(5));
  var qText="Упростите выражение: "+sqrt("a · "+nthroot(n2,"a"))+"."+NOTE;
  var det="";
  det+=step("Преобразуем",nthroot(n2,"a")+" = a^("+ft(1,n2)+"). a · a^("+ft(1,n2)+") = a^("+ft(5,4)+").");
  det+=step("Извлечём корень",sqrt("a^("+ft(5,4)+")")+" = a^("+ft(5,8)+") = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,rt(L,"a"),"√a·"+rt(n2,"a"),rt(2*n2,"a")],sol:ansText,hint:"Внутренний корень → степень, потом внешний",detailed:det});
}

/* ===== ТИП 8: Многоэтажный корень — √(x·√(x·√x)) ===== */
function genType8(rng){
  /* = ⁸√(x⁷) */
  var ansText=rt(8,"x⁷");
  var ansHtml=nthroot(8,"x"+sup(7));
  var qText="Упростите выражение: "+sqrt("x · "+sqrt("x · "+sqrt("x")))+"."+NOTE;
  var det="";
  det+=step("Изнутри",sqrt("x")+" = x^(1/2).");
  det+=step("Следующий",sqrt("x · x^(1/2)")+" = sqrt(x^(3/2)) = x^(3/4).");
  det+=step("Внешний",sqrt("x · x^(3/4)")+" = sqrt(x^(7/4)) = x^(7/8) = "+ansHtml+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,rt(8,"x"),"√x",rt(4,"x³")],sol:ansText,hint:"Раскручивай изнутри наружу",detailed:det});
}

/* ===== ТИП 9: Вынесение из-под корня — ³√(8x³y⁶/(27a¹²b⁹)) ===== */
function genType9(rng){
  var ansText="2xy²/(3a⁴b³)";
  var ansHtml=frac("2xy²","3a⁴b³");
  var qText="Упростите выражение: "+nthroot(3,frac("8x³y⁶","27a¹²b⁹"))+"."+NOTE;
  var det="";
  det+=step("Разобьём",nthroot(3,frac("8x³y⁶","27a¹²b⁹"))+" = "+frac(nthroot(3,"8")+"·"+nthroot(3,"x³")+"·"+nthroot(3,"y⁶"),nthroot(3,"27")+"·"+nthroot(3,"a¹²")+"·"+nthroot(3,"b⁹"))+".");
  det+=step("Извлечём","³√8=2, ³√27=3, ³√x³=x, ³√a¹²=a⁴, ³√y⁶=y², ³√b⁹=b³.");
  det+=step("Соберём",frac("2xy²","3a⁴b³")+".");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,"2xy/(3ab)","8x³y⁶/(27a¹²b⁹)","2x³y⁶/(3a¹²b⁹)"],sol:ansText,hint:"Корень из дроби = дробь корней",detailed:det});
}

/* ===== ТИП 10: ⁴√(16a¹⁶b¹²/(81x²⁴b⁴)) ===== */
function genType10(rng){
  var ansText="2a⁴b²/(3x⁶)";
  var ansHtml=frac("2a⁴b²","3x⁶");
  var qText="Упростите выражение: "+nthroot(4,frac("16a¹⁶b¹²","81x²⁴b⁴"))+"."+NOTE;
  var det="";
  det+=step("Разобьём",nthroot(4,frac("16a¹⁶b¹²","81x²⁴b⁴"))+" = "+frac(nthroot(4,"16")+"·"+nthroot(4,"a¹⁶")+"·"+nthroot(4,"b¹²"),nthroot(4,"81")+"·"+nthroot(4,"x²⁴")+"·"+nthroot(4,"b⁴"))+".");
  det+=step("Извлечём","⁴√16=2, ⁴√81=3, ⁴√a¹⁶=a⁴, ⁴√x²⁴=x⁶, ⁴√b¹²=b³, ⁴√b⁴=b.");
  det+=step("Соберём",frac("2a⁴b³","3x⁶b")+" = "+frac("2a⁴b²","3x⁶")+" (сократили b).");
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ansHtml+"</span></p>";
  return mkMC({q:qText,c:ansText,opts:[ansText,"2a⁴b³/(3x⁶b)","4a⁴b³/(9x⁶b)","2ab/(3x)"],sol:ansText,hint:"Извлекай 4-е степени из каждого множителя",detailed:det});
}

/* ---------- генератор варианта ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8,genType9,genType10];
function genVariant(rng){return ALL_TYPES.map(function(gen){return gen(rng);});}

/* ---------- регистрация ---------- */
function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){var p=["./trenazher-data.js","../lessons/trenazher-data.js"];for(var i=0;i<p.length;i++){try{var tz=require(p[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}}}
  return null;
}
function register(){
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="korni9")return;
  TZ.TOPICS.push({id:"korni9",subject:"Математика",grade:"9 класс",title:"Корни (радикалы)",variants:40,
    desc:"Тренажёр по алгебре (9 класс): корни n-й степени. 10 заданий от простого к сложному.",
    blocks:[{name:"Корни (радикалы)",gen:genVariant,count:10}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
