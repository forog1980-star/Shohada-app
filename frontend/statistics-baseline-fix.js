"use strict";
// وضعیت فعلی مورد تأیید: ترمیمی = ۰ ارسال، ۱ سنگ آماده، ۶۱۹ نصب شده.
(function(){
  function normalize(){
    if(typeof STATS === "undefined") return;
    STATS.repairStages[0]=0;
    STATS.repairStages[1]=1;
    STATS.repairStages[2]=619;
    STATS.repair.total=1172;
    STATS.repair.completed=619;
    STATS.repair.remaining=553;
    STATS.trackedOperations=STATS.replacement.total+STATS.repair.total;
    STATS.unclassified=STATS.totalRequests-STATS.trackedOperations;
  }
  normalize();
  window.addEventListener("golzar:statistics-live", normalize);
})();