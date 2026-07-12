let selectedType='prevent';
document.addEventListener('DOMContentLoaded',()=>{
  if(typeof initSidebar==='function') initSidebar({relatedTools:['health-checkup','health-refund','bokji-subsidy']});
  document.querySelectorAll('.type-tab').forEach(btn=>btn.addEventListener('click',()=>{
    selectedType=btn.dataset.type;
    document.querySelectorAll('.type-tab').forEach(x=>x.classList.toggle('active',x===btn));
    document.getElementById('prevent-fields').classList.toggle('active',selectedType==='prevent');
    document.getElementById('manage-fields').classList.toggle('active',selectedType==='manage');
    document.getElementById('check-result').hidden=true;
  }));
  document.getElementById('check-form').addEventListener('submit',checkEligibility);
  document.getElementById('btn-share').addEventListener('click',handleShare);
});
function checkEligibility(e){
  e.preventDefault();
  const result=document.getElementById('check-result');
  let eligible=false,complete=true,title='',body='';
  if(selectedType==='prevent'){
    const values=['checkup-months','bmi-risk','metric-risk'].map(id=>document.getElementById(id).value);
    complete=values.every(Boolean); eligible=values.every(v=>v==='yes');
    title=eligible?'예방형 대상 가능성이 있어요':'예방형 조건을 모두 충족하지 않았어요';
    body=eligible?'최근 검진 시기와 BMI, 혈압·공복혈당 조건상 가능성이 있습니다. 거주지역 등 추가 조건은 공단 대상자 조회에서 최종 확인하세요.':'선택한 내용만으로는 예방형 핵심 조건을 모두 확인하기 어렵습니다. 검진결과표를 확인하거나 공단 공식 대상자 조회를 이용하세요.';
  }else{
    const values=['clinic-program','careplan'].map(id=>document.getElementById(id).value);
    complete=values.every(Boolean); eligible=values.every(v=>v==='yes');
    title=eligible?'관리형 대상 가능성이 있어요':'관리형 참여 상태를 확인해 주세요';
    body=eligible?'참여 의원 등록과 최근 케어플랜 조건상 가능성이 있습니다. The건강보험에서 최종 참여 가능 여부를 확인하세요.':'일차의료 만성질환관리 등록 또는 최근 케어플랜 수립이 확인되어야 합니다. 다니는 의원이나 공단에 문의해 보세요.';
  }
  if(!complete){title='먼저 모든 항목을 선택해 주세요';body='모르는 항목은 “모름”이 포함된 선택지를 고르면 다음 안내를 확인할 수 있습니다.'}
  result.className='check-result'+((eligible&&complete)?'':' warn');
  result.innerHTML='<h3>'+title+'</h3><p>'+body+'</p><a class="result-link" href="https://www.nhis.or.kr/nhis/index.do" target="_blank" rel="noopener">국민건강보험에서 최종 확인 →</a>';
  result.hidden=false; result.scrollIntoView({behavior:'smooth',block:'nearest'});
}
async function handleShare(){
  const data={title:'건강생활실천지원금 대상 확인',text:'건강생활실천지원금 예방형·관리형 대상과 신청방법을 확인해 보세요.',url:'https://healthpoint.8949ok.kr/'};
  try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);showToast('링크가 복사되었습니다.')}}catch(e){if(e.name!=='AbortError')showToast('주소창의 링크를 복사해 주세요.')}
}
function showToast(msg){const old=document.querySelector('.share-toast');if(old)old.remove();const t=document.createElement('div');t.className='share-toast';t.textContent=msg;document.body.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),250)},2200)}
