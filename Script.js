const CORES = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];
const ORDEM_TIPOS = ['Universal', 'publica', 'publicaNegro', 'Negro', 'PCD'];

const fmtMoeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

function hexParaRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function totais(tipoCota) {
  return tipoCota.reduce(
    (acc, t) => ({ candidatos: acc.candidatos + (t.candidatos || 0), vagas: acc.vagas + (t.vagas || 0) }),
    { candidatos: 0, vagas: 0 }
  );
}

function anosDoCurso(curso) {
  return [...curso.cotas].sort((a, b) => a.ano - b.ano).map((c) => String(c.ano));
}

function todosOsAnos() {
  const anos = new Set();
  db.cursos.forEach((c) => c.cotas.forEach((co) => anos.add(co.ano)));
  return [...anos].sort((a, b) => a - b).map(String);
}

function datasetsDoCurso(curso, anos) {
  const porAno = {};
  curso.cotas.forEach((c) => (porAno[String(c.ano)] = c.tipoCota));

  const tiposDoCurso = ORDEM_TIPOS.filter((tipo) => curso.cotas.some((c) => c.tipoCota.some((t) => t.tipo === tipo)));

  return tiposDoCurso.map((tipo, i) => {
    const cor = CORES[i % CORES.length];
    return {
      label: tipo,
      data: anos.map((ano) => (porAno[ano] || []).find((t) => t.tipo === tipo)?.candidatos ?? 0),
      borderColor: cor,
      backgroundColor: hexParaRgba(cor, 0.08),
      fill: false,
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
    };
  });
}

function criarGrafico(canvasId, titulo, anos, datasets) {
  const el = document.getElementById(canvasId);
  if (!el) return null;
  return new Chart(el, {
    type: 'line',
    data: { labels: anos, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: titulo, font: { size: 16, weight: '600' } },
        legend: { position: 'top' },
        tooltip: { mode: 'index', intersect: false },
      },
      interaction: { mode: 'nearest', intersect: false },
      scales: {
        x: { title: { display: true, text: 'Anos' } },
        y: { title: { display: true, text: 'Candidatos' }, beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  });
}

const GRAFICOS = {};

function criarGraficos() {
  const anos = todosOsAnos();
  db.cursos.forEach((curso, i) => {
    const titulo = `${curso.nome} — Candidatos por tipo de cota (${anos[0]}–${anos[anos.length - 1]})`;
    GRAFICOS[i + 1] = criarGrafico(`chart-${i + 1}`, titulo, anos, datasetsDoCurso(curso, anos));
  });
}

const ANALISES_GRAFICOS = {
  1: `
    <h6><i class="bi bi-graph-up me-1"></i>Educação Física - Bacharelado — Análise detalhada</h6>
    <p>A concorrência do curso caiu de forma acentuada ao longo da série: começou em <strong>12,1 candidatos/vaga em 2016</strong> (o pico) e chegou ao ponto mais baixo em <strong>2023, com 3,5</strong>, antes de uma leve recuperação para 5,4 em 2025. Parte importante dessa queda se explica pela oferta: o número de vagas quase dobrou no período, saindo de 18 para 33 (<strong>+83%</strong>), com saltos visíveis em 2020, 2022 e 2023.</p>
    <p>Apesar da concorrência menor, a <strong>nota mínima da cota Universal subiu de forma constante</strong>, de 2.633 para 3.554 pontos (<strong>+35%</strong>) — um movimento praticamente oposto ao da concorrência. Isso indica que, mesmo com menos candidatos por vaga, o nível de preparo de quem disputa o curso vem aumentando ano a ano.</p>
    <p>As cotas afirmativas (Negro, PCD e Pública+Negro) começaram a aparecer de forma mais consistente a partir de <strong>2021</strong>, refletindo a ampliação das políticas de cotas na UEPG nesse período — antes disso, o curso operava basicamente com as cotas Universal, Escola Pública e Negro.</p>
    <p>No mercado de trabalho, o salário médio subiu 60% no período (R$ 2.000 → R$ 3.200), um crescimento moderado se comparado aos demais cursos analisados.</p>
  `,
  2: `
    <h6><i class="bi bi-graph-up me-1"></i>Engenharia de Software — Análise detalhada</h6>
    <p>Este é o curso mais volátil do grupo: a concorrência varia de <strong>5,7 candidatos/vaga em 2018</strong> (quando as vagas dobraram de 15 para 30) até um pico de <strong>18,2 em 2021</strong>, o maior valor registrado em qualquer curso/ano da série — coincidindo com a explosão de contratações no setor de tecnologia durante e após a pandemia. Desde então a concorrência se mantém elevada e estável, fechando 2025 em 15,6.</p>
    <p>A <strong>nota mínima da cota Universal é a que mais cresceu entre os quatro cursos</strong>: saltou de 3.158 para 4.706 pontos (<strong>+49%</strong>), reforçando que o curso está atraindo candidatos cada vez mais qualificados, mesmo com o número de vagas quase estável.</p>
    <p>É também o curso com <strong>maior expansão de cotas afirmativas</strong>: a cota Negro, inexistente até 2017, cresceu de 5 candidatos em 2018 para 16 em 2025, e a cota Pública praticamente dobrou de candidatos no mesmo período (86 → 156).</p>
    <p>No aspecto salarial, é disparado o destaque: <strong>+175% de crescimento</strong> (R$ 4.000 → R$ 11.000), o maior entre todos os cursos — o que ajuda a explicar por que é o único curso com concorrência crescente na década.</p>
  `,
  3: `
    <h6><i class="bi bi-graph-up me-1"></i>Zootecnia — Análise detalhada</h6>
    <p>É o curso menos concorrido do grupo durante praticamente toda a série, com média de <strong>6,0 candidatos/vaga</strong>. A concorrência caiu de forma consistente, do pico em <strong>2017 (9,8)</strong> até o mínimo em <strong>2023 (3,1)</strong>, com recuperação parcial para 4,8 em 2025.</p>
    <p>A oferta de vagas quase dobrou (16 → 27, <strong>+69%</strong>), o que ajuda a explicar a queda relativa na concorrência mesmo com o número absoluto de candidatos oscilando pouco (entre 104 e 166 ao longo dos anos).</p>
    <p>A <strong>nota mínima da cota Universal cresceu de forma mais modesta</strong> que nos demais cursos: de 2.705 para 3.380 (<strong>+25%</strong>), o menor crescimento percentual do grupo, condizente com a menor pressão competitiva.</p>
    <p>É também o curso com a <strong>presença mais tímida de cotas afirmativas</strong>: PCD só aparece a partir de 2022 e com números muito baixos (0 a 2 candidatos por ano), e Pública+Negro nunca ultrapassa 5 candidatos em um mesmo ano.</p>
    <p>Ainda assim, o salário médio cresceu 71,4% no período (R$ 3.500 → R$ 6.000), superando a valorização salarial de Educação Física e Odontologia — um contraste interessante entre baixa concorrência e retorno financeiro relativamente bom.</p>
  `,
  4: `
    <h6><i class="bi bi-graph-up me-1"></i>Odontologia — Análise detalhada</h6>
    <p>Historicamente o curso mais concorrido da UEPG: chegou a <strong>25,6 candidatos/vaga em 2016</strong>, o maior valor entre todos os cursos e anos analisados. A concorrência caiu de forma acentuada e praticamente ininterrupta até <strong>2023 (6,0)</strong>, com leve recuperação para 9,5 em 2025 — uma queda total de <strong>-62,7%</strong>, a maior do grupo.</p>
    <p>Parte da explicação está na oferta: as vagas cresceram 50% (22 → 33), com destaque para o salto em 2020 (45 vagas). Ainda assim, mesmo em queda, Odontologia segue sendo o curso mais disputado em termos absolutos em 2025.</p>
    <p>Um dado chama atenção: a <strong>nota mínima da cota Universal praticamente não se moveu</strong> (3.966 → 4.414, apenas <strong>+11,3%</strong>, o menor crescimento entre os quatro cursos) — mesmo com a concorrência caindo pela metade. Isso sugere que a nota de corte do curso já operava perto de um teto historicamente alto, sustentado por um público extremamente concorrido mesmo quando o volume de candidatos diminui.</p>
    <p>As cotas Negro e PCD são as <strong>mais recentes entre os quatro cursos</strong>, aparecendo somente a partir de 2022 — um indício de que a ampliação de políticas afirmativas chegou mais tarde a esse curso.</p>
    <p>No aspecto salarial, o crescimento foi o <strong>mais baixo do grupo (+42,9%)</strong>, o que, combinado à forte queda de concorrência, indica uma possível reacomodação do interesse pelo curso ao longo da década.</p>
  `,
};

function alternarExpansaoGrafico(indice) {
  const col = document.getElementById(`chart-col-${indice}`);
  const wrap = document.getElementById(`chart-wrap-${indice}`);
  const analise = document.getElementById(`chart-analise-${indice}`);
  if (!col || !wrap || !analise) return;

  const vaiExpandir = !col.classList.contains('col-12');

  if (vaiExpandir) {
    col.classList.remove('col-lg-6');
    col.classList.add('col-12');
    wrap.classList.add('expandido');
    if (!analise.innerHTML) analise.innerHTML = ANALISES_GRAFICOS[indice] || '';
    analise.classList.remove('d-none');
  } else {
    col.classList.remove('col-12');
    col.classList.add('col-lg-6');
    wrap.classList.remove('expandido');
    analise.classList.add('d-none');
  }

  requestAnimationFrame(() => {
    GRAFICOS[indice]?.resize();
  });
}

function configurarExpansaoGraficos() {
  db.cursos.forEach((_, i) => {
    const card = document.getElementById(`chart-card-${i + 1}`);
    if (!card) return;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.chart-analise')) return; // clique dentro do texto não recolhe
      alternarExpansaoGrafico(i + 1);
    });
  });
}

function notaMinimaDoAno(tipoCota) {
  const universal = tipoCota.find((t) => t.tipo === 'Universal');
  if (universal?.notaMinima) return universal.notaMinima;
  const publica = tipoCota.find((t) => t.tipo === 'publica');
  if (publica?.notaMinima) return publica.notaMinima;
  return Math.max(0, ...tipoCota.map((t) => t.notaMinima || 0));
}

function renderTabela(filtro = 'todos') {
  const tbody = document.querySelector('#tabela-dados tbody');
  tbody.innerHTML = '';

  const cursos = filtro === 'todos' ? db.cursos : db.cursos.filter((c) => String(c.id) === filtro);

  cursos.forEach((curso) => {
    anosDoCurso(curso).forEach((ano) => {
      const entrada = curso.cotas.find((c) => String(c.ano) === ano);
      const { candidatos, vagas } = totais(entrada.tipoCota);
      const ratio = vagas ? candidatos / vagas : 0;
      const nota = notaMinimaDoAno(entrada.tipoCota);
      const salario = curso.salarioPorAno[ano];

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${ano}</td>
        <td>${curso.nome}</td>
        <td>${candidatos}</td>
        <td>${vagas}</td>
        <td>${vagas ? ratio.toFixed(1) : '—'}</td>
        <td>${nota || '—'}</td>
        <td>${salario ? fmtMoeda(salario) : '—'}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

function popularFiltroCursos() {
  const sel = document.getElementById('filtroCurso');
  db.cursos.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = String(c.id);
    opt.textContent = c.nome;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => renderTabela(sel.value));
}

function renderKpis() {
  const anos = todosOsAnos();
  const ultimoAno = anos[anos.length - 1];

  const ratiosUltimoAno = db.cursos
    .map((c) => c.cotas.find((co) => String(co.ano) === ultimoAno))
    .filter(Boolean)
    .map((entrada) => {
      const { candidatos, vagas } = totais(entrada.tipoCota);
      return vagas ? candidatos / vagas : null;
    })
    .filter((v) => v !== null);

  const mediaUltimoAno = ratiosUltimoAno.length
    ? (ratiosUltimoAno.reduce((a, b) => a + b, 0) / ratiosUltimoAno.length).toFixed(2)
    : '—';

  const kpis = [
    { title: 'Cursos analisados', value: db.cursos.length, icon: 'bi-book' },
    { title: 'Último ano nos dados', value: ultimoAno, icon: 'bi-calendar' },
    { title: 'Média candidatos/vaga (último ano)', value: mediaUltimoAno, icon: 'bi-people' },
  ];

  document.getElementById('kpi-row').innerHTML = kpis
    .map(
      (k) => `
      <div class="col-12 col-md-4">
        <div class="card shadow-sm">
          <div class="card-body d-flex align-items-center gap-3">
            <div class="kpi-icon bg-primary text-white"><i class="${k.icon} fs-4"></i></div>
            <div>
              <div class="small text-muted">${k.title}</div>
              <div class="h5 mb-0">${k.value}</div>
            </div>
          </div>
        </div>
      </div>`
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!db?.cursos?.length) throw new Error('Dados ausentes em `db`');

    renderKpis();
    popularFiltroCursos();
    renderTabela();
    criarGraficos();
    configurarExpansaoGraficos();
  } catch (err) {
    console.error('Erro ao inicializar:', err);
    const main = document.querySelector('main.container');
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger';
    alerta.textContent = 'Erro ao carregar os dados. Veja o console do navegador para mais detalhes.';
    main.prepend(alerta);
  }
});