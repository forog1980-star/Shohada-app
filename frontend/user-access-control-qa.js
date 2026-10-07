"use strict";

/*
 * GolzarStone — User Access Control QA Engine
 * QA-only, deterministic, no Supabase writes.
 * Production authentication / RLS / role administration are intentionally
 * not implemented here because those require an approved backend/Auth schema.
 */

const PERMISSIONS = [
  ["all_martyrs","جستجوی کل شهدا",["view","search","detail","edit_draft","export"]],
  ["registration","ثبت اطلاعات",["view","create","edit_own","review","approve","reject","export"]],
  ["martyrs","مدیریت و بهسازی",["view","search","create","edit","change_stage","approve","export","delete"]],
  ["quality","کنترل کیفیت",["view","submit","edit_proposal","review","return","reject","approve","apply","export"]],
  ["statistics","آمار",["view","export","manage_baseline"]],
  ["reports","گزارش‌ها",["view","create","edit","export","delete"]],
  ["users","کاربران",["view","create","edit","disable","reset_access"]],
  ["roles","نقش‌ها و مجوزها",["view","create","edit","disable","assign_permissions"]],
  ["audit","ردیابی فعالیت",["view_own","view_module","view_all","export"]]
];

const ROLES = {
  viewer:{label:"مشاهده‌گر",permissions:["all_martyrs.view","all_martyrs.search","all_martyrs.detail","martyrs.view","martyrs.search","quality.view","statistics.view","reports.view","audit.view_own"]},
  registration_operator:{label:"اپراتور ثبت",permissions:["all_martyrs.view","all_martyrs.search","all_martyrs.detail","registration.view","registration.create","registration.edit_own","registration.export","martyrs.view","martyrs.search","audit.view_own"]},
  rehabilitation_operator:{label:"کارشناس بهسازی",permissions:["all_martyrs.view","all_martyrs.search","all_martyrs.detail","registration.view","martyrs.view","martyrs.search","martyrs.create","martyrs.edit","martyrs.change_stage","martyrs.export","statistics.view","audit.view_own"]},
  quality_reviewer:{label:"ناظر کنترل کیفیت",permissions:["martyrs.view","martyrs.search","quality.view","quality.submit","quality.edit_proposal","quality.review","quality.return","quality.reject","quality.export","statistics.view","audit.view_own","audit.view_module"]},
  quality_approver:{label:"تأییدکننده",permissions:["martyrs.view","martyrs.search","quality.view","quality.review","quality.approve","quality.reject","quality.export","audit.view_own","audit.view_module"]},
  auditor:{label:"ممیز",permissions:["all_martyrs.view","martyrs.view","quality.view","statistics.view","reports.view","audit.view_all","audit.export"]},
  manager:{label:"مدیر سامانه",permissions:["all_martyrs.view","all_martyrs.search","all_martyrs.detail","all_martyrs.export","registration.view","registration.review","registration.approve","registration.reject","registration.export","martyrs.view","martyrs.search","martyrs.create","martyrs.edit","martyrs.change_stage","martyrs.approve","martyrs.export","quality.view","quality.review","quality.return","quality.reject","quality.approve","quality.export","statistics.view","statistics.export","reports.view","reports.create","reports.edit","reports.export","users.view","users.create","users.edit","users.disable","users.reset_access","roles.view","roles.create","roles.edit","roles.disable","roles.assign_permissions","audit.view_all","audit.export"]},
  system_admin:{label:"مدیر فنی",permissions:["users.view","users.create","users.edit","users.disable","users.reset_access","roles.view","roles.create","roles.edit","roles.disable","roles.assign_permissions","audit.view_all","audit.export"]}
};

const SCOPES = [
  ["global","کل سامانه"],
  ["assigned_unit","واحد/گروه تخصیص‌یافته"],
  ["assigned_sections","قطعات تخصیص‌یافته"],
  ["own_records","رکوردهای خود کاربر"],
  ["assigned_records","رکوردهای تخصیص‌یافته"],
];

const state = {
  userId:"qa-user-001",
  userName:"کاربر آزمایشی",
  roles:["viewer"],
  scopes:["assigned_sections"]
};

const $ = id => document.getElementById(id);
const permKey = (m,a) => m+"."+a;

function allPermissions(){
  return PERMISSIONS.flatMap(([module,,actions])=>actions.map(a=>permKey(module,a)));
}

function effectivePermissions(){
  const set = new Set();
  state.roles.forEach(r => (ROLES[r]?.permissions||[]).forEach(p=>set.add(p)));
  return [...set].sort();
}

function hasPermission(permission){
  return effectivePermissions().includes(permission);
}

function hasScope(scope){
  if(state.scopes.includes("global")) return true;
  return state.scopes.includes(scope);
}

function can(permission, requiredScope="read_only", targetCreatorId=null){
  if(!state.userId) return {allowed:false,reason:"شناسه کاربر وجود ندارد."};
  if(!hasPermission(permission)) return {allowed:false,reason:"Permission اعطا نشده است (deny by default)."};
  if(requiredScope && !hasScope(requiredScope)) return {allowed:false,reason:"Scope داده برای این عملیات کافی نیست."};
  if(["quality.approve","martyrs.approve","registration.approve"].includes(permission)
     && targetCreatorId && targetCreatorId===state.userId){
    return {allowed:false,reason:"Separation of Duties: کاربر نمی‌تواند رکورد/پیشنهاد خودش را تأیید نهایی کند."};
  }
  if(permission==="martyrs.delete") return {allowed:false,reason:"حذف عملیاتی در این مرحله عمداً غیرفعال است."};
  return {allowed:true,reason:"دسترسی مجاز است."};
}

function renderRoles(){
  $("roles").innerHTML = Object.entries(ROLES).map(([id,r]) =>
    '<div class="role '+(state.roles.includes(id)?"active":"")+'" data-role="'+id+'">'+r.label+' <span class="small">('+r.permissions.length+' مجوز)</span></div>'
  ).join("");
  document.querySelectorAll("[data-role]").forEach(el=>el.onclick=()=>{
    const r=el.dataset.role;
    state.roles=state.roles.includes(r)?state.roles.filter(x=>x!==r):[...state.roles,r];
    if(!state.roles.length) state.roles=["viewer"];
    render();
  });
}

function renderScopes(){
  $("scopes").innerHTML = SCOPES.map(([id,label]) =>
    '<label class="scope"><input type="checkbox" data-scope="'+id+'" '+(state.scopes.includes(id)?"checked":"")+'> '+label+'</label>'
  ).join("");
  document.querySelectorAll("[data-scope]").forEach(el=>el.onchange=()=>{
    if(el.checked) state.scopes=[...new Set([...state.scopes,el.dataset.scope])];
    else state.scopes=state.scopes.filter(x=>x!==el.dataset.scope);
    if(!state.scopes.length) state.scopes=["read_only"];
    renderEffective();
  });
}

function renderPermissions(){
  $("permissions").innerHTML=PERMISSIONS.map(([module,label,actions])=>{
    return '<div class="group"><div class="group-title">'+label+' <span class="small">('+module+')</span></div>'+
      actions.map(a=>{
        const p=permKey(module,a), yes=hasPermission(p);
        return '<div class="permission"><span>'+a+'</span><b class="'+(yes?"pass":"")+'">'+(yes?"✓":"—")+'</b></div>';
      }).join("")+'</div>';
  }).join("");
}

function renderSelectors(){
  $("permissionSelect").innerHTML=allPermissions().map(p=>'<option>'+p+'</option>').join("");
  $("scopeSelect").innerHTML=SCOPES.map(([id,label])=>'<option value="'+id+'">'+id+' — '+label+'</option>').join("");
}

function renderEffective(){
  $("effective").textContent=JSON.stringify({
    userId:state.userId,userName:state.userName,roles:state.roles,scopes:state.scopes,
    effectivePermissions:effectivePermissions()
  },null,2);
}

function render(){
  $("userName").value=state.userName;
  $("userId").value=state.userId;
  renderRoles();renderScopes();renderPermissions();renderSelectors();renderEffective();
}

function runTests(){
  const original=JSON.parse(JSON.stringify(state));
  const tests=[];
  const t=(name,fn)=>{try{tests.push({name,ok:!!fn()})}catch(e){tests.push({name,ok:false,error:String(e)})}};
  state.userId="u1";state.userName="u1";state.roles=["viewer"];state.scopes=["assigned_sections"];
  t("viewer cannot create martyrs",()=>!can("martyrs.create","read_only").allowed);
  state.roles=["rehabilitation_operator"];state.scopes=["assigned_records"];
  t("rehabilitation operator can edit with assigned scope",()=>can("martyrs.edit","assigned_records").allowed);
  t("missing global scope is denied",()=>!can("martyrs.edit","global").allowed);
  state.roles=["quality_approver"];state.scopes=["global"];
  t("approver can approve quality",()=>can("quality.approve","global","u2").allowed);
  t("approver cannot approve own proposal",()=>!can("quality.approve","global","u1").allowed);
  state.roles=["system_admin"];state.scopes=["global"];
  t("system admin does not gain data edit automatically",()=>!can("martyrs.edit","global").allowed);
  t("delete is explicitly denied",()=>!can("martyrs.delete","global","u2").allowed);
  state.roles=["unknown_role"];state.scopes=["global"];
  t("unknown role is denied",()=>!can("martyrs.view","global").allowed);
  state.roles=["viewer","quality_reviewer"];state.scopes=["assigned_sections"];
  t("multiple roles union permissions",()=>can("quality.review","assigned_sections").allowed);
  state.roles=["viewer"];state.scopes=["global"];state.userId="";
  t("missing user id is denied",()=>!can("martyrs.view","global").allowed);
  Object.assign(state,original);
  const passed=tests.filter(x=>x.ok).length;
  $("tests").innerHTML=tests.map(x=>'<div class="result '+(x.ok?"pass":"fail")+'">'+(x.ok?"PASS":"FAIL")+' — '+x.name+(x.error?" — "+x.error:"")+'</div>').join("")+
    '<div class="small">نتیجه: '+passed+'/'+tests.length+' تست موفق</div>';
}

$("saveBtn").onclick=()=>{
  state.userName=$("userName").value.trim()||"کاربر آزمایشی";
  state.userId=$("userId").value.trim();
  localStorage.setItem("golzar_uac_qa_state",JSON.stringify(state));
  renderEffective();
  alert("سناریوی QA در مرورگر ذخیره شد. این ذخیره‌سازی فقط localStorage است.");
};
$("resetBtn").onclick=()=>{
  localStorage.removeItem("golzar_uac_qa_state");
  state.userId="qa-user-001";state.userName="کاربر آزمایشی";state.roles=["viewer"];state.scopes=["assigned_sections"];
  render();runTests();
};
$("checkBtn").onclick=()=>{
  const r=can($("permissionSelect").value,$("scopeSelect").value,$("creatorId").value.trim()||null);
  $("decision").textContent=r.allowed?"✓ ALLOW":"✕ DENY";
  $("decision").style.color=r.allowed?"#17633d":"#c84b4b";
  $("reason").textContent=r.reason;
};

try{
  const saved=JSON.parse(localStorage.getItem("golzar_uac_qa_state")||"null");
  if(saved&&Array.isArray(saved.roles)&&Array.isArray(saved.scopes)) Object.assign(state,saved);
}catch(e){console.warn("QA state load failed",e)}
render();runTests();
