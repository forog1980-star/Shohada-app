"use strict";
(function(){
  const REPAIR="ترمیمی", REPLACEMENT="تعویضی";
  const REPAIR_STAGES=["سنگ آماده ارسال به واحد مرمت","سنگ مرمتی آماده","نصب سنگ مرمت شده"];
  const REPLACEMENT_STAGES=["سنگ آماده ارسال به واحد تعویض","سنگ تعویضی آماده","سنگ تعویضی نصب شده"];
  const APPROVED="تأیید شده";
  const BASELINE_MAX_ID=12507;
  const seenLiveIds=new Set();
  function norm(v){return String(v??"").trim().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");}
  function typeOf(r){return norm(r?.stone_type??r?.stoneType??r?.operation_type??r?.operationType);}
  function stageOf(r){return norm(r?.stage??r?.operation_stage??r?.operationStage);}
  function pieceOf(r){return norm(r?.piece??r?.قطعه??r?.piece_number??r?.pieceNumber);}
  function statusOf(r){return norm(r?.status);}
  function isRequest(r){return statusOf(r)===APPROVED;}
  function idOf(r){return Number(r?.id??r?.ID);}
  function isLiveAddition(r){const id=idOf(r);return Number.isFinite(id)&&id>BASELINE_MAX_ID;}
  function contribution(r,sign){
    if(!r||!isRequest(r)) return;
    const signN=sign||1,piece=STATS.pieces.find(p=>String(p.piece)===pieceOf(r)),t=typeOf(r),s=stageOf(r);
    STATS.totalRequests+=signN;
    if(t===REPAIR){
      STATS.repair.total+=signN;STATS.repair.remaining+=signN;
      if(s===REPAIR_STAGES[2]){STATS.repair.completed+=signN;STATS.repair.remaining-=signN;}
      if(piece){piece.requests+=signN;piece.repair+=signN;if(s===REPAIR_STAGES[2])piece.repairDone+=signN;piece.repairRemaining=piece.repair-piece.repairDone;}
      const i=REPAIR_STAGES.indexOf(s);if(i>=0)STATS.repairStages[i]+=signN;
    }else if(t===REPLACEMENT){
      STATS.replacement.total+=signN;STATS.replacement.remaining+=signN;
      if(s===REPLACEMENT_STAGES[2]){STATS.replacement.completed+=signN;STATS.replacement.remaining-=signN;}
      if(piece){piece.requests+=signN;piece.replacement+=signN;if(s===REPLACEMENT_STAGES[2])piece.replacementDone+=signN;piece.replacementRemaining=piece.replacement-piece.replacementDone;}
      const i=REPLACEMENT_STAGES.indexOf(s);if(i>=0)STATS.replacementStages[i]+=signN;
    }else if(piece){piece.requests+=signN;}
    STATS.trackedOperations=STATS.replacement.total+STATS.repair.total;
    STATS.unclassified=STATS.totalRequests-STATS.trackedOperations;
  }
  function applyInitial(rows){for(const r of rows||[]){if(!isLiveAddition(r))continue;const id=idOf(r);if(seenLiveIds.has(id))continue;seenLiveIds.add(id);contribution(r,1);}}
  function applyChange(c){
    const oldR=c?.old||null,newR=c?.new||null;
    if(c?.event==="INSERT"){const id=idOf(newR);if(seenLiveIds.has(id))return;if(isLiveAddition(newR)){seenLiveIds.add(id);contribution(newR,1);}return;}
    if(c?.event==="DELETE"){const id=idOf(oldR);if(isLiveAddition(oldR)){seenLiveIds.delete(id);contribution(oldR,-1);}return;}
    if(c?.event==="UPDATE"){if(isLiveAddition(oldR))contribution(oldR,-1);if(isLiveAddition(newR))contribution(newR,1);if(isLiveAddition(newR))seenLiveIds.add(idOf(newR));}
  }
  window.addEventListener("golzar:statistics-live",event=>{const detail=event.detail||{};if(detail.initial)applyInitial(detail.rows||[]);else for(const c of detail.changes||[])applyChange(c);if(typeof render==="function")render();});
})();