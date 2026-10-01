"use strict";
(function(){
  const REPAIR="ترمیمی", REPLACEMENT="تعویضی";
  const PIECES=["17","24","26","27","28","29","40","53"];
  const TOTALS={"17":103,"24":6100,"26":4514,"27":3177,"28":3523,"29":2743,"40":2948,"53":3092};
  const n=v=>String(v??"").trim().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");
  const type=r=>n(r?.stone_type), stage=r=>n(r?.stage), status=r=>n(r?.status), piece=r=>n(r?.piece), id=r=>Number(r?.id??r?.ID);
  const inScope=r=>PIECES.includes(piece(r))&&status(r)==="تأیید شده";
  function stageNo(t,s){
    if(t===REPAIR){
      if(["طرح سنگ به واحد مرمت ارسال شد","سنگ آماده ارسال به واحد مرمت"].includes(s))return 1;
      if(["سنگ مرمتی آماده","سنگ مرمتی آماده است"].includes(s))return 2;
      if(["نصب سنگ مرمت شده","نصب مرمتی شده"].includes(s))return 3;
    }
    if(t===REPLACEMENT){
      if(["طرح سنگ به واحد تعویض ارسال شد","ارسال به واحد تعویض"].includes(s))return 1;
      if(s==="سنگ تعویضی آماده")return 2;
      if(["سنگ تعویضی نصب شد","تعویضی نصب شده"].includes(s))return 3;
    }
    return 0;
  }
  function emptyPiece(p){return {piece:p,total:TOTALS[p],requests:0,replacement:0,replacementDone:0,replacementRemaining:0,replacementStage1:0,replacementStage2:0,replacementStage3:0,repair:0,repairDone:0,repairRemaining:0,repairStage1:0,repairStage2:0,repairStage3:0};}
  function calculate(rows){
    const pieces=PIECES.map(emptyPiece),byPiece=new Map(pieces.map(p=>[p.piece,p]));
    const s={totalGraves:26200,totalRequests:0,trackedOperations:0,unclassified:0,replacement:{total:0,completed:0,remaining:0},repair:{total:0,completed:0,remaining:0},replacementStages:[0,0,0],repairStages:[0,0,0],pieces};
    for(const r of rows){if(!inScope(r))continue;const p=byPiece.get(piece(r)),t=type(r),st=stageNo(t,stage(r));s.totalRequests++;p.requests++;
      if(t===REPLACEMENT){s.replacement.total++;p.replacement++;if(st){s.replacementStages[st-1]++;p["replacementStage"+st]++;}if(st===3){s.replacement.completed++;p.replacementDone++;}}
      else if(t===REPAIR){s.repair.total++;p.repair++;if(st){s.repairStages[st-1]++;p["repairStage"+st]++;}if(st===3){s.repair.completed++;p.repairDone++;}}
    }
    s.replacement.remaining=s.replacement.total-s.replacement.completed;
    s.repair.remaining=s.repair.total-s.repair.completed;
    s.trackedOperations=s.replacement.total+s.repair.total;
    s.unclassified=s.totalRequests-s.trackedOperations;
    for(const p of pieces){p.replacementRemaining=p.replacement-p.replacementDone;p.repairRemaining=p.repair-p.repairDone;}
    return s;
  }
  const rows=new Map();
  window.addEventListener("golzar:statistics-live",event=>{
    const d=event.detail||{};
    if(d.initial){rows.clear();for(const r of d.rows||[]){const i=id(r);if(Number.isFinite(i))rows.set(i,r);}}
    else for(const c of d.changes||[]){const i=id(c?.new||c?.old);if(!Number.isFinite(i))continue;if(c.event==="DELETE")rows.delete(i);else if(c.new)rows.set(i,c.new);}
    Object.assign(STATS,calculate(Array.from(rows.values())));
  },true);
})();