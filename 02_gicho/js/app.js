// 2026년 기준 중위소득 (보건복지부 제77차 중앙생활보장위원회 의결 · 원/월)
const MEDIAN_2026 = { 1: 2564238, 2: 4199292, 3: 5359036, 4: 6494738, 5: 7556719, 6: 8555952 };
// 급여별 선정기준 비율 (2026년, 전년 동일)
const BENEFITS = [
  { key: 'saenggye', label: '생계급여', rate: 0.32, note: '기준액 − 소득인정액 = 월 지급액' },
  { key: 'uiryo', label: '의료급여', rate: 0.40, note: '부양의무자 기준 별도 적용' },
  { key: 'jugeo', label: '주거급여', rate: 0.48, note: '부양의무자 기준 없음' },
  { key: 'gyoyuk', label: '교육급여', rate: 0.50, note: '부양의무자 기준 없음' },
];

const fmt = n => new Intl.NumberFormat('ko-KR').format(Math.round(n));

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initSidebar === 'function') initSidebar({ relatedTools: ['bokji-subsidy', 'healthpoint', 'eitc-grant'] });
  buildStdTable();
  document.getElementById('check-form').addEventListener('submit', checkEligibility);
  document.getElementById('btn-share').addEventListener('click', handleShare);
  // 소득 입력 콤마 자동
  const income = document.getElementById('income');
  income.addEventListener('input', () => {
    const raw = income.value.replace(/[^0-9]/g, '');
    income.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
  });
});

function buildStdTable() {
  const tbody = document.getElementById('std-table-body');
  let html = '';
  for (let n = 1; n <= 6; n++) {
    const m = MEDIAN_2026[n];
    html += `<tr><td>${n}인</td><td>${fmt(m)}</td>` +
      BENEFITS.map(b => `<td>${fmt(m * b.rate)}</td>`).join('') + '</tr>';
  }
  tbody.innerHTML = html;
}

function checkEligibility(e) {
  e.preventDefault();
  const result = document.getElementById('check-result');
  const size = Number(document.getElementById('household-size').value);
  const income = Number(document.getElementById('income').value.replace(/[^0-9]/g, ''));

  if (!size || !document.getElementById('income').value.trim()) {
    result.className = 'check-result warn';
    result.innerHTML = '<h3>가구원 수와 소득인정액을 입력해 주세요</h3><p>소득인정액을 모르면 대략적인 월소득을 입력해 보세요. 실제 심사는 재산까지 반영되므로 참고용입니다.</p>';
    result.hidden = false;
    return;
  }

  const median = MEDIAN_2026[size];
  let rows = '';
  let anyPass = false;
  for (const b of BENEFITS) {
    const threshold = Math.round(median * b.rate);
    const pass = income <= threshold;
    if (pass) anyPass = true;
    const gap = Math.abs(threshold - income);
    rows += `<tr class="${pass ? 'pass' : 'fail'}">
      <td>${b.label}</td>
      <td>${fmt(median)} × ${Math.round(b.rate * 100)}% = <strong>${fmt(threshold)}원</strong></td>
      <td>${pass ? '✅ 가능성 있음' : '❌ 기준 초과'}</td>
      <td>${pass ? `여유 ${fmt(gap)}원` : `초과 ${fmt(gap)}원`}</td>
    </tr>`;
  }

  // 생계급여 예상액 (자격 가능 시)
  const saenggyeThreshold = Math.round(median * 0.32);
  let extra = '';
  if (income <= saenggyeThreshold) {
    extra = `<p class="calc-note">💰 생계급여 예상 월 지급액: ${fmt(saenggyeThreshold)} − ${fmt(income)} = <strong>${fmt(saenggyeThreshold - income)}원</strong></p>`;
  } else if (income <= Math.round(median * 0.50)) {
    extra = `<p class="calc-note">생계급여 기준은 초과했지만 다른 급여 가능성이 있습니다. 차상위 지원(중위소득 50% 이하)도 함께 알아보세요.</p>`;
  } else {
    extra = `<p class="calc-note">모든 급여 기준을 초과했습니다. 단, 재산 공제·근로소득 30% 공제를 반영한 실제 소득인정액은 입력값보다 낮을 수 있으니 복지로 모의계산을 해보세요.</p>`;
  }

  result.className = 'check-result' + (anyPass ? '' : ' warn');
  result.innerHTML = `<h3>${size}인 가구 · 소득인정액 ${fmt(income)}원 기준 결과</h3>
    <div class="table-wrap"><table class="result-table">
      <thead><tr><th>급여</th><th>계산식 (기준액)</th><th>판정</th><th>차이</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${extra}
    <a class="result-link" href="https://www.bokjiro.go.kr/ssis-tbu/twatza/wlfareInfo/moveTWAT52055M.do" target="_blank" rel="noopener">복지로 모의계산으로 정확히 확인 →</a>`;
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function handleShare() {
  const data = {
    title: '기초생활수급자 자격확인 2026',
    text: '가구원 수와 소득인정액만 입력하면 생계·의료·주거·교육급여 수급 가능성을 바로 확인할 수 있어요.',
    url: 'https://gicho.8949ok.kr/',
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
