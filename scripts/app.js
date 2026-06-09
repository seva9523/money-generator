const selectors = {
  offers: '[data-offers]',
  siteName: '[data-site-name]',
  tagline: '[data-tagline]',
  disclosure: '[data-disclosure]',
  heroCta: '[data-hero-cta]',
  leadForm: '[data-lead-form]',
  formStatus: '[data-form-status]',
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
  style: 'currency',
  currency: 'USD',
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

function renderOffer(offer) {
  const featuredClass = offer.featured ? ' featured' : '';
  const safeName = escapeHtml(offer.name);

  return `
    <article class="offer-card${featuredClass}">
      <div class="offer-meta">
        <span class="category">${escapeHtml(offer.category)}</span>
        <span class="rating" aria-label="Rating ${escapeHtml(offer.rating)} out of 5">★ ${escapeHtml(offer.rating)}</span>
      </div>
      <h3>${safeName}</h3>
      <p>${escapeHtml(offer.headline)}</p>
      <dl class="offer-details">
        <div>
          <dt>Commission</dt>
          <dd>${escapeHtml(offer.commission)}</dd>
        </div>
        <div>
          <dt>Setup effort</dt>
          <dd>${escapeHtml(offer.effort)}</dd>
        </div>
        <div>
          <dt>Best for</dt>
          <dd>${escapeHtml(offer.audience)}</dd>
        </div>
      </dl>
      <a class="button primary" href="${escapeHtml(offer.affiliateUrl)}" target="_blank" rel="sponsored noopener" data-affiliate-link data-offer-name="${safeName}">
        Visit partner
      </a>
    </article>
  `;
}

function wireAffiliateTracking() {
  document.querySelectorAll('[data-affiliate-link]').forEach((link) => {
    link.addEventListener('click', () => {
      const event = new CustomEvent('affiliate-click', {
        detail: {
          offer: link.dataset.offerName,
          url: link.href,
          clickedAt: new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    });
  });
}

function estimateMonthlyRevenue({ visitors = 1000, clickRate = 0.08, conversionRate = 0.03, averageCommission = 35 } = {}) {
  return visitors * clickRate * conversionRate * averageCommission;
}

function renderRevenueHint() {
  const estimate = estimateMonthlyRevenue();
  const heroCard = document.querySelector('.hero-card');

  if (!heroCard) return;

  const hint = document.createElement('p');
  hint.className = 'fine-print';
  hint.textContent = `Example math: 1,000 visitors × 8% clicks × 3% conversions × $35 commission = ${currencyFormatter.format(estimate)} per month. This is illustrative, not guaranteed.`;
  heroCard.append(hint);
}

async function loadOffers() {
  const response = await fetch('data/offers.json');
  if (!response.ok) {
    throw new Error(`Unable to load offers: ${response.status}`);
  }

  return response.json();
}

function applySiteConfig(config) {
  document.title = config.siteName;
  document.querySelectorAll(selectors.siteName).forEach((element) => {
    element.textContent = config.siteName;
  });
  document.querySelector(selectors.tagline).textContent = config.tagline;
  document.querySelector(selectors.disclosure).textContent = config.disclosure;

  const heroCta = document.querySelector(selectors.heroCta);
  heroCta.textContent = config.heroCta.label;
  heroCta.href = config.heroCta.url;
}

function renderOffers(config) {
  const offerContainer = document.querySelector(selectors.offers);
  offerContainer.innerHTML = config.offers.map(renderOffer).join('');
  wireAffiliateTracking();
}

function setupLeadForm() {
  const form = document.querySelector(selectors.leadForm);
  const status = document.querySelector(selectors.formStatus);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const signups = JSON.parse(localStorage.getItem('quiet-cashflow-signups') || '[]');
    signups.push({ email, createdAt: new Date().toISOString() });
    localStorage.setItem('quiet-cashflow-signups', JSON.stringify(signups));
    status.textContent = 'Saved locally for demo purposes. Connect your email service before launch.';
    form.reset();
  });
}

async function init() {
  try {
    const config = await loadOffers();
    applySiteConfig(config);
    renderOffers(config);
    renderRevenueHint();
    setupLeadForm();
  } catch (error) {
    const offerContainer = document.querySelector(selectors.offers);
    offerContainer.innerHTML = '<p>Offer data could not be loaded. Check data/offers.json and run the validator.</p>';
    console.error(error);
  }
}

init();

export { escapeHtml, estimateMonthlyRevenue, renderOffer };
