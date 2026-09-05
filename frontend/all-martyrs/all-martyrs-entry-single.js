(function(){
  const form=document.getElementById('single-entry-form');
  if(!form)return;
  const status=document.getElementById('entry-status');
  const age=document.getElementById('age');
  const topButton=document.querySelector('.back-to-top');
  const value=id=>document.getElementById(id).value.trim();
  const toInt=id=>{const raw=value(id);if(!/^\d+$/.test(raw))return null;const n=Number(raw);return Number.isInteger(n)?n:null};
  const dateRules={birth_day:{min:1,max:31},birth_month:{min:1,max:12},birth_year:{min:1300,max:1450},death_day:{min:1,max:31},death_month:{min:1,max:12},death_year:{min:1300,max:1450}};
  const dateIds=Object.keys(dateRules);
  const fieldLabel=id=>document.querySelector(`label[for="${id}"]`)?.textContent.replace('*','').trim()||id;
  const groupFor=id=>document.getElementById(id)?.closest('.entry-date-group');

  function setDateError(id,message){
    const el=document.getElementById(id),group=groupFor(id);if(!el||!group)return;
    el.classList.add('is-invalid');el.setAttribute('aria-invalid','true');
    let box=group.querySelector('.date-validation-message');
    if(!box){box=document.createElement('div');box.className='date-validation-message';box.setAttribute('role','alert');group.appendChild(box)}
    box.textContent=message;
  }
  function clearDateError(id){
    const el=document.getElementById(id),group=groupFor(id);if(!el||!group)return;
    el.classList.remove('is-invalid');el.removeAttribute('aria-invalid');
    const box=group.querySelector('.date-validation-message');if(box)box.remove();
  }
  function clearAllDateErrors(){dateIds.forEach(clearDateError)}

  function calculateAge(){
    const by=toInt('birth_year'),dy=toInt('death_year');
    if(by!==null&&dy!==null&&dy>=by)age.value=String(dy-by);else age.value='';
  }

  function validateDateFields(){
    clearAllDateErrors();
    for(const [id,rule] of Object.entries(dateRules)){
      const raw=value(id);if(raw==='')continue;
      if(!/^\d+$/.test(raw)){setDateError(id,`تاریخ ${fieldLabel(id)} صحیح نیست؛ فقط عدد وارد کنید.`);return `تاریخ ${fieldLabel(id)} صحیح نیست.`}
      const n=Number(raw);
      if(n<rule.min||n>rule.max){setDateError(id,`مقدار ${fieldLabel(id)} صحیح نیست؛ باید بین ${rule.min} و ${rule.max} باشد.`);return `تاریخ ${fieldLabel(id)} صحیح نیست.`}
    }
    const bm=toInt('birth_month'),bd=toInt('birth_day'),dm=toInt('death_month'),dd=toInt('death_day');
    const maxDays=m=>m<=6?31:m<=11?30:29;
    if(bm!==null&&bd!==null&&bd>maxDays(bm)){setDateError('birth_day','تاریخ تولد صحیح نیست؛ این ماه بیش از این تعداد روز ندارد.');return 'تاریخ تولد صحیح نیست.'}
    if(dm!==null&&dd!==null&&dd>maxDays(dm)){setDateError('death_day','تاریخ شهادت صحیح نیست؛ این ماه بیش از این تعداد روز ندارد.');return 'تاریخ شهادت صحیح نیست.'}
    const by=toInt('birth_year'),dy=toInt('death_year');
    if(by!==null&&dy!==null&&dy<by){setDateError('death_year','تاریخ شهادت صحیح نیست؛ سال شهادت نمی‌تواند قبل از سال تولد باشد.');return 'تاریخ شهادت صحیح نیست.'}
    return '';
  }

  function sanitizeDateInput(id,maxLength){
    const el=document.getElementById(id);el.addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,maxLength);clearDateError(id);calculateAge()});
    el.addEventListener('blur',function(){if(value(id))validateDateFields()});
  }
  dateIds.forEach(id=>sanitizeDateInput(id,id.includes('year')?4:2));

  function hydrateFromPending(){
    const raw=sessionStorage.getItem('golzar_single_entry_pending');if(!raw)return;
    try{
      const data=JSON.parse(raw);
      ['first_name','last_name','father_name','gender','birth_day','birth_month','birth_year','death_day','death_month','death_year','martyrdom_operation','martyrdom_location','grave_piece','grave_row','grave_number','notes'].forEach(id=>{
        if(data[id]!==undefined)document.getElementById(id).value=data[id];
      });
      calculateAge();
      status.textContent='اطلاعات ثبت اولیه قبلی بازیابی شد؛ می‌توانید آن‌ها را ویرایش کنید.';
      status.className='entry-status is-success';
      setTimeout(()=>{status.textContent='';status.className='entry-status'},3500);
    }catch(e){sessionStorage.removeItem('golzar_single_entry_pending')}
  }
  hydrateFromPending();

  form.addEventListener('submit',function(e){
    e.preventDefault();
    const required=['first_name','last_name','father_name','grave_piece','grave_row','grave_number'];
    const missing=required.filter(id=>!value(id));
    if(missing.length){status.textContent='لطفاً نام، نام خانوادگی، نام پدر و هر سه مشخصه مزار را تکمیل کنید.';status.className='entry-status is-error';document.getElementById(missing[0]).focus();return}
    const dateError=validateDateFields();
    if(dateError){status.textContent=dateError+' لطفاً تاریخ را اصلاح کنید.';status.className='entry-status is-error';const invalid=document.querySelector('.is-invalid');if(invalid)invalid.focus();return}
    calculateAge();
    const payload={first_name:value('first_name'),last_name:value('last_name'),father_name:value('father_name'),gender:value('gender'),birth_day:value('birth_day'),birth_month:value('birth_month'),birth_year:value('birth_year'),death_day:value('death_day'),death_month:value('death_month'),death_year:value('death_year'),age:value('age'),martyrdom_operation:value('martyrdom_operation'),martyrdom_location:value('martyrdom_location'),grave_piece:value('grave_piece'),grave_row:value('grave_row'),grave_number:value('grave_number'),notes:value('notes')};
    sessionStorage.setItem('golzar_single_entry_pending',JSON.stringify(payload));
    status.textContent='ثبت اولیه اطلاعات با موفقیت انجام شد. در حال انتقال به صفحه تأیید...';status.className='entry-status is-success';
    setTimeout(()=>{window.location.href='all-martyrs-entry-single-confirm.html'},900);
  });

  form.addEventListener('reset',function(){setTimeout(function(){clearAllDateErrors();status.textContent='';status.className='entry-status';age.value=''},0)});
  const updateTopVisibility=()=>topButton.classList.toggle('is-visible',window.scrollY>420);
  window.addEventListener('scroll',updateTopVisibility,{passive:true});updateTopVisibility();
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();