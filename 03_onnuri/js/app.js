// 온누리상품권 연간 혜택 계산기
// 2026-07 공식 기준: 디지털 평시 7% (월 100만 한도) · 지류 5% (월 50만)
// 소득공제: 전통시장 사용분 40%, 전통시장 추가한도 연 100만원
const DEDUCT_RATE = 0.40;
const DEDUCT_CAP = 1000000;   // 전통시장 추가한도 (공제대상액 기준)

const fmt = n => new Intl.NumberFormat('ko-KR').format(Math.round(n));

let sel = { rate: 7, limit: 1000000, label: '디지털 (카드·모바일)', tax: 15 };

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initSidebar === 'function') initSidebar({ relatedTools: ['gicho', 'bokji-subsidy', 'eitc-grant'] });
  document.getElementById('calc-form').addEventListener('submit', calc);
  document.getElementById('btn-share').addEventListener('click', handleShare);

  document.querySelectorAll('#type-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sel.rate = Number(chip.dataset.rate);
      sel.limit = Number(chip.dataset.limit);
      sel.label = chip.dataset.label;
      document.querySelectorAll('#type-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
    });
  });
  document.querySelectorAll('#tax-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sel.tax = Number(chip.dataset.tax);
      document.querySelectorAll('#tax-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
    });
  });

  const monthly = document.getElementById('monthly');
  monthly.addEventListener('input', () => {
    const raw = monthly.value.replace(/[^0-9]/g, '');
    monthly.value = raw ? Number(raw).toLocaleString('ko-KR') : '';
  });
});

function calc(e) {
  e.preventDefault();
  const result = document.getElementById('calc-result');
  const m = Number(document.getElementById('monthly').value.replace(/[^0-9]/g, ''));

  if (!m) {
    result.className = 'check-result warn';
    result.innerHTML = '<h3>월 사용 금액을 입력해 주세요</h3><p>전통시장·상점가에서 한 달에 쓰는 대략적인 금액이면 충분해요.</p>';
    result.hidden = false;
    return;
  }

  // 1) 구매 할인 — 월 한도 내에서만 할인 구매 가능
  const buyable = Math.min(m, sel.limit);
  const over = m - buyable;
  const discountMonth = Math.round(buyable * sel.rate / 100);
  const discountYear = discountMonth * 12;

  // 2) 소득공제 — 연 사용액 × 40%, 전통시장 추가한도 100만원 캡
  const yearSpend = m * 12;
  const deductRaw = Math.round(yearSpend * DEDUCT_RATE);
  const deduct = Math.min(deductRaw, DEDUCT_CAP);
  const capped = deductRaw > DEDUCT_CAP;
  const taxSave = Math.round(deduct * sel.tax / 100);

  const total = discountYear + taxSave;

  let rows = `
    <tr><td>구매 할인 (월)</td><td>${fmt(buyable)} × ${sel.rate}% = <strong>${fmt(discountMonth)}원</strong></td></tr>
    <tr><td>구매 할인 (연)</td><td>${fmt(discountMonth)} × 12 = <strong>${fmt(discountYear)}원</strong></td></tr>
    <tr><td>연 사용액</td><td>${fmt(m)} × 12 = ${fmt(yearSpend)}원</td></tr>
    <tr><td>공제대상액</td><td>${fmt(yearSpend)} × 40% = ${fmt(deductRaw)}원${capped ? ` → 한도 적용 <strong>${fmt(DEDUCT_CAP)}원</strong>` : ''}</td></tr>
    <tr><td>연말정산 절세</td><td>${fmt(deduct)} × ${sel.tax}% = <strong>${fmt(taxSave)}원</strong></td></tr>
    <tr class="total-row"><td>연간 총 혜택</td><td>${fmt(discountYear)} + ${fmt(taxSave)} = <strong>${fmt(total)}원</strong></td></tr>
  `;

  let warns = '';
  if (over > 0) {
    warns += `<p class="calc-note">⚠️ 월 사용액이 ${sel.label} 구매한도(${fmt(sel.limit)}원)를 넘어요. 초과 ${fmt(over)}원은 할인 없이 다른 수단으로 결제한다고 가정했어요. 명절 기간엔 디지털 한도가 200만원으로 늘어납니다.</p>`;
  }
  warns += `<p class="calc-note">💡 설·추석 명절 판매 기간(10% 할인)에 구매하면 연 할인이 최대 ${fmt(Math.round(buyable * 0.10) * 12)}원까지 늘어날 수 있어요. 상품권 유효기간은 5년이라 미리 사둬도 됩니다.</p>`;

  result.className = 'check-result';
  result.innerHTML = `<h3>${sel.label} · 월 ${fmt(m)}원 사용 기준</h3>
    <div class="table-wrap"><table class="result-table">
      <thead><tr><th>항목</th><th>계산식</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    ${warns}
    <p class="calc-note">소득공제는 총급여 25% 초과 사용분부터 적용되는 참고용 계산이에요. 지방소득세(10%)까지 더하면 실제 효과는 조금 더 큽니다.</p>
    <a class="result-link" href="https://onnuri.gift/place" target="_blank" rel="noopener">온누리플레이스에서 우리 동네 사용처 확인 →</a>`;
  result.hidden = false;
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function handleShare() {
  const data = {
    title: '온누리상품권 할인 계산기 2026',
    text: '온누리상품권 구매 할인 + 소득공제 40%, 1년에 얼마나 아끼는지 바로 계산해 보세요.',
    url: 'https://onnuri.8949ok.kr/',
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
