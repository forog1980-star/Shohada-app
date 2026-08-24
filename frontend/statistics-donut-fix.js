"use strict";

function donutChart(){
  const done=STATS.replacement.completed+STATS.repair.completed;
  const rem=STATS.replacement.remaining+STATS.repair.remaining;
  const total=STATS.trackedOperations;
  const cp=pct(done,total);
  const rp=100-cp;
  const doneStop=cp.toFixed(3);
  return `<div class="donut-layout">
    <div class="donut-wrap donut-css" role="img" aria-label="نمودار دوناتی وضعیت عملیات: ${fa(cp.toFixed(1))} درصد انجام شده و ${fa(rp.toFixed(1))} درصد باقی مانده">
      <div class="donut-css-chart" style="background:conic-gradient(#238b57 0 ${doneStop}%,#e3a64b ${doneStop}% 100%)" aria-hidden="true"></div>
      <div class="donut-center"><strong>${fa(cp.toFixed(1))}٪</strong><span>انجام‌شده</span></div>
    </div>
    <div class="donut-legend">
      <div class="legend-row"><span class="legend-dot done"></span><div><strong>انجام‌شده</strong><b>${fa(done)}</b><small>${fa(cp.toFixed(1))}٪</small></div></div>
      <div class="legend-row"><span class="legend-dot remain"></span><div><strong>باقی‌مانده</strong><b>${fa(rem)}</b><small>${fa(rp.toFixed(1))}٪</small></div></div>
      <p>مبنای نمودار: ${fa(total)} مورد قابل اقدام؛ شامل تعویضی و ترمیمی. ${fa(STATS.unclassified)} درخواست فعلاً در این تفکیک وارد نشده است.</p>
    </div>
  </div>`;
}

document.addEventListener("DOMContentLoaded",()=>{
  const heading=[...document.querySelectorAll("h2")].find(h=>h.textContent.trim()==="وضعیت عملیات عمرانی");
  if(!heading) return;
  const card=heading.closest("section.card");
  if(card) card.innerHTML=`<h2>وضعیت عملیات عمرانی</h2>${donutChart()}`;
});
