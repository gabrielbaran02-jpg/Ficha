const rollBtn = document.getElementById('rollBtn');
const multiBtn = document.getElementById('multiBtn');
const dieEl = document.getElementById('die');
const statusEl = document.getElementById('status');
const historyEl = document.getElementById('history');
const themeToggle = document.getElementById('themeToggle');

const countInput = document.getElementById('count');
const sidesInput = document.getElementById('sides');
const modifierInput = document.getElementById('modifier');

const lastTotalEl = document.getElementById('lastTotal');
const avgEl = document.getElementById('avg');
const critEl = document.getElementById('crit');

const chips = [...document.querySelectorAll('.chip')];
const state = {
  rolls: [],
  crits: 0,
};

function rng(max) {
  return Math.floor(Math.random() * max) + 1;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseInputs() {
  const count = clamp(Number(countInput.value) || 1, 1, 20);
  const sides = clamp(Number(sidesInput.value) || 20, 2, 1000);
  const modifier = clamp(Number(modifierInput.value) || 0, -100, 100);

  countInput.value = count;
  sidesInput.value = sides;
  modifierInput.value = modifier;

  return { count, sides, modifier };
}

function rollOnce({ count, sides, modifier }) {
  const values = Array.from({ length: count }, () => rng(sides));
  const subtotal = values.reduce((sum, v) => sum + v, 0);
  const total = subtotal + modifier;
  const criticals = values.filter((value) => value === sides).length;

  return { values, subtotal, total, criticals };
}

function animateDie(value) {
  dieEl.classList.remove('rolling');
  void dieEl.offsetWidth;
  dieEl.classList.add('rolling');
  dieEl.textContent = value;
}

function updateStats(result, sides) {
  state.rolls.push(result.total);
  state.crits += result.criticals;

  const average =
    state.rolls.reduce((sum, item) => sum + item, 0) / state.rolls.length;

  lastTotalEl.textContent = result.total;
  avgEl.textContent = average.toFixed(2);
  critEl.textContent = state.crits;

  const item = document.createElement('li');
  item.innerHTML = `<span>${result.values.join(' + ')} ${
    result.criticals ? '🔥' : ''
  }</span><strong>= ${result.total}</strong>`;
  historyEl.prepend(item);

  while (historyEl.children.length > 12) {
    historyEl.removeChild(historyEl.lastChild);
  }

  const modSignal = result.total - result.subtotal >= 0 ? '+' : '';
  statusEl.textContent = `${result.values.length}d${sides} ${modSignal}${
    result.total - result.subtotal
  } => ${result.total}`;
}

function runRoll(times = 1) {
  const settings = parseInputs();
  let last;

  for (let i = 0; i < times; i += 1) {
    last = rollOnce(settings);
    updateStats(last, settings.sides);
  }

  animateDie(last.values[last.values.length - 1]);
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
    sidesInput.value = chip.dataset.sides;
  });
});

rollBtn.addEventListener('click', () => runRoll(1));
multiBtn.addEventListener('click', () => runRoll(10));

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeToggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    runRoll(1);
  }
});
