import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

const PLANS = [
  {
    name: 'FREE',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for getting started',
    color: '#00f5ff',
    features: [
      '✅ Upload up to 5 clips/month',
      '✅ Access to 10 lo-fi tracks',
      '✅ Basic analytics',
      '✅ Community access',
      '✅ Standard quality uploads',
      '❌ No ads removal',
      '❌ No priority support',
      '❌ No exclusive tracks',
    ],
    cta: 'GET STARTED FREE',
    popular: false,
  },
  {
    name: 'PRO',
    price: { monthly: 99, yearly: 79 },
    description: 'For serious creators',
    color: '#bf00ff',
    features: [
      '✅ Unlimited clip uploads',
      '✅ Access to 100+ lo-fi tracks',
      '✅ Advanced analytics',
      '✅ Community access',
      '✅ HD quality uploads',
      '✅ No ads experience',
      '✅ Priority support',
      '✅ Exclusive tracks monthly',
    ],
    cta: 'GO PRO',
    popular: true,
  },
  {
    name: 'CREATOR',
    price: { monthly: 199, yearly: 159 },
    description: 'For top creators and teams',
    color: '#ff6b35',
    features: [
      '✅ Everything in Pro',
      '✅ Custom profile badge',
      '✅ Featured on leaderboard',
      '✅ Early access to features',
      '✅ 4K quality uploads',
      '✅ Monetization access',
      '✅ Dedicated support',
      '✅ Collab opportunities',
    ],
    cta: 'GO CREATOR',
    popular: false,
  },
]

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your subscription anytime. No hidden fees, no questions asked.' },
  { q: 'Is the free plan really free?', a: 'Yes, 100% free forever. No credit card required to get started.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, and net banking. More methods coming soon.' },
  { q: 'Can I switch plans?', a: 'Absolutely! You can upgrade or downgrade your plan at any time.' },
]

function Pricing() {
  const [yearly, setYearly] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-cyan-400 text-xs tracking-widest uppercase mb-4">// PRICING</p>
          <h1 className="font-black text-5xl text-white mb-4" style={{ fontFamily: 'monospace' }}>
            Simple Pricing 💰
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Start free, upgrade when you're ready. No hidden fees ever.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-[#0b1425] border border-cyan-500/20 rounded-full px-6 py-3">
            <span className={`text-sm font-bold transition-colors duration-200 ${!yearly ? 'text-cyan-400' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${yearly ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${yearly ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-bold transition-colors duration-200 ${yearly ? 'text-cyan-400' : 'text-slate-500'}`}>
              Yearly <span className="text-green-400 text-xs">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`bg-[#0b1425] rounded-xl p-6 border transition-all duration-300 relative ${plan.popular ? 'border-purple-500/50 scale-105' : 'border-cyan-500/10 hover:border-cyan-400/30'}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 py-1 rounded-full text-xs font-black tracking-widest" style={{ fontFamily: 'monospace' }}>
                  MOST POPULAR
                </div>
              )}

              {/* Plan name */}
              <div className="font-black text-sm tracking-widest mb-2" style={{ fontFamily: 'monospace', color: plan.color }}>
                {plan.name}
              </div>

              {/* Price */}
              <div className="mb-2">
                <span className="font-black text-4xl text-white" style={{ fontFamily: 'monospace' }}>
                  {plan.price.monthly === 0 ? 'FREE' : `₹${yearly ? plan.price.yearly : plan.price.monthly}`}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-slate-500 text-sm ml-2">/month</span>
                )}
              </div>

              <p className="text-slate-500 text-xs mb-6">{plan.description}</p>

              {/* Features */}
              <div className="flex flex-col gap-2 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="text-sm" style={{ color: feature.startsWith('❌') ? '#475569' : '#e2e8f0' }}>
                    {feature}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate('/auth')}
                className={`w-full py-3 rounded-lg font-black text-xs tracking-widest transition-all duration-200 ${plan.popular
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:brightness-110'
                  : 'border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
                style={{ fontFamily: 'monospace' }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3 text-center">// FAQ</p>
          <h2 className="font-black text-3xl text-white mb-8 text-center" style={{ fontFamily: 'monospace' }}>
            Got Questions? 🤔
          </h2>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-[#0b1425] border border-cyan-500/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-white text-sm font-bold">{faq.q}</span>
                  <span className="text-cyan-400 text-lg">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-slate-400 text-sm leading-relaxed border-t border-cyan-500/10 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Pricing