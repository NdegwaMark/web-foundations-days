// Select all required elements
const noteText = document.getElementById('note-text');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');
const themeToggle = document.getElementById('theme-toggle');

const MAX_CHARS = 200;
const DRAFT_KEY = 'noteDraft';
const THEME_KEY = 'theme';

// Updates both counters and the warning/over classes
function updateCounts() {
  const text = noteText.value;
  const chars = text.length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  charCount.textContent = chars + ' / ' + MAX_CHARS + ' characters';
  wordCount.textContent = words + ' words';

  charCount.classList.toggle('warning', chars > 180 && chars <= MAX_CHARS);
  charCount.classList.toggle('over', chars > MAX_CHARS);
}

// Save the draft and update counters on every input event
noteText.addEventListener('input', () => {
  localStorage.setItem(DRAFT_KEY, noteText.value);
  updateCounts();
});

// Clear button: empties textarea, resets counters, removes the draft
clearBtn.addEventListener('click', () => {
  noteText.value = '';
  localStorage.removeItem(DRAFT_KEY);
  updateCounts();
});

// Escape key inside the textarea also clears everything
noteText.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    noteText.value = '';
    localStorage.removeItem(DRAFT_KEY);
    updateCounts();
  }
});

// Theme button: toggles dark class on <body> and remembers the choice
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
});

// On page load: restore saved draft and theme, then update counters
(function init() {
  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft !== null) {
    noteText.value = savedDraft;
  }

  if (localStorage.getItem(THEME_KEY) === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = 'Light mode';
  } else {
    themeToggle.textContent = 'Dark mode';
  }

  updateCounts();
})();
