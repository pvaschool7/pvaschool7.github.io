/* =====================================================================
   Тренажёр · 8 класс · Геометрия · Подобные треугольники
   По задачам 657–671 учебника. 40 вариантов × 8 заданий.
   Типы: dec (число), mc (да/нет).
   После выполнения — подробное решение с чертежом SVG и пошаговым решением.
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

var NOTE=" <span style='color:var(--mute);font-size:14px'>(ответ — число, округлите до сотых)</span>";

function mkDec(opts){
  return {type:"dec",q:opts.q,a:opts.a,unit:opts.unit||"",sol:opts.sol,
    hint:opts.hint||"",detailed:opts.detailed||""};
}
function mkMC(opts){
  return {type:"mc",q:opts.q,c:opts.c,opts:opts.opts,hint:opts.hint||"",detailed:opts.detailed||""};
}

/* =====================================================================
   SVG-ФУНКЦИИ (чертежи с реальными данными задачи)
   ===================================================================== */

/* Вершины треугольника по трём сторонам a=BC, b=CA, c=AB.
   B в (0,0), C в (a,0), A вычисляется. */
function triVerts(a,b,c){
  var xA=(c*c+a*a-b*b)/(2*a);
  var yA=Math.sqrt(Math.max(0,c*c-xA*xA));
  return [{x:xA,y:yA},{x:0,y:0},{x:a,y:0}];
}

/* Середина отрезка + перпендикулярный сдвиг для подписи стороны */
function sideLabel(p1,p2,offset){
  var mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
  var dx=p2.x-p1.x,dy=p2.y-p1.y;
  var len=Math.sqrt(dx*dx+dy*dy)||1;
  var nx=-dy/len,ny=dx/len;
  return {x:mx+nx*offset,y:my+ny*offset};
}

/* Текст вдоль стороны (поворот) */
function sideTextAngle(p1,p2){
  var dx=p2.x-p1.x,dy=p2.y-p1.y;
  var ang=Math.atan2(-dy,dx)*180/Math.PI;
  if(ang>90)ang-=180;
  if(ang<-90)ang+=180;
  return ang;
}

/* ---------- SVG: два подобных треугольника рядом ----------
   a,b,c — стороны △ABC; k — коэффициент; sideFind — какая сторона ищется ("a"/"b"/"c");
   ans — числовой ответ.
*/
function svgSimPair(a,b,c,k,sideFind,ans){
  var v1=triVerts(a,b,c);
  var v2=triVerts(a*k,b*k,c*k);
  /* Размещаем два треугольника рядом в общей системе координат */
  var gap=5;
  /* Сдвигаем второй треугольник вправо */
  var shiftX=Math.max.apply(null,v1.map(function(p){return p.x}))+gap;
  var allPts=v1.concat(v2.map(function(p){return {x:p.x+shiftX,y:p.y}}));
  var minX=Math.min.apply(null,allPts.map(function(p){return p.x}));
  var maxX=Math.max.apply(null,allPts.map(function(p){return p.x}));
  var minY=Math.min.apply(null,allPts.map(function(p){return p.y}));
  var maxY=Math.max.apply(null,allPts.map(function(p){return p.y}));
  var W=520,H=260,padX=46,padY=42;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H-2*padY);};
  var lblA=["A","B","C"],lblB=["A₁","B₁","C₁"];
  var sideNames=["a","b","c"]; /* BC, CA, AB */
  var sidePts=[[v1[1],v1[2]],[v1[2],v1[0]],[v1[0],v1[1]]];
  var sideVals=[a,b,c];
  var sidePts2=[[v2[1],v2[2]],[v2[2],v2[0]],[v2[0],v2[1]]];
  var sideVals2=[a*k,b*k,c*k];
  /* Ответ — какая сторона второго треугольника */
  var findIdx=sideNames.indexOf(sideFind);

  /* Центроиды треугольников — для заголовков */
  var c1x=(v1[0].x+v1[1].x+v1[2].x)/3;
  var c2x=(v2[0].x+v2[1].x+v2[2].x)/3+shiftX;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  /* Заголовки — по центроидам */
  h+="<text x='"+sx(c1x).toFixed(0)+"' y='20' font-size='13' fill='var(--mute)' font-weight='600' text-anchor='middle'>△ABC</text>";
  h+="<text x='"+sx(c2x).toFixed(0)+"' y='20' font-size='13' fill='var(--mute)' font-weight='600' text-anchor='middle'>△A₁B₁C₁</text>";

  /* Первый треугольник */
  var poly1=v1.map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly1+"' fill='rgba(47,111,208,.08)' stroke='var(--ink)' stroke-width='2'/>";
  for(var i=0;i<3;i++){
    var p=v1[i];
    var lx=p.x<0.3?-13:p.x>a-0.3?13:0;
    var ly=p.y<0.3?16:-8;
    h+="<circle cx='"+sx(p.x).toFixed(1)+"' cy='"+sy(p.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p.x)+lx).toFixed(0)+"' y='"+(sy(p.y)+ly).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lblA[i]+"</text>";
  }
  for(var j=0;j<3;j++){
    var s=sideLabel(sidePts[j][0],sidePts[j][1],-0.85);
    h+="<text x='"+sx(s.x).toFixed(0)+"' y='"+sy(s.y).toFixed(0)+"' font-size='13' fill='var(--blue)' font-weight='600' text-anchor='middle'>"+sideVals[j]+"</text>";
  }

  /* Второй треугольник */
  var poly2=v2.map(function(p){return sx(p.x+shiftX).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly2+"' fill='rgba(220,80,60,.06)' stroke='var(--ink)' stroke-width='2'/>";
  for(var i=0;i<3;i++){
    var p=v2[i];
    var lx=p.x<0.3?-13:p.x>a*k-0.3?13:0;
    var ly=p.y<0.3?16:-8;
    h+="<circle cx='"+sx(p.x+shiftX).toFixed(1)+"' cy='"+sy(p.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p.x+shiftX)+lx).toFixed(0)+"' y='"+(sy(p.y)+ly).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lblB[i]+"</text>";
  }
  for(var j=0;j<3;j++){
    var s=sideLabel(sidePts2[j][0],sidePts2[j][1],-0.85);
    var txt=(j===findIdx)?"?":fmt(sideVals2[j]);
    var col=(j===findIdx)?"var(--red)":"var(--blue)";
    h+="<text x='"+sx(s.x+shiftX).toFixed(0)+"' y='"+sy(s.y).toFixed(0)+"' font-size='13' fill='"+col+"' font-weight='700' text-anchor='middle'>"+txt+"</text>";
  }
  h+="</svg>";
  return h;
}

/* ---------- SVG: трапеция ABCD с диагоналями, точка O ----------
   AB — верхнее основание, CD — нижнее (CD > AB).
   AC — диагональ. */
function svgTrapezoidDiag(ab,cd,ac,ao){
  /* A — слева вверху, B — справа вверху, C — справа внизу, D — слева внизу */
  var hTrap=Math.max(3,Math.min(ab,cd)*0.7);
  var topY=hTrap,botY=0;
  var A={x:-ab/2,y:topY},B={x:ab/2,y:topY};
  var C={x:cd/2,y:botY},D={x:-cd/2,y:botY};
  /* Точка O на AC: AO/AC = AB/CD */
  var r=ao/ac;
  var O={x:A.x+(C.x-A.x)*r,y:A.y+(C.y-A.y)*r};
  var pts=[A,B,C,D];
  var minX=-cd/2-1,maxX=cd/2+1,minY=-1,maxY=topY+1;
  var W=380,H=260,padX=50,padY=40;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H-2*padY);};
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  /* Трапеция */
  var poly=pts.map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly+"' fill='rgba(47,111,208,.06)' stroke='var(--ink)' stroke-width='2'/>";
  /* Диагонали AC и BD */
  h+="<line x1='"+sx(A.x).toFixed(1)+"' y1='"+sy(A.y).toFixed(1)+"' x2='"+sx(C.x).toFixed(1)+"' y2='"+sy(C.y).toFixed(1)+"' stroke='var(--red)' stroke-width='1.5' stroke-dasharray='5,3'/>";
  h+="<line x1='"+sx(B.x).toFixed(1)+"' y1='"+sy(B.y).toFixed(1)+"' x2='"+sx(D.x).toFixed(1)+"' y2='"+sy(D.y).toFixed(1)+"' stroke='var(--red)' stroke-width='1.5' stroke-dasharray='5,3'/>";
  /* Точка O */
  h+="<circle cx='"+sx(O.x).toFixed(1)+"' cy='"+sy(O.y).toFixed(1)+"' r='3.5' fill='var(--red)'/>";
  h+="<text x='"+(sx(O.x)-9).toFixed(0)+"' y='"+(sy(O.y)-7).toFixed(0)+"' font-size='14' fill='var(--red)' font-weight='700' text-anchor='middle'>O</text>";
  /* Подписи вершин */
  var offs=[[-10,-8],[10,-8],[10,16],[-10,16]];
  var lbls=["A","B","C","D"];
  for(var i=0;i<4;i++){
    h+="<circle cx='"+sx(pts[i].x).toFixed(1)+"' cy='"+sy(pts[i].y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(pts[i].x)+offs[i][0]).toFixed(0)+"' y='"+(sy(pts[i].y)+offs[i][1]).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lbls[i]+"</text>";
  }
  /* Подписи длин: AB, CD, AC */
  h+="<text x='"+sx(0).toFixed(0)+"' y='"+(sy(topY)-8).toFixed(0)+"' font-size='13' fill='var(--blue)' font-weight='600' text-anchor='middle'>AB = "+ab+"</text>";
  h+="<text x='"+sx(0).toFixed(0)+"' y='"+(sy(0)+18).toFixed(0)+"' font-size='13' fill='var(--blue)' font-weight='600' text-anchor='middle'>CD = "+cd+"</text>";
  /* AC — подпись в центроид треугольника CDO (внизу, вдали от BD и других подписей) */
  var cdoCentroid={x:(C.x+D.x+O.x)/3, y:(C.y+D.y+O.y)/3};
  h+="<text x='"+sx(cdoCentroid.x).toFixed(0)+"' y='"+sy(cdoCentroid.y).toFixed(0)+"' font-size='13' fill='var(--red)' font-weight='600' text-anchor='middle'>AC = "+ac+"</text>";
  /* AO — подпись ВНЕ трапеции, слева от вершины A (вдали от BD и AB) */
  h+="<text x='"+(sx(A.x)-50).toFixed(0)+"' y='"+(sy(A.y)-4).toFixed(0)+"' font-size='13' fill='var(--green)' font-weight='700' text-anchor='middle'>AO = "+fmt(ao)+"</text>";
  h+="</svg>";
  return h;
}

/* ---------- SVG: угол A с параллельными BC ∥ DE ----------
   AB, BD — на одной стороне угла, AC, CE — на другой.
   Точки: A — вершина (низ), B,D — на одной стороне, C,E — на другой.
*/
function svgAnglePar(ab,bd,ce,ac){
  /* Лучи выходят из A (внизу слева). На нижнем луче: B (ближе), D (дальше).
     На верхнем луче: C (ближе), E (дальше). BC ∥ DE. */
  var angleLow=8;   /* нижний луч: почти горизонтальный */
  var angleHigh=48; /* верхний луч: наклонный вверх */
  function rPt(r,ang){return {x:r*Math.cos(ang*Math.PI/180),y:r*Math.sin(ang*Math.PI/180)};}
  var A={x:0,y:0};
  var B=rPt(ab,angleLow),D=rPt(ab+bd,angleLow);
  var C=rPt(ac,angleHigh),E=rPt(ac+ce,angleHigh);
  /* Концы лучей чуть дальше последних точек */
  var Dir={x:D.x+1.5,y:D.y};
  var Eir={x:E.x+1.5,y:E.y};
  /* Bounding box по всем точкам */
  var allX=[A.x,B.x,D.x,C.x,E.x,Dir.x,Eir.x];
  var allY=[A.y,B.y,D.y,C.y,E.y,Dir.y,Eir.y];
  var minX=Math.min.apply(null,allX)-0.5;
  var maxX=Math.max.apply(null,allX)+0.5;
  var minY=Math.min.apply(null,allY)-0.5;
  var maxY=Math.max.apply(null,allY)+0.5;
  var W=440,H=300,padX=58,padY=44;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H-2*padY);};
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  /* Стороны угла */
  h+="<line x1='"+sx(A.x).toFixed(1)+"' y1='"+sy(A.y).toFixed(1)+"' x2='"+sx(Dir.x).toFixed(1)+"' y2='"+sy(Dir.y).toFixed(1)+"' stroke='var(--ink)' stroke-width='2'/>";
  h+="<line x1='"+sx(A.x).toFixed(1)+"' y1='"+sy(A.y).toFixed(1)+"' x2='"+sx(Eir.x).toFixed(1)+"' y2='"+sy(Eir.y).toFixed(1)+"' stroke='var(--ink)' stroke-width='2'/>";
  /* Дуга угла A — между лучами на расстоянии arcR от A */
  var arcR=Math.min(22,(maxX-minX)*0.10);
  var arcStartX=arcR*Math.cos(angleLow*Math.PI/180);
  var arcStartY=arcR*Math.sin(angleLow*Math.PI/180);
  var arcEndX=arcR*Math.cos(angleHigh*Math.PI/180);
  var arcEndY=arcR*Math.sin(angleHigh*Math.PI/180);
  h+="<path d='M "+sx(arcStartX).toFixed(1)+" "+sy(arcStartY).toFixed(1)+" A "+arcR+" "+arcR+" 0 0 0 "+sx(arcEndX).toFixed(1)+" "+sy(arcEndY).toFixed(1)+"' fill='none' stroke='var(--mute)' stroke-width='1'/>";
  /* Параллельные BC и DE */
  h+="<line x1='"+sx(B.x).toFixed(1)+"' y1='"+sy(B.y).toFixed(1)+"' x2='"+sx(C.x).toFixed(1)+"' y2='"+sy(C.y).toFixed(1)+"' stroke='var(--blue)' stroke-width='2.2'/>";
  h+="<line x1='"+sx(D.x).toFixed(1)+"' y1='"+sy(D.y).toFixed(1)+"' x2='"+sx(E.x).toFixed(1)+"' y2='"+sy(E.y).toFixed(1)+"' stroke='var(--green)' stroke-width='2.2'/>";
  /* Метки параллельности (∥) */
  var bcMid={x:(B.x+C.x)/2,y:(B.y+C.y)/2};
  var bcN=sideLabel(B,C,0.6);
  h+="<text x='"+sx(bcN.x).toFixed(0)+"' y='"+sy(bcN.y).toFixed(0)+"' font-size='11' fill='var(--blue)' font-weight='700' text-anchor='middle'>∥</text>";
  var deN=sideLabel(D,E,0.6);
  h+="<text x='"+sx(deN.x).toFixed(0)+"' y='"+sy(deN.y).toFixed(0)+"' font-size='11' fill='var(--green)' font-weight='700' text-anchor='middle'>∥</text>";
  /* Вершины: A, B, C, D, E */
  var pts=[A,B,C,D,E];
  var lbls=["A","B","C","D","E"];
  var offs=[[-12,-6],[-10,15],[-12,-9],[10,15],[12,-9]];
  for(var i=0;i<pts.length;i++){
    h+="<circle cx='"+sx(pts[i].x).toFixed(1)+"' cy='"+sy(pts[i].y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(pts[i].x)+offs[i][0]).toFixed(0)+"' y='"+(sy(pts[i].y)+offs[i][1]).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lbls[i]+"</text>";
  }
  /* Подписи длин отрезков */
  /* AB — ПОД нижним лучом (вдали от верхнего луча и от самой нижней линии) */
  var abMid={x:A.x+(B.x-A.x)*0.5,y:A.y+(B.y-A.y)*0.5};
  h+="<text x='"+sx(abMid.x).toFixed(0)+"' y='"+(sy(abMid.y)+24).toFixed(0)+"' font-size='12' fill='var(--mute)' font-weight='600' text-anchor='middle'>AB = "+ab+"</text>";
  /* BD — под нижним лучом, между B и D, с большим смещением вниз */
  var bdMid={x:(B.x+D.x)/2,y:(B.y+D.y)/2};
  h+="<text x='"+sx(bdMid.x).toFixed(0)+"' y='"+(sy(bdMid.y)+22).toFixed(0)+"' font-size='12' fill='var(--mute)' font-weight='600' text-anchor='middle'>BD = "+bd+"</text>";
  /* AC — слева от верхнего луча (перпендикулярно вверх-влево), с увеличенным смещением */
  var acMidP=sideLabel(A,C,3.0);
  h+="<text x='"+sx(acMidP.x).toFixed(0)+"' y='"+sy(acMidP.y).toFixed(0)+"' font-size='12' fill='var(--red)' font-weight='700' text-anchor='middle'>AC = "+fmt(ac)+"</text>";
  /* CE — выше верхнего луча, перпендикулярно вверх-влево (вне угла, вдали от DE), с увеличенным смещением */
  var ceMidP=sideLabel(C,E,3.0);
  h+="<text x='"+sx(ceMidP.x).toFixed(0)+"' y='"+sy(ceMidP.y).toFixed(0)+"' font-size='12' fill='var(--mute)' font-weight='600' text-anchor='middle'>CE = "+ce+"</text>";
  h+="</svg>";
  return h;
}

/* ---------- SVG: два треугольника с подписями сторон (для подобия по 3 сторонам) ---------- */
function svgTriSSS(a,b,c,a1,b1,c1){
  var v1=triVerts(a,b,c);
  var v2=triVerts(a1,b1,c1);
  var gap=5;
  var shiftX=Math.max.apply(null,v1.map(function(p){return p.x}))+gap;
  var allPts=v1.concat(v2.map(function(p){return {x:p.x+shiftX,y:p.y}}));
  var minX=Math.min.apply(null,allPts.map(function(p){return p.x}));
  var maxX=Math.max.apply(null,allPts.map(function(p){return p.x}));
  var minY=Math.min.apply(null,allPts.map(function(p){return p.y}));
  var maxY=Math.max.apply(null,allPts.map(function(p){return p.y}));
  var W=540,H=260,padX=58,padY=42;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H-2*padY);};
  var c1x=(v1[0].x+v1[1].x+v1[2].x)/3;
  var c2x=(v2[0].x+v2[1].x+v2[2].x)/3+shiftX;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  h+="<text x='"+sx(c1x).toFixed(0)+"' y='20' font-size='13' fill='var(--mute)' font-weight='600' text-anchor='middle'>△ABC</text>";
  h+="<text x='"+sx(c2x).toFixed(0)+"' y='20' font-size='13' fill='var(--mute)' font-weight='600' text-anchor='middle'>△A₁B₁C₁</text>";
  /* Первый */
  var poly1=v1.map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly1+"' fill='rgba(47,111,208,.08)' stroke='var(--ink)' stroke-width='2'/>";
  var lblA=["A","B","C"];
  for(var i=0;i<3;i++){
    var p=v1[i];
    var lx=p.x<0.3?-13:p.x>a-0.3?13:0;
    var ly=p.y<0.3?16:-8;
    h+="<circle cx='"+sx(p.x).toFixed(1)+"' cy='"+sy(p.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p.x)+lx).toFixed(0)+"' y='"+(sy(p.y)+ly).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lblA[i]+"</text>";
  }
  var sp1=[[v1[1],v1[2],a],[v1[2],v1[0],b],[v1[0],v1[1],c]];
  for(var j=0;j<3;j++){
    var s=sideLabel(sp1[j][0],sp1[j][1],-0.85);
    h+="<text x='"+sx(s.x).toFixed(0)+"' y='"+sy(s.y).toFixed(0)+"' font-size='13' fill='var(--blue)' font-weight='600' text-anchor='middle'>"+fmt(sp1[j][2])+"</text>";
  }
  /* Второй */
  var poly2=v2.map(function(p){return sx(p.x+shiftX).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly2+"' fill='rgba(220,80,60,.06)' stroke='var(--ink)' stroke-width='2'/>";
  var lblB=["A₁","B₁","C₁"];
  for(var i=0;i<3;i++){
    var p=v2[i];
    var lx=p.x<0.3?-13:p.x>a1-0.3?13:0;
    var ly=p.y<0.3?16:-8;
    h+="<circle cx='"+sx(p.x+shiftX).toFixed(1)+"' cy='"+sy(p.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p.x+shiftX)+lx).toFixed(0)+"' y='"+(sy(p.y)+ly).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lblB[i]+"</text>";
  }
  var sp2=[[v2[1],v2[2],a1],[v2[2],v2[0],b1],[v2[0],v2[1],c1]];
  for(var j=0;j<3;j++){
    var s=sideLabel(sp2[j][0],sp2[j][1],-0.85);
    h+="<text x='"+sx(s.x+shiftX).toFixed(0)+"' y='"+sy(s.y).toFixed(0)+"' font-size='13' fill='var(--green)' font-weight='600' text-anchor='middle'>"+fmt(sp2[j][2])+"</text>";
  }
  h+="</svg>";
  return h;
}

/* ---------- SVG: два подобных треугольника с площадями ----------
   s1, s2 — площади; k — коэффициент подобия.
*/
function svgSimAreas(s1,s2,k){
  /* Используем произвольные стороны: 4, 5, 6 для первого, умноженные на k для второго */
  var a=4,b=5,c=6;
  var v1=triVerts(a,b,c);
  var v2=triVerts(a*k,b*k,c*k);
  var gap=6;
  var shiftX=Math.max.apply(null,v1.map(function(p){return p.x}))+gap;
  var allPts=v1.concat(v2.map(function(p){return {x:p.x+shiftX,y:p.y}}));
  var minX=Math.min.apply(null,allPts.map(function(p){return p.x}));
  var maxX=Math.max.apply(null,allPts.map(function(p){return p.x}));
  var minY=Math.min.apply(null,allPts.map(function(p){return p.y}));
  var maxY=Math.max.apply(null,allPts.map(function(p){return p.y}));
  var W=480,H=240,padX=50,padY=44;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H-2*padY);};
  var cx1=function(){return sx((v1[0].x+v1[1].x+v1[2].x)/3);};
  var cy1=function(){return sy((v1[0].y+v1[1].y+v1[2].y)/3);};
  var cx2=function(){return sx((v2[0].x+v2[1].x+v2[2].x)/3+shiftX);};
  var cy2=function(){return sy((v2[0].y+v2[1].y+v2[2].y)/3);};
  var c1x=(v1[0].x+v1[1].x+v1[2].x)/3;
  var c2x=(v2[0].x+v2[1].x+v2[2].x)/3+shiftX;
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  h+="<text x='"+sx(c1x).toFixed(0)+"' y='20' font-size='13' fill='var(--blue)' font-weight='700' text-anchor='middle'>△ABC, S₁ = "+s1+"</text>";
  h+="<text x='"+sx(c2x).toFixed(0)+"' y='20' font-size='13' fill='var(--red)' font-weight='700' text-anchor='middle'>△A₁B₁C₁, S₂ = "+s2+"</text>";
  var poly1=v1.map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly1+"' fill='rgba(47,111,208,.12)' stroke='var(--ink)' stroke-width='2'/>";
  var poly2=v2.map(function(p){return sx(p.x+shiftX).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly2+"' fill='rgba(220,80,60,.10)' stroke='var(--ink)' stroke-width='2'/>";
  var lblA=["A","B","C"],lblB=["A₁","B₁","C₁"];
  for(var i=0;i<3;i++){
    var p=v1[i];
    var lx=p.x<0.3?-13:p.x>a-0.3?13:0;
    var ly=p.y<0.3?16:-8;
    h+="<circle cx='"+sx(p.x).toFixed(1)+"' cy='"+sy(p.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p.x)+lx).toFixed(0)+"' y='"+(sy(p.y)+ly).toFixed(0)+"' font-size='13' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lblA[i]+"</text>";
    var p2=v2[i];
    var lx2=p2.x<0.3?-13:p2.x>a*k-0.3?13:0;
    var ly2=p2.y<0.3?16:-8;
    h+="<circle cx='"+sx(p2.x+shiftX).toFixed(1)+"' cy='"+sy(p2.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p2.x+shiftX)+lx2).toFixed(0)+"' y='"+(sy(p2.y)+ly2).toFixed(0)+"' font-size='13' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lblB[i]+"</text>";
  }
  /* (площади указаны в заголовках выше) */
  h+="</svg>";
  return h;
}

/* ---------- SVG: трапеция с продолженными боковыми сторонами, точка M ----------
   small, large — основания; side1, side2 — боковые стороны; d1 — отрезок от M до конца меньшего основания.
   M — точка схода боковых сторон сверху.
*/
function svgTrapezoidExt(small,large,side1,side2,d1){
  var W=380,H=300,padX=44,padY=36;
  /* M сверху, меньшее основание (BC) ближе к M, большее (AD) — ниже.
     Боковые стороны: AB (слева) = side1, CD (справа) = side2.
     BC ∥ AD, BC = small, AD = large. Продления AB и DC пересекаются в M.
     △MBC ~ △MAD с коэффициентом small/large.
  */
  /* Численно решаем уравнение для высоты трапеции hTrap:
     sqrt(side1² − hTrap²) + sqrt(side2² − hTrap²) = large − small
     (сумма горизонтальных проекций боковых сторон = разности оснований)
  */
  var sumHD=large-small;
  var hTrap;
  if(Math.abs(side1-side2)>=sumHD){
    /* Трапеция вырожденная — рисуем симметричную с усреднённой стороной */
    var sideAvg=(side1+side2)/2;
    hTrap=Math.sqrt(Math.max(2,sideAvg*sideAvg-(sumHD/2)*(sumHD/2)));
  }else{
    var lo=0,hi=Math.min(side1,side2)-0.001;
    for(var i=0;i<50;i++){
      var mid=(lo+hi)/2;
      var f=Math.sqrt(Math.max(0,side1*side1-mid*mid))+Math.sqrt(Math.max(0,side2*side2-mid*mid))-sumHD;
      if(f>0)lo=mid; else hi=mid;
    }
    hTrap=(lo+hi)/2;
  }
  /* Горизонтальные проекции боковых сторон */
  var hd1=Math.sqrt(Math.max(0,side1*side1-hTrap*hTrap));
  var hd2=Math.sqrt(Math.max(0,side2*side2-hTrap*hTrap));
  /* Высота малого треугольника MBC */
  var hSmall=hTrap*small/(large-small);
  var totalH=hSmall+hTrap;
  /* M — точка пересечения продолженных боковых сторон.
     Размещаем M в (0, totalH). Тогда A и D не симметричны.
     A.x = −large/(large−small) * hd1, D.x = +large/(large−small) * hd2
     B.x = −small/(large−small) * hd1, C.x = +small/(large−small) * hd2 */
  var A={x:-large/(large-small)*hd1,y:0};
  var D={x: large/(large-small)*hd2,y:0};
  var B={x:-small/(large-small)*hd1,y:hTrap};
  var C={x: small/(large-small)*hd2,y:hTrap};
  var M={x:0,y:totalH};
  /* Bounding box */
  var minX=Math.min(A.x,B.x,C.x,D.x,M.x)-1;
  var maxX=Math.max(A.x,B.x,C.x,D.x,M.x)+1;
  var minY=-1,maxY=totalH+1;
  /* Uniform масштабирование (одинаковый масштаб по X и Y) — сохраняет пропорции */
  var rangeX=maxX-minX, rangeY=maxY-minY;
  var scale=Math.min((W-2*padX)/rangeX,(H-2*padY)/rangeY);
  var cx=(minX+maxX)/2, cy=(minY+maxY)/2;
  /* Центрируем чертёж в canvas */
  var sx=function(x){return W/2+(x-cx)*scale;};
  var sy=function(y){return H/2-(y-cy)*scale;};
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  /* Заливка трапеции (без обводки — обводка будет отдельными линиями для боковых сторон) */
  var poly=[B,C,D,A].map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly+"' fill='rgba(47,111,208,.08)' stroke='none'/>";
  /* Верхнее основание BC */
  h+="<line x1='"+sx(B.x).toFixed(1)+"' y1='"+sy(B.y).toFixed(1)+"' x2='"+sx(C.x).toFixed(1)+"' y2='"+sy(C.y).toFixed(1)+"' stroke='var(--ink)' stroke-width='2' stroke-linecap='round'/>";
  /* Нижнее основание AD */
  h+="<line x1='"+sx(A.x).toFixed(1)+"' y1='"+sy(A.y).toFixed(1)+"' x2='"+sx(D.x).toFixed(1)+"' y2='"+sy(D.y).toFixed(1)+"' stroke='var(--ink)' stroke-width='2' stroke-linecap='round'/>";
  /* Левая боковая сторона с продолжением: A → B → M (одна непрерывная прямая) */
  h+="<line x1='"+sx(A.x).toFixed(1)+"' y1='"+sy(A.y).toFixed(1)+"' x2='"+sx(M.x).toFixed(1)+"' y2='"+sy(M.y).toFixed(1)+"' stroke='var(--ink)' stroke-width='2' stroke-linecap='round'/>";
  /* Правая боковая сторона с продолжением: D → C → M (одна непрерывная прямая) */
  h+="<line x1='"+sx(D.x).toFixed(1)+"' y1='"+sy(D.y).toFixed(1)+"' x2='"+sx(M.x).toFixed(1)+"' y2='"+sy(M.y).toFixed(1)+"' stroke='var(--ink)' stroke-width='2' stroke-linecap='round'/>";
  /* Точка M */
  h+="<circle cx='"+sx(M.x).toFixed(1)+"' cy='"+sy(M.y).toFixed(1)+"' r='3.5' fill='var(--red)'/>";
  h+="<text x='"+(sx(M.x)).toFixed(0)+"' y='"+(sy(M.y)-9).toFixed(0)+"' font-size='14' fill='var(--red)' font-weight='700' text-anchor='middle'>M</text>";
  /* Вершины */
  var pts=[A,B,C,D];
  var lbls=["A","B","C","D"];
  var offs=[[-10,16],[-10,-8],[10,-8],[10,16]];
  for(var i=0;i<4;i++){
    h+="<circle cx='"+sx(pts[i].x).toFixed(1)+"' cy='"+sy(pts[i].y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(pts[i].x)+offs[i][0]).toFixed(0)+"' y='"+(sy(pts[i].y)+offs[i][1]).toFixed(0)+"' font-size='13' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lbls[i]+"</text>";
  }
  /* Подписи оснований — над/под серединой */
  var bcMidX=(B.x+C.x)/2;
  var adMidX=(A.x+D.x)/2;
  h+="<text x='"+sx(bcMidX).toFixed(0)+"' y='"+(sy(hTrap)+16).toFixed(0)+"' font-size='12' fill='var(--blue)' font-weight='600' text-anchor='middle'>BC = "+small+"</text>";
  h+="<text x='"+sx(adMidX).toFixed(0)+"' y='"+(sy(0)+18).toFixed(0)+"' font-size='12' fill='var(--blue)' font-weight='600' text-anchor='middle'>AD = "+large+"</text>";
  /* Подпись боковой стороны AB — перпендикулярно AB, слева снаружи */
  var abDir={x:B.x-A.x,y:B.y-A.y},abLen=Math.sqrt(abDir.x*abDir.x+abDir.y*abDir.y)||1;
  var abNx=-abDir.y/abLen,abNy=abDir.x/abLen;
  var abSign=(abNx*(minX-(A.x+B.x)/2)+abNy*(maxY-(A.y+B.y)/2))>0?1:-1;
  var abLab={x:(A.x+B.x)/2+abNx*abSign*3.0,y:(A.y+B.y)/2+abNy*abSign*3.0};
  h+="<text x='"+sx(abLab.x).toFixed(0)+"' y='"+sy(abLab.y).toFixed(0)+"' font-size='12' fill='var(--mute)' font-weight='600' text-anchor='middle'>AB = "+side1+"</text>";
  var cdDir={x:D.x-C.x,y:D.y-C.y},cdLen=Math.sqrt(cdDir.x*cdDir.x+cdDir.y*cdDir.y)||1;
  var cdNx=-cdDir.y/cdLen,cdNy=cdDir.x/cdLen;
  var cdSign=(cdNx*(maxX-(C.x+D.x)/2)+cdNy*(maxY-(C.y+D.y)/2))>0?1:-1;
  var cdLab={x:(C.x+D.x)/2+cdNx*cdSign*3.0,y:(C.y+D.y)/2+cdNy*cdSign*3.0};
  h+="<text x='"+sx(cdLab.x).toFixed(0)+"' y='"+sy(cdLab.y).toFixed(0)+"' font-size='12' fill='var(--mute)' font-weight='600' text-anchor='middle'>CD = "+side2+"</text>";
  /* Подпись MB (от M до B) — перпендикулярно MB, слева снаружи малого треугольника */
  var mbDir={x:B.x-M.x,y:B.y-M.y},mbLen=Math.sqrt(mbDir.x*mbDir.x+mbDir.y*mbDir.y)||1;
  var mbNx=-mbDir.y/mbLen,mbNy=mbDir.x/mbLen;
  /* знак: влево от MB (наружу малого треугольника) */
  var mbSign=(mbNx*(minX-(M.x+B.x)/2)+mbNy*(maxY-(M.y+B.y)/2))>0?1:-1;
  var mbLab={x:(M.x+B.x)/2+mbNx*mbSign*4.0,y:(M.y+B.y)/2+mbNy*mbSign*4.0};
  h+="<text x='"+sx(mbLab.x).toFixed(0)+"' y='"+sy(mbLab.y).toFixed(0)+"' font-size='12' fill='var(--green)' font-weight='700' text-anchor='middle'>MB = "+fmt(d1)+"</text>";
  h+="</svg>";
  return h;
}

/* ---------- SVG: треугольник ABC с MN ∥ AC ----------
   AB, AC — стороны; AM — отрезок на AB; MN — искомый.
*/
function svgTriParSeg(ab,ac,am,mn){
  /* Используем равнобедренный для красоты: AB=AC, но ac может отличаться */
  var b=ac,c=ab,a=Math.sqrt(b*b+c*c-2*b*c*0.4); /* произвольная третья сторона */
  var v=triVerts(a,b,c); /* [A, B, C] */
  /* M на AB: AM/AB = am/ab */
  var rM=am/ab;
  var M={x:v[0].x+(v[1].x-v[0].x)*rM,y:v[0].y+(v[1].y-v[0].y)*rM};
  /* N на BC: BN/BC = MB/AB = 1 − AM/AB (т.к. MN ∥ AC → △MBN ~ △ABC, коэф MB/AB) */
  var rN=1-rM;
  var N={x:v[1].x+(v[2].x-v[1].x)*rN,y:v[1].y+(v[2].y-v[1].y)*rN};
  var minX=Math.min(v[0].x,v[1].x,v[2].x,M.x,N.x)-1;
  var maxX=Math.max(v[0].x,v[1].x,v[2].x,M.x,N.x)+1;
  var minY=Math.min(v[0].y,v[1].y,v[2].y,M.y,N.y)-1;
  var maxY=Math.max(v[0].y,v[1].y,v[2].y,M.y,N.y)+1;
  var W=380,H=280,padX=58,padY=44;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H-2*padY);};
  var h="<svg width='"+W+"' height='"+H+"' viewBox='0 0 "+W+" "+H+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  /* △ABC */
  var poly=v.map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h+="<polygon points='"+poly+"' fill='rgba(47,111,208,.08)' stroke='var(--ink)' stroke-width='2'/>";
  /* MN — параллельный отрезок */
  h+="<line x1='"+sx(M.x).toFixed(1)+"' y1='"+sy(M.y).toFixed(1)+"' x2='"+sx(N.x).toFixed(1)+"' y2='"+sy(N.y).toFixed(1)+"' stroke='var(--red)' stroke-width='2.2'/>";
  /* Метки параллельности */
  h+="<text x='"+sx((M.x+N.x)/2).toFixed(0)+"' y='"+(sy((M.y+N.y)/2)-6).toFixed(0)+"' font-size='10' fill='var(--red)' font-weight='700' text-anchor='middle'>∥ AC</text>";
  /* Вершины */
  var lbls=["A","B","C"];
  for(var i=0;i<3;i++){
    var p=v[i];
    var lx=p.x<minX+0.5?-13:p.x>maxX-0.5?13:0;
    var ly=p.y<minY+0.5?16:p.y>maxY-0.5?-12:-8;
    h+="<circle cx='"+sx(p.x).toFixed(1)+"' cy='"+sy(p.y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h+="<text x='"+(sx(p.x)+lx).toFixed(0)+"' y='"+(sy(p.y)+ly).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lbls[i]+"</text>";
  }
  /* M и N */
  h+="<circle cx='"+sx(M.x).toFixed(1)+"' cy='"+sy(M.y).toFixed(1)+"' r='3' fill='var(--red)'/>";
  h+="<text x='"+(sx(M.x)-8).toFixed(0)+"' y='"+(sy(M.y)-7).toFixed(0)+"' font-size='13' fill='var(--red)' font-weight='700' text-anchor='middle'>M</text>";
  h+="<circle cx='"+sx(N.x).toFixed(1)+"' cy='"+sy(N.y).toFixed(1)+"' r='3' fill='var(--red)'/>";
  h+="<text x='"+(sx(N.x)+8).toFixed(0)+"' y='"+(sy(N.y)+14).toFixed(0)+"' font-size='13' fill='var(--red)' font-weight='700' text-anchor='middle'>N</text>";
  /* Подписи сторон: AB слева снаружи (вдали от M); AM справа внутри (с большим смещением); AC справа снаружи; MN ВЫШЕ MN (в quadrilateral AMNC, с большим смещением) */
  function ptOnSide(p1,p2,t,off){
    var dx=p2.x-p1.x,dy=p2.y-p1.y;
    var len=Math.sqrt(dx*dx+dy*dy)||1;
    var nx=-dy/len,ny=dx/len;
    return {x:p1.x+dx*t+nx*off, y:p1.y+dy*t+ny*off};
  }
  var abPos=ptOnSide(v[0],v[1],0.7,-2.5);
  h+="<text x='"+sx(abPos.x).toFixed(0)+"' y='"+sy(abPos.y).toFixed(0)+"' font-size='12' fill='var(--blue)' font-weight='600' text-anchor='middle'>AB = "+ab+"</text>";
  var acPos=ptOnSide(v[0],v[2],0.65,1.5);
  h+="<text x='"+sx(acPos.x).toFixed(0)+"' y='"+sy(acPos.y).toFixed(0)+"' font-size='12' fill='var(--blue)' font-weight='600' text-anchor='middle'>AC = "+ac+"</text>";
  /* AM — справа от AB (внутри), у середины AM, с увеличенным смещением */
  var amPos=ptOnSide(v[0],M,0.5,1.8);
  h+="<text x='"+sx(amPos.x).toFixed(0)+"' y='"+sy(amPos.y).toFixed(0)+"' font-size='12' fill='var(--green)' font-weight='700' text-anchor='middle'>AM = "+fmt(am)+"</text>";
  /* MN — ВЫШЕ MN (в quadrilateral AMNC), с большим перпендикулярным смещением */
  var mnPos=ptOnSide(M,N,0.5,3.0);
  h+="<text x='"+sx(mnPos.x).toFixed(0)+"' y='"+sy(mnPos.y).toFixed(0)+"' font-size='12' fill='var(--red)' font-weight='700' text-anchor='middle'>MN = "+fmt(mn)+"</text>";
  h+="</svg>";
  return h;
}

/* ---------- SVG: треугольник с вписанным квадратом ----------
   a=AB (основание), h=CH (высота), x=сторона квадрата.
*/
function svgInscribedSquare(a,h,x){
  /* Равнобедренный треугольник для красоты */
  var A={x:-a/2,y:0},B={x:a/2,y:0},C={x:0,y:h};
  /* Квадрат: две нижние вершины на AB, две верхние — на AC и BC.
     Нижние вершины: P=(-x/2, 0), Q=(x/2, 0)
     Верхние вершины: R=(x/2, x), S=(-x/2, x) — но они должны лежать на AC и BC.
     Проверка: AC идёт от (-a/2,0) до (0,h). Уравнение: y = (h/(a/2))(x+a/2) = 2h/a·(x+a/2).
     Для x=-x/2: y = 2h/a·(-x/2+a/2) = h·(a-x)/a. Должно быть = x.
     Так и есть: x = h(a-x)/a → xa = h(a-x) → xa = ha - hx → x(a+h) = ha → x = ha/(a+h). ✓
  */
  var P={x:-x/2,y:0},Q={x:x/2,y:0};
  var R={x:x/2,y:x},S={x:-x/2,y:x};
  /* H — основание высоты (середина AB) */
  var H={x:0,y:0};
  var minX=-a/2-1,maxX=a/2+1,minY=-1,maxY=h+1;
  var W=360,H_svg=300,padX=46,padY=40;
  var sx=function(x){return padX+(x-minX)/(maxX-minX)*(W-2*padX);};
  var sy=function(y){return padY+(maxY-y)/(maxY-minY)*(H_svg-2*padY);};
  var h_="<svg width='"+W+"' height='"+H_svg+"' viewBox='0 0 "+W+" "+H_svg+"' xmlns='http://www.w3.org/2000/svg' style='font-family:Golos Text,sans-serif;max-width:100%;height:auto;display:block;margin:0 auto'>";
  /* △ABC */
  var poly=[A,B,C].map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h_+="<polygon points='"+poly+"' fill='rgba(47,111,208,.06)' stroke='var(--ink)' stroke-width='2'/>";
  /* Подпись CH (пунктиром) — слева от высоты, выше квадрата, с увеличенным отступом */
  h_+="<line x1='"+sx(C.x).toFixed(1)+"' y1='"+sy(C.y).toFixed(1)+"' x2='"+sx(H.x).toFixed(1)+"' y2='"+sy(H.y).toFixed(1)+"' stroke='var(--mute)' stroke-width='1.2' stroke-dasharray='4,3'/>";
  h_+="<text x='"+(sx(0)-25).toFixed(0)+"' y='"+sy(h-x-0.5).toFixed(0)+"' font-size='12' fill='var(--mute)' font-weight='600' text-anchor='end'>CH = "+h+"</text>";
  /* Квадрат */
  var sq=[P,Q,R,S].map(function(p){return sx(p.x).toFixed(1)+","+sy(p.y).toFixed(1);}).join(" ");
  h_+="<polygon points='"+sq+"' fill='rgba(220,80,60,.15)' stroke='var(--red)' stroke-width='2'/>";
  /* Подпись x — справа от квадрата (снаружи), вертикально по центру */
  h_+="<text x='"+(sx(x/2)+8).toFixed(0)+"' y='"+(sy(x/2)+4).toFixed(0)+"' font-size='12' fill='var(--red)' font-weight='700' text-anchor='start'>x = "+fmt(x)+"</text>";
  /* Вершины */
  var pts=[A,B,C];
  var lbls=["A","B","C"];
  var offs=[[-10,16],[10,16],[0,-8]];
  for(var i=0;i<3;i++){
    h_+="<circle cx='"+sx(pts[i].x).toFixed(1)+"' cy='"+sy(pts[i].y).toFixed(1)+"' r='3' fill='var(--ink)'/>";
    h_+="<text x='"+(sx(pts[i].x)+offs[i][0]).toFixed(0)+"' y='"+(sy(pts[i].y)+offs[i][1]).toFixed(0)+"' font-size='14' fill='var(--ink)' font-weight='700' text-anchor='middle'>"+lbls[i]+"</text>";
  }
  /* Подпись AB — под серединой основания AB */
  h_+="<text x='"+sx(0).toFixed(0)+"' y='"+(sy(0)+18).toFixed(0)+"' font-size='12' fill='var(--blue)' font-weight='600' text-anchor='middle'>AB = "+a+"</text>";
  h_+="</svg>";
  return h_;
}

function detSteps(items,answerLine){
  var h="";
  for(var i=0;i<items.length;i++){
    h+="<p><b>"+items[i].title+"</b></p>";
    if(items[i].text)h+="<p>"+items[i].text+"</p>";
    if(items[i].svg)h+="<div class='svg-center' style='margin:8px auto'>"+items[i].svg+"</div>";
  }
  h+="<p><b>Ответ:</b> <span class='dz-code'>"+answerLine+"</span></p>";
  return h;
}

/* =====================================================================
   ГЕНЕРАТОРЫ ЗАДАЧ (8 типов, случайный выбор в каждом варианте)
   ===================================================================== */

/* Тип 1: Подобные треугольники — найти сторону (по коэффициенту подобия) */
function genType1(rng){
  var k=pick(rng,[2,3,0.5,1.5,2.5,0.4]);
  var a=ri(rng,3,12);
  var b=ri(rng,4,15);
  /* c подберём так, чтобы треугольник существовал */
  var c;
  do{ c=ri(rng,5,18); }while(c>=a+b-1 || c<=Math.abs(a-b)+1);
  var side=pick(rng,["a","b","c"]);
  var sideVal={a:a,b:b,c:c}[side];
  var ans=sideVal*k;
  var detH=detSteps([
    {title:"Дано",text:"△ABC ~ △A₁B₁C₁, коэффициент подобия k = "+fmt(k)+". Стороны △ABC: a = BC = "+a+", b = CA = "+b+", c = AB = "+c+".",
      svg:svgSimPair(a,b,c,k,side,ans)},
    {title:"Свойство",text:"В подобных треугольниках отношения соответствующих сторон равны коэффициенту подобия: a₁/a = b₁/b = c₁/c = k."},
    {title:"Решение",text:"Искомая сторона "+side+"₁ = "+side+" · k = "+sideVal+" · "+fmt(k)+" = <b>"+fmt(ans)+"</b>."},
  ],fmt(ans));
  return mkDec({
    q:"△ABC ~ △A₁B₁C₁ с коэффициентом подобия k = "+fmt(k)+". Стороны △ABC: a = "+a+", b = "+b+", c = "+c+". Найдите сторону "+side+"₁."+NOTE,
    a:ans,sol:fmt(ans),
    hint:"Стороны подобных треугольников относятся как коэффициент подобия",
    detailed:detH
  });
}

/* Тип 2: Трапеция — отношение диагоналей (обратная задача) */
function genType2(rng){
  var ab=ri(rng,4,12),cd=ab*ri(rng,2,4);
  var ac=ab+cd;
  var oc=ac*cd/(ab+cd);
  var ao=ac-oc;
  var detH=detSteps([
    {title:"Дано",text:"Трапеция ABCD, основания AB = "+ab+", CD = "+cd+". Диагонали пересекаются в O. AC = "+ac+".",
      svg:svgTrapezoidDiag(ab,cd,ac,ao)},
    {title:"Свойство",text:"Диагонали трапеции делятся точкой пересечения пропорционально основаниям: AO/OC = AB/CD."},
    {title:"Решение",text:"AO/OC = "+ab+"/"+cd+". AC = AO + OC = "+ac+". Пусть OC = x, тогда AO = ("+ab+"/"+cd+")·x. ("+ab+"/"+cd+")·x + x = "+ac+". x·("+ab+"+"+cd+")/"+cd+" = "+ac+", x = "+ac+"·"+cd+"/"+(ab+cd)+" = "+fmt(oc)+". Тогда AO = "+ac+" − "+fmt(oc)+" = <b>"+fmt(ao)+"</b>."},
  ],fmt(ao));
  return mkDec({
    q:"В трапеции ABCD с основаниями AB = "+ab+" и CD = "+cd+" диагонали пересекаются в точке O. AC = "+ac+". Найдите AO."+NOTE,
    a:ao,sol:fmt(ao),
    hint:"AO/OC = AB/CD; AO + OC = AC",
    detailed:detH
  });
}

/* Тип 3: Параллельные прямые, пересекающие стороны угла — найти отрезок */
function genType3(rng){
  var ab=ri(rng,3,10),bd=ri(rng,2,8);
  var ce=ri(rng,4,12);
  var ac=ab*ce/bd;
  var detH=detSteps([
    {title:"Дано",text:"Стороны угла A пересечены параллельными прямыми BC и DE. На одной стороне угла: AB = "+ab+", BD = "+bd+". На другой: CE = "+ce+". AC — искомый отрезок.",
      svg:svgAnglePar(ab,bd,ce,ac)},
    {title:"Теорема",text:"Параллельные прямые, пересекающие стороны угла, отсекают пропорциональные отрезки: AB/BD = AC/CE."},
    {title:"Решение",text:ab+"/"+bd+" = AC/"+ce+". AC = "+ab+"·"+ce+"/"+bd+" = <b>"+fmt(ac)+"</b>."},
  ],fmt(ac));
  return mkDec({
    q:"Стороны угла A пересечены параллельными прямыми BC ∥ DE. AB = "+ab+", BD = "+bd+", CE = "+ce+". Найдите AC."+NOTE,
    a:ac,sol:fmt(ac),
    hint:"AB/BD = AC/CE (теорема о пропорциональных отрезках)",
    detailed:detH
  });
}

/* Тип 4: Подобны ли треугольники? (по трём сторонам) — Да/Нет */
function genType4(rng){
  var k=pick(rng,[1.5,2,2.5,3,0.5]);
  var similar=rng()<0.7;
  var a=ri(rng,3,8),b=ri(rng,4,10);
  var c;
  do{ c=ri(rng,5,12); }while(c>=a+b-1 || c<=Math.abs(a-b)+1);
  var a1,b1,c1;
  if(similar){
    a1=a*k;b1=b*k;c1=c*k;
  } else {
    a1=a*k+pick(rng,[-1,1,-2,2]);b1=b*k;c1=c*k;
    if(a1<=0)a1=a*k+1;
  }
  var correct=similar?"Да":"Нет";
  var ratio1=a1/a,ratio2=b1/b,ratio3=c1/c;
  var allEqual=Math.abs(ratio1-ratio2)<0.01&&Math.abs(ratio2-ratio3)<0.01;
  var detH=detSteps([
    {title:"Дано",text:"△ABC: AB = "+c+", BC = "+a+", CA = "+b+". △A₁B₁C₁: A₁B₁ = "+fmt(c1)+", B₁C₁ = "+fmt(a1)+", C₁A₁ = "+fmt(b1)+".",
      svg:svgTriSSS(a,b,c,a1,b1,c1)},
    {title:"Признак",text:"Третий признак подобия: если три стороны одного треугольника пропорциональны трём сторонам другого, то треугольники подобны."},
    {title:"Проверка отношений",text:"A₁B₁/AB = "+fmt(c1)+"/"+c+" = "+fmt(ratio1)+"; B₁C₁/BC = "+fmt(a1)+"/"+a+" = "+fmt(ratio2)+"; C₁A₁/CA = "+fmt(b1)+"/"+b+" = "+fmt(ratio3)+"."+
      (allEqual?"<br/>Все три отношения равны → треугольники <b>подобны</b>.":"<br/>Отношения не равны → треугольники <b>не подобны</b>.")},
  ],correct);
  return mkMC({
    q:"Подобны ли треугольники ABC и A₁B₁C₁, если AB = "+c+", BC = "+a+", CA = "+b+", A₁B₁ = "+fmt(c1)+", B₁C₁ = "+fmt(a1)+", C₁A₁ = "+fmt(b1)+"?",
    c:correct,opts:["Да","Нет"],
    hint:"Проверьте, равны ли отношения соответствующих сторон",
    detailed:detH
  });
}

/* Тип 5: Найти коэффициент подобия по отношению площадей */
function genType5(rng){
  var k=ri(rng,2,5);
  var s1=ri(rng,4,20);
  var s2=s1*k*k;
  var detH=detSteps([
    {title:"Дано",text:"Подобные треугольники △ABC ~ △A₁B₁C₁. S(△ABC) = "+s1+", S(△A₁B₁C₁) = "+s2+".",
      svg:svgSimAreas(s1,s2,k)},
    {title:"Свойство",text:"Отношение площадей подобных треугольников равно квадрату коэффициента подобия: S₁/S₂ = k²."},
    {title:"Решение",text:"S₁/S₂ = "+s1+"/"+s2+" = "+(s1/s2).toFixed(3)+". k² = "+(s1/s2).toFixed(3)+". k = √("+(s1/s2).toFixed(3)+") = <b>"+fmt(k)+"</b>."},
  ],fmt(k));
  return mkDec({
    q:"Площади подобных треугольников равны "+s1+" и "+s2+". Найдите коэффициент подобия."+NOTE,
    a:k,sol:fmt(k),
    hint:"S₁/S₂ = k², поэтому k = √(S₁/S₂)",
    detailed:detH
  });
}

/* Тип 6: Трапеция — боковые стороны продолжены до пересечения (обратная) */
function genType6(rng){
  /* Подбираем параметры так, чтобы трапеция существовала:
     нужно |side1 − side2| < large − small (иначе нарушается неравенство треугольника).
     Также side1 + side2 > large − small (всегда выполняется при наших значениях). */
  var small=ri(rng,3,7);
  var largeAdd=ri(rng,3,6); /* увеличил диапазон, чтобы large−small было больше */
  var large=small+largeAdd;
  var side1=ri(rng,4,7);
  /* Максимальное отклонение side2 от side1, чтобы трапеция существовала */
  var maxDelta=Math.max(1, largeAdd-1);
  var side2=side1+ri(rng,-Math.min(maxDelta,side1-3),Math.min(maxDelta,7-side1));
  if(side2<3)side2=3;
  if(side2>7)side2=7;
  /* Если всё-таки не существует — приравниваем side2 к side1 */
  if(Math.abs(side1-side2)>=largeAdd){
    side2=side1;
  }
  /* расстояние от M до меньшего основания = side * small/(large-small) */
  var d1=side1*small/(large-small);
  var d2=side2*small/(large-small);
  var detH=detSteps([
    {title:"Дано",text:"Трапеция ABCD с основаниями BC = "+small+" и AD = "+large+". Боковые стороны AB = "+side1+", CD = "+side2+" продолжены до пересечения в точке M.",
      svg:svgTrapezoidExt(small,large,side1,side2,d1)},
    {title:"Подобие",text:"△MBC ~ △MAD по двум углам (∠M — общий, ∠MBC = ∠MAD как соответственные при BC ∥ AD). Коэффициент подобия k = BC/AD = "+small+"/"+large+"."},
    {title:"Решение",text:"MB/MA = "+small+"/"+large+". MA = MB + AB = MB + "+side1+". Тогда MB/(MB+"+side1+") = "+small+"/"+large+", откуда MB·"+large+" = "+small+"·(MB+"+side1+"), MB·("+large+"−"+small+") = "+(small*side1)+", MB = "+(small*side1)+"/"+(large-small)+" = <b>"+fmt(d1)+"</b>. Аналогично MC = "+fmt(d2)+"."},
  ],fmt(d1));
  return mkDec({
    q:"Основания трапеции равны "+small+" и "+large+". Боковые стороны "+side1+" и "+side2+" продолжены до пересечения в точке M. Найдите расстояние от M до ближайшего конца меньшего основания."+NOTE,
    a:d1,sol:fmt(d1),
    hint:"△MBC ~ △MAD. Коэффициент = меньшее основание / большее",
    detailed:detH
  });
}

/* Тип 7: Средняя линия / параллельный отрезок в треугольнике */
function genType7(rng){
  var ab=ri(rng,6,15),ac=ri(rng,8,18);
  var ratio=pick(rng,[0.3,0.4,0.5,0.6,0.7]);
  var am=ab*ratio;
  var mn=ac*(1-ratio); /* MN = AC · MB/AB = AC · (1 − AM/AB) */
  var detH=detSteps([
    {title:"Дано",text:"△ABC: M ∈ AB, N ∈ BC, MN ∥ AC. AB = "+ab+", AC = "+ac+", AM = "+fmt(am)+".",
      svg:svgTriParSeg(ab,ac,am,mn)},
    {title:"Подобие",text:"По теореме: если MN ∥ AC, то △MBN ~ △ABC (по двум углам). Коэффициент подобия △MBN к △ABC равен MB/AB."},
    {title:"Решение",text:"MB = AB − AM = "+ab+" − "+fmt(am)+" = "+fmt(ab-am)+". MN/AC = MB/AB = "+fmt(ab-am)+"/"+ab+" = "+fmt(1-ratio)+". MN = AC · "+fmt(1-ratio)+" = "+ac+" · "+fmt(1-ratio)+" = <b>"+fmt(mn)+"</b>."},
  ],fmt(mn));
  return mkDec({
    q:"В треугольнике ABC точка M лежит на AB, N — на BC, MN ∥ AC. AB = "+ab+", AC = "+ac+", AM = "+fmt(am)+". Найдите MN."+NOTE,
    a:mn,sol:fmt(mn),
    hint:"△MBN ~ △ABC, MN/AC = MB/AB",
    detailed:detH
  });
}

/* Тип 8: Вписанный квадрат в треугольник (обратная) */
function genType8(rng){
  var a=ri(rng,6,12),h=ri(rng,4,10);
  var side=a*h/(a+h);
  var detH=detSteps([
    {title:"Дано",text:"△ABC: AB = "+a+", высота CH = "+h+", CH ⊥ AB. Квадрат вписан так, что две вершины лежат на AB, две другие — на AC и BC.",
      svg:svgInscribedSquare(a,h,side)},
    {title:"Подобие",text:"Малый треугольник над квадратом (с основанием — верхней стороной квадрата) подобен △ABC (по двум углам: ∠A общий, ∠ при верхнем основании равен ∠ACB как соответственный)."},
    {title:"Решение",text:"Пусть сторона квадрата x. Коэффициент подобия малого треугольника к △ABC равен (h − x)/h. Тогда x/a = (h − x)/h. h·x = a·(h − x). h·x + a·x = a·h. x(h + a) = a·h. x = a·h/(a + h) = "+a+"·"+h+"/"+(a+h)+" = <b>"+fmt(side)+"</b>."},
  ],fmt(side));
  return mkDec({
    q:"В треугольнике ABC сторона AB = "+a+", высота CH = "+h+". Найдите сторону квадрата, вписанного в треугольник так, что две вершины лежат на AB, а две другие — на AC и BC."+NOTE,
    a:side,sol:fmt(side),
    hint:"Малый треугольник над квадратом подобен данному. x/a = (h−x)/h",
    detailed:detH
  });
}

/* ---------- генератор варианта: 8 случайных заданий без повторов типа ---------- */
var ALL_TYPES=[genType1,genType2,genType3,genType4,genType5,genType6,genType7,genType8];
function genVariant(rng){
  var types=shuf(rng,[0,1,2,3,4,5,6,7]);
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
    if(TZ.TOPICS[i].id==="podobnye")return;
  }
  TZ.TOPICS.push({
    id:"podobnye",
    subject:"Математика",
    grade:"8 класс",
    title:"Подобные треугольники",
    variants:40,
    desc:"Тренажёр по геометрии (8 класс): подобные треугольники. "
      +"8 заданий: коэффициент подобия, трапеция с диагоналями, "
      +"параллельные прямые, признаки подобия, площади, вписанный квадрат. "
      +"40 вариантов. После выполнения — подробное решение с чертежами SVG.",
    blocks:[{name:"Подобные треугольники",gen:genVariant,count:8}]
  });
}

register();

if(typeof module!=="undefined"&&module.exports){
  module.exports={genVariant:genVariant,ALL_TYPES:ALL_TYPES};
}

})(typeof window!=="undefined"?window:globalThis);
