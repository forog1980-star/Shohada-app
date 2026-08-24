"use strict";
(function(){
 const U="https://bafrksgdcmglahyrppfy.supabase.co",K="sb_publishable_O5CkSuivysXJf-8hu1";
 async function refresh(){
  try{
   const r=await fetch(`${U}/rest/v1/martyrs?select=*`,{headers:{apikey:K,Authorization:`Bearer ${K}`}});
   if(!r.ok)throw new Error(String(r.status));
   const rows=await r.json(); window.__GOLZAR_LIVE_ROWS__=rows;
   const m=document.querySelector('.meta'); if(m)m.dataset.liveRows=rows.length;
   window.dispatchEvent(new CustomEvent('golzar:statistics-live',{detail:{rows}}));
  }catch(e){console.warn('live statistics unavailable',e)}
 }
 window.GOLZAR_STATISTICS={refresh}; document.addEventListener('DOMContentLoaded',()=>{refresh();setInterval(refresh,15000)});
})();
