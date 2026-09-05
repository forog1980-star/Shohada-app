(function(){
  const form=document.getElementById('single-entry-form');
  if(!form)return;
  const status=document.getElementById('entry-status');
  const age=document.getElementById('age');
  const topButton=document.querySelector('.back-to-top');
  const value=id=>document.getElementById(id).value.trim();
  const toInt=id=>{const n=Number(value(id));return Number.isInteger(n)?n:null};

  function calculateAge(){
    const by=toInt('birth_year'), dy=toInt('death_year');
    if(by && dy && dy>=by){
      age.value=String(dy-by);
      return;
    }
    age.value='';
  }
  ['birth_year','death_year','birth_day','death_day','birth_month','death_month'].forEach(id=>{
    document.getElementById(id).addEventListener('input',calculateAge);
  });

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