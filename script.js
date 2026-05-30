/**
 * ============================================================
 * StudyFlow — Student Productivity Dashboard
 * script.js
 * ============================================================
 *
 * FEATURES
 * ────────
 * 1. Mobile hamburger menu toggle
 * 2. Close menu when a nav link is clicked
 * 3. Task complete / incomplete toggle
 * 4. Task deletion
 * 5. Add new task form (show / hide + save)
 * 6. Live task counter
 * 7. Progress bar animation on page load (IntersectionObserver)
 * 8. Smooth active nav link highlight on scroll
 *
 * All code is written in plain ES6 JavaScript — no libraries.
 * ============================================================
 */

/* ============================================================
   SECTION 1 — HAMBURGER MENU TOGGLE
   ============================================================
   On mobile the navbar collapses into a hamburger button.
   Clicking it toggles the "is-open" class on the nav menu
   and updates aria-expanded for screen readers.
============================================================ */

/**
 * Elements for the hamburger / nav menu interaction.
 * @type {HTMLElement}
 */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu      = document.getElementById('navMenu');

/**
 * Toggles the mobile navigation open/closed.
 * Updates:
 *  - The aria-expanded attribute on the hamburger button
 *  - The "is-open" CSS class on the nav menu (triggers CSS animation)
 */
function toggleMobileMenu() {
  // Read current state
  const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';

  // Flip the state
  hamburgerBtn.setAttribute('aria-expanded', String(!isOpen));

  // Toggle CSS class that drives the slide-down animation
  navMenu.classList.toggle('is-open', !isOpen);
}

// Attach the toggle to the hamburger button click
hamburgerBtn.addEventListener('click', toggleMobileMenu);

/* ============================================================
   Close the mobile menu when any nav link is clicked.
   This gives a smooth UX when navigating to page sections.
============================================================ */
const navLinks = navMenu.querySelectorAll('.navbar__link');

navLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    // Only act on mobile (menu is open)
    if (navMenu.classList.contains('is-open')) {
      toggleMobileMenu();
    }
  });
});

/* ============================================================
   Close the mobile menu when the user clicks outside it.
============================================================ */
document.addEventListener('click', function (event) {
  // If the click target is neither the menu nor the hamburger button
  const clickedInsideMenu   = navMenu.contains(event.target);
  const clickedHamburger    = hamburgerBtn.contains(event.target);

  if (!clickedInsideMenu && !clickedHamburger && navMenu.classList.contains('is-open')) {
    toggleMobileMenu();
  }
});


/* ============================================================
   SECTION 2 — TASK INTERACTION
   ============================================================
   Each task item has:
   • A toggle button — marks the task complete / incomplete
   • A delete button — removes the task from the list
   We use event delegation on the parent list so newly added
   tasks are also handled automatically.
============================================================ */

/** The task list container element */
const taskList = document.getElementById('taskList');

/**
 * Event delegation — listen for all clicks inside the task list.
 * Route clicks to the correct handler based on the clicked element.
 */
taskList.addEventListener('click', function (event) {

  // ── Toggle complete / incomplete ──
  const toggleBtn = event.target.closest('.task-item__toggle');
  if (toggleBtn) {
    handleTaskToggle(toggleBtn);
    return;
  }

  // ── Delete task ──
  const deleteBtn = event.target.closest('.task-item__delete');
  if (deleteBtn) {
    handleTaskDelete(deleteBtn);
    return;
  }
});

/**
 * Toggles a task's completion state.
 * Updates:
 *  - aria-pressed attribute for accessibility
 *  - CSS class on the parent <li> for visual styling
 *  - The "Due date" text to "Done ✓" when completed
 *  - The live task counter
 *
 * @param {HTMLElement} toggleBtn - The toggle button that was clicked
 */
function handleTaskToggle(toggleBtn) {
  const taskItem = toggleBtn.closest('.task-item');
  const dueLabel = taskItem.querySelector('.task-item__due');

  // Read current state from aria-pressed
  const wasComplete = toggleBtn.getAttribute('aria-pressed') === 'true';

  if (wasComplete) {
    // Mark as incomplete
    toggleBtn.setAttribute('aria-pressed', 'false');
    taskItem.classList.remove('task-item--done');

    // Restore "Due: …" text — store it in a data attribute
    const originalDue = taskItem.dataset.due || 'Due: —';
    dueLabel.textContent = originalDue;

  } else {
    // Save the original due text before overwriting it
    if (!taskItem.dataset.due) {
      taskItem.dataset.due = dueLabel.textContent;
    }

    // Mark as complete
    toggleBtn.setAttribute('aria-pressed', 'true');
    taskItem.classList.add('task-item--done');
    dueLabel.textContent = 'Done ✓';
  }

  // Update the task counter display
  updateTaskCounter();
}

/**
 * Removes a task item from the list with a fade-out animation.
 *
 * @param {HTMLElement} deleteBtn - The delete button that was clicked
 */
function handleTaskDelete(deleteBtn) {
  const taskItem = deleteBtn.closest('.task-item');

  // Fade out, then remove the element from the DOM
  taskItem.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  taskItem.style.opacity    = '0';
  taskItem.style.transform  = 'translateX(-8px)';

  setTimeout(function () {
    taskItem.remove();
    updateTaskCounter();
  }, 260); // Match the CSS transition duration
}

/**
 * Counts tasks and updates the counter text below the task list.
 * Format: "X of Y tasks completed"
 */
function updateTaskCounter() {
  const allTasks       = taskList.querySelectorAll('.task-item');
  const completedTasks = taskList.querySelectorAll('.task-item--done');

  const total     = allTasks.length;
  const completed = completedTasks.length;

  const counterEl = document.getElementById('taskCounter');
  counterEl.textContent =
    total > 0
      ? completed + ' of ' + total + ' tasks completed'
      : 'No tasks — add one above! 🎉';
}

// Run on page load so the initial count is shown
updateTaskCounter();


/* ============================================================
   SECTION 3 — ADD TASK FORM
   ============================================================
   The "Add Task" button reveals a small inline form.
   Saving creates a new <li> with full toggle + delete support.
============================================================ */

const addTaskBtn  = document.getElementById('addTaskBtn');
const taskForm    = document.getElementById('taskForm');
const taskInput   = document.getElementById('taskInput');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelBtn   = document.getElementById('cancelTaskBtn');

/**
 * Shows the add-task form and focuses the input.
 */
function showTaskForm() {
  taskForm.hidden = false;
  taskForm.setAttribute('aria-hidden', 'false');
  taskInput.value = '';        // Clear any previous input
  taskInput.focus();
}

/**
 * Hides the add-task form without saving.
 */
function hideTaskForm() {
  taskForm.hidden = true;
  taskForm.setAttribute('aria-hidden', 'true');
  taskInput.value = '';
  addTaskBtn.focus();          // Return focus to the trigger button
}

// Button event listeners
addTaskBtn.addEventListener('click', showTaskForm);
cancelBtn.addEventListener('click', hideTaskForm);

/**
 * Saves the new task to the list.
 * Validates input, creates a new <li>, and animates it in.
 */
function saveTask() {
  const text = taskInput.value.trim();

  // Don't save empty tasks
  if (!text) {
    taskInput.focus();
    taskInput.style.borderColor = 'var(--color-danger)';
    setTimeout(function () {
      taskInput.style.borderColor = '';
    }, 1500);
    return;
  }

  // Build the new task list item HTML string
  const newTaskHTML =
    '<li class="task-item task-item--new" role="listitem">' +
      '<button class="task-item__toggle" aria-pressed="false" ' +
        'aria-label="Mark task complete: ' + escapeHtml(text) + '">' +
        '<span class="task-item__checkbox" aria-hidden="true"></span>' +
      '</button>' +
      '<span class="task-item__text">' + escapeHtml(text) + '</span>' +
      '<span class="task-item__due">Due: TBD</span>' +
      '<button class="task-item__delete" ' +
        'aria-label="Delete task: ' + escapeHtml(text) + '">✕</button>' +
    '</li>';

  // Insert at the top of the task list
  taskList.insertAdjacentHTML('afterbegin', newTaskHTML);

  // Hide the form and update the counter
  hideTaskForm();
  updateTaskCounter();

  // Remove the animation class after it finishes so it doesn't replay
  const newItem = taskList.querySelector('.task-item--new');
  newItem.addEventListener('animationend', function () {
    newItem.classList.remove('task-item--new');
  }, { once: true });
}

// Save on button click
saveTaskBtn.addEventListener('click', saveTask);

// Save on Enter key inside the input
taskInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    saveTask();
  }
  // Cancel on Escape
  if (event.key === 'Escape') {
    hideTaskForm();
  }
});

/**
 * Simple HTML escape helper — prevents XSS when inserting
 * user-typed text into the DOM via innerHTML.
 *
 * @param {string} str - Raw user input string
 * @returns {string} HTML-safe string
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


/* ============================================================
   SECTION 4 — PROGRESS BAR ANIMATION
   ============================================================
   We use the IntersectionObserver API to detect when the
   progress section scrolls into view, then animate each bar
   from 0% to its target width (read from data-progress).
   This creates a smooth "fill in" effect on first view.
============================================================ */

/**
 * Map of progress-bar fill elements to their label elements.
 * We keep a reference so we can update the percentage text.
 *
 * Structure: [ { fill, pctLabel, targetPct }, ... ]
 */
const progressItems = [
  { fillId: null,  fill: null, pctLabel: document.getElementById('mathPct')    },
  { fillId: null,  fill: null, pctLabel: document.getElementById('physicsPct') },
  { fillId: null,  fill: null, pctLabel: document.getElementById('chemPct')    },
  { fillId: null,  fill: null, pctLabel: document.getElementById('engPct')     },
  { fillId: null,  fill: null, pctLabel: document.getElementById('histPct')    },
  { fillId: null,  fill: null, pctLabel: document.getElementById('csPct')      },
];

// Get all progress bar fill elements from the DOM
const progressFills = document.querySelectorAll('.progress-bar__fill');

/**
 * Animates all progress bars to their target values.
 * Called once when the section enters the viewport.
 */
function animateProgressBars() {
  progressFills.forEach(function (fill, index) {
    const target = parseInt(fill.getAttribute('data-progress'), 10) || 0;

    // Apply the width — CSS transition handles the animation
    fill.style.width = target + '%';

    // Update the matching percentage label
    if (progressItems[index] && progressItems[index].pctLabel) {
      // Animate the number counting up
      animateCounter(progressItems[index].pctLabel, 0, target, 1000);
    }
  });
}

/**
 * Smoothly counts a number from `start` to `end` over `duration` ms,
 * updating the text content of `element` with each frame.
 *
 * @param {HTMLElement} element  - The element whose text we update
 * @param {number}      start    - Starting value
 * @param {number}      end      - Target value
 * @param {number}      duration - Animation duration in milliseconds
 */
function animateCounter(element, start, end, duration) {
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out curve: progress goes fast then slows
    const eased  = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);

    element.textContent = current + '%';

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

/* Also animate the goal bar */
const goalBarFill = document.querySelector('.goal-bar__fill');

/**
 * IntersectionObserver watches the progress section.
 * Fires the animation once when the section is 20% visible.
 */
const progressSection = document.getElementById('progress');

const progressObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateProgressBars();

        // Animate the goal bar
        if (goalBarFill) {
          const goalTarget = parseInt(goalBarFill.getAttribute('data-progress'), 10) || 0;
          goalBarFill.style.width = goalTarget + '%';
        }

        // Stop observing after the first trigger (animate once)
        progressObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }  // Trigger when 20% of the section is visible
);

// Start observing the progress section
if (progressSection) {
  progressObserver.observe(progressSection);
}


/* ============================================================
   SECTION 5 — ACTIVE NAV LINK ON SCROLL
   ============================================================
   Highlights the nav link corresponding to the section
   currently in view. Uses IntersectionObserver for performance.
============================================================ */

/** All main page sections that have matching nav links */
const sections = document.querySelectorAll('section[id]');

/**
 * Updates nav links by adding/removing an "active" class.
 * The active link is visually distinguished via CSS.
 */
const navObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      // Find the matching nav link by its href
      const id   = entry.target.getAttribute('id');
      const link = document.querySelector('.navbar__link[href="#' + id + '"]');

      if (!link) return;

      if (entry.isIntersecting) {
        // Remove active from all links
        navLinks.forEach(function (l) { l.classList.remove('navbar__link--active'); });
        // Add active to the matching link
        link.classList.add('navbar__link--active');
      }
    });
  },
  {
    rootMargin: '-40% 0px -55% 0px',  // Trigger when section is roughly centered
    threshold:  0
  }
);

sections.forEach(function (section) {
  navObserver.observe(section);
});

/* CSS for the active nav link (injected via JS to keep style.css clean) */
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent =
  '.navbar__link--active {' +
  '  color: var(--color-mocha) !important;' +
  '  background: var(--color-mocha-light) !important;' +
  '}';
document.head.appendChild(activeNavStyle);


/* ============================================================
   SECTION 6 — KEYBOARD ACCESSIBILITY HELPERS
   ============================================================
   Ensure the task list is navigable via keyboard.
   Arrow keys move between tasks; Enter/Space activates buttons.
============================================================ */

taskList.addEventListener('keydown', function (event) {
  const items = Array.from(taskList.querySelectorAll('.task-item'));
  const focused = document.activeElement.closest('.task-item');

  if (!focused) return;

  const idx = items.indexOf(focused);

  if (event.key === 'ArrowDown' && idx < items.length - 1) {
    // Move focus to the toggle button of the next task
    const nextToggle = items[idx + 1].querySelector('.task-item__toggle');
    if (nextToggle) {
      nextToggle.focus();
      event.preventDefault();
    }
  }

  if (event.key === 'ArrowUp' && idx > 0) {
    // Move focus to the toggle button of the previous task
    const prevToggle = items[idx - 1].querySelector('.task-item__toggle');
    if (prevToggle) {
      prevToggle.focus();
      event.preventDefault();
    }
  }
});


/* ============================================================
   SECTION 7 — INIT / READY LOG
   ============================================================
   Confirm all scripts loaded correctly in the console.
============================================================ */
console.log('✅ StudyFlow dashboard initialised.');
console.log('   • Mobile menu toggle   — ready');
console.log('   • Task interactions    — ready');
console.log('   • Add task form        — ready');
console.log('   • Progress bar anim.   — ready');
console.log('   • Active nav tracking  — ready');
