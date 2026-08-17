const sections = [...document.querySelectorAll('.slide')];
const nav = document.getElementById('slideNav');
const railProgress = document.getElementById('railProgress');
const toast = document.getElementById('toast');

// Navegação executiva por seções
sections.forEach((section, index) => {
  const btn = document.createElement('button');
  btn.className = 'nav-dot';
  btn.type = 'button';
  btn.setAttribute('aria-label', section.dataset.label || `Seção ${index + 1}`);
  btn.addEventListener('click', () => section.scrollIntoView({ behavior: 'smooth' }));
  nav.appendChild(btn);
});
const navDots = [...nav.children];

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = sections.indexOf(entry.target);
      navDots.forEach((d, i) => d.classList.toggle('active', i === index));
      railProgress.style.height = `${((index + 1) / sections.length) * 100}%`;
      entry.target.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      entry.target.querySelectorAll('.counter').forEach(animateCounter);
    }
  });
}, { threshold: 0.12, rootMargin: '-6% 0px -6% 0px' });
sections.forEach(section => observer.observe(section));

function currentSectionIndex() {
  const mid = window.scrollY + window.innerHeight * 0.45;
  let closest = 0;
  sections.forEach((s, i) => { if (s.offsetTop <= mid) closest = i; });
  return closest;
}
function goToIndex(i) {
  const safe = Math.max(0, Math.min(sections.length - 1, i));
  sections[safe].scrollIntoView({ behavior: 'smooth' });
}
window.addEventListener('keydown', (e) => {
  if (['INPUT','TEXTAREA','BUTTON','A','SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
  const i = currentSectionIndex();
  if (['ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); goToIndex(i + 1); }
  if (['ArrowUp','PageUp'].includes(e.key)) { e.preventDefault(); goToIndex(i - 1); }
  if (e.key === 'Home') { e.preventDefault(); goToIndex(0); }
  if (e.key === 'End') { e.preventDefault(); goToIndex(sections.length - 1); }
});

// Contadores
function animateCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = Number(el.dataset.target || 0);
  const start = performance.now();
  const duration = 900;
  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Fallbacks das fotos quando o arquivo não estiver presente
function setupImageFallback(img, fallback) {
  const fail = () => { img.style.display = 'none'; fallback.style.display = 'grid'; };
  img.addEventListener('error', fail);
  if (img.complete && img.naturalWidth === 0) fail();
}
setupImageFallback(document.getElementById('profilePhoto'), document.getElementById('photoFallback'));
document.querySelectorAll('.secondaryPhoto').forEach((img, i) => setupImageFallback(img, document.querySelectorAll('.secondaryFallback')[i]));

// Analytics Command Center — dashboards publicados incorporados via um único iframe
const embeddedDashboards = {
  engenharia: {
    number: '01',
    title: 'Engenharia',
    area: 'OPERAÇÃO & ENGENHARIA',
    url: 'https://gustavoanalytics.github.io/dashboard-engenharia/',
    description: 'Planejado x realizado, avanço físico, custo, medições e tendência da obra.',
    question: 'A obra está evoluindo no ritmo e custo planejados?',
    focus: 'Prazo + Custo',
    kpis: 'Curva S • Medições • Tendência',
    audience: 'Diretoria & Engenharia'
  },
  comercial: {
    number: '02',
    title: 'Comercial',
    area: 'VENDAS & RECEITA',
    url: 'https://gustavoanalytics.github.io/dashboard-comercial/',
    description: 'Da reserva à venda, com estoque, VGV, corretores, imobiliárias, repasses e pro soluto.',
    question: 'Estamos transformando estoque em vendas e VGV na velocidade necessária?',
    focus: 'Venda + VGV',
    kpis: 'Reservas • VSO • Repasses',
    audience: 'Diretoria & Comercial'
  },
  financeiro: {
    number: '03',
    title: 'Financeiro',
    area: 'FINANÇAS & CONTROLADORIA',
    url: 'https://gustavoanalytics.github.io/dashboard-financeiro/',
    description: 'Caixa, budget, DRE, capital de giro, contas a pagar/receber e previsão financeira.',
    question: 'A operação gera caixa e resultado suficientes para sustentar o plano?',
    focus: 'Caixa + Resultado',
    kpis: 'DRE • Budget • Forecast',
    audience: 'Diretoria & Financeiro'
  },
  marketing: {
    number: '04',
    title: 'Marketing',
    area: 'AQUISIÇÃO & CONVERSÃO',
    url: 'https://gustavoanalytics.github.io/dashboard-marketing/',
    description: 'Investimento, mídia paga, offline, eventos, leads, reservas, vendas e retorno sobre VGV.',
    question: 'O investimento em marketing está virando demanda, reserva e venda?',
    focus: 'CAC + Conversão',
    kpis: 'Leads • ROI • VGV',
    audience: 'Diretoria & Marketing'
  },
  projetos: {
    number: '05',
    title: 'Projetos',
    area: 'INCORPORAÇÃO & DESENVOLVIMENTO',
    url: 'https://gustavoanalytics.github.io/dashboard-projetos-/',
    description: 'Pipeline de incorporação, aprovações, marcos, riscos e prontidão para lançamento.',
    question: 'Quais projetos estão prontos para avançar e quais podem comprometer o lançamento?',
    focus: 'Prazo + Gate',
    kpis: 'Pipeline • Marcos • Riscos',
    audience: 'Diretoria & Incorporação'
  },
  viabilidade: {
    number: '06',
    title: 'Viabilidade',
    area: 'INVESTIMENTO & RENTABILIDADE',
    url: 'https://gustavoanalytics.github.io/-dashboard-viabilidade/',
    description: 'Comparação entre viabilidade prospectada, aprovada e executiva, com VGV, custos e margem.',
    question: 'O projeto continua entregando a rentabilidade que justificou o investimento?',
    focus: 'Margem + Retorno',
    kpis: 'VGV • Custos • Contribuição',
    audience: 'Diretoria & Incorporação'
  }
};

const dashboardOrder = Object.keys(embeddedDashboards);
const dashboardIframe = document.getElementById('dashboardIframe');
const dashboardFrameShell = document.getElementById('dashboardFrameShell');
const embedDashboardNumber = document.getElementById('embedDashboardNumber');
const embedDashboardArea = document.getElementById('embedDashboardArea');
const embedDashboardTitle = document.getElementById('embedDashboardTitle');
const embedDashboardDescription = document.getElementById('embedDashboardDescription');
const embedDashboardQuestion = document.getElementById('embedDashboardQuestion');
const embedDashboardFocus = document.getElementById('embedDashboardFocus');
const embedDashboardKpis = document.getElementById('embedDashboardKpis');
const embedDashboardAudience = document.getElementById('embedDashboardAudience');
const embedDashboardHost = document.getElementById('embedDashboardHost');
const embedDashboardPosition = document.getElementById('embedDashboardPosition');
const embedFallbackLink = document.getElementById('embedFallbackLink');
const embedLoading = document.getElementById('embedLoading');
const embedLoadingTitle = document.getElementById('embedLoadingTitle');
const embedReloadBtn = document.getElementById('embedReloadBtn');
const embedOpenBtn = document.getElementById('embedOpenBtn');
const embedExpandBtn = document.getElementById('embedExpandBtn');
const embedPrevBtn = document.getElementById('embedPrevBtn');
const embedNextBtn = document.getElementById('embedNextBtn');
let activeEmbeddedDashboard = sessionStorage.getItem('portfolio-dashboard') || 'engenharia';
let embedLoadTimer;

function setEmbeddedLoading(isLoading, title) {
  if (!embedLoading) return;
  if (title && embedLoadingTitle) embedLoadingTitle.textContent = title;
  embedLoading.classList.toggle('show', isLoading);
}

function cleanDashboardHost(url) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '/')
}

function selectEmbeddedDashboard(key, options = {}) {
  const item = embeddedDashboards[key];
  if (!item || !dashboardIframe) return;
  activeEmbeddedDashboard = key;
  sessionStorage.setItem('portfolio-dashboard', key);

  document.querySelectorAll('.analytics-card').forEach(card => {
    const active = card.dataset.dashboardKey === key;
    card.classList.toggle('active', active);
    card.setAttribute('aria-selected', active ? 'true' : 'false');
    if (active && options.scrollCard && window.innerWidth <= 740) {
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });

  const index = dashboardOrder.indexOf(key);
  if (embedDashboardNumber) embedDashboardNumber.textContent = item.number;
  if (embedDashboardArea) embedDashboardArea.textContent = item.area;
  if (embedDashboardTitle) embedDashboardTitle.textContent = item.title;
  if (embedDashboardDescription) embedDashboardDescription.textContent = item.description;
  if (embedDashboardQuestion) embedDashboardQuestion.textContent = item.question;
  if (embedDashboardFocus) embedDashboardFocus.textContent = item.focus;
  if (embedDashboardKpis) embedDashboardKpis.textContent = item.kpis;
  if (embedDashboardAudience) embedDashboardAudience.textContent = item.audience;
  if (embedDashboardHost) embedDashboardHost.textContent = cleanDashboardHost(item.url);
  if (embedDashboardPosition) embedDashboardPosition.textContent = `${String(index + 1).padStart(2, '0')} / ${String(dashboardOrder.length).padStart(2, '0')}`;
  if (embedFallbackLink) embedFallbackLink.href = item.url;
  dashboardIframe.title = `Dashboard ${item.title}`;

  setEmbeddedLoading(true, `Abrindo cockpit de ${item.title}`);
  clearTimeout(embedLoadTimer);
  dashboardIframe.src = item.url;
  embedLoadTimer = setTimeout(() => setEmbeddedLoading(false), 9000);
}

function stepEmbeddedDashboard(direction) {
  const current = dashboardOrder.indexOf(activeEmbeddedDashboard);
  const next = (current + direction + dashboardOrder.length) % dashboardOrder.length;
  selectEmbeddedDashboard(dashboardOrder[next], { scrollCard: true });
}

document.querySelectorAll('.analytics-card').forEach(card => {
  card.addEventListener('click', () => selectEmbeddedDashboard(card.dataset.dashboardKey, { scrollCard: true }));
});

dashboardIframe?.addEventListener('load', () => {
  clearTimeout(embedLoadTimer);
  setEmbeddedLoading(false);
});

embedReloadBtn?.addEventListener('click', () => {
  const item = embeddedDashboards[activeEmbeddedDashboard];
  setEmbeddedLoading(true, `Atualizando cockpit de ${item.title}`);
  clearTimeout(embedLoadTimer);
  dashboardIframe.src = item.url;
  embedLoadTimer = setTimeout(() => setEmbeddedLoading(false), 9000);
});

embedOpenBtn?.addEventListener('click', () => {
  window.open(embeddedDashboards[activeEmbeddedDashboard].url, '_blank', 'noopener');
});

embedPrevBtn?.addEventListener('click', () => stepEmbeddedDashboard(-1));
embedNextBtn?.addEventListener('click', () => stepEmbeddedDashboard(1));

function setDashboardExpanded(expanded) {
  dashboardFrameShell?.classList.toggle('embed-expanded', expanded);
  document.body.classList.toggle('embed-modal-open', expanded);
  if (embedExpandBtn) {
    embedExpandBtn.innerHTML = expanded ? '× <span>Fechar</span>' : '⛶ <span>Tela cheia</span>';
    embedExpandBtn.setAttribute('aria-label', expanded ? 'Fechar cockpit expandido' : 'Expandir cockpit');
  }
}

embedExpandBtn?.addEventListener('click', () => {
  setDashboardExpanded(!dashboardFrameShell.classList.contains('embed-expanded'));
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && dashboardFrameShell?.classList.contains('embed-expanded')) {
    event.stopImmediatePropagation();
    setDashboardExpanded(false);
  }
}, true);

selectEmbeddedDashboard(embeddedDashboards[activeEmbeddedDashboard] ? activeEmbeddedDashboard : 'engenharia');

// Calculadora de custo de retrabalho
const peopleInput = document.getElementById('peopleInput');
const minutesInput = document.getElementById('minutesInput');
const hourlyInput = document.getElementById('hourlyInput');
const hoursResult = document.getElementById('hoursResult');
const monthResult = document.getElementById('monthResult');
const yearResult = document.getElementById('yearResult');
const calcInsight = document.getElementById('calcInsight');
const money = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0 });
function updateCalculator() {
  const people = Math.max(0, Number(peopleInput.value));
  const minutes = Math.max(0, Number(minutesInput.value));
  const hourly = Math.max(0, Number(hourlyInput.value));
  const workDays = 22;
  const hours = people * minutes / 60 * workDays;
  const monthly = hours * hourly;
  const annual = monthly * 12;
  hoursResult.textContent = `${hours.toFixed(1)} h`;
  monthResult.textContent = money.format(monthly);
  yearResult.textContent = money.format(annual);
  calcInsight.textContent = `Nesse cenário, a empresa consome cerca de ${hours.toFixed(0)} horas por mês apenas nessa rotina. O diagnóstico serve para descobrir quanto desse esforço pode ser eliminado, simplificado ou automatizado.`;
}
[peopleInput, minutesInput, hourlyInput].forEach(el => el.addEventListener('input', updateCalculator));
updateCalculator();

// Print / PDF
const printBtn = document.getElementById('printBtn');
printBtn.addEventListener('click', () => window.print());

// Clipboard
const copySiteBtn = document.getElementById('copySiteBtn');
copySiteBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('https://cruzfarias.com.br');
    showToast('Site copiado');
  } catch {
    showToast('cruzfarias.com.br');
  }
});
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 1800);
}

// Canvas ambiente discreto
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');
let points = [];
function resizeCanvas() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  points = Array.from({length: Math.min(42, Math.floor(innerWidth/30))}, () => ({
    x: Math.random()*innerWidth,
    y: Math.random()*innerHeight,
    vx:(Math.random()-.5)*.16,
    vy:(Math.random()-.5)*.16
  }));
}
function drawAmbient() {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  ctx.fillStyle = '#0fa3a0';
  points.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x<0||p.x>innerWidth) p.vx *= -1;
    if (p.y<0||p.y>innerHeight) p.vy *= -1;
    ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2); ctx.fill();
  });
  ctx.strokeStyle = 'rgba(15,163,160,.18)';
  for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++){
    const dx=points[i].x-points[j].x, dy=points[i].y-points[j].y, d=Math.hypot(dx,dy);
    if(d<110){ctx.globalAlpha=1-d/110;ctx.beginPath();ctx.moveTo(points[i].x,points[i].y);ctx.lineTo(points[j].x,points[j].y);ctx.stroke();}
  }
  ctx.globalAlpha=1;
  requestAnimationFrame(drawAmbient);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); drawAmbient();

// Exibe a primeira seção sem aguardar o observer
sections[0].querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
