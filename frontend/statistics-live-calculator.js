"use strict";
(function(){
  const REPAIR="ترمیمی", REPLACEMENT="تعویضی";
  const PIECES=["17","24","26","27","28","29","40","53"];
  const TOTALS={"17":103,"24":6100,"26":4514,"27":3177,"28":3523,"29":2743,"40":2948,"53":3092};
  const n=v=>String(v??"").trim().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک");
  const type=r=>n(r?.stone_type), stage=r=>n(r?.stage), status=r=>n(r?.status), piece=r=>n(r?.piece), id=r=>Number(r?.id??r?.ID);
  const inScope=r=>PIECES.includes(piece(r))&&status(r)==="تأیید شده";
  function sn(t,s){
    if(t===REPAIR){if(["طرح سنگ به واحد مرمت ارسال شد","سنگ آماده ارسال به واحد مرمت"].includes(s))return 1;if(["سنگ مرمتی آماده","سنگ مرمتی آماده است"].includes(s))return 2;if(["نصب سنگ مرمت شده","نصب مرمتی شده"].includes(s))return 3;}
    if(t===REPLACEMENT){if(["طرح سنگ به واحد تعویض ارسال شد","ارسال به واحد تعویض"].includes(s))return 1;if(s==="سنگ تعویضی آماده")return 2;if(["سنگ تعویضی نصب شد","تعویضی نصب شده"].includes(s))return 3;}return 0;
  }
  function calc(rows){
    const ps=PIECES.map(p=>({piece:p,total:TOTALS[p],requests:0,replacement:0,replacementDone:0,replacementRemaining:0,replacementStage1:0,replacementStage2:0,replacementStage3:0,repair:0,repairDone:0,repairRemaining:0,repairStage1:0,repairStage2:0,repairStage3:0}));
    const pm=new Map(ps.map(p=>[p.piece,p]));
    const s={totalGraves:26200,totalRequests:0,trackedOperations:0,unclassified:0,replacement:{total:0,completed:0,remaining:0},repair:{total:0,completed:0,remaining:0},replacementStages:[0,0,0],repairStages:[0,0,0],pieces:ps};
    for(const r of rows){if(!inScope(r))continue;const p=pm.get(piece(r)),t=type(r),st=sn(t,stage(r));s.totalRequests++;p.requests++;
      if(t===REPLACEMENT){s.replacement.total++;p.replacement++;if(st){s.replacementStages[st-1]++;p["replacementStage"+st]++;}if(st===3){s.replacement.completed++;p.replacementDone++;}}
      else if(t===REPAIR){s.repair.total++;p.repair++;if(st){s.repairStages[st-1]++;p["repairStage"+st]++;}if(st===3){s.repair.completed++;p.repairDone++;}}
    }
    s.replacement.remaining=s.replacement.total-s.replacement.completed;s.repair.remaining=s.repair.total-s.repair.completed;s.trackedOperations=s.replacement.total+s.repair.total;s.unclassified=s.totalRequests-s.trackedOperations;
    for(const p of ps){p.replacementRemaining=p.replacement-p.replacementDone;p.repairRemaining=p.repair-p.repairDone;}
    return s;
  }
  const rows=new Map(), fa=v=>String(v).replace(/d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d]);
  function patchTable(){const t=document.querySelector("table.piece-table.full-table");if(!t)return;t.innerHTML=`<thead><tr><th rowspan="2">قطعه</th><th rowspan="2">کل مزار</th><th rowspan="2">درخواست</th><th rowspan="2">بدون نوع</th><th colspan="5">تعویضی</th><th colspan="5">ترمیمی</th></tr><tr><th>کل</th><th>مرحله ۱</th><th>مرحله ۲</th><th>مرحله ۳</th><th>باقی‌مانده</th><th>کل</th><th>مرحله ۱</th><th>مرحله ۲</th><th>مرحله ۳</th><th>باقی‌مانده</th></tr></thead><tbody>${STATS.pieces.map(p=>`<tr><td><strong>${fa(p.piece)}</strong></td><td>${fa(p.total)}</td><td>${fa(p.requests)}</td><td>${fa(p.requests-p.replacement-p.repair)}</td><td>${fa(p.replacement)}</td><td>${fa(p.replacementStage1)}</td><td>${fa(p.replacementStage2)}</td><td>${fa(p.replacementStage3)}</td><td>${fa(p.replacementRemaining)}</td><td>${fa(p.repair)}</td><td>${fa(p.repairStage1)}</td><td>${fa(p.repairStage2)}</td><td>${fa(p.repairStage3)}</td><td>${fa(p.repairRemaining)}</td></tr>`).join("")}</tbody><tfoot><tr><td><strong>جمع</strong></td><td><strong>${fa(STATS.totalGraves)}</strong></td><td><strong>${fa(STATS.totalRequests)}</strong></td><td><strong>${fa(STATS.unclassified)}</strong></td><td><strong>${fa(STATS.replacement.total)}</strong></td><td><strong>${fa(STATS.replacementStages[0])}</strong></td><td><strong>${fa(STATS.replacementStages[1])}</strong></td><td><strong>${fa(STATS.replacementStages[2])}</strong></td><td><strong>${fa(STATS.replacement.remaining)}</strong></td><td><strong>${fa(STATS.repair.total)}</strong></td><td><strong>${fa(STATS.repairStages[0])}</strong></td><td><strong>${fa(STATS.repairStages[1])}</strong></td><td><strong>${fa(STATS.repairStages[2])}</strong></td><td><strong>${fa(STATS.repair.remaining)}</strong></td></tr></tfoot>`);}
  function patchStages(){const defs=[["مراحل تعویضی",["طرح سنگ به واحد تعویض ارسال شد","سنگ تعویضی آماده","سنگ تعویضی نصب شد"],STATS.replacementStages,STATS.replacement],["مراحل ترمیمی",["طرح سنگ به واحد مرمت ارسال شد","سنگ مرمتی آماده","نصب سنگ مرمت شده"],STATS.repairStages,STATS.repair]];for(const [title,names,vals,sum] of defs){const h=[...document.querySelectorAll("h2")].find(x=>x.textContent.trim()===title),tb=h?.closest("section.card")?.querySelector(".mini-table tbody");if(!tb)continue;const unstaged=sum.total-vals.reduce((a,b)=>a+b,0);tb.innerHTML=names.map((x,i)=>`<tr><td>${x}</td><td>${fa(vals[i])}</td></tr>`).join("")+`<tr><td>بدون مرحله ثبت‌شده</td><td>${fa(unstaged)}</td></tr>`;}}
  function patch(){patchTable();patchStages();const m=document.querySelector(".meta");if(m)m.innerHTML=`منبع آماری: <strong>داده زنده جدول martyrs</strong> · ۸ قطعه مصوب · <span class="badge">آمار زنده</span>`;}
  function rebuild(detail){if(detail.initial){rows.clear();for(const r of detail.rows||[]){const i=id(r);if(Number.isFinite(i))rows.set(i,r);}}else for(const c of detail.changes||[]){const i=id(c?.new||c?.old);if(!Number.isFinite(i))continue;if(c.event==="DELETE")rows.delete(i);else if(c.new)rows.set(i,c.new);}Object.assign(STATS,calc([...rows.values()]));}
  window.addEventListener("golzar:statistics-live",e=>{rebuild(e.detail||{});if(typeof render==="function")render();patch();},true);
})();