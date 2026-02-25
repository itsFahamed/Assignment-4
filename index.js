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

