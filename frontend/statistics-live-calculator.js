"use strict";
(function(){
 const REPAIR="ترمیمی", REPLACEMENT="تعویضی";
 const REPAIR_DONE="نصب مرمتی شده", REPLACEMENT_DONE="تعویضی نصب شده";
 const PIECES=["17","24","26","27","28","29","40","53"];

 function norm(v){return String(v??"").trim().replace(/ي/g,"ی").replace(/ك/g,"ک");}
 function stoneType(row){return norm(row?.stone_type ?? row?.stoneType ?? row?.operation_type ?? row?.operationType);}
 function stage(row){return norm(row?.stage ?? row?.operation_stage ?? row?.operationStage);}
 function piece(row){return norm(row?.piece ?? row?.قطعه ?? row?.piece_number ?? row?.pieceNumber);}
 function contribution(row){
  const type=stoneType(row);
  if(type!==REPAIR && type!==REPLACEMENT) return null;
  const p=piece(row);
  const done=stage(row)===(type===REPAIR?REPAIR_DONE:REPLACEMENT_DONE);
  return {type,p,done};
 }
 function applyOne(row,sign){
  const c=contribution(row); if(!c)return;
  STATS.totalRequests += sign;
  if(c.type===REPAIR){
   STATS.repair.total += sign;
   if(c.done) STATS.repair.completed += sign;
  }else{
   STATS.replacement.total += sign;
   if(c.done) STATS.replacement.completed += sign;
  }
  if(c.p){
   const p=STATS.pieces.find(x=>String(x.piece)===c.p);
   if(p){
    p.requests += sign;
    if(c.type===REPAIR){
     p.repair += sign;
     if(c.done)p.repairDone += sign;
    }else{
     p.replacement += sign;
     if(c.done)p.replacementDone += sign;
    }
   }
  }
 }
 function recalc(){
  STATS.replacement.remaining=STATS.replacement.total-STATS.replacement.completed;
  STATS.repair.remaining=STATS.repair.total-STATS.repair.completed;
  STATS.trackedOperations=STATS.replacement.total+STATS.repair.total;
  STATS.unclassified=STATS.totalRequests-STATS.trackedOperations;
  STATS.pieces.forEach(p=>{
   p.replacementRemaining=p.replacement-p.replacementDone;
   p.repairRemaining=p.repair-p.repairDone;
  });
 }

 window.addEventListener("golzar:statistics-live",event=>{
  const changes=event.detail?.changes||[];
  if(!changes.length)return;
  changes.forEach(change=>{
   if(change.event==="DELETE") applyOne(change.old,-1);
   else if(change.event==="INSERT") applyOne(change.new,1);
   else if(change.event==="UPDATE"){
    applyOne(change.old,-1);
    applyOne(change.new,1);
   }
  });
  recalc();
  if(typeof render==="function") render();
 });
})();
