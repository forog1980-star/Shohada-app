"use strict";
(function(){
  // Read-only identity index generated from the agreed master Excel workbook.
  // It does not alter the approved statistical totals.
  const BASELINE = {
    full: PLACEHOLDER_FULL,
    piece: PLACEHOLDER_PIECE,
    name: PLACEHOLDER_NAME
  };
  function norm(v){return String(v ?? "").trim().toLowerCase().replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d));}
  function primary(r){return [r?.name,r?.family,r?.piece,r?.grave_row??r?.row,r?.grave_number??r?.number].map(norm).join("|");}
  function pieceKey(r){return [r?.name,r?.family,r?.piece].map(norm).join("|");}
  function nameKey(r){return [r?.name,r?.family].map(norm).join("|");}
  const full=new Set(BASELINE.full),piece=new Set(BASELINE.piece),name=new Set(BASELINE.name);
  function isBaseline(r){return full.has(primary(r))||piece.has(pieceKey(r))||name.has(nameKey(r));}
  window.GOLZAR_STATISTICS_BASELINE={isBaseline};
})();
".replace("PLACEHOLDER_FULL", PLACEHOLDER_FULL).replace("PLACEHOLDER_PIECE", PLACEHOLDER_PIECE).replace("PLACEHOLDER_NAME", PLACEHOLDER_NAME);
