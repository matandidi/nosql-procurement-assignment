const API = '/.netlify/functions/query';
const statusContainer = document.getElementById('status');
const questionsContainer = document.getElementById('questions');
const questionTemplate = document.getElementById('question-template');
const highlightedColumns = {
  q1: 'shortage_quantity',
  q2: 'at_risk_quantity',
  q3: 'total_delayed_quantity'
};

function textElement(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  return element;
}

function formatCellValue(value) {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return value.slice(0, 10);
  }
  return String(value);
}

function needsLeftToRight(value) {
  return typeof value === 'number' ||
    (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value));
}

async function requestQuery(questionId) {
  const query = questionId ? `?${new URLSearchParams({ q: questionId, pipeline: '1' })}` : '';
  const response = await fetch(API + query);
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`לא התקבלה תשובה תקינה מהשרת (${response.status}).`);
  }
  if (!response.ok || !data.ok) {
    throw new Error(data.error || `הבקשה נכשלה (${response.status}).`);
  }
  return data;
}

function renderTable(container, columns, rows, highlightedColumn) {
  container.replaceChildren();
  if (!rows.length) {
    container.append(textElement('div', 'אין תוצאות.', 'empty'));
    return;
  }

  const visibleColumns = columns.filter(([key]) => rows.some(row => key in row));
  const table = document.createElement('table');
  const headerRow = table.createTHead().insertRow();
  for (const [, label] of visibleColumns) {
    const heading = textElement('th', label);
    heading.scope = 'col';
    headerRow.append(heading);
  }

  const body = table.createTBody();
  const largestQuantity = Math.max(...rows.map(row => Number(row[highlightedColumn]) || 0));
  for (const row of rows) {
    const tableRow = body.insertRow();
    for (const [key, label] of visibleColumns) {
      const value = row[key];
      const cell = tableRow.insertCell();
      // The same labels appear beside each value in the mobile layout.
      cell.dataset.label = label;
      cell.classList.toggle('n', needsLeftToRight(value));
      cell.classList.toggle('hot', key === highlightedColumn && Number(value) === largestQuantity);
      cell.append(textElement('span', formatCellValue(value)));
    }
  }
  container.append(table);
}

function buildQuestionCard(question, index) {
  const card = questionTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector('.num').textContent = index + 1;
  card.querySelector('.question-title').textContent = question.title;
  card.querySelector('.summary').textContent = question.summary;
  card.querySelector('.badge').textContent = `db.${question.collection}.aggregate(…)`;

  const runButton = card.querySelector('.run');
  const pipelineButton = card.querySelector('.ghost');
  const resultSummary = card.querySelector('.meta');
  const pipelinePanel = card.querySelector('pre');
  const resultsContainer = card.querySelector('.tbl');
  let pipelineLoaded = false;

  function setLoading(loading) {
    runButton.disabled = loading;
    pipelineButton.disabled = loading;
  }

  async function loadQuestion() {
    const data = await requestQuery(question.id);
    pipelinePanel.textContent = JSON.stringify(data.pipeline, null, 2);
    pipelineLoaded = true;
    return data;
  }

  runButton.addEventListener('click', async () => {
    setLoading(true);
    resultSummary.textContent = 'מריץ ב-Atlas…';
    try {
      const data = await loadQuestion();
      renderTable(resultsContainer, question.columns, data.rows, highlightedColumns[question.id]);
      let summary = `${data.count} תוצאות`;
      if (question.id === 'q2') {
        const lateQuantity = data.rows.reduce((sum, row) => sum + row.at_risk_quantity, 0);
        summary += ` · סה"כ ${lateQuantity} יחידות פתוחות מאחרות`;
      }
      resultSummary.textContent = `${summary} · ${data.ms} ms`;
    } catch (error) {
      resultSummary.textContent = '';
      resultsContainer.replaceChildren(textElement('div', `שגיאה: ${error.message}`, 'empty'));
    } finally {
      setLoading(false);
    }
  });

  pipelineButton.addEventListener('click', async () => {
    setLoading(true);
    try {
      if (!pipelineLoaded) {
        resultSummary.textContent = 'טוען את השאילתה…';
        await loadQuestion();
        resultSummary.textContent = '';
      }
      pipelinePanel.classList.toggle('hidden');
      const visible = !pipelinePanel.classList.contains('hidden');
      pipelineButton.textContent = visible ? 'הסתר pipeline' : 'הצג pipeline';
      pipelineButton.setAttribute('aria-expanded', String(visible));
    } catch (error) {
      resultSummary.textContent = `שגיאה: ${error.message}`;
    } finally {
      setLoading(false);
    }
  });
  return card;
}

async function initialize() {
  try {
    const data = await requestQuery();
    statusContainer.replaceChildren(textElement('span', 'מחובר ל-Atlas', 'chip ok'));
    for (const collection of ['items', 'purchase_orders', 'suppliers']) {
      const chip = textElement('span', `${collection} `, 'chip');
      chip.append(textElement('b', data.counts[collection]));
      statusContainer.append(chip);
    }
    statusContainer.append(textElement('span', `${data.ms} ms`, 'chip'));
    data.questions.forEach((question, index) => {
      questionsContainer.append(buildQuestionCard(question, index));
    });
  } catch (error) {
    statusContainer.replaceChildren(textElement('span', `אין חיבור ל-Atlas: ${error.message}`, 'chip err'));
  }
}

initialize();
