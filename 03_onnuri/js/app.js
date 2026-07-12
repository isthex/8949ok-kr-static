const P = 'https://onnuri.gift/place';
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
document.addEventListener('DOMContentLoaded', () => {
  if (typeof initSidebar === 'function') initSidebar({ relatedSites: [{ name: '건강포인트 안내', url: 'https://healthpoint.8949ok.kr/' }, { name: '기초생활수급자 안내', url: 'https://gicho.8949ok.kr/' }], relatedTools: [] });
  const share = document.getElementById('btn-share');
  if (share) share.addEventListener('click', async () => { try { if (navigator.share) await navigator.share({ title: document.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); share.textContent = '주소가 복사되었습니다'; setTimeout(() => { share.textContent = '공유하기'; }, 1600); } } catch (error) {} });
  const form = document.getElementById('finder-form');
  const result = document.getElementById('finder-result');
  if (!form || !result) return;
  const renderResult = () => {
    const data = new FormData(form); const type = data.get('type') || '상품권 형태 미선택'; const place = data.get('place') || '사용 장소 미선택'; const region = String(data.get('region') || '').trim();
    const query = new URLSearchParams(); if (data.get('type')) query.set('type', data.get('type')); if (data.get('place')) query.set('place', data.get('place')); if (region) query.set('region', region); history.replaceState(null, '', query.toString() ? `?${query}` : location.pathname);
    let guide = '/where/'; if (data.get('place') === 'online') guide = '/online/'; else if (data.get('type') === 'paper') guide = '/paper/'; else if (data.get('type') === 'digital') guide = '/digital/';
    result.hidden = false; result.innerHTML = `<strong>${[region || '선택한 조건', type, place].map(esc).join(' · ')}</strong><p>공식 조회에서 최신 정보를 확인한 뒤 매장 또는 결제 화면에서 다시 확인하세요.</p><a href="${guide}">상황별 안내 보기</a> · <a href="${P}" target="_blank" rel="noopener">온누리플레이스 열기</a>`;
  };
  form.addEventListener('submit', event => { event.preventDefault(); renderResult(); });
  const params = new URLSearchParams(location.search);
  ['type', 'place', 'region'].forEach(name => { if (params.get(name) && form.elements[name]) form.elements[name].value = params.get(name); });
  if (params.toString()) renderResult();
});
