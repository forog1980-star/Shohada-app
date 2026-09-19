"use strict";
(function () {
  const REPAIR = "ترمیمی";
  const REPLACEMENT = "تعویضی";
  const normalize = v => String(v ?? "").trim().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");
  const typeOf = r => normalize(r?.stone_type ?? r?.stoneType ?? r?.operation_type ?? r?.operationType);
  const stageOf = r => normalize(r?.stage ?? r?.operation_stage ?? r?.operationStage);
  const statusOf = r => normalize(r?.status);
  const isRequest = r => statusOf(r) === "تأیید شده";
  const isDone = (type, stage) => {
    const s=normalize(stage);
    if(type===REPAIR) return s==="نصب سنگ مرمت شده" || s==="نصب مرمتی شده";
    if(type===REPLACEMENT) return s==="سنگ تعویضی نصب شد" || s==="تعویضی نصب شده";
    return false;
  };
  const seenIds = new Set();
  function contribution(r, sign=1){
    if(!r || !isRequest(r)) return;
    const t=typeOf(r), done=isDone(t,stageOf(r));
    STATS.totalRequests += sign;
    if(t===REPAIR){
      STATS.repair.total += sign;
      STATS.repair.remaining += sign;
      if(done){ STATS.repair.completed += sign; STATS.repair.remaining -= sign; }
    } else if(t===REPLACEMENT){
      STATS.replacement.total += sign;
      STATS.replacement.remaining += sign;
      if(done){ STATS.replacement.completed += sign; STATS.replacement.remaining -= sign; }
    }
    STATS.trackedOperations=STATS.replacement.total+STATS.repair.total;
    STATS.unclassified=STATS.totalRequests-STATS.trackedOperations;
  }
  function applyInitial(rows){
    seenIds.clear();
    for(const r of rows||[]){
      const id=Number(r?.id ?? r?.ID);
      if(Number.isFinite(id)) seenIds.add(id);
    }
  }
  function applyChange(c){
    const oldR=c?.old||null, newR=c?.new||null;
    if(c?.event==="INSERT"){
      const id=Number(newR?.id ?? newR?.ID);
      if(Number.isFinite(id) && seenIds.has(id)) return;
      if(Number.isFinite(id)) seenIds.add(id);
      contribution(newR,1); return;
    }
    if(c?.event==="DELETE"){
      const id=Number(oldR?.id ?? oldR?.ID);
      if(Number.isFinite(id)) seenIds.delete(id);
      contribution(oldR,-1); return;
    }
    if(c?.event==="UPDATE"){
      const id=Number(newR?.id ?? oldR?.id ?? newR?.ID ?? oldR?.ID);
      if(Number.isFinite(id)) seenIds.add(id);
      contribution(oldR,-1);
      contribution(newR,1);
    }
  }
  window.addEventListener("golzar:statistics-live",(event)=>{
    const detail=event.detail||{};
    if(detail.initial) applyInitial(detail.rows||[]);
    else for(const c of detail.changes||[]) applyChange(c);
    if(typeof render==="function") render();
  });
})();