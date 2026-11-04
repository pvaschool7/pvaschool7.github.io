/* Поиск по сайту: живой поиск по индексу search-index.js.
   Работает и с file:// (индекс подключается тегом <script>, без fetch).
   Вставляется в боковое меню сразу после пункта «Главная» (add_search.py). */
(function(){
  var IN=document.getElementById("site-search"),
      DROP=document.getElementById("search-drop");
  if(!IN||!DROP)return;
  var SEL=-1,ITEMS=[];
  function idx(){return window.pvaSearchIndex||[];}
  /* префикс пути берём из ссылки «Главная» в этом же меню: '' в корне, '../' на вложенных страницах */
  function home(){
    var a=document.querySelector('.menu a[href$="index.html"]');
    return a?a.getAttribute("href").replace(/index\.html.*$/,""):"";
  }
  function norm(s){return (s||"").toLowerCase().replace(/ё/g,"е");}
  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function hl(escd,words){
    var out=escd;
    for(var i=0;i<words.length;i++){
      var w=words[i].replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      out=out.replace(new RegExp("("+w+")","gi"),"<mark>$1</mark>");
    }
    return out;
  }
  function snippet(x,words){
    var lx=norm(x),p=-1;
    for(var i=0;i<words.length;i++){
      var k=lx.indexOf(words[i]);
      if(k>-1&&(p<0||k<p))p=k;
    }
    if(p<0){var s0=x.slice(0,140);return esc(s0)+(x.length>140?"…":"");}
    var a=Math.max(0,p-55),b=Math.min(x.length,p+95);
    return (a>0?"…":"")+hl(esc(x.slice(a,b)),words)+(b<x.length?"…":"");
  }
  function search(q){
    var words=norm(q).split(/[\s,.;:!?]+/).filter(function(w){return w.length>1;});
    if(!words.length)return null;
    var res=[];
    for(var i=0;i<idx().length;i++){
      var e=idx()[i],T=norm(e.t),X=norm(e.x||""),hay=T+" "+X,score=0,ok=true;
      for(var j=0;j<words.length;j++){
        if(hay.indexOf(words[j])<0){ok=false;break;}
        if(T.indexOf(words[j])>-1)score+=30;
        score+=Math.min(X.split(words[j]).length-1,8);
      }
      if(!ok)continue;
      var allT=true;
      for(var k=0;k<words.length;k++)if(T.indexOf(words[k])<0){allT=false;break;}
      if(allT)score+=40;
      res.push({e:e,s:score});
    }
    res.sort(function(a,b){return b.s-a.s;});
    return {words:words,res:res.slice(0,7)};
  }
  function render(){
    var r=search(IN.value);
    ITEMS=[];SEL=-1;
    if(!r){DROP.hidden=true;DROP.innerHTML="";return;}
    var pre=home(),h="";
    if(!r.res.length){
      h='<div class="search-empty">Ничего не найдено. Попробуйте другое слово — например, «информация» или «вероятность».</div>';
    }else{
      for(var i=0;i<r.res.length;i++){
        var e=r.res[i].e,u=pre+e.u;
        h+='<a href="'+u+'"'+(i===0?' class="sel"':'')+'><b>'+hl(esc(e.t),r.words)+"</b><small>"+snippet(e.x||"",r.words)+"</small></a>";
        ITEMS.push(u);
      }
      SEL=0;
    }
    DROP.innerHTML=h;
    DROP.hidden=false;
  }
  function move(d){
    var as=DROP.querySelectorAll("a");
    if(!as.length)return;
    SEL=(SEL+d+as.length)%as.length;
    for(var i=0;i<as.length;i++)as[i].classList.toggle("sel",i===SEL);
    as[SEL].scrollIntoView({block:"nearest"});
  }
  function go(){
    var u=ITEMS[SEL>-1?SEL:0];
    if(!u)return;
    DROP.hidden=true;
    IN.blur();
    location.href=u;
  }
  IN.addEventListener("input",render);
  IN.addEventListener("focus",function(){if(IN.value.trim().length>1)render();});
  IN.addEventListener("keydown",function(e){
    if(DROP.hidden)return;
    if(e.key==="ArrowDown"){e.preventDefault();move(1);}
    else if(e.key==="ArrowUp"){e.preventDefault();move(-1);}
    else if(e.key==="Enter"){e.preventDefault();go();}
    else if(e.key==="Escape"){DROP.hidden=true;IN.blur();}
  });
  document.addEventListener("click",function(e){
    if(!DROP.hidden&&e.target!==IN&&!DROP.contains(e.target))DROP.hidden=true;
  });
})();
