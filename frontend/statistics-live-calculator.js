"use strict";
(function(){
  const REPAIR="ترمیمی", REPLACEMENT="تعویضی";
  const REPAIR_STAGES=["ارسال به واحد مرمت","سنگ مرمتی آماده","نصب مرمتی شده"];
  const REPLACEMENT_STAGES=["ارسال به واحد تعویض","سنگ تعویضی آماده","تعویضی نصب شده"];
  const APPROVED="تأیید شده";
  // 12507 is the last record belonging to the agreed master-data baseline.
  // Records after it are live additions; the approved statistical totals remain untouched.
  const BASELINE_MAX_ID=12507;

  function norm(v){return String(v??"").trim().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");}
  function typeOf(r){return norm(r?.stone_type??r?.stoneType??r?.operation_type??r?.operationType);}
  function stageOf(r){return norm(r?.stage??r?.operation_stage??r?.operationStage);}
  function pieceOf(r){return norm(r?.piece??r?.قطعه??r?.piece_number??r?.pieceNumber);}
  function statusOf(r){return norm(r?.status);}
  function isRequest(r){return statusOf(r)===APPROVED;}
  function isLiveAddition(r){const id=Number(r?.id??r?.ID);return Number.isFinite(id)&&id>BASELINE_MAX_ID;}

  function contribution(r,sign){
    if(!r||!isRequest(r)) return;
    const signN=sign||1, piece=STATS.pieces.find(p=>String(p.piece)===pieceOf(r));
    STATS.totalRequests+=signN;
    const t=typeOf(r),s=stageOf(r);
    if(t===REPAIR){
      STATS.repair.total+=signN;
      STATS.repair.remaining+=signN;
      if(s===REPAIR_STAGES[2]){STATS.repair.completed+=signN;STATS.repair.remaining-=signN;}
      if(piece){piece.requests+=signN;piece.repair+=signN;if(s===REPAIR_STAGES[2])piece.repairDone+=signN;piece.repairRemaining=piece.repair-piece.repairDone;}
      STATS.liveRepairStages=STATS.liveRepairStages||[0,0,0];
      const i=REPAIR_STAGES.indexOf(s);if(i>=0)STATS.liveRepairStages[i]+=signN;
    }else if(t===REPLACEMENT){
      STATS.replacement.total+=signN;
      STATS.replacement.remaining+=signN;
      if(s===REPLACEMENT_STAGES[2]){STATS.replacement.completed+=signN;STATS.replacement.remaining-=signN;}
      if(piece){piece.requests+=signN;piece.replacement+=signN;if(s===REPLACEMENT_STAGES[2])piece.replacementDone+=signN;piece.replacementRemaining=piece.replacement-piece.replacementDone;}
      STATS.liveReplacementStages=STATS.liveReplacementStages||[0,0,0];
      const i=REPLACEMENT_STAGES.indexOf(s);if(i>=0)STATS.liveReplacementStages[i]+=signN;
    }else if(piece){
      piece.requests+=signN;
    }
    STATS.trackedOperations=STATS.replacement.total+STATS.repair.total;
    STATS.unclassified=STATS.totalRequests-STATS.trackedOperations;
  }

  function applyInitial(rows){
    STATS.liveRepairStages=[0,0,0];
    STATS.liveReplacementStages=[0,0,0];
    for(const r of rows||[]){if(isLiveAddition(r)) contribution(r,1);}
  }

  window.addEventListener("golzar:statistics-live",event=>{
    const detail=event.detail||{};
    if(detail.initial) applyInitial(detail.rows||[]);
    else for(const c of detail.changes||[]){
      if(c.event==="INSERT") contribution(c.new,1);
      else if(c.event==="DELETE") contribution(c.old,-1);
      else if(c.event==="UPDATE"){contribution(c.old,-1);contribution(c.new,1);}
    }
    if(typeof render==="function")render();
  });
})();
