"use strict";
(function(){
  const U="https://bafrksgdcmglahyrppfy.supabase.co";
  const K="sb_publishable_O5CkSuivysXJf-8hu1IUCA_izu8hWiX";
  const TABLE="martyrs", PAGE_SIZE=1000;
  let channel=null,refreshing=false;
  const rowMap=new Map();
  async function fetchAll(){
    const rows=[]; let offset=0;
    while(true){
      const url=`${U}/rest/v1/${TABLE}?select=*&order=id&limit=${PAGE_SIZE}&offset=${offset}`;
      const r=await fetch(url,{headers:{apikey:K,Authorization:`Bearer ${K}`},cache:"no-store"});
      if(!r.ok) throw new Error(`Supabase ${r.status}`);
      const batch=await r.json(); rows.push(...batch);
      if(batch.length<PAGE_SIZE) break;
      offset+=PAGE_SIZE;
      if(offset>100000) throw new Error("pagination safety limit reached");
    }
    return rows;
  }
  function idOf(r){return Number(r?.id ?? r?.ID);}
  function seed(rows){
    rowMap.clear();
    for(const r of rows||[]){const id=idOf(r); if(Number.isFinite(id)) rowMap.set(id,r);}
  }
  async function initialRefresh(){
    if(refreshing) return;
    refreshing=true;
    try{
      const rows=await fetchAll();
      seed(rows);
      window.__GOLZAR_LIVE_ROWS__=rows;
      window.dispatchEvent(new CustomEvent("golzar:statistics-live",{detail:{rows,changes:[],source:"initial",initial:true}}));
      console.info(`[Golzar statistics] initial: ${rows.length} rows`);
    }catch(e){console.error("[Golzar statistics] initial sync failed",e)}
    finally{refreshing=false}
  }
  function handleChange(payload){
    const event=payload?.eventType;
    const incoming=payload?.new||null;
    const id=Number(incoming?.id ?? payload?.old?.id);
    const old=rowMap.get(id)||payload?.old||null;
    if(event==="INSERT" && incoming){
      rowMap.set(id,incoming);
      window.dispatchEvent(new CustomEvent("golzar:statistics-live",{detail:{rows:[],changes:[{event:"INSERT",old:null,new:incoming}],source:"realtime:INSERT",initial:false}}));
    } else if(event==="UPDATE" && incoming){
      rowMap.set(id,incoming);
      window.dispatchEvent(new CustomEvent("golzar:statistics-live",{detail:{rows:[],changes:[{event:"UPDATE",old,new:incoming}],source:"realtime:UPDATE",initial:false}}));
    } else if(event==="DELETE"){
      rowMap.delete(id);
      window.dispatchEvent(new CustomEvent("golzar:statistics-live",{detail:{rows:[],changes:[{event:"DELETE",old,new:null}],source:"realtime:DELETE",initial:false}}));
    }
    window.__GOLZAR_LIVE_ROWS__=Array.from(rowMap.values());
  }
  function startRealtime(){
    if(channel||!window.supabase?.createClient) return;
    const client=window.supabase.createClient(U,K);
    channel=client.channel("golzar-statistics-live-v3")
      .on("postgres_changes",{event:"*",schema:"public",table:TABLE},handleChange)
      .subscribe(status=>console.info(`[Golzar statistics] Realtime status: ${status}`));
  }
  window.GOLZAR_STATISTICS={refresh:initialRefresh};
  document.addEventListener("DOMContentLoaded",()=>{initialRefresh();startRealtime();});
})();