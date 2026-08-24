(function(){
  "use strict";
  const EXCEL_URL="../ExcelData/martyrs_master_v2.xlsx";
  const PIECES=[["17",103],["24",6100],["26",4514],["27",3177],["28",3523],["29",2743],["40",2948],["53",3092]];
  const clean=v=>String(v??"").trim().replace(/\u200c/g," ").replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک").replace(/\s+/g," ");
  const checked=v=>!['','0','false','no','خیر','نه','-'].includes(clean(v).toLowerCase());
  const piece=v=>clean(v).replace(/[۰-۹]/g,d=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\.0$/,'');
  const col=(h,...n)=>{const a=n.map(clean);for(let i=0;i<h.length;i++)if(a.includes(clean(h[i])))return i;return null};
  const fa=v=>String(v).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[+d]);
  const pct=(v,d)=>d?v/d*100:0;
  async function run(){
    if(!window.XLSX?.read)return;
    const res=await fetch(EXCEL_URL,{cache:'no-store'}); if(!res.ok)throw Error('Excel HTTP '+res.status);
    const wb=XLSX.read(await res.arrayBuffer(),{type:'array'});
    const m={}; for(const[p,total]of PIECES)m[p]={total,r:0,rd:0,x:0,xd:0,w:0};
    for(const s of wb.SheetNames){
      const d=XLSX.utils.sheet_to_json(wb.Sheets[s],{header:1,defval:'',raw:true}); if(!d.length)continue;
      const h=d[0],pc=col(h,'قطعه'),rc=col(h,'مرمتی'),xc=col(h,'تعویضی');
      const rdone=col(h,'نصب مرمتی شده','نصب سنگ مرمتی آماده شده');
      const xdone=col(h,'تعویضی نصب شده','نصب سنگ تعویضی آماده شده');
      if(pc===null||(rc===null&&xc===null))continue;
      for(let i=1;i<d.length;i++){
        const row=d[i];if(!row||!row.some(v=>clean(v)))continue;const p=piece(row[pc]);if(!m[p])continue;
        const R=rc!==null&&checked(row[rc]),X=xc!==null&&checked(row[xc]);if(R&&X){m[p].w++;continue;}
        if(R&&!X){m[p].r++;if(rdone!==null&&checked(row[rdone]))m[p].rd++;}
        if(X&&!R){m[p].x++;if(xdone!==null&&checked(row[xdone]))m[p].xd++;}
      }
    }
    let bad=0; for(const p of Object.keys(m))bad+=m[p].w;
    const old=document.querySelector('.management');
    if(old){old.innerHTML='<div class="section-head"><h2>جدول مدیریتی آمار قطعات</h2><p>قابل تعویض و قابل ترمیم مستقیماً از ستون‌های «تعویضی» و «مرمتی» Excel محاسبه شده‌اند؛ درصد آسیب هر قطعه از کل سنگ همان قطعه است.</p></div>'+table(m);}
    document.querySelectorAll('.chart-card').forEach((card,idx)=>{
      const repair=idx===0; card.querySelector('h2').textContent=repair?'نمودار میله‌ای ترمیمی به تفکیک قطعه':'نمودار میله‌ای تعویضی به تفکیک قطعه';
      const note=card.querySelector('.chart-note'); if(note)note.textContent='مقیاس هر قطعه نسبت به کل مزار همان قطعه است.';
      card.querySelectorAll('.chart-row').forEach((row,i)=>{const p=PIECES[i][0],t=PIECES[i][1],z=m[p],v=repair?z.r:z.x,d=repair?z.rd:z.xd;row.querySelector('.chart-track i').style.width=Math.min(pct(v,t),100).toFixed(2)+'%';row.querySelector('.chart-value').innerHTML=fa(v)+' <small>از '+fa(t)+'</small>';row.querySelector('.chart-done').textContent='تکمیل: '+fa(d);});
    });
    if(bad){const sec=document.querySelector('.warning-card');if(sec)sec.innerHTML='<h2>هشدار کنترل داده</h2><div>⚠️ '+fa(bad)+' رکورد دارای ناهماهنگی ساختاری است: تعویضی و مرمتی هر دو ۱ هستند.</div>';}
  }
  function table(m){let rows='';let T={r:0,rd:0,x:0,xd:0};for(const[p,total]of PIECES){const z=m[p],xr=Math.max(z.x-z.xd,0),rr=Math.max(z.r-z.rd,0),a=z.x+z.r,d=z.xd+z.rd;T.r+=z.r;T.rd+=z.rd;T.x+=z.x;T.xd+=z.xd;rows+=`<tr><td class="piece-name">${fa(p)}</td><td>${fa(total)}</td><td>${fa(z.x)}</td><td>${fa(z.xd)}</td><td>${fa(xr)}</td><td>${fa(z.r)}</td><td>${fa(z.rd)}</td><td>${fa(rr)}</td><td><b>${fa(pct(a,total).toFixed(1))}٪</b></td><td>${fa(a)}</td><td>${fa(d)}</td><td>${fa(a-d)}</td></tr>`;}const all=T.x+T.r,done=T.xd+T.rd;return `<div class="table-wrap"><table class="management-table"><thead><tr><th>قطعه</th><th>کل سنگ قطعه</th><th colspan="3">آمار تعویض سنگ‌ها</th><th colspan="3">آمار ترمیم سنگ‌ها</th><th>درصد آسیب قطعه</th><th>کل قابل تعویض و ترمیم</th><th>کل تعویض و ترمیم شده</th><th>کل باقی‌مانده</th></tr><tr class="subhead"><th></th><th></th><th>قابل تعویض</th><th>تعویض شده</th><th>باقی‌مانده</th><th>قابل ترمیم</th><th>ترمیم شده</th><th>باقی‌مانده</th><th></th><th></th><th></th><th></th></tr></thead><tbody>${rows}<tr class="total-row"><td>جمع کل</td><td>${fa(26097)}</td><td>${fa(T.x)}</td><td>${fa(T.xd)}</td><td>${fa(T.x-T.xd)}</td><td>${fa(T.r)}</td><td>${fa(T.rd)}</td><td>${fa(T.r-T.rd)}</td><td><b>${fa(pct(all,26097).toFixed(1))}٪</b></td><td>${fa(all)}</td><td>${fa(done)}</td><td>${fa(all-done)}</td></tr></tbody></table></div>`;}
  window.addEventListener('load',()=>setTimeout(()=>run().catch(e=>console.error('Excel table fix:',e)),100));
})();
