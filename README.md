# Concorrência no Vestibular UEPG (2016–2025)

Análise descritiva da concorrência no vestibular da **Universidade Estadual de Ponta Grossa (UEPG)**, com gráfico interativo, tabela de dados filtrável e respostas a questões de análise. Construído em HTML + CSS + JavaScript puro.

## Equipe

-   Guilherme Godoy
-   Antonio Wesley
-   Pedro Nathan
-   Natasha Alexandra

## Estrutura de arquivos

```
.
├── index.html      # Estrutura da página (cabeçalho, gráfico, tabela, Q&A)
├── style.css       # Estilos visuais (cores, layout, responsividade)
├── script.js       # Lógica do gráfico, da tabela e dos filtros
├── database.js     # Base de dados (array `database`) — única fonte de dados

## Cursos analisados

- Odontologia
- Educação Física – Bacharelado
- Engenharia de Software
- Zootecnia

## Funcionalidades

### 1. Gráfico de linha — Candidatos por Vaga por Cota

- Uma linha para cada categoria de cota (Universal, Escola Pública, Negros, Negros em Escola Pública, PCD).
- Eixo X: anos (controlado pelos seletores **Ano inicial** / **Ano final**).
- Eixo Y: candidatos por vaga dentro de cada cota.
- Filtro de **Curso**: ao selecionar um curso, mostra apenas os dados dele; deixando em branco, soma candidatos e vagas de todos os cursos antes de calcular a razão (evita média de médias).

### 2. Tabela de dados

- Lista todos os registros (ano, curso, candidatos, vagas, candidatos/vaga, nota mínima, salário médio).
- Filtros independentes por **Ano** e por **Curso**, com botão para limpar os filtros.
- Cores diferentes por curso para facilitar a leitura visual.

### 3. Análise descritiva (Q&A)

Seção com 8 perguntas e respostas interpretando os dados (curso mais/menos concorrido, evolução de Odontologia, impacto da pandemia, relação entre nota mínima/salário e concorrência).

## Tecnologias utilizadas

- [Bootstrap 5.3](https://getbootstrap.com/) — layout e componentes de formulário
- [Chart.js 4.4](https://www.chartjs.org/) — gráfico de linha interativo
- Google Fonts (Inter) — tipografia
- JavaScript puro (sem frameworks) para manipulação do DOM e lógica de filtros