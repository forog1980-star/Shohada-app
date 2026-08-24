"use strict";
(function(){
 const U="https://bafrksgdcmglahyrppfy.supabase.co",K="sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
 let channel=null;
 let previousRows=null;
 let firstLoad=true;

 function rowKey(row){return String(row?.id ?? row?.ID ?? `${row?.piece??""}|${row?.row??row?.grave_row??""}|${row?.number??row?.grave_number??""}|${row?.name??""}`);}
 function sameRow(a,b){return JSON.stringify(a)===JSON.stringify(b);}

 function diffRows(rows){
  if(firstLoad || !previousRows){
   previousRows=rows;
   firstLoad=false;
   return [];
  }
  const oldMap=new Map(previousRows.map(r=>[rowKey(r),r]));
  const newMap=new Map(rows.map(r=>[rowKey(r),r]));
  const changes=[];
  for(const [key,oldRow] of oldMap){
   if(!newMap.has(key)) changes.push({event:"DELETE",old:oldRow,new:null});
   else if(!sameRow(oldRow,newMap.get(key))) changes.push({event:"UPDATE",old:oldRow,new:newMap.get(key)});
  }
  for(const [key,newRow] of newMap){
   if(!oldMap.has(key)) changes.push({event:"INSERT",old:null,new:newRow});
  }
  previousRows=rows;
  return changes;
 }

 async function refresh(reason="poll"){
  try{
   const r=await fetch(`${U}/rest/v1/martyrs?select=*`,{headers:{apikey:K,Authorization:`Bearer ${K}`} });
   if(!r.ok)throw new Error(String(r.status));
   const rows=await r.json();
   window.__GOLZAR_LIVE_ROWS__=rows;
   const m=document.querySelector('.meta'); if(m)m.dataset.liveRows=rows.length;
   const changes=diffRows(rows);
   if(changes.length){
    window.dispatchEvent(new CustomEvent('golzar:statistics-live',{detail:{rows,changes,source:reason}}));
   }
  }catch(e){console.warn('live statistics unavailable',e)}
 }

 function startRealtime(){
  if(channel||!window.supabase?.createClient)return;
  try{
   const client=window.supabase.createClient(U,K);
   channel=client.channel('golzar-statistics-live')
    .on('postgres_changes',{event:'*',schema:'public',table:'martyrs'},payload=>{
      refresh(`realtime:${payload.eventType||"change"}`);
    })
    .subscribe();
  }catch(e){console.warn('realtime statistics unavailable',e)}
 }

 window.GOLZAR_STATISTICS={refresh};
 document.addEventListener('DOMContentLoaded',()=>{
  refresh('initial');
  startRealtime();
  setInterval(()=>refresh('poll'),15000);
 });
})();
