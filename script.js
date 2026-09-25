const SYMBOLS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_-+=[]{}<>?/|~';
const input = document.querySelector('#passwordInput');
const encodedOutput = document.querySelector('#encodedOutput');
const decodedPreview = document.querySelector('#decodedPreview');
const decodeResult = document.querySelector('#decodeResult');
const originalTokens = document.querySelector('#originalTokens');
const numericTokens = document.querySelector('#numericTokens');
const finalTokens = document.querySelector('#finalTokens');
const charCount = document.querySelector('#charCount');
const strengthLabel = document.querySelector('#strengthLabel');
const strengthBars = [...document.querySelectorAll('.strength-bars i')];

function encode(text) {
  const bytes = new TextEncoder().encode(text);
  return Array.from(bytes, byte => SYMBOLS[(byte >> 6) & 63] + SYMBOLS[byte & 63]).join('');
}

function decode(encoded) {
  const bytes = [];
  for (let i = 0; i < encoded.length; i += 2) {
    const first = SYMBOLS.indexOf(encoded[i]);
    const second = SYMBOLS.indexOf(encoded[i + 1]);
    if (first < 0 || second < 0) return '';
    bytes.push((first << 6) | second);
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

function tokenMarkup(items, numeric = false) {
  return items.slice(0, 12).map(item => `<span>${numeric ? item : escapeHtml(item)}</span>`).join('') || '<span>—</span>';
}
function escapeHtml(value) { return value.replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }
function updateStrength(text) {
  const score = Math.min(4, (text.length >= 8 ? 1 : 0) + (text.length >= 12 ? 1 : 0) + (/[A-Z]/.test(text) && /[a-z]/.test(text) ? 1 : 0) + (/\d/.test(text) && /[^A-Za-z0-9]/.test(text) ? 1 : 0));
  strengthBars.forEach((bar, index) => bar.classList.toggle('active', index < score));
  strengthLabel.textContent = ['vazia', 'fraca', 'razoável', 'boa', 'forte'][score];
}
function render() {
  const text = input.value;
  const encoded = encode(text);
  const bytes = Array.from(new TextEncoder().encode(text));
  const pairs = encoded.match(/.{1,2}/g) || [];
  encodedOutput.textContent = encoded || '—';
  decodedPreview.textContent = decode(encoded) || '—';
  decodeResult.textContent = decode(encoded) || '—';
  charCount.textContent = text.length;
  originalTokens.innerHTML = tokenMarkup(Array.from(text));
  numericTokens.innerHTML = tokenMarkup(bytes.map(String), true);
  finalTokens.innerHTML = tokenMarkup(pairs);
  updateStrength(text);
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  const values = new Uint32Array(16);
  crypto.getRandomValues(values);
  input.value = Array.from(values, value => chars[value % chars.length]).join('');
  input.type = 'text';
  render();
}

document.querySelector('#generateButton').addEventListener('click', generatePassword);
document.querySelector('#clearButton').addEventListener('click', () => { input.value = ''; render(); input.focus(); });
document.querySelector('#togglePassword').addEventListener('click', event => {
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  event.currentTarget.textContent = isHidden ? '◌' : '◉';
  event.currentTarget.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
});
input.addEventListener('input', render);
document.querySelector('#copyButton').addEventListener('click', async event => {
  if (!encodedOutput.textContent || encodedOutput.textContent === '—') return;
  await navigator.clipboard.writeText(encodedOutput.textContent);
  const button = event.currentTarget;
  button.textContent = '✓';
  setTimeout(() => { button.textContent = '⧉'; }, 1300);
});
render();
