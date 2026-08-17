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
  if (['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
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

// Conteúdo interativo de dashboards
const dashboards = {
  engenharia: {
    kpis: [['Avanço físico','68%','+4,2 p.p.'],['Custo comprometido','R$ 8,4 mi','78% do orçamento'],['Desvio previsto','-2,1%','em monitoramento']],
    question: 'A obra está avançando no ritmo planejado e dentro do custo esperado?',
    metrics: [['Curva S','Planejado x Realizado'],['Medições','Status e saldo'],['Orçamento','Realizado + A realizar'],['Suprimentos','Pendências críticas']],
    bars: [42,58,51,70,64,79,73,88]
  },
  financeiro: {
    kpis: [['Caixa projetado','R$ 4,2 mi','próx. 90 dias'],['A receber','R$ 7,8 mi','carteira ativa'],['Vencido','R$ 312 mil','prioridade']],
    question: 'A empresa terá caixa suficiente para cumprir compromissos futuros?',
    metrics: [['Fluxo de caixa','Previsto x Realizado'],['Inadimplência','Evolução'],['Pagamentos','Curto prazo'],['Recebimentos','Curto prazo']],
    bars: [65,58,71,62,74,68,81,77]
  },
  comercial: {
    kpis: [['Leads','1.284','mês'],['Conversão','6,8%','funil total'],['VGV vendido','R$ 12,6 mi','acumulado']],
    question: 'O funil comercial está gerando volume suficiente para atingir a meta de vendas?',
    metrics: [['Origem','Leads por canal'],['Visitas','Agendado x realizado'],['Vendas','Meta x Realizado'],['Estoque','Unidades disponíveis']],
    bars: [28,46,52,67,58,79,86,74]
  },
  marketing: {
    kpis: [['Investimento','R$ 185 mil','período'],['CPL','R$ 144','médio'],['VGV atribuído','R$ 6,9 mi','campanhas']],
    question: 'Quais campanhas realmente contribuem para oportunidades e vendas?',
    metrics: [['Canais','Eficiência'],['Campanhas','Retorno'],['Custo','Por oportunidade'],['Vendas','Origem']],
    bars: [38,62,49,73,55,84,67,91]
  },
  projetos: {
    kpis: [['Projetos ativos','18','portfólio'],['No prazo','72%','status'],['Riscos críticos','3','ação necessária']],
    question: 'Quais projetos exigem decisão executiva antes de impactarem prazo ou custo?',
    metrics: [['Marcos','Próximos 30 dias'],['Riscos','Severidade'],['Responsáveis','Pendências'],['Prazo','Desvios']],
    bars: [70,55,78,66,82,61,87,75]
  },
  logistica: {
    kpis: [['SLA expedição','96,2%','período'],['Ocupação','81%','armazenagem'],['Divergência','0,7%','inventário']],
    question: 'Onde o fluxo logístico está consumindo tempo e capacidade acima do esperado?',
    metrics: [['Recebimento','Lead time'],['Separação','Produtividade'],['Inventário','Acuracidade'],['Expedição','SLA']],
    bars: [53,67,72,60,78,83,76,92]
  }
};

const dashboardContent = document.getElementById('dashboardContent');
function renderDashboard(key) {
  const d = dashboards[key];
  dashboardContent.innerHTML = `
    <div class="dash-main">
      <div class="kpi-row">${d.kpis.map(k => `<div class="kpi"><small>${k[0]}</small><strong>${k[1]}</strong><em>${k[2]}</em></div>`).join('')}</div>
      <div class="chart-card"><h4>Tendência / evolução</h4><div class="fake-chart">${d.bars.map(v => `<span style="height:${v}%"></span>`).join('')}</div></div>
    </div>
    <div class="dash-side">
      <div class="decision-box"><small>PERGUNTA QUE O PAINEL PRECISA RESPONDER</small><strong>${d.question}</strong></div>
      <div class="chart-card"><h4>Indicadores-chave</h4><div class="metric-list">${d.metrics.map(m => `<div><span>${m[0]}</span><b>${m[1]}</b></div>`).join('')}</div></div>
    </div>`;
}
renderDashboard('engenharia');
document.querySelectorAll('.dash-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  renderDashboard(tab.dataset.tab);
}));

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

// Canvas ambiente discreto — adaptado para desktop e mobile
const canvas = document.getElementById('ambientCanvas');
const ctx = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');
let points = [];
let ambientFrame = 0;
let resizeTimer = 0;

function resizeCanvas() {
  if (!ctx || reducedMotion.matches) return;
  const dpr = Math.min(window.devicePixelRatio || 1, innerWidth < 740 ? 1.25 : 1.75);
  canvas.width = Math.max(1, Math.floor(innerWidth * dpr));
  canvas.height = Math.max(1, Math.floor(innerHeight * dpr));
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const density = innerWidth < 480 ? 55 : innerWidth < 900 ? 42 : 30;
  const maxPoints = innerWidth < 740 ? 20 : innerWidth < 1200 ? 30 : 42;
  points = Array.from({ length: Math.min(maxPoints, Math.max(10, Math.floor(innerWidth / density))) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * (coarsePointer.matches ? .10 : .16),
    vy: (Math.random() - .5) * (coarsePointer.matches ? .10 : .16)
  }));
}

function drawAmbient() {
  if (!ctx || reducedMotion.matches || document.hidden) {
    ambientFrame = 0;
    return;
  }
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  ctx.fillStyle = '#0fa3a0';
  points.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, innerWidth < 740 ? .9 : 1.2, 0, Math.PI * 2);
    ctx.fill();
  });

  const connectDistance = innerWidth < 740 ? 82 : 110;
  ctx.strokeStyle = 'rgba(15,163,160,.18)';
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const d = Math.hypot(dx, dy);
      if (d < connectDistance) {
        ctx.globalAlpha = 1 - d / connectDistance;
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[j].x, points[j].y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  ambientFrame = requestAnimationFrame(drawAmbient);
}

function startAmbient() {
  if (reducedMotion.matches || ambientFrame) return;
  resizeCanvas();
  ambientFrame = requestAnimationFrame(drawAmbient);
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeCanvas, 120);
}, { passive: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (ambientFrame) cancelAnimationFrame(ambientFrame);
    ambientFrame = 0;
  } else {
    startAmbient();
  }
});

reducedMotion.addEventListener?.('change', () => {
  if (reducedMotion.matches) {
    if (ambientFrame) cancelAnimationFrame(ambientFrame);
    ambientFrame = 0;
    canvas.style.display = 'none';
  } else {
    canvas.style.display = '';
    startAmbient();
  }
});

startAmbient();

// Exibe a primeira seção sem aguardar o observer
sections[0].querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
