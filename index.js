// Mutable arrays — never reassigned, only spliced/pushed
const interviewCount = [];
const rejectedCount = [];

const mainContainer     = document.querySelector('[data-section="positions-container"]');
const interviewSection  = document.querySelector('[data-filter-section="interview"]');
const rejectedSection   = document.querySelector('[data-filter-section="rejected"]');

const filterAllBtn       = document.querySelector('[data-filter="all"]');
const filterInterviewBtn = document.querySelector('[data-filter="interview"]');
const filterRejectedBtn  = document.querySelector('[data-filter="rejected"]');

const interviewCountEl = document.querySelector('[data-counter="interview"]');
const rejectedCountEl  = document.querySelector('[data-counter="rejected"]');
const totalCountEl     = document.querySelector('[data-counter="total"]');
const jobsCountDisplay = document.querySelector('.jobs-count');

// Set initial total count from DOM
totalCountEl.textContent = getPositionsGridCount();

function getPositionsGridCount() {
    // childElementCount counts element nodes only, ignoring whitespace text nodes
    return document.querySelector(
        '[data-section="positions-container"] .positions-grid'
    ).childElementCount;
}

const JobUtils = {
    findJobIndex(jobArray, companyName) {
        return jobArray.findIndex(job => job.company === companyName);
    },

    removeJobByCompany(jobArray, companyName) {
        const index = this.findJobIndex(jobArray, companyName);
        if (index !== -1) jobArray.splice(index, 1);
    },

    extractJobData(card) {
        return {
            company:     card.querySelector('.organization-name').innerText,
            title:       card.querySelector('.position-title').innerText,
            details:     card.querySelector('.position-details').innerText,
            description: card.querySelector('.position-description').innerText,
            status:      'Interview' // default; overridden to 'Rejected' in handleRejected
        };
    },

    updateCounts() {
        const total = getPositionsGridCount();
        interviewCountEl.textContent = interviewCount.length;
        rejectedCountEl.textContent  = rejectedCount.length;
        totalCountEl.textContent     = total;
        return total;
    },

    updateCardStatus(companyName, statusType) {
        const config = {
            interview: {
                text:        'INTERVIEW',
                badgeClass:  'position-status badge badge-outline text-green-600 border-green-600 text-xs',
                addBorder:   'border-green-500',
                removeBorder:'border-red-500'
            },
            rejected: {
                text:        'REJECTED',
                badgeClass:  'position-status badge badge-outline text-red-600 border-red-600 text-xs',
                addBorder:   'border-red-500',
                removeBorder:'border-green-500'
            }
        }[statusType];

        if (!config) return;

        mainContainer.querySelectorAll('.position-card').forEach(card => {
            if (card.querySelector('.organization-name')?.innerText !== companyName) return;
            const badge = card.querySelector('.position-status');
            badge.innerText   = config.text;
            badge.className   = config.badgeClass;
            card.classList.add('border-l-4', config.addBorder);
            card.classList.remove(config.removeBorder);
        });
    }
};

const TemplateGenerator = {
    createEmptyState() {
        return `
            <div class="flex flex-col items-center justify-center py-16">
                <img src="assets/word.png" alt="No jobs" class="w-16 h-16 mb-4 opacity-50">
                <h3 class="text-lg font-semibold text-neutral mb-2">No jobs available</h3>
                <p class="text-sm text-gray-500">Check back soon for new job opportunities</p>
            </div>
        `;
    },

    createJobCard(job, borderColor, statusColor) {
        return `
            <article class="position-card border-l-4 ${borderColor} bg-base-100 rounded-lg shadow p-6 relative"
                     data-status="${job.status.toLowerCase()}"
                     data-position-id="${job.id || ''}">

                <button class="position-action remove-action absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        data-action="delete"
                        aria-label="Delete job application">
                    <img src="assets/delete.png" alt="Delete" class="h-5 w-5">
                </button>

                <header class="position-header">
                    <h3 class="organization-name text-lg font-bold text-neutral">${job.company}</h3>
                    <p class="position-title text-sm text-gray-600">${job.title}</p>
                    <p class="position-details text-xs text-gray-500 mt-1">${job.details}</p>
                </header>

                <div class="position-status-container mt-3">
                    <span class="position-status badge badge-outline ${statusColor} text-xs">${job.status.toUpperCase()}</span>
                </div>

                <div class="position-description text-sm text-gray-700 mt-3">
                    ${job.description}
                </div>

                <footer class="position-actions flex gap-2 mt-4">
                    <button class="position-action interview-action btn btn-sm btn-outline border-green-500 text-green-600 hover:bg-green-50"
                            data-action="interview">
                        INTERVIEW
                    </button>
                    <button class="position-action rejected-action btn btn-sm btn-outline border-red-500 text-red-600 hover:bg-red-50"
                            data-action="rejected">
                        REJECTED
                    </button>
                </footer>
            </article>
        `;
    }
};

function renderInterviewView(jobs) {
    interviewSection.innerHTML = jobs.length
        ? jobs.map(job => TemplateGenerator.createJobCard(job, 'border-green-500', 'text-green-600 border-green-600')).join('')
        : TemplateGenerator.createEmptyState();
}

function renderRejectedView(jobs) {
    rejectedSection.innerHTML = jobs.length
        ? jobs.map(job => TemplateGenerator.createJobCard(job, 'border-red-500', 'text-red-600 border-red-600')).join('')
        : TemplateGenerator.createEmptyState();
}

const EventHandlers = {
    handleDelete(card) {
        const company = card.querySelector('.organization-name').innerText;

        JobUtils.removeJobByCompany(interviewCount, company);
        JobUtils.removeJobByCompany(rejectedCount, company);

        // Remove all cards in main container matching this company
        mainContainer.querySelectorAll('.position-card').forEach(c => {
            if (c.querySelector('.organization-name')?.innerText === company) c.remove();
        });

        const total = JobUtils.updateCounts();
        renderInterviewView(interviewCount);
        renderRejectedView(rejectedCount);
        jobsCountDisplay.textContent = total;
    },

    handleInterview(card) {
        const job = JobUtils.extractJobData(card);

        JobUtils.removeJobByCompany(rejectedCount, job.company);
        // Guard against duplicates if INTERVIEW is clicked more than once
        if (JobUtils.findJobIndex(interviewCount, job.company) === -1) {
            interviewCount.push(job);
        }

        JobUtils.updateCounts();
        renderInterviewView(interviewCount);
        JobUtils.updateCardStatus(job.company, 'interview');
    },

    handleRejected(card) {
        const job = JobUtils.extractJobData(card);
        job.status = 'Rejected';

        JobUtils.removeJobByCompany(interviewCount, job.company);
        // Guard against duplicates if REJECTED is clicked more than once
        if (JobUtils.findJobIndex(rejectedCount, job.company) === -1) {
            rejectedCount.push(job);
        }

        JobUtils.updateCounts();
        renderRejectedView(rejectedCount);
        JobUtils.updateCardStatus(job.company, 'rejected');
    }
};

// Single delegated click listener for all card buttons
document.addEventListener('click', function (event) {
    const btn  = event.target.closest('button');
    if (!btn) return;

    const card = btn.closest('.position-card');
    if (!card) return;

    const handlers = {
        delete:    EventHandlers.handleDelete,
        interview: EventHandlers.handleInterview,
        rejected:  EventHandlers.handleRejected
    };

    const handler = handlers[btn.getAttribute('data-action')];
    if (handler) handler(card);
});

const FilterManager = {
    // Button style configs keyed by filter id
    buttonConfig: {
        'filter-all': {
            active:   { backgroundColor: '#3b82f6', color: 'white',       borderColor: '#3b82f6' },
            inactive: { backgroundColor: 'transparent', color: '#3b82f6', borderColor: '#3b82f6' }
        },
        'filter-interview': {
            active:   { backgroundColor: '#10b981', color: 'white',       borderColor: '#10b981' },
            inactive: { backgroundColor: 'transparent', color: '#3b82f6', borderColor: '#3b82f6' }
        },
        'filter-rejected': {
            active:   { backgroundColor: '#ef4444', color: 'white',       borderColor: '#ef4444' },
            inactive: { backgroundColor: 'transparent', color: '#3b82f6', borderColor: '#3b82f6' }
        }
    },

    buttonElements: {
        'filter-all':       filterAllBtn,
        'filter-interview': filterInterviewBtn,
        'filter-rejected':  filterRejectedBtn
    },

    applyButtonStyles(activeId) {
        Object.entries(this.buttonElements).forEach(([id, btn]) => {
            const styles = id === activeId
                ? this.buttonConfig[id].active
                : this.buttonConfig[id].inactive;
            Object.assign(btn.style, styles);
        });
    },

    setSectionVisibility(showMain, showInterview, showRejected) {
        mainContainer.style.display    = showMain      ? 'block' : 'none';
        interviewSection.style.display = showInterview ? 'block' : 'none';
        rejectedSection.style.display  = showRejected  ? 'block' : 'none';
    },

    setJobCountDisplay(count, total) {
        jobsCountDisplay.textContent = total !== undefined
            ? `${count} out of ${total}`
            : `${count}`;
    }
};

// Called from HTML onclick on each filter button
function setActiveButton(id) {
    const total = getPositionsGridCount();
    FilterManager.applyButtonStyles(id);

    if (id === 'filter-all') {
        FilterManager.setSectionVisibility(true, false, false);
        FilterManager.setJobCountDisplay(total);
    } else if (id === 'filter-interview') {
        FilterManager.setSectionVisibility(false, true, false);
        renderInterviewView(interviewCount);
        FilterManager.setJobCountDisplay(interviewCount.length, total);
    } else if (id === 'filter-rejected') {
        FilterManager.setSectionVisibility(false, false, true);
        renderRejectedView(rejectedCount);
        FilterManager.setJobCountDisplay(rejectedCount.length, total);
    }
}