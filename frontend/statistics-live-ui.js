"use strict";
(function(){
  let baselineRepair=null, baselineReplacement=null;
  function readCurrent(){
    const tables=document.querySelectorAll('.mini-table table');
    const read=table=>table?[...table.querySelectorAll('tbody tr')].map(tr=>Number(String(tr.querySelectorAll('td')[1]?.textContent||'0').replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)))||0):[0,0,0];
    if(baselineRepair===null) baselineRepair=read(tables[0]);
    if(baselineReplacement===null) baselineReplacement=read(tables[1]);
    return tables;
  }
  window.addEventListener("golzar:statistics-live",event=>{
    const detail=event.detail||{};
    const tables=readCurrent();
    if(detail.initial) return;
    const repairDelta=STATS.liveRepairStages||[0,0,0];
    const replacementDelta=STATS.liveReplacementStages||[0,0,0];
    if(tables[0]) tables[0].querySelectorAll('tbody tr').forEach((tr,i)=>{const td=tr.querySelectorAll('td')[1];if(td)td.textContent=typeof fa==='function'?fa((baselineRepair[i]||0)+(repairDelta[i]||0)):String((baselineRepair[i]||0)+(repairDelta[i]||0));});
    if(tables[1]) tables[1].querySelectorAll('tbody tr').forEach((tr,i)=>{const td=tr.querySelectorAll('td')[1];if(td)td.textContent=typeof fa==='function'?fa((baselineReplacement[i]||0)+(replacementDelta[i]||0)):String((baselineReplacement[i]||0)+(replacementDelta[i]||0));});
  });
})();
