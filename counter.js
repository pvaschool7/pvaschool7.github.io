/* Счётчик посещений сайта — Abacus (abacus.jasoncameron.dev), бесплатный сервис без регистрации.
   Один счётчик на весь сайт: namespace «pvaschool7», ключ «site-visits».
   Как считается: один заход = одна сессия браузера (sessionStorage) — переходы по
   страницам и обновление страницы (F5) счёт не увеличивают, новый заход после
   закрытия вкладки/браузера даёт +1.
   Если нет интернета или сервис недоступен — строка счётчика просто не показывается,
   работа сайта не нарушается. Посмотреть текущее значение можно по адресу:
   https://abacus.jasoncameron.dev/get/pvaschool7/site-visits */
(function(){
  var el = document.getElementById("pva-visits");
  if(!el) return;
  var API = "https://abacus.jasoncameron.dev/";
  var NS = "pvaschool7", KEY = "site-visits", SESS = "pva-visit-counted";
  var act = "hit";
  try {
    if(sessionStorage.getItem(SESS)) act = "get";
    else sessionStorage.setItem(SESS, "1");
  } catch(e) { /* приватный режим: считаем каждую загрузку страницы */ }
  fetch(API + act + "/" + NS + "/" + KEY)
    .then(function(r){ if(!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function(d){
      if(d && typeof d.value === "number"){
        el.textContent = d.value;
        var box = el.closest(".foot-counter");
        if(box) box.hidden = false;
      }
    })
    .catch(function(){ /* нет сети или сервис недоступен — счётчик остаётся скрытым */ });
})();
