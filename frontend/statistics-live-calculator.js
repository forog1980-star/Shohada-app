"use strict";
(function(){
  const REPAIR="ترمیمی", REPLACEMENT="تعویضی";
  const REPAIR_STAGES=["ارسال به واحد مرمت","سنگ مرمتی آماده","نصب مرمتی شده"];
  const REPLACEMENT_STAGES=["ارسال به واحد تعویض","سنگ تعویضی آماده","تعویضی نصب شده"];
  const APPROVED="تأیید شده";

  function norm(v){return String(v??"").trim().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");}
  function typeOf(r){return norm(r?.stone_type??r?.stoneType??r?.operation_type??r?.operationType);}
  function stageOf(r){return norm(r?.stage??r?.operation_stage??r?.operationStage);}
  function pieceOf(r){return norm(r?.piece??r?.قطعه??r?.piece_number??r?.pieceNumber);}
  function statusOf(r){return norm(r?.status);}
  function isRequest(r){return statusOf(r)===APPROVED;}

  function rebuild(rows){
    const basePieces=STATS.pieces.map(p=>({piece:String(p.piece),total:p.total,requests:0,replacement:0,replacementDone:0,replacementRemaining:0,repair:0,repairDone:0,repairRemaining:0}));
    const pieceMap=new Map(basePieces.map(p=>[p.piece,p]));
    let totalRequests=0, replacementTotal=0, replacementDone=0, repairTotal=0, repairDone=0;

    const repairStages=[0,0,0], replacementStages=[0,0,0];
    for(const r of rows||[]){
      if(!isRequest(r)) continue;
      totalRequests++;
      const t=typeOf(r), s=stageOf(r), p=pieceMap.get(pieceOf(r));
      if(t===REPAIR){
        repairTotal++;
        const i=REPAIR_STAGES.indexOf(s); if(i>=0)repairStages[i]++;
        if(s===REPAIR_STAGES[2])repairDone++;
        if(p){p.requests++;p.repair++;if(s===REPAIR_STAGES[2])p.repairDone++;}
      }else if(t===REPLACEMENT){
        replacementTotal++;
        const i=REPLACEMENT_STAGES.indexOf(s); if(i>=0)replacementStages[i]++;
        if(s===REPLACEMENT_STAGES[2])replacementDone++;
        if(p){p.requests++;p.replacement++;if(s===REPLACEMENT_STAGES[2])p.replacementDone++;}
      }else if(p){p.requests++;}
    }

    STATS.totalRequests=totalRequests;
    STATS.replacement.total=replacementTotal;
    STATS.replacement.completed=replacementDone;
    STATS.replacement.remaining=replacementTotal-replacementDone;
    STATS.repair.total=repairTotal;
    STATS.repair.completed=repairDone;
    STATS.repair.remaining=repairTotal-repairDone;
    STATS.trackedOperations=replacementTotal+repairTotal;
    STATS.unclassified=totalRequests-STATS.trackedOperations;
    STATS.pieces=basePieces.map(p=>{
      p.replacementRemaining=p.replacement-p.replacementDone;
      p.repairRemaining=p.repair-p.repairDone;
      return p;
    });
    STATS.liveRepairStages=repairStages;
    STATS.liveReplacementStages=replacementStages;
  }

  window.addEventListener("golzar:statistics-live",event=>{
    rebuild(event.detail?.rows||[]);
    if(typeof render==="function")render();
  });
})();
