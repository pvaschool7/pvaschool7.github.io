/* =====================================================================
   xlsx-lite.js · минимальный генератор XLSX без библиотек (ES5)
   Подключается к lessons/trenazher.html обычным <script src>.
   Работает и под file://, и в Node (для автотестов).
   XLSX — это ZIP с XML внутри; архив пишем методом STORE (без сжатия),
   этого достаточно, а зависимости не нужны.
   API: XLSXLITE.build(sheetName, rows, widths) → Uint8Array (xlsx-файл)
        rows — массив строк; ячейка — число или строка;
        widths — массив ширин колонок (символы), можно не задавать.
        Заголовки жирним: XLSXLITE.build(..., widths, boldRows).
   ===================================================================== */
(function(global){
"use strict";

/* ---- CRC32 (полином 0xEDB88320) ---- */
var CRC_T=(function(){
 var t=new Array(256),n,k,c;
 for(n=0;n<256;n++){
  c=n;
  for(k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
  t[n]=c>>>0;
 }
 return t;
})();
function crc32(u8){
 var c=0xFFFFFFFF,i;
 for(i=0;i<u8.length;i++)c=CRC_T[(c^u8[i])&0xFF]^(c>>>8);
 return (c^0xFFFFFFFF)>>>0;
}

/* ---- Строка → UTF-8 байты (без TextEncoder, работает везде) ---- */
function utf8(s){
 var out=[],i,c;
 for(i=0;i<s.length;i++){
  c=s.charCodeAt(i);
  if(c<0x80)out.push(c);
  else if(c<0x800){out.push(0xC0|(c>>6),0x80|(c&63));}
  else if(c>=0xD800&&c<=0xDBFF&&i+1<s.length){
   var c2=s.charCodeAt(++i);
   var cp=0x10000+((c-0xD800)<<10)+(c2-0xDC00);
   out.push(0xF0|(cp>>18),0x80|((cp>>12)&63),0x80|((cp>>6)&63),0x80|(cp&63));
  }
  else{out.push(0xE0|(c>>12),0x80|((c>>6)&63),0x80|(c&63));}
 }
 return new Uint8Array(out);
}

/* ---- ZIP (STORE) ---- */
function dosDT(d){
 var t=(d.getHours()<<11)|(d.getMinutes()<<5)|(Math.floor(d.getSeconds()/2));
 var day=((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate();
 return {t:t,d:day};
}
function w16(a,v){a.push(v&255,(v>>8)&255);}
function w32(a,v){a.push(v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255);}
function zipSync(files,when){
 var dt=dosDT(when||new Date()),parts=[],central=[],offset=0,i;
 for(i=0;i<files.length;i++){
  var name=files[i].name,data=files[i].data,nb=utf8(name),crc=crc32(data);
  var lh=[0x50,0x4B,0x03,0x04];w16(lh,20);w16(lh,0x0800);w16(lh,0);w16(lh,dt.t);w16(lh,dt.d);
  w32(lh,crc);w32(lh,data.length);w32(lh,data.length);w16(lh,nb.length);w16(lh,0);
  var lhb=new Uint8Array(lh),out=new Uint8Array(lhb.length+nb.length+data.length);
  out.set(lhb,0);out.set(nb,lhb.length);out.set(data,lhb.length+nb.length);
  parts.push(out);
  var ch=[0x50,0x4B,0x01,0x02];w16(ch,20);w16(ch,20);w16(ch,0x0800);w16(ch,0);w16(ch,dt.t);w16(ch,dt.d);
  w32(ch,crc);w32(ch,data.length);w32(ch,data.length);w16(ch,nb.length);w16(ch,0);w16(ch,0);
  w16(ch,0);w16(ch,0);w32(ch,0);w32(ch,offset);
  central.push({h:new Uint8Array(ch),n:nb});
  offset+=out.length;
 }
 var cdSize=0,cdParts=[];
 for(i=0;i<central.length;i++){
  var c=new Uint8Array(central[i].h.length+central[i].n.length);
  c.set(central[i].h,0);c.set(central[i].n,central[i].h.length);
  cdParts.push(c);cdSize+=c.length;
 }
 var eocd=[0x50,0x4B,0x05,0x06];w16(eocd,0);w16(eocd,0);w16(eocd,files.length);w16(eocd,files.length);
 w32(eocd,cdSize);w32(eocd,offset);w16(eocd,0);
 var total=offset+cdSize+eocd.length,res=new Uint8Array(total),pos=0;
 for(i=0;i<parts.length;i++){res.set(parts[i],pos);pos+=parts[i].length;}
 for(i=0;i<cdParts.length;i++){res.set(cdParts[i],pos);pos+=cdParts[i].length;}
 res.set(new Uint8Array(eocd),pos);
 return res;
}

/* ---- XML ---- */
function esc(s){
 return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,"");
}
function colName(n){ /* 0 → A */
 var s="";
 while(n>=0){s=String.fromCharCode(65+(n%26))+s;n=Math.floor(n/26)-1;}
 return s;
}

/* ---- Сборка xlsx ---- */
function build(sheetName,rows,widths,boldRows){
 var bold={};
 if(boldRows){for(var b=0;b<boldRows.length;b++)bold[boldRows[b]]=1;}
 var C='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
 var R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
 '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
 '<Default Extension="xml" ContentType="application/xml"/>'+
 '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
 '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'+
 '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
 '</Types>';
 var rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
 '<Relationship Id="rId1" Type="'+R+'/officeDocument" Target="xl/workbook.xml"/>'+
 '</Relationships>';
 var wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<workbook xmlns="'+C+'" xmlns:r="'+R+'"><sheets><sheet name="'+esc(sheetName)+'" sheetId="1" r:id="rId1"/></sheets></workbook>';
 var wbr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
 '<Relationship Id="rId1" Type="'+R+'/worksheet" Target="worksheets/sheet1.xml"/>'+
 '<Relationship Id="rId2" Type="'+R+'/styles" Target="styles.xml"/>'+
 '</Relationships>';
 var st='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<styleSheet xmlns="'+C+'"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'+
 '<font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'+
 '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'+
 '<borders count="1"><border/></borders><cellStyleXfs count="1">'+
 '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
 '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>'+
 '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/></cellXfs></styleSheet>';
 var cols="";
 if(widths&&widths.length){
  cols="<cols>";
  for(var w=0;w<widths.length;w++)cols+='<col min="'+(w+1)+'" max="'+(w+1)+'" width="'+widths[w]+'" customWidth="1"/>';
  cols+="</cols>";
 }
 var sd="",r,c;
 for(r=0;r<rows.length;r++){
  sd+='<row r="'+(r+1)+'">';
  var row=rows[r]||[];
  for(c=0;c<row.length;c++){
   var v=row[c],ref=colName(c)+(r+1),s=(bold[r]?' s="1"':'');
   if(v===null||v===undefined||v===""){sd+='<c r="'+ref+'"'+s+'/>';continue;}
   if(typeof v==="number"&&isFinite(v)){
    sd+='<c r="'+ref+'"'+s+'><v>'+v+'</v></c>';
   }else{
    sd+='<c r="'+ref+'" t="inlineStr"'+s+'><is><t xml:space="preserve">'+esc(v)+'</t></is></c>';
   }
  }
  sd+="</row>";
 }
 var sh='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<worksheet xmlns="'+C+'">'+cols+'<sheetData>'+sd+'</sheetData></worksheet>';
 return zipSync([
  {name:"[Content_Types].xml",data:utf8(ct)},
  {name:"_rels/.rels",data:utf8(rels)},
  {name:"xl/workbook.xml",data:utf8(wb)},
  {name:"xl/_rels/workbook.xml.rels",data:utf8(wbr)},
  {name:"xl/styles.xml",data:utf8(st)},
  {name:"xl/worksheets/sheet1.xml",data:utf8(sh)}
 ]);
}

var API={build:build,crc32:crc32,utf8:utf8,zipSync:zipSync};
if(typeof module!=="undefined"&&module.exports){module.exports=API;}
global.XLSXLITE=API;

})(typeof window!=="undefined"?window:this);
