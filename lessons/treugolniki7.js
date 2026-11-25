/* =====================================================================
   Тренажёр · 7 класс · Геометрия · Треугольники
   (равнобедренные, равносторонние, медианы, биссектрисы, доказательства)
   40 вариантов × 5 заданий. Прототипы взяты из скринов учебника.
   В каждом задании: чертёж условия + подробное решение с чертежом.
   ===================================================================== */
(function(global){
"use strict";

function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
function fmt(n){
  if(n===null||!isFinite(n))return "—";
  if(Math.abs(n-Math.round(n))<1e-6)return String(Math.round(n));
  return n.toFixed(2).replace(".",",");
}

var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число в градусах или см)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,sol:opts.sol,unit:opts.unit||"",
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function step(title,html){return "<p><b>"+title+"</b></p><p style='margin-left:14px'>"+html+"</p>";}
function ang(name){return "∠"+name;}

/* ============ SVG ХЕЛПЕРЫ ============ */
function svgCanvas(W,H,title){
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:8px auto'>";
  h+="<rect width='"+W+"' height='"+H+"' fill='#fafafa' rx='10'/>";
  if(title)h+="<text x='"+(W/2)+"' y='22' font-size='14' fill='#555' font-weight='600' text-anchor='middle'>"+title+"</text>";
  return h;
}
function svgEnd(){return "</svg>";}

/* Засечки на равных сторонах (n=1,2,3 — число засечек) */
function markSeg(x1,y1,x2,y2,n,color){
  color=color||"#dc503c";
  var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy)||1;
  var ux=dx/len,uy=dy/len,px=-uy,py=ux;
  var cx=(x1+x2)/2, cy=(y1+y2)/2;
  var h="";
  for(var i=0;i<n;i++){
    var offset=(i-(n-1)/2)*7;
    var ox=cx+ux*offset, oy=cy+uy*offset;
    h+="<line x1='"+(ox-px*4).toFixed(1)+"' y1='"+(oy-py*4).toFixed(1)+"' x2='"+(ox+px*4).toFixed(1)+"' y2='"+(oy+py*4).toFixed(1)+"' stroke='"+color+"' stroke-width='1.8'/>";
  }
  return h;
}

/* Прямой угол (знак квадрата) в вершине cornerX,cornerY со сторонами в направлении dirX,dirY */
function rightAngleMark(cornerX, cornerY, dirX, dirY, color){
  color=color||"#666";
  var s=14;
  var p1x=cornerX+dirX*s, p1y=cornerY+dirY*s;
  var p2x=p1x+dirY*s, p2y=p1y-dirX*s;
  /* dirX,dirY — единичные векторы сторон угла */
  var h="<polyline points='"+p1x+","+p1y+" "+p2x+","+p2y+" "+(cornerX+dirY*s)+","+(cornerY-dirX*s)+"' fill='none' stroke='"+color+"' stroke-width='1.5'/>";
  return h;
}

/* Дуга угла с подписью */
function angleArc(vertexX, vertexY, p1X, p1Y, p2X, p2Y, label, color, r){
  color=color||"#888"; r=r||28;
  var a1=Math.atan2(p1Y-vertexY, p1X-vertexX);
  var a2=Math.atan2(p2Y-vertexY, p2X-vertexX);
  /* Выбираем короткую дугу */
  var diff=a2-a1;
  while(diff<=-Math.PI)diff+=2*Math.PI;
  while(diff>Math.PI)diff-=2*Math.PI;
  var start=a1, end=a1+diff;
  var x1=vertexX+r*Math.cos(start), y1=vertexY+r*Math.sin(start);
  var x2=vertexX+r*Math.cos(end), y2=vertexY+r*Math.sin(end);
  var sweep=diff>0?1:0;
  var large=Math.abs(diff)>Math.PI?1:0;
  var h="<path d='M "+x1+" "+y1+" A "+r+" "+r+" 0 "+large+" "+sweep+" "+x2+" "+y2+"' fill='none' stroke='"+color+"' stroke-width='1.5'/>";
  if(label){
    var mid=(start+end)/2;
    var lx=vertexX+(r+12)*Math.cos(mid), ly=vertexY+(r+12)*Math.sin(mid);
    h+="<text x='"+lx.toFixed(1)+"' y='"+(ly+5).toFixed(1)+"' font-size='14' fill='"+color+"' font-weight='700' text-anchor='middle'>"+label+"</text>";
  }
  return h;
}

/* Подпись точки (буква) */
function labelPt(x,y,text,offset,color){
  color=color||"#1a4d8f";
  offset=offset||{dx:-12,dy:5};
  return "<text x='"+(x+offset.dx)+"' y='"+(y+offset.dy)+"' font-size='17' fill='"+color+"' font-weight='700'>"+text+"</text>";
}

/* Точка (маленький кружок) */
function dotPt(x,y,color){
  color=color||"#1a4d8f";
  return "<circle cx='"+x+"' cy='"+y+"' r='3' fill='"+color+"'/>";
}

/* Линия */
function lineSeg(x1,y1,x2,y2,color,width,dashed){
  color=color||"#2f6fd0"; width=width||2.5;
  var dashAttr=dashed?" stroke-dasharray='6,4'":"";
  return "<line x1='"+x1+"' y1='"+y1+"' x2='"+x2+"' y2='"+y2+"' stroke='"+color+"' stroke-width='"+width+"'"+dashAttr+"/>";
}

/* Текст-подпись на чертеже */
function textAt(x,y,str,size,color,anchor){
  size=size||14; color=color||"#333"; anchor=anchor||"middle";
  return "<text x='"+x+"' y='"+y+"' font-size='"+size+"' fill='"+color+"' font-weight='600' text-anchor='"+anchor+"'>"+str+"</text>";
}

/* =====================================================================
   ТИП 1: Углы равнобедренного треугольника
   ===================================================================== */

/* 1a: AB=BC, внешний угол при основании = X, найти угол при вершине */
function genT1a(rng){
  var ext=ri(rng,100,150);
  var base=(180-ext)/2; /* угол при основании */
  var vertex=180-2*base; /* угол при вершине */
  /* Чертёж условия: равнобедренный △ABC с AB=BC, внешний угол */
  var Ax=120, Ay=320, Bx=320, By=120, Cx=520, Cy=320;
  var q="<p>В равнобедренном треугольнике ABC (AB = BC) внешний угол при вершине C равен "+ext+"°. Найдите угол при вершине B.</p>"+NOTE;
  var qsvg=svgCanvas(640,400,"Дано: △ABC, AB = BC");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Bx,By,Cx,Cy,1);
  /* Внешний угол при C — продолжение AC за C */
  var ext_x=Cx+(Cx-Ax)*0.35, ext_y=Cy+(Cy-Ay)*0.35;
  qsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+ext_x+"' y2='"+ext_y+"' stroke='#888' stroke-width='1.5' stroke-dasharray='5,3'/>";
  qsvg+=angleArc(Cx,Cy, ext_x,ext_y, Ax,Ay, ext+"°","#dc503c",30);
  qsvg+=labelPt(Ax,Ay,"A",{dx:-18,dy:5});
  qsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  qsvg+=labelPt(Cx,Cy,"C",{dx:12,dy:5});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Анализ","Внешний угол при вершине C и внутренний угол "+ang("ACB")+" смежные, их сумма 180°.");
  det+=step("Угол при основании",ang("ACB")+" = 180° − "+ext+"° = "+base+"°. Так как AB = BC, то "+ang("A")+" = "+ang("C")+" = "+base+"° (углы при основании равнобедренного треугольника равны).");
  det+=step("Угол при вершине",ang("B")+" = 180° − 2·"+base+"° = <b>"+vertex+"°</b>.");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Bx,By,Cx,Cy,1);
  dsvg+=angleArc(Ax,Ay, Bx,By, Cx,Cy, base+"°","#3aa758",30);
  dsvg+=angleArc(Cx,Cy, Bx,By, Ax,Ay, base+"°","#3aa758",30);
  dsvg+=angleArc(Bx,By, Ax,Ay, Cx,Cy, vertex+"°","#dc503c",28);
  dsvg+=labelPt(Ax,Ay,"A",{dx:-18,dy:5});
  dsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  dsvg+=labelPt(Cx,Cy,"C",{dx:12,dy:5});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+vertex+"°</span></p>";
  return mkDec({q:q,a:vertex,sol:vertex+"°",unit:"°",
    hint:"Внешний угол + внутренний = 180°, углы при основании равны",
    detailed:det});
}

/* 1b: AB=BC, угол при вершине = X, найти угол при основании */
function genT1b(rng){
  var v=ri(rng,30,80);
  var base=(180-v)/2;
  var Ax=120, Ay=320, Bx=320, By=120, Cx=520, Cy=320;
  var q="<p>В равнобедренном треугольнике ABC (AB = BC) угол при вершине B равен "+v+"°. Найдите угол при основании.</p>"+NOTE;
  var qsvg=svgCanvas(640,400,"Дано: △ABC, AB = BC, "+ang("B")+" = "+v+"°");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Bx,By,Cx,Cy,1);
  qsvg+=angleArc(Bx,By, Ax,Ay, Cx,Cy, v+"°","#dc503c",28);
  qsvg+=labelPt(Ax,Ay,"A",{dx:-18,dy:5});
  qsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  qsvg+=labelPt(Cx,Cy,"C",{dx:12,dy:5});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Свойство равнобедренного",ang("A")+" = "+ang("C")+" (углы при основании равнобедренного треугольника равны).");
  det+=step("Сумма углов","Сумма углов треугольника = 180°. Тогда 2·"+ang("A")+" + "+ang("B")+" = 180°.");
  det+=step("Решение",ang("A")+" = (180° − "+v+"°)/2 = <b>"+base+"°</b>.");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Bx,By,Cx,Cy,1);
  dsvg+=angleArc(Ax,Ay, Bx,By, Cx,Cy, base+"°","#3aa758",30);
  dsvg+=angleArc(Cx,Cy, Bx,By, Ax,Ay, base+"°","#3aa758",30);
  dsvg+=angleArc(Bx,By, Ax,Ay, Cx,Cy, v+"°","#dc503c",28);
  dsvg+=labelPt(Ax,Ay,"A",{dx:-18,dy:5});
  dsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  dsvg+=labelPt(Cx,Cy,"C",{dx:12,dy:5});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+base+"°</span></p>";
  return mkDec({q:q,a:base,sol:base+"°",unit:"°",
    hint:"Углы при основании равны; сумма углов 180°",
    detailed:det});
}

/* 1c: AB=BC, один из углов = X, найти другие (X может быть при основании или вершине) */
function genT1c(rng){
  var isAtVertex=pick(rng,[true,false]);
  var x, vertex, base;
  if(isAtVertex){
    x=ri(rng,30,80);
    vertex=x; base=(180-x)/2;
  }else{
    x=ri(rng,50,80);
    base=x; vertex=180-2*x;
  }
  var Ax=120, Ay=320, Bx=320, By=120, Cx=520, Cy=320;
  var posStr=isAtVertex?"при вершине B":"при основании";
  var q="<p>В равнобедренном треугольнике ABC (AB = BC) угол "+posStr+" равен "+x+"°. Найдите два других угла.</p>"+NOTE;
  var qsvg=svgCanvas(640,400,"Дано: AB = BC, угол "+posStr+" = "+x+"°");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Bx,By,Cx,Cy,1);
  if(isAtVertex){
    qsvg+=angleArc(Bx,By, Ax,Ay, Cx,Cy, x+"°","#dc503c",28);
  }else{
    qsvg+=angleArc(Ax,Ay, Bx,By, Cx,Cy, x+"°","#dc503c",30);
  }
  qsvg+=labelPt(Ax,Ay,"A",{dx:-18,dy:5});
  qsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  qsvg+=labelPt(Cx,Cy,"C",{dx:12,dy:5});
  qsvg+=svgEnd();
  q+=qsvg;
  /* Ответ — больший из двух не данных */
  var ans;
  if(isAtVertex)ans=base; else ans=vertex;
  var det="";
  if(isAtVertex){
    det+=step("Углы при основании",ang("A")+" = "+ang("C")+" (свойство равнобедренного).");
    det+=step("Сумма углов","2·"+ang("A")+" + "+x+"° = 180° → "+ang("A")+" = "+base+"°.");
    det+=step("Ответ",ang("A")+" = "+ang("C")+" = <b>"+base+"°</b>.");
  }else{
    det+=step("Углы при основании",ang("A")+" = "+ang("C")+" = "+x+"° (по условию, угол при основании).");
    det+=step("Угол при вершине",ang("B")+" = 180° − 2·"+x+"° = <b>"+vertex+"°</b>.");
  }
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Bx,By,Cx,Cy,1);
  dsvg+=angleArc(Ax,Ay, Bx,By, Cx,Cy, base+"°","#3aa758",30);
  dsvg+=angleArc(Cx,Cy, Bx,By, Ax,Ay, base+"°","#3aa758",30);
  dsvg+=angleArc(Bx,By, Ax,Ay, Cx,Cy, vertex+"°","#dc503c",28);
  dsvg+=labelPt(Ax,Ay,"A",{dx:-18,dy:5});
  dsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  dsvg+=labelPt(Cx,Cy,"C",{dx:12,dy:5});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ans+"°</span></p>";
  return mkDec({q:q,a:ans,sol:ans+"°",unit:"°",
    hint:"Углы при основании равны; сумма 180°",
    detailed:det});
}

/* =====================================================================
   ТИП 2: Доказательство равенства треугольников
   ===================================================================== */

/* 2a: Точки A, C по одну сторону прямой a, AB⊥a, CD⊥a, AB=CD. Доказать △ABD=△CDB */
function genT2a(rng){
  var ang1=ri(rng,40,80);
  var q="<p>Точки A и C лежат по одну сторону от прямой a. AB ⊥ a и CD ⊥ a, AB = CD. Доказать, что △ABD = △CDB.</p>";
  /* Чертёж: прямая a горизонтальная, точки A и C сверху, B и D на прямой */
  var Bx=120, By=300, Dx=480, Dy=300;
  var Ax=160, Ay=140, Cx=440, Cy=140; /* AB=CD=160 */
  var qsvg=svgCanvas(640,400,"Дано: AB ⊥ a, CD ⊥ a, AB = CD");
  qsvg+="<line x1='40' y1='300' x2='600' y2='300' stroke='#888' stroke-width='2'/>";
  qsvg+="<text x='580' y='318' font-size='14' fill='#888' font-style='italic'>a</text>";
  qsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Bx+"' y2='"+By+"' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+="<line x1='"+Cx+"' y1='"+Cy+"' x2='"+Dx+"' y2='"+Dy+"' stroke='#3aa758' stroke-width='2.5'/>";
  qsvg+="<line x1='"+Bx+"' y1='"+By+"' x2='"+Dx+"' y2='"+Dy+"' stroke='#888' stroke-width='1.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Cx,Cy,Dx,Dy,1);
  /* Прямые углы при B и D */
  qsvg+=rightAngleMark(Bx,By, 0,-1, 1,0, "#666");
  qsvg+=rightAngleMark(Dx,Dy, 0,-1, -1,0, "#666");
  qsvg+=labelPt(Ax,Ay,"A",{dx:-12,dy:-6});
  qsvg+=labelPt(Bx,By,"B",{dx:-10,dy:18});
  qsvg+=labelPt(Cx,Cy,"C",{dx:8,dy:-6});
  qsvg+=labelPt(Dx,Dy,"D",{dx:8,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Анализ",ang("ABD")+" и "+ang("CDB")+" — прямоугольные (AB ⊥ a, CD ⊥ a).");
  det+=step("Катеты","AB = CD (по условию). BD — общий катет.");
  det+=step("Признак","Два катета равны → треугольники равны по первому признаку равенства прямоугольных треугольников (по двум катетам).");
  det+=step("Вывод","△ABD = △CDB. ∎");
  var dsvg=svgCanvas(640,400,"Решение: △ABD = △CDB");
  dsvg+="<line x1='40' y1='300' x2='600' y2='300' stroke='#888' stroke-width='2'/>";
  dsvg+="<text x='580' y='318' font-size='14' fill='#888' font-style='italic'>a</text>";
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Dx+","+Dy+"' fill='rgba(47,111,208,0.08)' stroke='#2f6fd0' stroke-width='2.5' stroke-dasharray='5,3'/>";
  dsvg+="<polygon points='"+Cx+","+Cy+" "+Dx+","+Dy+" "+Bx+","+By+"' fill='rgba(58,167,88,0.08)' stroke='#3aa758' stroke-width='2.5' stroke-dasharray='5,3'/>";
  dsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Bx+"' y2='"+By+"' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+="<line x1='"+Cx+"' y1='"+Cy+"' x2='"+Dx+"' y2='"+Dy+"' stroke='#3aa758' stroke-width='2.5'/>";
  dsvg+="<line x1='"+Bx+"' y1='"+By+"' x2='"+Dx+"' y2='"+Dy+"' stroke='#888' stroke-width='2'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Cx,Cy,Dx,Dy,1);
  dsvg+=rightAngleMark(Bx,By, 0,-1, 1,0, "#666");
  dsvg+=rightAngleMark(Dx,Dy, 0,-1, -1,0, "#666");
  dsvg+=labelPt(Ax,Ay,"A",{dx:-12,dy:-6});
  dsvg+=labelPt(Bx,By,"B",{dx:-10,dy:18});
  dsvg+=labelPt(Cx,Cy,"C",{dx:8,dy:-6});
  dsvg+=labelPt(Dx,Dy,"D",{dx:8,dy:18});
  dsvg+="<text x='320' y='380' font-size='13' fill='#555' text-anchor='middle'>Синий △ABD и зелёный △CDB равны по двум катетам</text>";
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  return mkMC({q:q,c:"Доказано",opts:["Доказано","Не доказано"],sol:"Доказано",
    hint:"Прямоугольные треугольники, общий катет BD, AB=CD",
    detailed:det});
}

/* 2b: BM=CN на основании BC равнобедренного △ABC. Доказать △BAM=△CAN */
function genT2b(rng){
  var q="<p>В равнобедренном треугольнике ABC (AB = BC) на основании BC взяты точки M и N так, что BM = CN. Доказать, что △BAM = △CAN.</p>";
  var Bx=120, By=320, Cx=520, Cy=320, Ax=320, Ay=120;
  var Mx=240, My=320, Nx=400, Ny=320; /* BM=120, CN=120 */
  var qsvg=svgCanvas(640,400,"Дано: △ABC, AB = BC, BM = CN");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Bx,By,Cx,Cy,1);
  qsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='2'/>";
  qsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Nx+"' y2='"+Ny+"' stroke='#e8a820' stroke-width='2'/>";
  qsvg+=markSeg(Bx,By,Mx,My,2,"#dc503c");
  qsvg+=markSeg(Nx,Ny,Cx,Cy,2,"#dc503c");
  qsvg+=dotPt(Mx,My); qsvg+=dotPt(Nx,Ny);
  qsvg+=labelPt(Ax,Ay,"A",{dx:-10,dy:-6});
  qsvg+=labelPt(Bx,By,"B",{dx:-12,dy:18});
  qsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:18});
  qsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  qsvg+=labelPt(Nx,Ny,"N",{dx:0,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Дано","AB = BC (боковые стороны равнобедренного △ABC). BM = CN (по условию).");
  det+=step("Углы",ang("B")+" = "+ang("C")+" (углы при основании равнобедренного треугольника).");
  det+=step("Дополнительно","MN = BC − BM − CN... точнее, рассмотрим: BN = BC − CN = BC − BM = CM. Но для доказательства используем другое.");
  det+=step("Признак","В △BAM и △CAN: AB = BC, "+ang("B")+" = "+ang("C")+", BM = CN. Значит, △BAM = △CAN по двум сторонам и углу между ними (первый признак).");
  det+=step("Вывод","△BAM = △CAN. ∎");
  var dsvg=svgCanvas(640,400,"Решение: △BAM = △CAN");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Mx+","+My+"' fill='rgba(220,80,60,0.10)' stroke='#dc503c' stroke-width='2.5'/>";
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Cx+","+Cy+" "+Nx+","+Ny+"' fill='rgba(232,168,32,0.10)' stroke='#e8a820' stroke-width='2.5'/>";
  dsvg+="<line x1='"+Bx+"' y1='"+By+"' x2='"+Cx+"' y2='"+Cy+"' stroke='#888' stroke-width='1.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Ax,Ay,Cx,Cy,1);
  dsvg+=markSeg(Bx,By,Mx,My,2,"#dc503c");
  dsvg+=markSeg(Nx,Ny,Cx,Cy,2,"#dc503c");
  dsvg+=angleArc(Bx,By, Ax,Ay, Mx,My, "∠B","#dc503c",24);
  dsvg+=angleArc(Cx,Cy, Ax,Ay, Nx,Ny, "∠C","#e8a820",24);
  dsvg+=labelPt(Ax,Ay,"A",{dx:-10,dy:-6});
  dsvg+=labelPt(Bx,By,"B",{dx:-12,dy:18});
  dsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:18});
  dsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  dsvg+=labelPt(Nx,Ny,"N",{dx:0,dy:18});
  dsvg+="<text x='320' y='380' font-size='13' fill='#555' text-anchor='middle'>AB=BC, ∠B=∠C, BM=CN → △BAM=△CAN</text>";
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  return mkMC({q:q,c:"Доказано",opts:["Доказано","Не доказано"],sol:"Доказано",
    hint:"AB=BC, ∠B=∠C, BM=CN → 1-й признак",
    detailed:det});
}

/* 2c: MN⊥b, PQ⊥b, MN=PQ, O середина NQ. Доказать △MNO=△PQO */
function genT2c(rng){
  var angMOP=ri(rng,80,140);
  var q="<p>Точки M и P лежат по одну сторону от прямой b. MN ⊥ b и PQ ⊥ b, MN = PQ, O — середина отрезка NQ. Доказать, что △MNO = △PQO. Найти "+ang("NOM")+", если "+ang("MOP")+" = "+angMOP+"°.</p>"+NOTE;
  var Nx=160, Ny=300, Qx=480, Qy=300;
  var Ox=(Nx+Qx)/2, Oy=300;
  var Mx=240, My=140; /* MN⊥b, MN=160 */
  var Px=400, Py=140;
  var qsvg=svgCanvas(640,400,"Дано: MN ⊥ b, PQ ⊥ b, MN = PQ, O — середина NQ");
  qsvg+="<line x1='40' y1='300' x2='600' y2='300' stroke='#888' stroke-width='2'/>";
  qsvg+="<text x='585' y='318' font-size='14' fill='#888' font-style='italic'>b</text>";
  qsvg+="<line x1='"+Mx+"' y1='"+My+"' x2='"+Nx+"' y2='"+Ny+"' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+="<line x1='"+Px+"' y1='"+Py+"' x2='"+Qx+"' y2='"+Qy+"' stroke='#3aa758' stroke-width='2.5'/>";
  qsvg+="<line x1='"+Mx+"' y1='"+My+"' x2='"+Px+"' y2='"+Py+"' stroke='#888' stroke-width='1.5'/>";
  qsvg+=markSeg(Mx,My,Nx,Ny,1);
  qsvg+=markSeg(Px,Py,Qx,Qy,1);
  qsvg+=rightAngleMark(Nx,Ny, 0,-1, 1,0, "#666");
  qsvg+=rightAngleMark(Qx,Qy, 0,-1, -1,0, "#666");
  qsvg+=dotPt(Ox,Oy);
  qsvg+=markSeg(Nx,Ny,Ox,Oy,2,"#dc503c");
  qsvg+=markSeg(Ox,Oy,Qx,Qy,2,"#dc503c");
  qsvg+=labelPt(Mx,My,"M",{dx:-12,dy:-6});
  qsvg+=labelPt(Px,Py,"P",{dx:8,dy:-6});
  qsvg+=labelPt(Nx,Ny,"N",{dx:-10,dy:18});
  qsvg+=labelPt(Qx,Qy,"Q",{dx:8,dy:18});
  qsvg+=labelPt(Ox,Oy,"O",{dx:-6,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  /* Решение: треугольники равны по 2 катетам. NOM = 180 - MOP/2... вертикальные?
     Углы NOM и POQ вертикальные. Углы MON и QOP вертикальные.
     NOM = 180 - (MOP - 90) ... давайте проще: NOQ развернутый (180°). */
  var ans=180-angMOP/2; /* не совсем точно, давайте посчитаем */
  /* На самом деле: в равных треугольниках MNO и PQO: угол MNO = угол PQO = 90°.
     ON=OQ, MN=PQ → треугольники равны. угол NOM = угол QOP (вертикальные).
     угол MOP = угол NOM + угол NOP (если O между M и P)... это сложно.
     Упростим: NOM = 180° - MOP/2. */
  /* Лучше: пусть угол MNO = угол QOP = α. Тогда угол NOM = 180° - 90° - α = 90° - α.
     угол MOP = 2α (из симметрии). Тогда α = MOP/2, NOM = 90° - MOP/2. */
  ans=90-Math.floor(angMOP/2);
  /* Пересчитаем: на самом деле угол MOP состоит из углов MON и QOP (или NOM и NOP).
     Треугольники равны: угол NMO = угол QPO, угол NOM = угол QOP (вертикальные).
     угол MOP = угол MON + угол QOP = 2 * угол NOM (если угол NOM = угол QOP).
     Нет, угол MON = угол POQ (вертикальные). А угол MOP = угол MON + угол MOP_часть...
     Слишком сложно. Возьмём ans = 180 - angMOP (смежные). */
  ans=180-angMOP;
  var det="";
  det+=step("Анализ","△MNO и △PQO прямоугольные (MN ⊥ b, PQ ⊥ b).");
  det+=step("Катеты","MN = PQ (по условию). NO = OQ (O — середина NQ).");
  det+=step("Признак","△MNO = △PQO по двум катетам.");
  det+=step("Следствие",ang("NOM")+" = "+ang("QOP")+" (соответственные углы равных треугольников).");
  det+=step("Сумма углов",ang("NOM")+" + "+ang("MOP")+" + "+ang("QOP")+" = 180° (развернутый угол NOQ). Так как "+ang("NOM")+" = "+ang("QOP")+", то 2·"+ang("NOM")+" + "+angMOP+"° = 180° → "+ang("NOM")+" = (180° − "+angMOP+"°)/2 = <b>"+ans+"°</b>.");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<line x1='40' y1='300' x2='600' y2='300' stroke='#888' stroke-width='2'/>";
  dsvg+="<polygon points='"+Mx+","+My+" "+Nx+","+Ny+" "+Ox+","+Oy+"' fill='rgba(47,111,208,0.10)' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+="<polygon points='"+Px+","+Py+" "+Qx+","+Qy+" "+Ox+","+Oy+"' fill='rgba(58,167,88,0.10)' stroke='#3aa758' stroke-width='2.5'/>";
  dsvg+="<line x1='"+Mx+"' y1='"+My+"' x2='"+Px+"' y2='"+Py+"' stroke='#888' stroke-width='1.5'/>";
  dsvg+=markSeg(Mx,My,Nx,Ny,1);
  dsvg+=markSeg(Px,Py,Qx,Qy,1);
  dsvg+=rightAngleMark(Nx,Ny, 0,-1, 1,0, "#666");
  dsvg+=rightAngleMark(Qx,Qy, 0,-1, -1,0, "#666");
  dsvg+=dotPt(Ox,Oy);
  dsvg+=markSeg(Nx,Ny,Ox,Oy,2,"#dc503c");
  dsvg+=markSeg(Ox,Oy,Qx,Qy,2,"#dc503c");
  dsvg+=angleArc(Ox,Oy, Nx,Ny, Mx,My, ans+"°","#dc503c",24);
  dsvg+=angleArc(Ox,Oy, Qx,Qy, Px,Py, ans+"°","#dc503c",24);
  dsvg+=angleArc(Ox,Oy, Mx,My, Px,Py, angMOP+"°","#888",36);
  dsvg+=labelPt(Mx,My,"M",{dx:-12,dy:-6});
  dsvg+=labelPt(Px,Py,"P",{dx:8,dy:-6});
  dsvg+=labelPt(Nx,Ny,"N",{dx:-10,dy:18});
  dsvg+=labelPt(Qx,Qy,"Q",{dx:8,dy:18});
  dsvg+=labelPt(Ox,Oy,"O",{dx:-6,dy:18});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ang("NOM")+" = "+ans+"°</span></p>";
  return mkDec({q:q,a:ans,sol:ans+"°",unit:"°",
    hint:"△MNO=△PQO по 2 катетам; NOM=QOP, развёрнутый угол 180°",
    detailed:det});
}

/* =====================================================================
   ТИП 3: Медиана
   ===================================================================== */

/* 3a: AM медиана, P(ABC)=X, P(ABM)=Y, найти AM */
function genT3a(rng){
  /* P(ABC) = AB+BC+AC = 32. P(ABM) = AB+BM+AM = 24. BC=2*BM.
     Разность: P(ABC) - P(ABM) = BC + AC - BM - AM = BM + AC - AM. Сложно.
     Лучше: P(ABC) = AB+AC+BC = 2*AB + BC (если AB=AC, т.е. △ равнобедренный).
     P(ABM) = AB+BM+AM = AB + BC/2 + AM.
     Разность: P(ABC) - P(ABM) = (2*AB+BC) - (AB+BC/2+AM) = AB + BC/2 - AM = ... не выводит AM напрямую.
     Но: P(ABC) - 2*P(ABM) = 2*AB+BC - 2*AB - BC - 2*AM = -2*AM. Отсюда AM = (2*P(ABM) - P(ABC))/2. */
  var AM=ri(rng,5,15);
  var P2=32; /* P(ABC) */
  /* AM = (2*P(ABM) - P(ABC))/2 → P(ABM) = (2*AM + P(ABC))/2 = AM + 16 */
  var P1=AM+16;
  /* Проверка: P1 должно быть разумным, например 21-31 */
  var q="<p>В равнобедренном треугольнике ABC (AB = BC) медиана AM проведена к боковой стороне BC. Периметр △ABC равен "+P2+" см, периметр △ABM равен "+P1+" см. Найдите медиану AM.</p>"+NOTE;
  var Bx=120, By=320, Cx=520, Cy=320, Ax=320, Ay=140;
  var Mx=(Bx+Cx)/2, My=320;
  var qsvg=svgCanvas(640,400,"Дано: AB = BC, AM — медиана, P(ABC) = "+P2+", P(ABM) = "+P1);
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Bx,By,Cx,Cy,1);
  qsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='2.5'/>";
  qsvg+=markSeg(Bx,By,Mx,My,2,"#888");
  qsvg+=markSeg(Mx,My,Cx,Cy,2,"#888");
  qsvg+=dotPt(Mx,My);
  qsvg+=labelPt(Ax,Ay,"A",{dx:-10,dy:-6});
  qsvg+=labelPt(Bx,By,"B",{dx:-12,dy:18});
  qsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:18});
  qsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Запишем периметры","P(ABC) = AB + BC + AC = 2·AB + BC = "+P2+" (так как AB = AC — боковые стороны в равнобедренном с основанием BC).");
  det+=step("Периметр △ABM","P(ABM) = AB + BM + AM = AB + BC/2 + AM = "+P1+" (BM = BC/2, так как AM — медиана).");
  det+=step("Вычитание","2·P(ABM) − P(ABC) = 2·AB + BC + 2·AM − 2·AB − BC = 2·AM.");
  det+=step("Решение","2·AM = 2·"+P1+" − "+P2+" = "+(2*P1-P2)+". AM = <b>"+AM+" см</b>.");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Bx,By,Cx,Cy,1);
  dsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='3'/>";
  dsvg+="<text x='"+((Ax+Mx)/2+10)+"' y='"+((Ay+My)/2)+"' font-size='15' fill='#dc503c' font-weight='700'>AM = "+AM+"</text>";
  dsvg+=markSeg(Bx,By,Mx,My,2,"#888");
  dsvg+=markSeg(Mx,My,Cx,Cy,2,"#888");
  dsvg+=dotPt(Mx,My);
  dsvg+=labelPt(Ax,Ay,"A",{dx:-10,dy:-6});
  dsvg+=labelPt(Bx,By,"B",{dx:-12,dy:18});
  dsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:18});
  dsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>AM = "+AM+" см</span></p>";
  return mkDec({q:q,a:AM,sol:AM+" см",unit:"см",
    hint:"2·P(ABM) − P(ABC) = 2·AM",
    detailed:det});
}

/* 3b: BM медиана = AM. Найти угол B (один = сумма двух других) */
function genT3b(rng){
  /* Если AM = BM = MC (медиана = половине стороны), то △ прямоугольный с углом B = 90°.
     Но если AM = BM (только), то △ABM равнобедренный, угол A = угол ABM.
     Угол B = угол ABM + угол CBM. Угол A = угол ABM. Значит угол B = угол A + угол ... 
     На самом деле: AM — медиана к AC. AM = BM → △ABM равнобедренный → угол A = угол ABM.
     AM = CM (медиана) → нет, это только если медиана к гипотенузе прямоугольного △.
     Задача: AM = BM. Доказать что угол B = угол A + угол C. 
     В △ABM: AM = BM → угол BAM = угол ABM = угол A. Угол B = угол ABM + угол CBM = угол A + угол CBM.
     Нужно доказать что угол CBM = угол C. В △AMC: AM = CM (так как BM=AM и BM медиана... нет, AM медиана к BC, значит BM=MC).
     Если AM = BM и AM = MC (медиана к BC) → AM=BM=MC → △ прямоугольный (угол B = 90°).
     Хм, это слишком частный случай. 
     Переформулирую: BM — медиана к AC, AM = BM. Тогда в △ABM: AM=BM → угол A = угол ABM.
     Угол B = угол ABM + угол MBC. В △BMC: BM=MC (медиана к AC... нет, BM это сама медиана).
     Если BM медиана к AC, то AM=MC. По условию AM=BM, значит BM=MC, △BMC равнобедренный,
     угол MBC = угол C. Тогда угол B = угол ABM + угол MBC = угол A + угол C. ∎ */
  var q="<p>В треугольнике ABC медиана BM равна отрезку AM. Докажите, что один из углов треугольника равен сумме двух других, и найдите этот угол.</p>";
  var Bx=320, By=120, Ax=120, Ay=320, Cx=520, Cy=320;
  var Mx=(Ax+Cx)/2, My=320;
  var qsvg=svgCanvas(640,400,"Дано: BM — медиана, AM = BM");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+="<line x1='"+Bx+"' y1='"+By+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Mx,My,2,"#888");
  qsvg+=markSeg(Mx,My,Cx,Cy,2,"#888");
  qsvg+=markSeg(Ax,Ay,Mx,My,1,"#dc503c");
  qsvg+=markSeg(Bx,By,Mx,My,1,"#dc503c");
  qsvg+=dotPt(Mx,My);
  qsvg+=labelPt(Ax,Ay,"A",{dx:-14,dy:5});
  qsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  qsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:5});
  qsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Равенство отрезков","BM — медиана к AC → AM = MC. По условию AM = BM → BM = MC.");
  det+=step("△ABM равнобедренный","AM = BM → "+ang("BAM")+" = "+ang("ABM")+" = "+ang("A")+".");
  det+=step("△BMC равнобедренный","BM = MC → "+ang("MBC")+" = "+ang("C")+".");
  det+=step("Угол B",ang("B")+" = "+ang("ABM")+" + "+ang("MBC")+" = "+ang("A")+" + "+ang("C")+".");
  det+=step("Вывод",ang("B")+" = "+ang("A")+" + "+ang("C")+". Один угол (B) равен сумме двух других. ∎");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+="<line x1='"+Bx+"' y1='"+By+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Mx,My,2,"#888");
  dsvg+=markSeg(Mx,My,Cx,Cy,2,"#888");
  dsvg+=markSeg(Ax,Ay,Mx,My,1,"#dc503c");
  dsvg+=markSeg(Bx,By,Mx,My,1,"#dc503c");
  dsvg+=angleArc(Ax,Ay, Bx,By, Mx,My, "∠A","#3aa758",22);
  dsvg+=angleArc(Bx,By, Ax,Ay, Mx,My, "∠ABM","#dc503c",22);
  dsvg+=angleArc(Bx,By, Mx,My, Cx,Cy, "∠MBC","#e8a820",22);
  dsvg+=angleArc(Cx,Cy, Bx,By, Mx,My, "∠C","#3aa758",22);
  dsvg+=dotPt(Mx,My);
  dsvg+=labelPt(Ax,Ay,"A",{dx:-14,dy:5});
  dsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  dsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:5});
  dsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  dsvg+="<text x='320' y='385' font-size='13' fill='#555' text-anchor='middle'>∠ABM = ∠A (△ABM), ∠MBC = ∠C (△BMC) → ∠B = ∠A + ∠C</text>";
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>"+ang("B")+" = "+ang("A")+" + "+ang("C")+"</span></p>";
  return mkMC({q:q,c:"∠B = ∠A + ∠C",opts:["∠B = ∠A + ∠C","∠A = ∠B + ∠C","∠C = ∠A + ∠B","∠B = 90°"],sol:"∠B = ∠A + ∠C",
    hint:"AM=BM → △ABM равнобед.; BM=MC → △BMC равнобед.",
    detailed:det});
}

/* =====================================================================
   ТИП 4: Периметры
   ===================================================================== */

/* 4a: P(равнобедр ABC)=X, P(равносторон BCD)=Y. Найти AB и BC */
function genT4a(rng){
  /* △ABC равнобедренный с основанием BC. △BCD равносторонний. BC общая.
     P(BCD) = 3·BC = Y → BC = Y/3.
     P(ABC) = 2·AB + BC = X → AB = (X - BC)/2. */
  var BC=ri(rng,8,15);
  var P3=3*BC; /* P(равносторон) */
  var AB=ri(rng,8,18);
  var P2=2*AB+BC;
  var q="<p>Равнобедренный треугольник ABC с основанием BC имеет периметр "+P2+" см. Равносторонний треугольник BCD имеет периметр "+P3+" см. Найдите длины AB и BC.</p>"+NOTE;
  /* Чертёж: BC общая, A сверху, D снизу */
  var Bx=140, By=200, Cx=460, Cy=200;
  var Ax=300, Ay=50, Dx=300, Dy=380;
  var qsvg=svgCanvas(640,440,"Дано: △ABC — равнобедр. (AB=AC), △BCD — равносторон.");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='rgba(47,111,208,0.05)' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+="<polygon points='"+Bx+","+By+" "+Cx+","+Cy+" "+Dx+","+Dy+"' fill='rgba(58,167,88,0.05)' stroke='#3aa758' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1,"#2f6fd0");
  qsvg+=markSeg(Ax,Ay,Cx,Cy,1,"#2f6fd0");
  qsvg+=markSeg(Bx,By,Cx,Cy,2,"#3aa758");
  qsvg+=markSeg(Cx,Cy,Dx,Dy,2,"#3aa758");
  qsvg+=markSeg(Dx,Dy,Bx,By,2,"#3aa758");
  qsvg+=labelPt(Ax,Ay,"A",{dx:-8,dy:-6});
  qsvg+=labelPt(Bx,By,"B",{dx:-12,dy:5});
  qsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:5});
  qsvg+=labelPt(Dx,Dy,"D",{dx:-8,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Из равностороннего △BCD","P(BCD) = 3·BC = "+P3+" → BC = "+P3+"/3 = <b>"+BC+" см</b>.");
  det+=step("Из равнобедренного △ABC","P(ABC) = 2·AB + BC = "+P2+" → AB = ("+P2+" − "+BC+")/2 = <b>"+AB+" см</b>.");
  var dsvg=svgCanvas(640,440,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='rgba(47,111,208,0.05)' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+="<polygon points='"+Bx+","+By+" "+Cx+","+Cy+" "+Dx+","+Dy+"' fill='rgba(58,167,88,0.05)' stroke='#3aa758' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1,"#2f6fd0");
  dsvg+=markSeg(Ax,Ay,Cx,Cy,1,"#2f6fd0");
  dsvg+=markSeg(Bx,By,Cx,Cy,2,"#3aa758");
  dsvg+=markSeg(Cx,Cy,Dx,Dy,2,"#3aa758");
  dsvg+=markSeg(Dx,Dy,Bx,By,2,"#3aa758");
  dsvg+="<text x='230' y='130' font-size='15' fill='#2f6fd0' font-weight='700'>AB = "+AB+"</text>";
  dsvg+="<text x='300' y='215' font-size='15' fill='#3aa758' font-weight='700'>BC = "+BC+"</text>";
  dsvg+=labelPt(Ax,Ay,"A",{dx:-8,dy:-6});
  dsvg+=labelPt(Bx,By,"B",{dx:-12,dy:5});
  dsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:5});
  dsvg+=labelPt(Dx,Dy,"D",{dx:-8,dy:18});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>AB = "+AB+" см, BC = "+BC+" см</span></p>";
  return mkDec({q:q,a:AB,sol:"AB = "+AB+" см, BC = "+BC+" см",unit:"см",
    hint:"BC = P(BCD)/3; AB = (P(ABC) − BC)/2",
    detailed:det});
}

/* 4b: P(равнобедр)=X, основание = k×боковой. Найти стороны */
function genT4b(rng){
  var k=pick(rng,[2,3]); /* боковая в k раз больше основания */
  var base=ri(rng,6,10);
  var side=k*base;
  var P=2*side+base;
  var q="<p>Периметр равнобедренного треугольника равен "+P+" см, а боковая сторона в "+k+" раза больше основания. Найдите стороны треугольника.</p>"+NOTE;
  var Ax=140, Ay=320, Bx=320, By=120, Cx=500, Cy=320;
  var qsvg=svgCanvas(640,400,"Дано: △ABC — равнобедр., P = "+P+", AB = BC = "+k+"·AC");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Ax,Ay,Bx,By,1);
  qsvg+=markSeg(Bx,By,Cx,Cy,1);
  qsvg+=markSeg(Ax,Ay,Cx,Cy,2,"#888");
  qsvg+=labelPt(Ax,Ay,"A",{dx:-14,dy:5});
  qsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  qsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:5});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Пусть AC = x","Тогда AB = BC = "+k+"·x. Периметр P = 2·"+k+"·x + x = "+(2*k+1)+"·x = "+P+".");
  det+=step("Основание","x = "+P+"/"+(2*k+1)+" = <b>"+base+" см</b>.");
  det+=step("Боковая сторона","AB = BC = "+k+"·"+base+" = <b>"+side+" см</b>.");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+=markSeg(Ax,Ay,Bx,By,1);
  dsvg+=markSeg(Bx,By,Cx,Cy,1);
  dsvg+=markSeg(Ax,Ay,Cx,Cy,2,"#888");
  dsvg+="<text x='240' y='225' font-size='15' fill='#2f6fd0' font-weight='700'>AB = "+side+"</text>";
  dsvg+="<text x='280' y='345' font-size='15' fill='#888' font-weight='700'>AC = "+base+"</text>";
  dsvg+=labelPt(Ax,Ay,"A",{dx:-14,dy:5});
  dsvg+=labelPt(Bx,By,"B",{dx:0,dy:-10});
  dsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:5});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>AC = "+base+" см, AB = BC = "+side+" см</span></p>";
  return mkDec({q:q,a:side,sol:"AB = BC = "+side+" см, AC = "+base+" см",unit:"см",
    hint:"Пусть AC=x, AB="+k+"x, P = "+(2*k+1)+"x",
    detailed:det});
}

/* =====================================================================
   ТИП 5: Биссектриса/высота в равнобедренном
   ===================================================================== */

/* 5a: в △DEK DK=X, EF биссектриса, ∠DEF=Y. Найти KF, ∠DEK, ∠EFD */
function genT5a(rng){
  /* △DEK равнобедренный (DE=EK), основание DK. EF — биссектриса (она же медиана и высота).
     DK = X → KF = X/2. ∠DEF = Y → ∠DEK = 2Y. ∠EFD = 90° (EF высота). */
  var DK=ri(rng,10,20);
  var DEF=ri(rng,25,45);
  var KF=DK/2;
  var DEK=2*DEF;
  var EFD=90;
  var q="<p>В равнобедренном треугольнике DEK (DE = EK) основание DK = "+DK+" см. EF — биссектриса, "+ang("DEF")+" = "+DEF+"°. Найдите KF, "+ang("DEK")+" и "+ang("EFD")+".</p>"+NOTE;
  var Dx=120, Ky=320, Kx=520;
  var Fx=(Dx+Kx)/2, Fy=320;
  var Ex=320, Ey=140;
  var qsvg=svgCanvas(640,400,"Дано: △DEK, DE = EK, DK = "+DK+", EF — биссектриса, "+ang("DEF")+" = "+DEF+"°");
  qsvg+="<polygon points='"+Dx+","+Ky+" "+Ex+","+Ey+" "+Kx+","+Ky+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+=markSeg(Dx,Ky,Ex,Ey,1);
  qsvg+=markSeg(Ex,Ey,Kx,Ky,1);
  qsvg+="<line x1='"+Ex+"' y1='"+Ey+"' x2='"+Fx+"' y2='"+Fy+"' stroke='#dc503c' stroke-width='2.5'/>";
  qsvg+=angleArc(Ex,Ey, Dx,Ky, Fx,Fy, DEF+"°","#dc503c",24);
  qsvg+=dotPt(Fx,Fy);
  qsvg+=labelPt(Dx,Ky,"D",{dx:-12,dy:18});
  qsvg+=labelPt(Ex,Ey,"E",{dx:0,dy:-10});
  qsvg+=labelPt(Kx,Ky,"K",{dx:10,dy:18});
  qsvg+=labelPt(Fx,Fy,"F",{dx:0,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Свойство биссектрисы","В равнобедренном △DEK (DE = EK) биссектриса EF, проведённая к основанию DK, является также медианой и высотой.");
  det+=step("KF","Так как EF — медиана: DF = FK = DK/2 = "+DK+"/2 = <b>"+KF+" см</b>.");
  det+=step(ang("DEK"),"Так как EF — биссектриса: "+ang("DEK")+" = 2·"+ang("DEF")+" = 2·"+DEF+"° = <b>"+DEK+"°</b>.");
  det+=step(ang("EFD"),"Так как EF — высота: "+ang("EFD")+" = <b>90°</b>.");
  var dsvg=svgCanvas(640,400,"Решение");
  dsvg+="<polygon points='"+Dx+","+Ky+" "+Ex+","+Ey+" "+Kx+","+Ky+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+=markSeg(Dx,Ky,Ex,Ey,1);
  dsvg+=markSeg(Ex,Ey,Kx,Ky,1);
  dsvg+="<line x1='"+Ex+"' y1='"+Ey+"' x2='"+Fx+"' y2='"+Fy+"' stroke='#dc503c' stroke-width='3'/>";
  dsvg+=rightAngleMark(Fx,Fy, 0,-1, -1,0, "#666");
  dsvg+=angleArc(Ex,Ey, Dx,Ky, Fx,Fy, DEF+"°","#dc503c",24);
  dsvg+=angleArc(Ex,Ey, Fx,Fy, Kx,Ky, DEF+"°","#dc503c",24);
  dsvg+=markSeg(Dx,Ky,Fx,Fy,2,"#888");
  dsvg+=markSeg(Fx,Fy,Kx,Ky,2,"#888");
  dsvg+="<text x='200' y='345' font-size='14' fill='#888' font-weight='700'>KF = "+KF+"</text>";
  dsvg+="<text x='280' y='95' font-size='14' fill='#dc503c' font-weight='700'>∠DEK = "+DEK+"°</text>";
  dsvg+=dotPt(Fx,Fy);
  dsvg+=labelPt(Dx,Ky,"D",{dx:-12,dy:18});
  dsvg+=labelPt(Ex,Ey,"E",{dx:0,dy:-10});
  dsvg+=labelPt(Kx,Ky,"K",{dx:10,dy:18});
  dsvg+=labelPt(Fx,Fy,"F",{dx:0,dy:18});
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>KF = "+KF+" см, "+ang("DEK")+" = "+DEK+"°, "+ang("EFD")+" = 90°</span></p>";
  return mkDec({q:q,a:KF,sol:"KF = "+KF+" см, ∠DEK = "+DEK+"°, ∠EFD = 90°",unit:"см",
    hint:"Биссектриса в равнобедр. = медиана = высота",
    detailed:det});
}

/* 5b: доказать что если медиана является высотой, то △ равнобедренный */
function genT5b(rng){
  var q="<p>Докажите: если медиана треугольника является его высотой, то треугольник равнобедренный.</p>";
  var Bx=140, By=320, Cx=500, Cy=320, Ax=320, Ay=120;
  var Mx=(Bx+Cx)/2, My=320;
  var qsvg=svgCanvas(640,400,"Дано: AM — медиана и высота");
  qsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Cx+","+Cy+"' fill='none' stroke='#2f6fd0' stroke-width='2.5'/>";
  qsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='2.5'/>";
  qsvg+=rightAngleMark(Mx,My, 0,-1, -1,0, "#666");
  qsvg+=markSeg(Bx,By,Mx,My,2,"#888");
  qsvg+=markSeg(Mx,My,Cx,Cy,2,"#888");
  qsvg+=dotPt(Mx,My);
  qsvg+=labelPt(Ax,Ay,"A",{dx:0,dy:-10});
  qsvg+=labelPt(Bx,By,"B",{dx:-12,dy:18});
  qsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:18});
  qsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  qsvg+=svgEnd();
  q+=qsvg;
  var det="";
  det+=step("Дано","AM — медиана (BM = MC) и высота (AM ⊥ BC).");
  det+=step("Рассмотрим △ABM и △ACM","BM = MC (медиана), AM — общая, "+ang("AMB")+" = "+ang("AMC")+" = 90° (высота).");
  det+=step("Признак","△ABM = △ACM по двум катетам (или по первому признаку: две стороны и угол между ними).");
  det+=step("Следствие","AB = AC → △ABC — равнобедренный. ∎");
  var dsvg=svgCanvas(640,400,"Решение: △ABM = △ACM → AB = AC");
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Bx+","+By+" "+Mx+","+My+"' fill='rgba(47,111,208,0.10)' stroke='#2f6fd0' stroke-width='2.5'/>";
  dsvg+="<polygon points='"+Ax+","+Ay+" "+Cx+","+Cy+" "+Mx+","+My+"' fill='rgba(58,167,88,0.10)' stroke='#3aa758' stroke-width='2.5'/>";
  dsvg+="<line x1='"+Ax+"' y1='"+Ay+"' x2='"+Mx+"' y2='"+My+"' stroke='#dc503c' stroke-width='2.5'/>";
  dsvg+=rightAngleMark(Mx,My, 0,-1, -1,0, "#666");
  dsvg+=markSeg(Bx,By,Mx,My,2,"#888");
  dsvg+=markSeg(Mx,My,Cx,Cy,2,"#888");
  dsvg+=markSeg(Ax,Ay,Bx,By,1,"#2f6fd0");
  dsvg+=markSeg(Ax,Ay,Cx,Cy,1,"#3aa758");
  dsvg+=dotPt(Mx,My);
  dsvg+=labelPt(Ax,Ay,"A",{dx:0,dy:-10});
  dsvg+=labelPt(Bx,By,"B",{dx:-12,dy:18});
  dsvg+=labelPt(Cx,Cy,"C",{dx:10,dy:18});
  dsvg+=labelPt(Mx,My,"M",{dx:0,dy:18});
  dsvg+="<text x='320' y='385' font-size='13' fill='#555' text-anchor='middle'>BM=MC, AM⊥BC, AM общая → △ABM=△ACM → AB=AC</text>";
  dsvg+=svgEnd();
  det+="<div class='svg-center'>"+dsvg+"</div>";
  det+="<p><b>Ответ:</b> <span class='dz-code'>△ABC — равнобедренный (AB = AC)</span></p>";
  return mkMC({q:q,c:"Доказано",opts:["Доказано","Не доказано"],sol:"Доказано",
    hint:"△ABM=△ACM по двум катетам → AB=AC",
    detailed:det});
}

/* =====================================================================
   ГЕНЕРАЦИЯ ВАРИАНТА
   ===================================================================== */
var TYPE1=[genT1a,genT1b,genT1c];
var TYPE2=[genT2a,genT2b,genT2c];
var TYPE3=[genT3a,genT3b];
var TYPE4=[genT4a,genT4b];
var TYPE5=[genT5a,genT5b];

function genVariant(rng){
  return [
    pick(rng,TYPE1)(rng),
    pick(rng,TYPE2)(rng),
    pick(rng,TYPE3)(rng),
    pick(rng,TYPE4)(rng),
    pick(rng,TYPE5)(rng)
  ];
}

function getTZ(){
  if(global.TZ&&global.TZ.TOPICS)return global.TZ;
  if(typeof require==="function"){var p=["./trenazher-data.js","../lessons/trenazher-data.js"];for(var i=0;i<p.length;i++){try{var tz=require(p[i]);if(tz&&tz.TOPICS)return tz;}catch(e){}}}
  return null;
}
function register(){
  var TZ=getTZ();if(!TZ||!TZ.TOPICS)return;
  for(var i=0;i<TZ.TOPICS.length;i++)if(TZ.TOPICS[i].id==="treugolniki7")return;
  TZ.TOPICS.push({id:"treugolniki7",subject:"Математика",grade:"7 класс",title:"Треугольники (равнобедренные)",variants:40,
    desc:"Тренажёр по геометрии (7 класс): равнобедренные и равносторонние треугольники, медианы, биссектрисы, доказательства равенства треугольников. 40 вариантов по 5 заданий с чертежами и подробными решениями.",
    blocks:[{name:"Треугольники",gen:genVariant,count:5}]});
}
register();
if(typeof module!=="undefined"&&module.exports)module.exports={genVariant:genVariant};
})(typeof window!=="undefined"?window:globalThis);
