/* =====================================================================
   Хакатон «TASKILLS» — строители протокола работы (XLSX + DOCX)
   и конфиг отправки на Яндекс.Диск.
   Подключается обычным <script src> после xlsx-lite.js.
   Работает и под file://, и в Node (для автотестов).
   ===================================================================== */
(function (global) {
"use strict";

/* ---- Отправка протокола на Яндекс.Диск, папка «Хакатон» ----
   Токен создаётся на https://oauth.yandex.ru (приложение с доступом
   «Яндекс.Диск REST API», право «Запись в любом месте на Диске») —
   тот же подход, что и в домашнем задании (см. trenazher-data.js).
   Внимание: страница публична, токен лежит в открытом виде — не выдавайте
   ему лишних прав и отзывайте, когда он больше не нужен.
   Если token пуст, файлы просто скачиваются: команда передаёт их учителю. */
var HK_DISK = {
  token: "y0__wgBEIza6wIY25YDIM6W2NEZMMKNy9sHJExVYrabBpylrZk3cxl912xgK8I",
  folder: "Хакатон",
  api: "https://cloud-api.yandex.net/v1/disk/resources/upload"
};

/* ---- утилиты ----
   XL() — движок zip/xlsx: в браузере это window.XLSXLITE (xlsx-lite.js
   подключён раньше), в Node — локальная копия из соседнего файла. */
function XL(){
 if(typeof XLSXLITE!=="undefined")return XLSXLITE;
 if(global&&global.XLSXLITE)return global.XLSXLITE;
 if(typeof require!=="undefined"){try{return require("./xlsx-lite.js")}catch(e){}}
 throw new Error("xlsx-lite.js не подключен");
}
function DATA(){
 if(global&&global.HK_DATA)return global.HK_DATA;
 if(typeof HK_DATA!=="undefined")return HK_DATA;
 throw new Error("HK_DATA не найдены (открывайте страницу hakaton.html)");
}
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
/* безопасное имя файла: только буквы/цифры/пробел/дефис/подчёркивание */
function safeName(s) {
  return String(s || "").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) || "Команда";
}
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function stamp(now) {
  return now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate()) +
    " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
}
function stampRu(now) {
  return pad2(now.getDate()) + "." + pad2(now.getMonth() + 1) + "." + now.getFullYear() +
    " " + pad2(now.getHours()) + ":" + pad2(now.getMinutes());
}

/* =====================================================================
   DOCX: минимальный валидный документ (Content_Types + rels + document.xml)
   paras: [{t:"текст", b:true|bold, i:true|italic, h:1|2|3|heading,
            c:true|center, s:список-маркер, sp:true|пустая строка-отступ}]
   ===================================================================== */
function docxParas(paras) {
  var out = [];
  for (var i = 0; i < paras.length; i++) {
    var p = paras[i];
    if (p && p.sp) { out.push("<w:p/>"); continue; }
    var t = (p && p.t) ? String(p.t) : "";
    var sz = 24, jc = p && p.c ? "center" : "left", bold = p && p.b, ital = p && p.i;
    if (p && p.h === 1) { sz = 36; bold = true; jc = "center"; }
    else if (p && p.h === 2) { sz = 30; bold = true; }
    else if (p && p.h === 3) { sz = 26; bold = true; }
    var rpr = "<w:rPr>" + (bold ? "<w:b/>" : "") + (ital ? "<w:i/>" : "") +
      '<w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/></w:rPr>';
    var ppr = "<w:pPr>" + (p && p.s ? '<w:ind w:left="340" w:hanging="340"/>' : "") +
      '<w:spacing w:after="60"/>' + '<w:jc w:val="' + jc + '"/></w:pPr>';
    var txt = p && p.s ? "• " + t : t;
    out.push("<w:p>" + ppr + "<w:r>" + rpr +
      '<w:t xml:space="preserve">' + esc(txt) + "</w:t></w:r></w:p>");
  }
  return out.join("");
}

function docxBuild(paras) {
  var ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    "</Types>";
  var rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    "</Relationships>";
  var doc = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    docxParas(paras) +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="850"/></w:sectPr>' +
    "</w:body></w:document>";
  return XL().zipSync([
    { name: "[Content_Types].xml", data: XL().utf8(ct) },
    { name: "_rels/.rels", data: XL().utf8(rels) },
    { name: "word/document.xml", data: XL().utf8(doc) }
  ]);
}

/* =====================================================================
   buildProtocol(S) — собирает XLSX и DOCX протокола работы команды.
   S: {team:{name,cls:[..],members:[{name,role}],track,level,bonus},
       prog:{mvp:[bool],stages:[{done,note}],rub:[5],bonus},
       sent:{stamp},now(optional Date)}
   Возвращает {xlsx:{data,name}, docx:{data,name}, total, max}
   ===================================================================== */
function buildProtocol(S) {
  var D = DATA();            // данные заданий из hakaton.html
  var now = S.now || new Date();
  var team = S.team, prog = S.prog;
  var tr = D.tracks.filter(function (t) { return t.id === team.track; })[0] || D.tracks[0];
  var lvl = tr.levels.filter(function (l) { return l.id === team.level; })[0] || tr.levels[0];
  var mvpN = tr.mvp.length;
  var done = 0;
  for (var k = 0; k < mvpN; k++) if (prog.mvp[k]) done++;
  var stagesDone = prog.stages.filter(function (x) { return x && x.done; }).length;
  var total = 0;
  for (var i = 0; i < D.rubric.length; i++) total += (+prog.rub[i] || 0);
  var bonus = +prog.bonus || 0;
  var cls = (team.cls || []).sort().join(", ");
  var members = (team.members || []).map(function (m) {
    return (m.name || "—") + " — " + m.role;
  }).join("; ");
  var bonusTxt = team.bonus ? "да (трек «Добавь нейросеть!»)" : "нет";

  /* ---------- XLSX (для учителя и жюри) ---------- */
  var rows = [];
  rows.push(["Хакатон «TASKILLS» · протокол работы команды"]);
  rows.push(["Задание", "Трек " + tr.n + " «" + tr.name + "» (" + tr.track + ")"]);
  rows.push(["Уровень", lvl.lvl + " · " + lvl.grades]);
  rows.push(["Бонусный трек ИИ", bonusTxt]);
  rows.push(["Команда", team.name || "—"]);
  rows.push(["Классы участников", cls || "—"]);
  rows.push(["Состав", members || "—"]);
  rows.push(["Дата и время", stamp(now)]);
  rows.push(["Выполнено функций MVP", done + " из " + mvpN]);
  rows.push(["Этапы работы", stagesDone + " из " + prog.stages.length]);
  rows.push([]);
  rows.push(["Самооценка по рубрике жюри"]);
  rows.push(["Критерий", "Баллы", "Максимум"]);
  for (i = 0; i < D.rubric.length; i++) {
    rows.push([D.rubric[i][0], prog.rub[i] || 0, D.rubric[i][1]]);
  }
  rows.push(["Бонусный трек «Добавь нейросеть!»", bonus, 10]);
  rows.push(["ИТОГО (самооценка)", total + bonus, 110]);
  rows.push([]);
  rows.push(["Обязательные функции MVP", "Статус"]);
  for (i = 0; i < tr.mvp.length; i++) {
    rows.push([tr.mvp[i], prog.mvp[i] ? "выполнено" : "не выполнено"]);
  }
  rows.push([]);
  rows.push(["Этап работы", "Отметка", "Заметка команды"]);
  for (i = 0; i < D.stages.length; i++) {
    var st = prog.stages[i] || {};
    rows.push([D.stages[i].name, st.done ? "выполнен" : "не выполнен", st.note || ""]);
  }
  rows.push([]);
  rows.push(["Отметка учителя/жюри", ""]);
  var xlsx = XL().build("Протокол", rows, [34, 60, 22, 26, 22], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 25, 26, 28, 29, 33]);
  var base = "Хакатон_" + safeName(team.name) + "_Трек" + tr.n;
  var xlsxName = base + ".xlsx";

  /* ---------- DOCX (протокол работы команды) ---------- */
  var paras = [];
  paras.push({ h: 1, t: "Протокол работы команды" });
  paras.push({ c: 1, t: "Хакатон «TASKILLS» · «Решаем реальные задачи — прокачиваем навыки»" });
  paras.push({ sp: 1 });
  paras.push({ h: 2, t: "1. Сведения о команде" });
  paras.push({ t: "Команда: " + (team.name || "—") });
  paras.push({ t: "Задание: трек " + tr.n + " «" + tr.name + "» (" + tr.track + ")" });
  paras.push({ t: "Уровень сложности: " + lvl.lvl + " (" + lvl.grades + ")" });
  paras.push({ t: "Бонусный трек «Добавь нейросеть!»:" + (team.bonus ? " выполняется" : " не выполняется") });
  paras.push({ t: "Классы участников: " + (cls || "—") });
  paras.push({ sp: 1 });
  paras.push({ h: 2, t: "2. Состав команды и роли" });
  for (i = 0; i < (team.members || []).length; i++) {
    paras.push({ s: 1, t: (team.members[i].name || "—") + " — " + team.members[i].role });
  }
  paras.push({ sp: 1 });
  paras.push({ h: 2, t: "3. Этапы работы" });
  for (i = 0; i < D.stages.length; i++) {
    st = prog.stages[i] || {};
    paras.push({ s: 1, b: st.done, t: D.stages[i].name + " — " + (st.done ? "выполнен" : "не выполнен") + (st.note ? ". " + st.note : "") });
  }
  paras.push({ sp: 1 });
  paras.push({ h: 2, t: "4. Обязательные функции продукта (MVP)" });
  for (i = 0; i < tr.mvp.length; i++) {
    paras.push({ s: 1, t: tr.mvp[i] + " — " + (prog.mvp[i] ? "выполнено" : "не выполнено") });
  }
  paras.push({ sp: 1 });
  paras.push({ h: 2, t: "5. Самооценка по рубрике жюри" });
  for (i = 0; i < D.rubric.length; i++) {
    paras.push({ s: 1, t: D.rubric[i][0] + " — " + (prog.rub[i] || 0) + " из " + D.rubric[i][1] });
  }
  paras.push({ s: 1, t: "Бонусный трек «Добавь нейросеть!» — " + bonus + " из 10" });
  paras.push({ b: 1, t: "Итог команды: " + (total + bonus) + " из 110 баллов (самооценка)" });
  paras.push({ sp: 1 });
  paras.push({ h: 2, t: "6. Подписи" });
  paras.push({ t: "Капитан команды: ______________________ / ______________ /" });
  paras.push({ t: "Учитель (руководитель): ______________________ / ______________ /" });
  paras.push({ sp: 1 });
  paras.push({ c: 1, i: 1, t: "Протокол сформирован на странице «Хакатон» сайта Плотникова В. А. · " + stampRu(now) });
  var docx = docxBuild(paras);
  var docxName = base + "_протокол_работы.docx";

  return {
    xlsx: { data: xlsx, name: xlsxName },
    docx: { data: docx, name: docxName },
    total: total + bonus,
    max: 110,
    track: tr, level: lvl,
    mvpDone: done, mvpTotal: mvpN,
    stagesDone: stagesDone, stagesTotal: D.stages.length
  };
}

/* ---- Загрузка на Диск с повторами (как в ДЗ: 423/5xx повторяются) ---- */
function hkDelay(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
function hkApi(url, opts, tries) {
  var n = tries || 3;
  function attempt(k) {
    return fetch(url, opts).then(function (r) {
      if (r.status === 423 || r.status === 500 || r.status === 502 || r.status === 503 || r.status === 504) {
        if (k < n) return hkDelay(900 * k + 600).then(function () { return attempt(k + 1); });
        throw new Error("HTTP " + r.status + ": Диск временно занят другой операцией — попробуйте отправить ещё раз через минуту");
      }
      return r;
    });
  }
  return attempt(1);
}
/* Загружает оба файла в папку «Хакатон»; cb(status, msg), status: ok|partial|notoken|error */
function hkUpload(P, cb) {
  var cfg = HK_DISK || {};
  if (!cfg.token) { cb("notoken"); return; }
  var folder = String(cfg.folder || "").replace(/^\/+/, "");
  var furl = "https://cloud-api.yandex.net/v1/disk/resources?path=" + encodeURIComponent("/" + folder);
  var fh = { Authorization: "OAuth " + cfg.token };
  hkApi(furl, { headers: fh }, 3).then(function (r) {
    if (r.status === 200) return;
    if (r.status === 404) return hkApi(furl, { method: "PUT", headers: fh }, 4).then(function (r2) {
      if (r2.status === 201 || r2.status === 409) return;
      return r2.text().then(function (t) { throw new Error("HTTP " + r2.status + " при создании папки: " + String(t).slice(0, 120)); });
    });
    return r.text().then(function (t) { throw new Error("HTTP " + r.status + " при проверке папки: " + String(t).slice(0, 120)); });
  }).then(function () {
    function put(file, k) {
      var path = "disk:/" + folder + "/" + file.name;
      return hkApi(cfg.api + "?overwrite=true&path=" + encodeURIComponent(path), { headers: fh }, 3)
        .then(function (r) {
          if (!r.ok) return r.text().then(function (t) { throw new Error("HTTP " + r.status + ": " + String(t).slice(0, 140)); });
          return r.json();
        }).then(function (j) {
          if (!j || !j.href) throw new Error("Диск не вернул ссылку загрузки");
          var body = new Blob([file.data], { type: k === 0 ?
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
          return fetch(j.href, { method: "PUT", body: body }).then(function (r2) {
            if (r2.ok) return;
            throw new Error("HTTP " + r2.status + " при загрузке файла " + file.name);
          });
        });
    }
    return put(P.xlsx, 0).then(function () { return put(P.docx, 1); });
  }).then(function () { cb("ok"); })
    .catch(function (e) { cb("error", String(e && e.message || e)); });
}

/* ---- скачивание файла (резервный путь) ---- */
function hkDownload(data, name, mime) {
  try {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: mime }));
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1500);
  } catch (e) {}
}

var API = {
  HK_DISK: HK_DISK, buildProtocol: buildProtocol, hkUpload: hkUpload,
  hkDownload: hkDownload, safeName: safeName, docxBuild: docxBuild
};
if (typeof module !== "undefined" && module.exports) { module.exports = API; }
global.HAKPROTO = API;

})(typeof window !== "undefined" ? window : this);
