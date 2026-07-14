// 에너지바우처 자격·금액 확인 (2026 기준)
// 대상 = 급여 수급(소득기준) AND 세대원 특성기준 둘 다 충족
const AMOUNT = { 1: 295200, 2: 407500, 3: 532700, 4: 701300 };
const TRAIT_LABEL = { senior: '노인', baby: '영유아', disabled: '장애인', pregnant: '임산부', ill: '중증·희귀질환자' };
const fmt = n => new Intl.NumberFormat('ko-KR').format(Math.round(n)) + '원';

let income = '', size = 0;
const traits = new Set();

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initSidebar === 'function') initSidebar({ relatedTools: ['gicho', '21_median-income-calculator', 'healthpoint', 'eitc-grant'] });
  document.getElementById('check-form').addEventListener('submit', check);
  document.getElementById('btn-share').addEventListener('click', handleShare);

  document.querySelectorAll('#income-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      income = chip.dataset.income;
      document.querySelectorAll('#income-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
    });
  });
  document.querySelectorAll('#trait-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const t = chip.dataset.trait;
      if (traits.has(t)) { traits.delete(t); chip.classList.remove('active'); }
      else { traits.add(t); chip.classList.add('active'); }
    });
  });
  document.querySelectorAll('#size-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      size = Number(chip.dataset.size);
      document.querySelectorAll('#size-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
    });
  });
});

function check(e) {
  e.preventDefault();
  const result = document.getElementById('check-result');

  if (!income || !size) {
    result.className = 'check-result warn';
    result.innerHTML = '<h3>① 급여 수급 여부와 ③ 가구원 수를 선택해 주세요</h3><p>세대원 특성(②)은 해당하는 것을 모두 골라주세요.</p>';
    result.hidden = false;
    return;
  }

  const hasIncome = income === 'yes';
  const hasTrait = traits.size > 0;
  const eligible = hasIncome && hasTrait;
  const amount = AMOUNT[size];
  const traitTxt = [...traits].map(t => TRAIT_LABEL[t]).join('·') || '없음';

  let body;
  if (eligible) {
    body = `<h3>✅ 에너지바우처 대상 가능성이 높아요</h3>
      <p class="benefit-picked">급여 수급 O · 세대원 특성 [${traitTxt}] · ${size === 4 ? '4인 이상' : size + '인'} 가구</p>
      <div class="table-wrap"><table class="result-table">
        <thead><tr><th>항목</th><th>내용</th></tr></thead>
        <tbody>
          <tr><td>소득기준</td><td>생계·의료·주거·교육급여 수급 ✅</td></tr>
          <tr><td>세대원 특성</td><td>${traitTxt} ✅</td></tr>
          <tr class="total-row"><td>예상 지원금</td><td><strong>${fmt(amount)}</strong> (냉·난방 통합)</td></tr>
        </tbody>
      </table></div>
      <p class="calc-note">신청 기간은 6/15~12/31이에요. 대상자라도 신청하지 않으면 지원되지 않으니 기간 내에 꼭 신청하세요.</p>
      <a class="result-link" href="https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00000072" target="_blank" rel="noopener">복지로에서 온라인 신청하기 →</a>`;
  } else {
    const reasons = [];
    if (!hasIncome) reasons.push('생계·의료·주거·교육급여 수급자가 아니에요');
    if (!hasTrait) reasons.push('세대원 특성기준(노인·영유아·장애인·임산부·중증질환자)에 해당하는 분이 없어요');
    body = `<h3>지금 선택으로는 대상 조건을 모두 충족하지 않아요</h3>
      <ul style="margin:10px 0 0;padding-left:18px">${reasons.map(r => `<li style="margin:5px 0;color:#5c6f7a;font-size:14px">${r}</li>`).join('')}</ul>
      <p class="calc-note">에너지바우처는 소득기준과 세대원 특성기준을 <strong>모두</strong> 충족해야 해요. 소득이 적은 편이라면 기초생활수급 자격부터 확인해 보세요.</p>
      <a class="result-link" href="https://gicho.8949ok.kr/" target="_blank">기초생활수급 자격 확인하기 →</a>`;
  }

  result.className = 'check-result' + (eligible ? '' : ' warn');
  result.innerHTML = body;
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function handleShare() {
  const data = {
    title: '에너지바우처 신청자격·금액 확인 2026',
    text: '냉방비 지원 에너지바우처, 나도 대상인지 30초에 확인해 보세요.',
    url: 'https://energy.8949ok.kr/',
  };
  try {
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(data.url); showToast('링크가 복사되었습니다.'); }
  } catch (e) { if (e.name !== 'AbortError') showToast('주소창의 링크를 복사해 주세요.'); }
}

function showToast(msg) {
  const old = document.querySelector('.share-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.className = 'share-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, 2200);
}
