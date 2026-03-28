const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'forever',
    description: 'Perfect for curious learners exploring new concepts.',
    highlight: false,
    cta: 'Get started',
    features: [
      '5 explanations per month',
      'Web Speech voice narration',
      'Whiteboard animations',
      'Scene-by-scene breakdown',
      'Transcript view',
      'Session history (last 5)',
    ],
    missing: ['Premium AI voices', 'Unlimited history', 'Priority generation', 'API access'],
  },
  {
    name: 'Pro',
    price: '$12',
    sub: 'per month',
    description: 'For students and professionals who learn every day.',
    highlight: true,
    badge: 'Most popular',
    cta: 'Start free trial',
    features: [
      'Unlimited explanations',
      'Premium ElevenLabs voice',
      'Unlimited history',
      'Priority generation speed',
      'All Starter features',
      'Early access to new features',
    ],
    missing: ['Team sharing', 'API access'],
  },
  {
    name: 'Team',
    price: '$49',
    sub: 'per month',
    description: 'For teams who want to learn and teach together.',
    highlight: false,
    cta: 'Contact us',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared team history',
      'Custom AI voice selection',
      'REST API access',
      'Dedicated support',
    ],
    missing: [],
  },
];

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="rgba(99,102,241,0.15)" />
    <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.04)" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#4a4a6a" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function PricingPage({ onNavigate, onOpenAuth }) {
  return (
    <div className="pricing-page">
      <div className="pricing-hero">
        <h1>Simple, transparent pricing</h1>
        <p>Start free. Upgrade when you need more.</p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`pricing-card ${plan.highlight ? 'highlighted' : ''}`}>
            {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
            <div className="pricing-card-header">
              <h3>{plan.name}</h3>
              <div className="pricing-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-sub">{plan.sub}</span>
              </div>
              <p className="pricing-description">{plan.description}</p>
            </div>

            <button
              className={`pricing-cta ${plan.highlight ? 'cta-primary' : 'cta-secondary'}`}
              onClick={() => onOpenAuth('signup')}
            >
              {plan.cta}
            </button>

            <div className="pricing-features">
              {plan.features.map((f) => (
                <div key={f} className="feature-row">
                  <CheckIcon />
                  <span>{f}</span>
                </div>
              ))}
              {plan.missing.map((f) => (
                <div key={f} className="feature-row missing">
                  <XIcon />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-faq">
        <h2>Frequently asked questions</h2>
        <div className="faq-grid">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel your subscription at any time with no fees or penalties.' },
            { q: 'What counts as an explanation?', a: 'Each time you generate a new concept breakdown counts as one explanation.' },
            { q: 'Is my history saved?', a: 'Starter plans keep your last 5 sessions. Pro and Team plans keep unlimited history.' },
            { q: 'What is the ElevenLabs voice?', a: 'Pro and Team plans use ElevenLabs AI voices for natural, human-sounding narration.' },
          ].map(({ q, a }) => (
            <div key={q} className="faq-item">
              <h4>{q}</h4>
              <p>{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-back">
        <button className="nav-btn-ghost" onClick={() => onNavigate('home')}>← Back to app</button>
      </div>
    </div>
  );
}
