'use strict';
// Project details adapted from the portfolio supplied by Haziq.
const projects = [
  {
    "title": "Qnex UPF FSHAD",
    "type": "systems",
    "label": "Exam management · System design",
    "description": "An exam management system design exploring clearer workflows for students, lecturers and invigilators.",
    "problem": "Bringing exam workflows together in one clearer workspace.",
    "solution": "Role-based access and student profiles; exam hall and invigilator assignments; MCQ answer keys and student answer-scanning workflows.",
    "learning": "System modelling and interface design for the different roles involved in managing an examination.",
    "short": "Exam workflows"
  },
  {
    "title": "GroupBuddy",
    "type": "programming",
    "label": "Student group finder · C++ / OOP",
    "description": "A C++ project exploring how students can form study groups around shared interests, skills and availability.",
    "problem": "Connecting students through compatibility, so they can find people to study and work with.",
    "solution": "Student profiles, group management and compatibility-based group searching.",
    "learning": "Array-based data structures and object-oriented programming in C++.",
    "short": "Finding your group"
  },
  {
    "title": "CPU Scheduling Analysis",
    "type": "systems",
    "label": "Operating systems · Round Robin",
    "description": "An operating systems project comparing Round Robin simulation runs with different time quantum sizes.",
    "problem": "Understanding the trade-offs between responsiveness and CPU efficiency.",
    "solution": "Comparing average waiting time, turnaround time and context-switching overhead across simulation runs.",
    "learning": "Round Robin scheduling and performance analysis, with time quantum size as the variable.",
    "short": "Scheduling trade-offs"
  }
];
const $ = (selector) => document.querySelector(selector);
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(key); return true; } catch { return false; } }
};
// 1. Theme toggle with a safely persisted preference.
function applyTheme(dark) {
  document.body.classList.toggle('dark', dark);
  $('#theme').setAttribute('aria-pressed', String(dark));
  $('#theme').setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
}
applyTheme(storage.get('portfolio-theme-v5') === 'dark');
$('#theme').addEventListener('click', () => {
  const dark = !document.body.classList.contains('dark');
  applyTheme(dark);
  storage.set('portfolio-theme-v5', dark ? 'dark' : 'light');
});
// 2. Mobile menu, including Escape and link activation.
function closeMenu() { $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false'); }
$('#menu').addEventListener('click', () => {
  const open = $('#nav').classList.toggle('open');
  $('#menu').setAttribute('aria-expanded', String(open));
});
$('#nav').addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
// 3–5. Combined project category filtering, text search and title sorting.
let currentFilter = 'all';
function renderProjects() {
  const query = $('#search').value.trim().toLowerCase();
  let visible = projects.filter((project) => (currentFilter === 'all' || project.type === currentFilter) && `${project.title} ${project.description} ${project.label}`.toLowerCase().includes(query));
  if ($('#sort').value === 'az') visible = [...visible].sort((a, b) => a.title.localeCompare(b.title));
  $('#project-grid').replaceChildren();
  visible.forEach((project) => {
    const article = document.createElement('article');
    article.className = 'project-card';
    // This fixed markup contains no visitor-provided values.
    article.innerHTML = '<div class="project-art" aria-hidden="true"><span class="work-number"></span><strong></strong><span class="work-type"></span></div><p class="project-meta"></p><h3></h3><p class="description"></p><button class="text-link">Read project notes ↗</button>';
    article.querySelector('.work-number').textContent = String(projects.indexOf(project) + 1).padStart(2, '0');
    article.querySelector('strong').textContent = project.short;
    article.querySelector('.work-type').textContent = project.type === 'systems' ? 'SYSTEMS & DESIGN' : 'PROGRAMMING';
    article.querySelector('.project-meta').textContent = `${String(projects.indexOf(project) + 1).padStart(2, '0')} / ${project.label.toUpperCase()}`;
    article.querySelector('h3').textContent = project.title;
    article.querySelector('.description').textContent = project.description;
    article.querySelector('button').setAttribute('aria-label', `Read about ${project.title}`);
    article.querySelector('button').addEventListener('click', () => openProject(project));
    $('#project-grid').append(article);
  });
  $('#results').textContent = `${visible.length} ${visible.length === 1 ? 'project' : 'projects'}`;
  $('#empty').hidden = visible.length > 0;
}
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  renderProjects();
}));
$('#search').addEventListener('input', renderProjects);
$('#sort').addEventListener('change', renderProjects);
renderProjects();
// 6. Native modal provides focus containment, Escape and focus restoration.
function openProject(project) {
  $('#dialog-title').textContent = project.title;
  $('#dialog-summary').textContent = project.description;
  $('#dialog-problem').textContent = project.problem;
  $('#dialog-solution').textContent = project.solution;
  $('#dialog-learning').textContent = project.learning;
  $('#project-dialog').showModal();
}
$('#close-dialog').addEventListener('click', () => $('#project-dialog').close());
$('#project-dialog').addEventListener('click', (event) => {
  const box = event.currentTarget.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.currentTarget.close();
});
// 7. Current-section navigation; 8. context-aware back-to-top control.
const sections = [...document.querySelectorAll('main > section')];
let scheduled = false;
function updateScrollUI() {
  const current = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 150) || sections[0];
  document.querySelectorAll('#nav a').forEach((link) => {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  $('#top').hidden = window.scrollY < 500;
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScrollUI); } }, { passive: true });
$('#top').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); $('.brand').focus({ preventScroll: true }); });
updateScrollUI();
// 9. Copy a contact message, with a fallback when clipboard access is unavailable.
function composeMessage() {
  return `From: ${$('#name').value.trim()} <${$('#email').value.trim()}>\n\n${$('#message').value.trim()}`;
}
$('#copy').addEventListener('click', async () => {
  const invalid = ['name', 'email', 'message'].filter((id) => fieldError(id));
  if (invalid.length) { $(`#${invalid[0]}`).focus(); $('#copy-status').textContent = 'Complete the contact form first, then copy your message.'; return; }
  try { await navigator.clipboard.writeText(composeMessage()); $('#copy-status').textContent = 'Message copied. Share it through the channel where you found this portfolio.'; }
  catch { $('#copy-status').textContent = 'Copy is unavailable. Select and copy the message from the form manually.'; $('#message').focus(); $('#message').select(); }
});
// 10. Accessible validation. No recipient address was supplied, so this prepares a draft only.
const fields = ['name', 'email', 'message'];
function fieldError(id) {
  const input = $(`#${id}`);
  let error = '';
  if (!input.value.trim()) error = `Please enter your ${id === 'message' ? 'message' : id}.`;
  else if (id === 'email' && !input.validity.valid) error = 'Enter a valid email address.';
  else if (id === 'message' && input.value.trim().length < 10) error = 'Please write at least 10 characters.';
  $(`#${id}-error`).textContent = error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  return error;
}
$('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const invalid = fields.filter((id) => fieldError(id));
  if (invalid.length) { $(`#${invalid[0]}`).focus(); $('#form-status').textContent = 'Please correct the highlighted fields.'; return; }
  $('#form-status').textContent = 'Your message is ready. Use Copy message to share it through the channel where you found this portfolio. Nothing has been sent.';
  $('#copy').focus();
});
// 11. Live message length; 12. optional draft save/restore; 13. draft reset.
function saveDraft() {
  if (!$('#save-draft').checked) return;
  const draft = Object.fromEntries(fields.map((id) => [id, $(`#${id}`).value]));
  if (!storage.set('portfolio-draft', JSON.stringify(draft))) $('#form-status').textContent = 'Draft storage is unavailable in this browser. Your text remains in this form.';
}
function updateCount() { $('#count').textContent = `${$('#message').value.length} / 1000`; }
fields.forEach((id) => $(`#${id}`).addEventListener('input', () => {
  if ($(`#${id}`).getAttribute('aria-invalid') === 'true') fieldError(id);
  updateCount(); saveDraft();
}));
$('#save-draft').addEventListener('change', () => { if ($('#save-draft').checked) { saveDraft(); } else { storage.remove('portfolio-draft'); $('#form-status').textContent = 'Saved draft removed from this device.'; } });
try {
  const draft = JSON.parse(storage.get('portfolio-draft'));
  if (draft && typeof draft === 'object') {
    fields.forEach((id) => { if (typeof draft[id] === 'string') $(`#${id}`).value = draft[id].slice(0, $(`#${id}`).maxLength); });
    $('#save-draft').checked = true;
    $('#form-status').textContent = 'Your saved draft has been restored on this device.';
  }
} catch { storage.remove('portfolio-draft'); }
updateCount();
$('#clear').addEventListener('click', () => {
  $('#contact-form').reset(); storage.remove('portfolio-draft');
  fields.forEach((id) => { $(`#${id}-error`).textContent = ''; $(`#${id}`).removeAttribute('aria-invalid'); });
  updateCount(); $('#form-status').textContent = 'Form cleared and saved draft removed.';
});
// 14. Print-friendly portfolio export (browser PDF option).
$('#print').addEventListener('click', () => window.print());
$('#year').textContent = new Date().getFullYear();
