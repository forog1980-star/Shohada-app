"use strict";
(function(){
  const fa=v=>String(v).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[+d]);
  const REPL=["طرح سنگ به واحد تعویض ارسال شد","سنگ تعویضی آماده","سنگ تعویضی نصب شد"];
  const REPAIR=["طرح سنگ به واحد مرمت ارسال شد","سنگ مرمتی آماده","نصب سنگ مرمت شده"];
  function pieceTable(){
    const t=document.querySelector("table.piece-table.full-table");if(!t)return;
    t.innerHTML=`<thead><tr><th rowspan="2">قطعه</th><th rowspan="2">کل مزار</th><th rowspan="2">درخواست</th><th rowspan="2">بدون نوع</th><th colspan="5">تعویضی</th><th colspan="5">ترمیمی</th></tr><tr><th>کل</th><th>مرحله ۱</th><th>مرحله ۲</th><th>مرحله ۳</th><th>باقی‌مانده</th><th>کل</th><th>مرحله ۱</th><th>مرحله ۲</th><th>مرحله ۳</th><th>باقی‌مانده</th></tr></thead><tbody>${STATS.pieces.map(p=>`<tr><td><strong>${fa(p.piece)}</strong></td><td>${fa(p.total)}</td><td>${fa(p.requests)}</td><td>${fa(p.requests-p.replacement-p.repair)}</td><td>${fa(p.replacement)}</td><td>${fa(p.replacementStage1)}</td><td>${fa(p.replacementStage2)}</td><td>${fa(p.replacementStage3)}</td><td>${fa(p.replacementRemaining)}</td><td>${fa(p.repair)}</td><td>${fa(p.repairStage1)}</td><td>${fa(p.repairStage2)}</td><td>${fa(p.repairStage3)}</td><td>${fa(p.repairRemaining)}</td></tr>`).join("")}</tbody><tfoot><tr><td><strong>جمع</strong></td><td><strong>${fa(STATS.totalGraves)}</strong></td><td><strong>${fa(STATS.totalRequests)}</strong></td><td><strong>${fa(STATS.unclassified)}</strong></td><td><strong>${fa(STATS.replacement.total)}</strong></td><td><strong>${fa(STATS.replacementStages[0])}</strong></td><td><strong>${fa(STATS.replacementStages[1])}</strong></td><td><strong>${fa(STATS.replacementStages[2])}</strong></td><td><strong>${fa(STATS.replacement.remaining)}</strong></td><td><strong>${fa(STATS.repair.total)}</strong></td><td><strong>${fa(STATS.repairStages[0])}</strong></td><td><strong>${fa(STATS.repairStages[1])}</strong></td><td><strong>${fa(STATS.repairStages[2])}</strong></td><td><strong>${fa(STATS.repair.remaining)}</strong></td></tr></tfoot>`;
  }
  function stageCards(){
    const defs=[["مراحل تعویضی",REPL,STATS.replacementStages,STATS.replacement],["مراحل ترمیمی",REPAIR,STATS.repairStages,STATS.repair]];
    for(const [title,names,vals,sum] of defs){
      const h=[...document.querySelectorAll("h2")].find(x=>x.textContent.trim()===title),tb=h?.closest("section.card")?.querySelector(".mini-table tbody");if(!tb)continue;
      const unstaged=sum.total-vals.reduce((a,b)=>a+b,0);
      tb.innerHTML=names.map((name,i)=>`<tr><td>${name}</td><td>${fa(vals[i])}</td></tr>`).join("")+`<tr><td>بدون مرحله ثبت‌شده</td><td>${fa(unstaged)}</td></tr>`;
    }
  }
  function patch(){if(typeof STATS==="undefined")return;pieceTable();stageCards();const m=document.querySelector(".meta");if(m)m.innerHTML=`منبع آماری: <strong>داده زنده جدول martyrs</strong> · ۸ قطعه مصوب · <span class="badge">آمار زنده</span>`;}
  window.addEventListener("golzar:statistics-live",patch);
})();