"use strict";

const STATS = {
  totalGraves: 26200,
  totalRequests: 2975,
  trackedOperations: 2897,
  unclassified: 78,
  replacement: { total: 1735, completed: 1386, remaining: 349 },
  repair: { total: 1162, completed: 610, remaining: 552 },
  pieces: [
    { piece:"17", total:103, requests:1, replacement:0, replacementDone:0, replacementRemaining:0, repair:1, repairDone:1, repairRemaining:0 },
    { piece:"24", total:6100, requests:597, replacement:281, replacementDone:166, replacementRemaining:115, repair:316, repairDone:120, repairRemaining:196 },
    { piece:"26", total:4514, requests:365, replacement:170, replacementDone:158, replacementRemaining:12, repair:143, repairDone:132, repairRemaining:11 },
    { piece:"27", total:3177, requests:323, replacement:280, replacementDone:235, replacementRemaining:45, repair:43, repairDone:1, repairRemaining:42 },
    { piece:"28", total:3523, requests:513, replacement:286, replacementDone:230, replacementRemaining:56, repair:203, repairDone:135, repairRemaining:68 },
    { piece:"29", total:2743, requests:415, replacement:226, replacementDone:174, replacementRemaining:52, repair:188, repairDone:184, repairRemaining:4 },
    { piece:"40", total:2948, requests:208, replacement:133, replacementDone:81, replacementRemaining:52, repair:75, repairDone:30, repairRemaining:45 },
    { piece:"53", total:3092, requests:553, replacement:359, replacementDone:342, replacementRemaining:17, repair:193, repairDone:7, repairRemaining:186 }
  ]
};

const REPAIR_STAGES = ["ارسال به واحد مرمت", "سنگ مرمتی آماده", "نصب مرمتی شده"];
const REPLACEMENT_STAGES = ["ارسال به واحد تعویض", "سنگ تعویضی آماده", "تعویضی نصب شده"];

function fa(value){return String(value).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[Number(d)]);}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function pct(value,total){return total?(value/total)*100:0;}

function barChart(){
  const max=Math.max(...STATS.pieces.map(p=>p.requests));
  return `<div class="chart-explanation"><div class="chart-definition"><strong>راهنمای نمودار</strong><span>عدد بالای هر ستون = کل درخواست‌های آن قطعه · بخش رنگی داخل ستون = تعداد درخواست‌های انجام‌شده</span></div></div>
  <div class="bar-chart" aria-label="نمودار درخواست‌های کار عمرانی به تفکیک قطعه">
  ${STATS.pieces.map(p=>{
    const height=(p.requests/max)*100;
    const completed=p.replacementDone+p.repairDone;
    const doneRatio=p.requests?(completed/p.requests)*100:0;
    return `<div class="bar-item piece-${p.piece}">
      <strong class="bar-total">${fa(p.requests)}</strong>
      <div class="bar-column" title="کل درخواست: ${p.requests} | انجام‌شده: ${completed}">
        <div class="bar-column-fill" style="height:${height.toFixed(2)}%">
          <span class="bar-completed" style="height:${Math.max(doneRatio,completed?8:0).toFixed(2)}%">${fa(completed)}</span>
        </div>
      </div>
      <span>قطعه ${fa(p.piece)}</span>
    </div>`;
  }).join("")}</div>`;
}

function donutChart(){
  const completed=STATS.replacement.completed+STATS.repair.completed;
  const remaining=STATS.replacement.remaining+STATS.repair.remaining;
  const total=STATS.trackedOperations;
  const completedPct=pct(completed,total);
  const radius=72,circumference=2*Math.PI*radius,completedLength=circumference*completedPct/100;
  return `<div class="donut-layout"><div class="donut-wrap" aria-label="نمودار دوناتی وضعیت عملیات"><svg viewBox="0 0 200 200" class="donut" role="img"><circle class="donut-track" cx="100" cy="100" r="${radius}"></circle><circle class="donut-progress" cx="100" cy="100" r="${radius}" stroke-dasharray="${completedLength.toFixed(2)} ${circumference.toFixed(2)}"></circle></svg><div class="donut-center"><strong>${fa(completedPct.toFixed(1))}٪</strong><span>انجام‌شده</span></div></div><div class="donut-legend"><div class="legend-row"><span class="legend-dot done"></span><div><strong>انجام‌شده</strong><b>${fa(completed)}</b><small>${fa(completedPct.toFixed(1))}٪</small></div></div><div class="legend-row"><span class="legend-dot remain"></span><div><strong>باقی‌مانده</strong><b>${fa(remaining)}</b><small>${fa((100-completedPct).toFixed(1))}٪</small></div></div><p>مبنای نمودار: ${fa(total)} مورد قابل اقدام؛ شامل تعویضی و ترمیمی. ${fa(STATS.unclassified)} درخواست فعلاً در این تفکیک وارد نشده است.</p></div></div>`;
}

function fullTable(){return STATS.pieces.map(p=>`<tr><td><strong>${fa(p.piece)}</strong></td><td>${fa(p.total)}</td><td>${fa(p.requests)}</td><td>${fa(p.replacement)}</td><td>${fa(p.replacementDone)}</td><td>${fa(p.replacementRemaining)}</td><td>${fa(p.repair)}</td><td>${fa(p.repairDone)}</td><td>${fa(p.repairRemaining)}</td></tr>`).join("");}
function stageTable(type,rows){return rows.map((row,index)=>`<tr><td>${esc(type==="repair"?REPAIR_STAGES[index]:REPLACEMENT_STAGES[index])}</td><td>${fa(row)}</td></tr>`).join("");}

function render(){
  const app=document.getElementById("statistics-app");
  const completed=STATS.replacement.completed+STATS.repair.completed;
  const remaining=STATS.replacement.remaining+STATS.repair.remaining;
  const completionPct=pct(completed,STATS.trackedOperations);
  const requestPct=pct(STATS.totalRequests,STATS.totalGraves);
  app.innerHTML=`<div class="page">
  <header class="head"><div><h1>گزارش‌های آماری</h1><p>وضعیت آمار مزارها و عملیات عمرانی گلزار شهدای تهران</p></div><button type="button" onclick="location.reload()">↻ تازه‌سازی</button></header>
  <div class="meta">مبنای آماری فعلی: <strong>${fa(STATS.totalGraves)}</strong> مزار در ۸ قطعه · <span class="badge">نسخه مبنا</span></div>
  <section class="card kpi-grid"><div class="metric hero"><span>کل مزارها</span><strong>${fa(STATS.totalGraves)}</strong><small>مبنای جدول پایه</small></div><div class="metric"><span>درخواست کار عمرانی</span><strong>${fa(STATS.totalRequests)}</strong><small>${fa(requestPct.toFixed(1))}٪ از کل مزارها</small></div><div class="metric"><span>قابل اقدام تعویضی</span><strong>${fa(STATS.replacement.total)}</strong><small>از درخواست‌های عمرانی</small></div><div class="metric"><span>قابل اقدام ترمیمی</span><strong>${fa(STATS.repair.total)}</strong><small>از درخواست‌های عمرانی</small></div></section>
  <section class="card"><h2>درخواست‌های عمرانی به تفکیک قطعه</h2><p class="section-note">مقایسه تعداد درخواست‌های کار عمرانی ثبت‌شده در هشت قطعه.</p>${barChart()}</section>
  <section class="card"><h2>جدول کامل آمار قطعات</h2><p class="section-note">مبنای این جدول همان اعداد آماری مورد توافق است. ردیف جمع از جمع واقعی هشت قطعه به دست آمده است.</p><div class="piece-table-wrap"><table class="piece-table full-table"><thead><tr><th rowspan="2">قطعه</th><th rowspan="2">کل مزار</th><th rowspan="2">درخواست کار عمرانی</th><th colspan="3">تعویضی</th><th colspan="3">ترمیمی</th></tr><tr><th>قابل تعویض</th><th>تعویض شده</th><th>باقی‌مانده تعویض</th><th>قابل ترمیم</th><th>ترمیم شده</th><th>باقی‌مانده ترمیم</th></tr></thead><tbody>${fullTable()}</tbody><tfoot><tr><td><strong>جمع</strong></td><td><strong>${fa(STATS.totalGraves)}</strong></td><td><strong>${fa(STATS.totalRequests)}</strong></td><td><strong>${fa(STATS.replacement.total)}</strong></td><td><strong>${fa(STATS.replacement.completed)}</strong></td><td><strong>${fa(STATS.replacement.remaining)}</strong></td><td><strong>${fa(STATS.repair.total)}</strong></td><td><strong>${fa(STATS.repair.completed)}</strong></td><td><strong>${fa(STATS.repair.remaining)}</strong></td></tr></tfoot></table></div></section>
  <section class="card"><h2>وضعیت عملیات عمرانی</h2>${donutChart()}</section>
  <div class="grid"><section class="card"><h2>مراحل ترمیمی</h2><div class="mini-table"><table><thead><tr><th>مرحله</th><th>تعداد</th></tr></thead><tbody>${stageTable("repair",[0,0,STATS.repair.completed])}</tbody></table></div><p class="section-note">جمع قابل ترمیم: ${fa(STATS.repair.total)} · انجام‌شده: ${fa(STATS.repair.completed)} · باقی‌مانده: ${fa(STATS.repair.remaining)}</p></section><section class="card"><h2>مراحل تعویضی</h2><div class="mini-table"><table><thead><tr><th>مرحله</th><th>تعداد</th></tr></thead><tbody>${stageTable("replacement",[0,0,STATS.replacement.completed])}</tbody></table></div><p class="section-note">جمع قابل تعویض: ${fa(STATS.replacement.total)} · انجام‌شده: ${fa(STATS.replacement.completed)} · باقی‌مانده: ${fa(STATS.replacement.remaining)}</p></section></div>
  <section class="card warning-card"><h2>یادداشت آماری مهم</h2><p><strong>${fa(STATS.totalRequests)}</strong> درخواست کار عمرانی ثبت شده است، اما مجموع مواردی که در دو گروه تعویضی و ترمیمی قرار گرفته‌اند <strong>${fa(STATS.trackedOperations)}</strong> مورد است.</p><p>بنابراین <strong>${fa(STATS.unclassified)}</strong> مورد فعلاً در تفکیک تعویضی/ترمیمی وارد نشده‌اند. این ۷۸ مورد در این نسخه نه «انجام‌شده» محسوب می‌شوند و نه «باقی‌مانده» و تا تعیین تکلیف، در نمودار دوناتی لحاظ نشده‌اند.</p></section>
  <footer class="footer">گلزار شهدای تهران · سامانه مدیریت و پایش سنگ مزار · آمار مبنا برای نسخه فعلی برنامه</footer></div>`;
}

document.addEventListener("DOMContentLoaded",render);
