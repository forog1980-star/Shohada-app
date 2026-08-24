"use strict";
(function(){
 const U="https://bafrksgdcmglahyrppfy.supabase.co",K="sb_publishable_O5CkSuivysXJf-8hu1";
 let channel=null;
 async function refresh(){
  try{
   const r=await fetch(`${U}/rest/v1/martyrs?select=*`,{headers:{apikey:K,Authorization:`Bearer ${K}`}});
   if(!r.ok)throw new Error(String(r.status));
   const rows=await r.json(); window.__GOLZAR_LIVE_ROWS__=rows;
   const m=document.querySelector('.meta'); if(m)m.dataset.liveRows=rows.length;
   window.dispatchEvent(new CustomEvent('golzar:statistics-live',{detail:{rows,source:'poll'}}));
  }catch(e){console.warn('live statistics unavailable',e)}
 }
 function startRealtime(){
  if(channel||!window.supabase?.createClient)return;
  try{
   const client=window.supabase.createClient(U,K);
   channel=client.channel('golzar-statistics-live').on('postgres_changes',{event:'*',schema:'public',table:'martyrs'},()=>refresh()).subscribe();
  }catch(e){console.warn('realtime statistics unavailable',e)}
 }
 window.GOLZAR_STATISTICS={refresh};
 document.addEventListener('DOMContentLoaded',()=>{refresh();startRealtime();setInterval(refresh,15000)});
})();
