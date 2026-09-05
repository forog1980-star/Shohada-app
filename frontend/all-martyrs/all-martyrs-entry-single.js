(function(){
  const form=document.getElementById('single-entry-form');
  if(!form)return;
  const status=document.getElementById('entry-status');
  const age=document.getElementById('age');
  const topButton=document.querySelector('.back-to-top');
  const value=id=>document.getElementById(id).value.trim();
  const toInt=id=>{const raw=value(id); if(!/^\d+$/.test(raw))return null; const n=Number(raw); return Number.isInteger(n)?n:null};

  const dateRules={
    birth_day:{min:1,max:31}, birth_month:{min:1,max:12}, birth_year:{min:1300,max:1405},
    death_day:{min:1,max:31}, death_month:{min:1,max:12}, death_year:{min:1300,max:1405}
  };

  function calculateAge(){
    const by=toInt('birth_year'), dy=toInt('death_year');
    if(by!==null && dy!==null && dy>=by){
      age.value=String(dy-by);
      return;
    }
    age.value='';
  }

  function validateDateFields(){
    for(const [id,rule] of Object.entries(dateRules)){
      const raw=value(id);
      if(raw==='')continue;
      if(!/^\d+$/.test(raw))return `فیلد «${document.querySelector(`label[for="${id}"]`).textContent}» فقط باید عدد باشد.`;
      const n=Number(raw);
      if(n<rule.min || n>rule.max)return `مقدار «${document.querySelector(`label[for="${id}"]`).textContent}» باید بین ${rule.min} و ${rule.max} باشد.`;
    }

    const by=toInt('birth_year'), dy=toInt('death_year');
    if(by!==null && dy!==null && dy<by)return 'سال شهادت نمی‌تواند قبل از سال تولد باشد.';

    return '';
  }

  function sanitizeDateInput(id,maxLength){
    const el=document.getElementById(id);
    el.addEventListener('input',function(){
      this.value=this.value.replace(/\D/g,'').slice(0,maxLength);
      calculateAge();
    });
  }

  sanitizeDateInput('birth_day',2);sanitizeDateInput('birth_month',2);sanitizeDateInput('birth_year',4);
  sanitizeDateInput('death_day',2);sanitizeDateInput('death_month',2);sanitizeDateInput('death_year',4);

  form.addEventListener('submit',function(e){
    e.preventDefault();
    const required=['first_name','last_name','father_name','grave_piece','grave_row','grave_number'];
    const missing=required.filter(id=>!value(id));
    if(missing.length){
      status.textContent='لطفاً نام، نام خانوادگی، نام پدر و هر سه مشخصه مزار را تکمیل کنید.';
      status.className='entry-status is-error';
      document.getElementById(missing[0]).focus();
      return;
    }

    const dateError=validateDateFields();
    if(dateError){
      status.textContent=dateError;
      status.className='entry-status is-error';
      const firstInvalid=Object.keys(dateRules).find(id=>{
        const raw=value(id); if(raw==='')return false; const rule=dateRules[id]; const n=Number(raw); return !/^\d+$/.test(raw)||n<rule.min||n>rule.max;
      });
      if(firstInvalid)document.getElementById(firstInvalid).focus();
      else document.getElementById('death_year').focus();
      return;
    }

    calculateAge();
    const payload={
      first_name:value('first_name'),last_name:value('last_name'),father_name:value('father_name'),gender:value('gender'),
      birth_day:value('birth_day'),birth_month:value('birth_month'),birth_year:value('birth_year'),
      death_day:value('death_day'),death_month:value('death_month'),death_year:value('death_year'),age:value('age'),
      martyrdom_operation:value('martyrdom_operation'),martyrdom_location:value('martyrdom_location'),
      grave_piece:value('grave_piece'),grave_row:value('grave_row'),grave_number:value('grave_number'),notes:value('notes')
    };
    sessionStorage.setItem('golzar_single_entry_pending',JSON.stringify(payload));
    window.location.href='all-martyrs-entry-single-confirm.html';
  });

  form.addEventListener('reset',function(){setTimeout(function(){status.textContent='';status.className='entry-status';age.value='';},0)});
  const updateTopVisibility=()=>topButton.classList.toggle('is-visible',window.scrollY>420);
  window.addEventListener('scroll',updateTopVisibility,{passive:true});updateTopVisibility();
  topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();