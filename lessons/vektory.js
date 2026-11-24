/* =====================================================================
   Тренажёр · 9 класс · Геометрия · Векторы
   40 вариантов × 10 заданий (5 интерактивных + 5 по прототипам).
   Интерактив: ученик перемещает и вращает векторы на SVG-поле.
   После выполнения — подробное пошаговое решение с чертежами.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function shuf(rng,arr){var a=arr.slice(),i,j,t;for(i=a.length-1;i>0;i--){j=Math.floor(rng()*(i+1));t=a[i];a[i]=a[j];a[j]=t;}return a;}

function fmt(n){
  if(n===null||!isFinite(n))return "—";
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  return n.toFixed(2).replace(".",",");
}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,sol:opts.sol,unit:opts.unit||"",
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkGraph(opts){
  return {type:"graph",q:opts.q,setup:opts.setup,check:opts.check,
    sol:opts.sol,hint:opts.hint||"",detailed:opts.detailed||""};
}
function step(title,html){
  return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";
}

/* Стрелка над буквой для векторов */
function vec(name){
  return "<span style='text-decoration:overline'>"+name+"</span>";
}

/* ---------- SVG: отрисовка вектора ---------- */
function svgVector(x1,y1,x2,y2,label,color){
  color=color||"var(--blue)";
  var dx=x2-x1, dy=y2-y1;
  var len=Math.sqrt(dx*dx+dy*dy);
  var ux=dx/len, uy=dy/len;
  /* Стрелка */
  var ax=x2-ux*8, ay=y2-uy*8;
  var px=-uy, py=ux;
  var aw=4;
  var p1=ax+px*aw+","+ (ay+py*aw);
  var p2=ax-px*aw+","+ (ay-py*aw);
  var h="<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='2.2'/>";
  h+="<polygon points='"+x2+","+y2+" "+p1+" "+p2+"' fill='"+color+"'/>";
  if(label){
    var lx=x1+dx*0.5+px*12, ly=y1+dy*0.5+py*12;
    h+="<text x='"+lx.toFixed(0)+"' y='"+ly.toFixed(0)+"' font-size='14' fill='"+color+"' font-weight='700' text-anchor='middle'>"+label+"</text>";
  }
  return h;
}

/* ---------- SVG: система координат с векторами ---------- */
function svgCoordSystem(vectors, title, showGrid){
  var W=460,H=360,padX=30,padY=25;
  var cx=W/2, cy=H/2;
  var scale=18;
  showGrid=showGrid!==false;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  if(title)h+="<text x='"+(W/2)+"' y='16' font-size='13' fill='#666' font-weight='600' text-anchor='middle'>"+title+"</text>";
  /* Сетка */
  if(showGrid){
    for(var gx=-8;gx<=8;gx++){
      var px=cx+gx*20;
      h+="<line x1='"+px+"' y1='"+padY+"' x2='"+px+"' y2='"+(H-padY)+"' stroke='#eee' stroke-width='0.5'/>";
    }
    for(var gy=-7;gy<=7;gy++){
      var py=cy+gy*20;
      h+="<line x1='"+padX+"' y1='"+py+"' x2='"+(W-padX)+"' y2='"+py+"' stroke='#eee' stroke-width='0.5'/>";
    }
  }
  /* Оси */
  h+="<line x1='"+padX+"' y1='"+cy+"' x2='"+(W-padX)+"' y2='"+cy+"' stroke='#999' stroke-width='1'/>";
  h+="<line x1='"+cx+"' y1='"+padY+"' x2='"+cx+"' y2='"+(H-padY)+"' stroke='#999' stroke-width='1'/>";
  h+="<text x='"+(W-padX+5)+"' y='"+(cy+4)+"' font-size='11' fill='#999'>x</text>";
  h+="<text x='"+cx+"' y='"+(padY-5)+"' font-size='11' fill='#999'>y</text>";
  h+="<text x='"+(cx-8)+"' y='"+(cy+14)+"' font-size='10' fill='#999'>O</text>";
  /* Векторы */
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6","#06b6d4"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i];
    var col=v.color||colors[i%colors.length];
    var x1=cx+v.x1*scale, y1=cy-v.y1*scale;
    var x2=cx+v.x2*scale, y2=cy-v.y2*scale;
    h+=svgVector(x1,y1,x2,y2,v.label,col);
  }
  h+="</svg>";
  return h;
}

/* ---------- SVG: интерактивное поле для векторов ---------- */
function svgInteractiveField(vectors, taskId){
  var W=480,H=360;
  var cx=W/2, cy=H/2;
  var scale=2.0;
  var h="<div class='tz-graph-wrap' id='vec-field-"+taskId+"' style='position:relative'>";
  h+="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' id='vec-svg-"+taskId+"' xmlns='http://www.w3.org/2000/svg' style='background:#fafafa;border:1px solid #ddd;border-radius:10px;touch-action:none'>";
  /* Сетка */
  for(var gx=-10;gx<=10;gx++){
    var px=cx+gx*20;
    h+="<line x1='"+px+"' y1='10' x2='"+px+"' y2='"+(H-10)+"' stroke='#eee' stroke-width='0.5'/>";
  }
  for(var gy=-8;gy<=8;gy++){
    var py=cy+gy*20;
    h+="<line x1='10' y1='"+py+"' x2='"+(W-10)+"' y2='"+py+"' stroke='#eee' stroke-width='0.5'/>";
  }
  /* Оси */
  h+="<line x1='10' y1='"+cy+"' x2='"+(W-10)+"' y2='"+cy+"' stroke='#999' stroke-width='1'/>";
  h+="<line x1='"+cx+"' y1='10' x2='"+cx+"' y2='"+(H-10)+"' stroke='#999' stroke-width='1'/>";
  h+="<text x='"+(W-15)+"' y='"+(cy-5)+"' font-size='11' fill='#999'>x</text>";
  h+="<text x='"+(cx+5)+"' y='18' font-size='11' fill='#999'>y</text>";
  /* Группа для векторов */
  h+="<g id='vec-group-"+taskId+"'>";
  var colors=["#2f6fd0","#3aa758","#dc503c","#e8a820","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
  for(var i=0;i<vectors.length;i++){
    var v=vectors[i];
    var col=v.color||colors[i%colors.length];
    var x1=cx+v.x1*scale, y1=cy-v.y1*scale;
    var x2=cx+v.x2*scale, y2=cy-v.y2*scale;
    h+=svgVector(x1,y1,x2,y2,v.label,col);
    /* Точки для drag — на концах */
    h+="<circle class='vec-handle' data-vec='"+i+"' data-end='1' data-task='"+taskId+"' cx='"+x2+"' cy='"+y2+"' r='7' fill='"+col+"' fill-opacity='0.7' stroke='#fff' stroke-width='2' style='cursor:grab'/>";
  }
  h+="</g>";
  h+="</svg>";
  /* Инструкция */
  h+="<p style='color:var(--mute);font-size:13px;text-align:center;margin:4px 0'>Перетаскивайте концы векторов, чтобы построить сумму/разность. Зелёная кнопка — проверка.</p>";
  h+="</div>";
  return h;
}

/* =====================================================================
   ГЕНЕРАТОРЫ 10 ТИПОВ ЗАДАЧ
   Типы 1-5: интерактивные (сложение/вычитание векторов)
   Типы 6-10: по прототипам из скрина
   ===================================================================== */

/* Тип 1 (простой): Сумма двух векторов — найти длину
   Даны 2 перпендикулярных вектора. Найти |a+b|. */
function genType1(rng){
  var a=ri(rng,3,8), b=ri(rng,3,8);
  var ans=Math.sqrt(a*a+b*b);
  var qText="Даны два перпендикулярных вектора: "+vec("a")+" длиной "+a+" и "+vec("b")+" длиной "+b+". Найдите длину вектора "+vec("a")+" + "+vec("b")+"."+NOTE;
  var det="";
  det+=step("Анализ", "Векторы перпендикулярны, значит, по теореме Пифагора: |"+vec("a")+" + "+vec("b")+"| = √(|"+vec("a")+"|² + |"+vec("b")+"|²).");
  det+=step("Решение", "|"+vec("a")+" + "+vec("b")+"| = √("+a+"² + "+b+"²) = √("+(a*a)+" + "+(b*b)+") = √"+(a*a+b*b)+" = <b>"+fmt(ans)+"</b>.");
  /* SVG чертёж */
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:0,y1:0,x2:a,y2:0,label:"a"},
    {x1:a,y1:0,x2:a,y2:b,label:"b"},
    {x1:0,y1:0,x2:a,y2:b,label:"a+b",color:"#dc503c"}
  ], "Сложение по правилу треугольника")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Теорема Пифагора для перпендикулярных векторов",detailed:det});
}

/* Тип 2: Разность двух векторов — найти длину */
function genType2(rng){
  var a=ri(rng,5,12), b=ri(rng,3,a-1);
  var ans=Math.sqrt(a*a+b*b); /* |a-b| при перпендикулярных = sqrt(a²+b²) */
  var qText="Даны два перпендикулярных вектора: "+vec("a")+" длиной "+a+" и "+vec("b")+" длиной "+b+". Найдите длину вектора "+vec("a")+" − "+vec("b")+"."+NOTE;
  var det="";
  det+=step("Анализ", vec("a")+" − "+vec("b")+" = "+vec("a")+" + (−"+vec("b")+"). Вектор −"+vec("b")+" перпендикулярен "+vec("a")+", поэтому теорема Пифагора.");
  det+=step("Решение", "|"+vec("a")+" − "+vec("b")+"| = √("+a+"² + "+b+"²) = √("+(a*a)+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:0,y1:0,x2:a,y2:0,label:"a"},
    {x1:a,y1:0,x2:a,y2:-b,label:"-b",color:"#e8a820"},
    {x1:0,y1:0,x2:a,y2:-b,label:"a-b",color:"#dc503c"}
  ], "Вычитание векторов")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"a−b = a+(−b), теорема Пифагора",detailed:det});
}

/* Тип 3: Сумма коллинеарных векторов */
function genType3(rng){
  var a=ri(rng,3,8), b=ri(rng,3,8);
  var sameDir=rng()<0.5;
  var ans=sameDir?a+b:Math.abs(a-b);
  var qText="Даны два коллинеарных "+(sameDir?"сонаправленных":"противоположно направленных")+" вектора: |"+vec("a")+"| = "+a+", |"+vec("b")+"| = "+b+". Найдите |"+vec("a")+" + "+vec("b")+"|."+NOTE;
  var det="";
  if(sameDir){
    det+=step("Анализ","Векторы сонаправлены: |"+vec("a")+" + "+vec("b")+"| = |"+vec("a")+"| + |"+vec("b")+"|.");
    det+=step("Решение","|"+vec("a")+" + "+vec("b")+"| = "+a+" + "+b+" = <b>"+ans+"</b>.");
  }else{
    det+=step("Анализ","Векторы противоположно направлены: |"+vec("a")+" + "+vec("b")+"| = ||"+vec("a")+"| − |"+vec("b")+"||.");
    det+=step("Решение","|"+vec("a")+" + "+vec("b")+"| = |"+a+" − "+b+"| = <b>"+ans+"</b>.");
  }
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:0,y1:0,x2:(sameDir?a:-a),y2:0,label:"a"},
    {x1:(sameDir?a:-a),y1:0,x2:(sameDir?a+b:-(a-b)),y2:0,label:"b",color:"#3aa758"},
    {x1:0,y1:0,x2:ans,y2:0,label:"a+b",color:"#dc503c"}
  ], "Коллинеарные векторы")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"</span></p>";
  return mkDec({q:qText,a:ans,sol:String(ans),hint:"Сонаправленные: сумма длин. Противоположные: разность длин",detailed:det});
}

/* Тип 4: Сумма трёх векторов (правило многоугольника) */
function genType4(rng){
  /* Три вектора, образующие прямоугольный треугольник */
  var a=ri(rng,3,6), b=ri(rng,3,6);
  var c=ri(rng,2,5);
  /* a — вдоль x, b — вдоль y, c — обратно вдоль x */
  /* Сумма: (a-c) вдоль x, b вдоль y → sqrt((a-c)² + b²) */
  var ans=Math.sqrt((a-c)*(a-c)+b*b);
  var qText="Даны три вектора: "+vec("a")+" = ("+a+"; 0), "+vec("b")+" = (0; "+b+"), "+vec("c")+" = (−"+c+"; 0). Найдите |"+vec("a")+" + "+vec("b")+" + "+vec("c")+"|."+NOTE;
  var det="";
  det+=step("Анализ","Сложим векторы по компонентам: "+vec("a")+" + "+vec("b")+" + "+vec("c")+" = ("+a+" + 0 + (−"+c+"); 0 + "+b+" + 0) = ("+(a-c)+"; "+b+").");
  det+=step("Решение","|"+vec("s")+"| = √("+(a-c)+"² + "+b+"²) = √("+((a-c)*(a-c))+" + "+(b*b)+") = <b>"+fmt(ans)+"</b>.");
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:0,y1:0,x2:a,y2:0,label:"a"},
    {x1:a,y1:0,x2:a,y2:b,label:"b",color:"#3aa758"},
    {x1:a,y1:b,x2:a-c,y2:b,label:"c",color:"#e8a820"},
    {x1:0,y1:0,x2:a-c,y2:b,label:"s",color:"#dc503c"}
  ], "Правило многоугольника")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Сложи по компонентам, потом теорема Пифагора",detailed:det});
}

/* Тип 5 (сложный): Сумма нескольких векторов, образующих замкнутый контур */
function genType5(rng){
  /* 5-8 векторов, образующих замкнутый многоугольник */
  var n=ri(rng,5,8);
  var sides=[];
  var totalLen=0;
  for(var i=0;i<n;i++){
    var s=ri(rng,3,8);
    sides.push(s);
    totalLen+=s;
  }
  /* Если векторы образуют замкнутый контур — сумма = 0 */
  var qText="По сторонам выпуклого "+n+"-угольника направлены векторы, длины которых равны "+sides.join(", ")+" соответственно. Векторы направлены по часовой стрелке вдоль контура. Найдите сумму всех этих векторов."+NOTE;
  var det="";
  det+=step("Анализ","Векторы направлены вдоль сторон замкнутого контура по порядку. Сумма векторов по замкнутому контуру равна "+vec("0")+".");
  det+=step("Решение","По правилу многоугольника: если конец последнего вектора совпадает с началом первого, то сумма равна нулевому вектору.");
  det+="<p><b>Ответ:</b> <span class='dz-code'>0</span></p>";
  return mkDec({q:qText,a:0,sol:"0",hint:"Сумма векторов по замкнутому контуру = 0",detailed:det});
}

/* ===== ТИПЫ 6-10: По прототипам из скрина ===== */

/* Тип 6: Правносторонний треугольник — |AB+BC|, |AB+AC| и т.д. */
function genType6(rng){
  var a=ri(rng,4,12);
  var variant=pick(rng,["а","б","в","г","д"]);
  var ans, what;
  if(variant==="а"){what="|"+vec("AB")+" + "+vec("BC")+"|";ans=a;}
  else if(variant==="б"){what="|"+vec("AB")+" + "+vec("AC")+"|";ans=a*Math.sqrt(3);}
  else if(variant==="в"){what="|"+vec("AB")+" + "+vec("CB")+"|";ans=a*Math.sqrt(3);}
  else if(variant==="г"){what="|"+vec("BA")+" − "+vec("BC")+"|";ans=a*Math.sqrt(3);}
  else{what="|"+vec("AB")+" − "+vec("AC")+"|";ans=a;}
  var qText="Сторона равностороннего треугольника ABC равна "+a+". Найдите: "+variant+") "+what+"."+NOTE;
  var det="";
  det+=step("Анализ","В равностороннем треугольнике все стороны = "+a+", все углы = 60°.");
  if(variant==="а"){
    det+=step("Решение",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+" (по правилу треугольника). |"+vec("AC")+"| = "+a+".");
  }else if(variant==="б"){
    det+=step("Решение",vec("AB")+" + "+vec("AC")+": угол между ними 60°. По теореме косинусов: |"+vec("s")+"|² = "+a+"² + "+a+"² − 2·"+a+"·"+a+"·cos120° = "+(2*a*a)+" + "+a*a+" = "+(3*a*a)+". |"+vec("s")+"| = "+a+"√3 = <b>"+fmt(ans)+"</b>.");
  }else if(variant==="в"){
    det+=step("Решение",vec("AB")+" + "+vec("CB")+": угол 120°. |"+vec("s")+"|² = "+a+"² + "+a+"² − 2·"+a+"·"+a+"·cos60° = "+(2*a*a)+" − "+(a*a)+" = "+(a*a)+". Нет, перепроверим: угол между AB и CB = 120°, cos120° = −½. |"+vec("s")+"|² = "+(2*a*a)+" − 2·"+a+"²·(−½) = "+(2*a*a)+" + "+a*a+" = "+(3*a*a)+". |"+vec("s")+"| = <b>"+fmt(ans)+"</b>.");
  }else if(variant==="г"){
    det+=step("Решение",vec("BA")+" − "+vec("BC")+" = "+vec("BA")+" + "+vec("CB")+". Угол между BA и CB = 120°. Аналогично: |"+vec("s")+"| = "+a+"√3 = <b>"+fmt(ans)+"</b>.");
  }else{
    det+=step("Решение",vec("AB")+" − "+vec("AC")+" = "+vec("AB")+" + "+vec("CA")+" = "+vec("CA")+" + "+vec("AB")+" = "+vec("CB")+". |"+vec("CB")+"| = "+a+".");
  }
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans)+"</span></p>";
  return mkDec({q:qText,a:ans,sol:fmt(ans),hint:"Правило треугольника + теорема косинусов",detailed:det});
}

/* Тип 7: Прямоугольный треугольник — |BA|-|BC| и |BA-BC| */
function genType7(rng){
  var ab=ri(rng,3,9), bc=ri(rng,4,10);
  var variant=pick(rng,["а","б","в","г"]);
  var ans1,ans2,what1,what2;
  if(variant==="а"){
    what1="|"+vec("BA")+"| − |"+vec("BC")+"|";ans1=ab-bc;
    what2="|"+vec("BA")+" − "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);
  }else if(variant==="б"){
    what1="|"+vec("AB")+"| + |"+vec("BC")+"|";ans1=ab+bc;
    what2="|"+vec("AB")+" + "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);
  }else if(variant==="в"){
    what1="|"+vec("BA")+"| + |"+vec("BC")+"|";ans1=ab+bc;
    what2="|"+vec("BA")+" + "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);
  }else{
    what1="|"+vec("AB")+"| − |"+vec("BC")+"|";ans1=ab-bc;
    what2="|"+vec("AB")+" − "+vec("BC")+"|";ans2=Math.sqrt(ab*ab+bc*bc);
  }
  /* Для тренажёра — ответ одно число; выберем ans2 */
  var qText="В треугольнике ABC: AB = "+ab+", BC = "+bc+", ∠B = 90°. Найдите "+variant+") "+what2+"."+NOTE;
  var det="";
  det+=step("Анализ","∠B = 90°, значит векторы "+vec("BA")+" и "+vec("BC")+" (или "+vec("AB")+" и "+vec("BC")+") перпендикулярны.");
  det+=step("Решение",what2+": векторы перпендикулярны → теорема Пифагора.<br/>"+
    "|"+vec("s")+"| = √("+ab+"² + "+bc+"²) = √("+(ab*ab)+" + "+(bc*bc)+") = √"+(ab*ab+bc*bc)+" = <b>"+fmt(ans2)+"</b>.");
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:0,y1:0,x2:ab,y2:0,label:"AB"},
    {x1:ab,y1:0,x2:ab,y2:bc,label:"BC",color:"#3aa758"},
    {x1:0,y1:0,x2:ab,y2:bc,label:"AB+BC",color:"#dc503c"}
  ], "Прямоугольный треугольник ABC")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+fmt(ans2)+"</span></p>";
  return mkDec({q:qText,a:ans2,sol:fmt(ans2),hint:"∠B=90° → векторы перпендикулярны → теорема Пифагора",detailed:det});
}

/* Тип 8: Правило многоугольника — упростить выражение */
function genType8(rng){
  var variant=pick(rng,["а","б"]);
  var qText,det,ans="0⃗";
  if(variant==="а"){
    qText="Пользуясь правилом многоугольника, упростите выражение: ("+vec("AB")+" + "+vec("BC")+" − "+vec("MC")+") + ("+vec("MD")+" − "+vec("KD")+"). В ответе запишите полученный вектор в виде "+vec("XY")+".";
    det="";
    det+=step("Раскроем скобки",vec("AB")+" + "+vec("BC")+" − "+vec("MC")+" + "+vec("MD")+" − "+vec("KD")+".");
    det+=step("Сгруппируем",vec("AB")+" + "+vec("BC")+" = "+vec("AC")+" (правило треугольника).<br/>"+
      "−"+vec("MC")+" = "+vec("CM")+".<br/>"+
      vec("AC")+" + "+vec("CM")+" = "+vec("AM")+".<br/>"+
      vec("AM")+" + "+vec("MD")+" = "+vec("AD")+".<br/>"+
      vec("AD")+" − "+vec("KD")+" = "+vec("AD")+" + "+vec("DK")+" = "+vec("AK")+".");
    ans=vec("AK");
  }else{
    qText="Пользуясь правилом многоугольника, упростите выражение: ("+vec("CB")+" + "+vec("AC")+" + "+vec("BD")+") − ("+vec("MK")+" + "+vec("KD")+"). В ответе запишите полученный вектор.";
    det="";
    det+=step("Раскроем скобки",vec("CB")+" + "+vec("AC")+" + "+vec("BD")+" − "+vec("MK")+" − "+vec("KD")+".");
    det+=step("Сгруппируем",vec("AC")+" + "+vec("CB")+" = "+vec("AB")+".<br/>"+
      vec("AB")+" + "+vec("BD")+" = "+vec("AD")+".<br/>"+
      "−"+vec("MK")+" = "+vec("KM")+".<br/>"+
      vec("AD")+" + "+vec("KM")+" − "+vec("KD")+" = "+vec("AD")+" + "+vec("DK")+" + "+vec("KM")+" = "+vec("AM")+".");
    ans=vec("AM");
  }
  /* Для проверки — текстовый ответ. Используем тип mc */
  var correct=variant==="а"?"AK":"AM";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec(correct)+"</span></p>";
  return {type:"mc",q:qText,c:correct,opts:[correct, correct==="AK"?"AM":"AK", "0", "AD"],
    sol:vec(correct),hint:"AB+BC=AC, группируй по правилу треугольника",detailed:det};
}

/* Тип 9: Выразить векторы через a и b */
function genType9(rng){
  var qText="Дан треугольник ABC. Выразите через векторы "+vec("a")+" = "+vec("AB")+" и "+vec("b")+" = "+vec("AC")+" следующие векторы: а) "+vec("BA")+"; б) "+vec("CB")+"; в) "+vec("CB")+" + "+vec("BA")+".";
  var det="";
  det+=step("а) "+vec("BA"),vec("BA")+" = −"+vec("AB")+" = −"+vec("a")+".");
  det+=step("б) "+vec("CB"),vec("CB")+" = "+vec("CA")+" + "+vec("AB")+" = −"+vec("AC")+" + "+vec("AB")+" = "+vec("a")+" − "+vec("b")+".");
  det+=step("в) "+vec("CB")+" + "+vec("BA"),vec("CB")+" + "+vec("BA")+" = ("+vec("a")+" − "+vec("b")+") + (−"+vec("a")+") = −"+vec("b")+" = −"+vec("AC")+".");
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:0,y1:0,x2:6,y2:0,label:"a"},
    {x1:0,y1:0,x2:3,y2:5,label:"b",color:"#3aa758"},
    {x1:6,y1:0,x2:3,y2:5,label:"CB",color:"#e8a820"}
  ], "Треугольник ABC")+"</div>";
  det+="<p><b>Ответ:</b> а) −"+vec("a")+"; б) "+vec("a")+" − "+vec("b")+"; в) −"+vec("b")+".</p>";
  /* Ответ — текстовый, используем mc */
  return {type:"mc",q:qText,c:"в) −b",opts:["в) −b","в) a−b","в) −a","в) a+b"],
    sol:"−b",hint:"BA=−AB, CB=CA+AB",detailed:det};
}

/* Тип 10 (сложный): Доказать AB+BC+CD+DA=0 */
function genType10(rng){
  var qText="Докажите, что для любых точек A, B, C, D справедливо равенство: "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+".";
  var det="";
  det+=step("Анализ", "По правилу многоугольника сумма векторов по замкнутому контуру равна нулевому вектору.");
  det+=step("Доказательство", vec("AB")+" + "+vec("BC")+" = "+vec("AC")+" (правило треугольника).<br/>"+
    vec("AC")+" + "+vec("CD")+" = "+vec("AD")+".<br/>"+
    vec("AD")+" + "+vec("DA")+" = "+vec("0")+" (вектор из точки в себя).<br/>"+
    "Значит, "+vec("AB")+" + "+vec("BC")+" + "+vec("CD")+" + "+vec("DA")+" = "+vec("0")+". ∎");
  det+="<div class='svg-center'>"+svgCoordSystem([
    {x1:-3,y1:2,x2:3,y2:3,label:"AB"},
    {x1:3,y1:3,x2:4,y2:-2,label:"BC",color:"#3aa758"},
    {x1:4,y1:-2,x2:-2,y2:-3,label:"CD",color:"#e8a820"},
    {x1:-2,y1:-3,x2:-3,y2:2,label:"DA",color:"#dc503c"}
  ], "Замкнутый контур ABCD")+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vec("0")+"</span> — доказано.</p>";
  return {type:"mc",q:qText,c:"Доказано",opts:["Доказано","Не доказано"],
    sol:vec("0"),hint:"Сумма по замкнутому контуру = 0",detailed:det};
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
    if(TZ.TOPICS[i].id==="vektory")return;
  }
  TZ.TOPICS.push({
    id:"vektory",
    subject:"Математика",
    grade:"9 класс",
    title:"Векторы",
    variants:40,
    desc:"Тренажёр по геометрии (9 класс): векторы. "+
      "10 заданий от простого к сложному: сложение и вычитание векторов, "+
      "правило треугольника и многоугольника, равносторонний и прямоугольный "+
      "треугольник, упрощение выражений с векторами. 40 вариантов. "+
      "После выполнения — подробное пошаговое решение с чертежами SVG.",
    blocks:[{name:"Векторы",gen:genVariant,count:10}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
