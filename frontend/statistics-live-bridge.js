"use strict";
(function(){
  const U="https://bafrksgdcmglahyrppfy.supabase.co";
  const K="sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
  const TABLE="martyrs";
  const PAGE_SIZE=1000;
  let channel=null;
  let previousRows=null;
  let refreshInProgress=false;

  async function fetchAll(){
    const rows=[];
    let offset=0;
    while(true){
      const url=`${U}/rest/v1/${TABLE}?select=*&order=id&limit=${PAGE_SIZE}&offset=${offset}`;
      const r=await fetch(url,{headers:{apikey:K,Authorization:`Bearer ${K}`},cache:"no-store"});
      if(!r.ok) throw new Error(`Supabase ${r.status}`);
      const batch=await r.json();
      rows.push(...batch);
      if(batch.length<PAGE_SIZE) break;
      offset+=PAGE_SIZE;
      if(offset>100000) throw new Error("pagination safety limit reached");
    }
    return rows;
  }

  function rowKey(row){return String(row?.id ?? row?.ID ?? `${row?.piece??""}|${row?.grave_row??row?.row??""}|${row?.grave_number??row?.number??""}|${row?.name??""}`);}
  function sameRow(a,b){return JSON.stringify(a)===JSON.stringify(b);}

  function diffRows(rows){
    if(!previousRows){previousRows=rows;return [];} 
    const oldMap=new Map(previousRows.map(r=>[rowKey(r),r]));
    const newMap=new Map(rows.map(r=>[rowKey(r),r]));
    const changes=[];
    for(const [key,oldRow] of oldMap){
      if(!newMap.has(key)) changes.push({event:"DELETE",old:oldRow,new:null});
      else if(!sameRow(oldRow,newMap.get(key))) changes.push({event:"UPDATE",old:oldRow,new:newMap.get(key)});
    }
    for(const [key,newRow] of newMap){if(!oldMap.has(key))changes.push({event:"INSERT",old:null,new:newRow});}
    previousRows=rows;
    return changes;
  }

  async function refresh(reason="poll"){
    if(refreshInProgress)return;
    refreshInProgress=true;
    try{
      const rows=await fetchAll();
      window.__GOLZAR_LIVE_ROWS__=rows;
      const changes=diffRows(rows);
      window.dispatchEvent(new CustomEvent('golzar:statistics-live',{detail:{rows,changes,source:reason,initial:changes.length===0}}));
      console.info(`[Golzar statistics] ${reason}: ${rows.length} rows, ${changes.length} changes`);
    }catch(e){console.error('[Golzar statistics] sync failed',e);}
    finally{refreshInProgress=false;}
  }

  function startRealtime(){
    if(channel||!window.supabase?.createClient)return;
    const client=window.supabase.createClient(U,K);
    channel=client.channel('golzar-statistics-live')
      .on('postgres_changes',{event:'*',schema:'public',table:TABLE},payload=>{
        console.info(`[Golzar statistics] Realtime ${payload.eventType||'change'}`);
        refresh(`realtime:${payload.eventType||'change'}`);
      })
      .subscribe(status=>console.info(`[Golzar statistics] Realtime status: ${status}`));
  }

  window.GOLZAR_STATISTICS={refresh};
  document.addEventListener('DOMContentLoaded',()=>{
    refresh('initial');
    startRealtime();
    setInterval(()=>refresh('poll'),15000);
  });
})();
