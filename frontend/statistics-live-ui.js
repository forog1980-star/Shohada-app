"use strict";
(function(){
  window.addEventListener("golzar:statistics-live",()=>{
    const repair=STATS.liveRepairStages||[0,0,0];
    const replacement=STATS.liveReplacementStages||[0,0,0];
    const tables=document.querySelectorAll('.mini-table table');
    if(tables[0]) tables[0].querySelectorAll('tbody tr').forEach((tr,i)=>{const td=tr.querySelectorAll('td')[1];if(td)td.textContent=typeof fa==='function'?fa(repair[i]||0):String(repair[i]||0);});
    if(tables[1]) tables[1].querySelectorAll('tbody tr').forEach((tr,i)=>{const td=tr.querySelectorAll('td')[1];if(td)td.textContent=typeof fa==='function'?fa(replacement[i]||0):String(replacement[i]||0);});
  });
})();
