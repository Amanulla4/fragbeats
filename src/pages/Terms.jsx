import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const TABS = ['Terms of Service', 'Privacy Policy']

const TERMS = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using FragBeats, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'
  },
  {
    title: '2. User Content',
    content: 'You retain ownership of all content you upload to FragBeats. By uploading content, you grant FragBeats a non-exclusive license to display and distribute your content on our platform.'
  },
  {
    title: '3. Prohibited Content',
    content: 'Users may not upload content that is illegal, harmful, threatening, abusive, harassing, or that infringes on intellectual property rights. FragBeats reserves the right to remove any content that violates these guidelines.'
  },
  {
    title: '4. Account Responsibility',
    content: 'You are responsible for maintaining the security of your account and all activities that occur under your account. Please notify us immediately of any unauthorized use.'
  },
  {
    title: '5. Subscription and Payments',
    content: 'FragBeats Pro and Creator plans are billed monthly or yearly. You may cancel your subscription at any time. Refunds are provided within 7 days of purchase if you are not satisfied.'
  },
  {
    title: '6. Termination',
    content: 'FragBeats reserves the right to terminate or suspend accounts that violate these terms. Users may also delete their accounts at any time through the Settings page.'
  },
  {
    title: '7. Changes to Terms',
    content: 'FragBeats may update these terms at any time. We will notify users of significant changes via email. Continued use of the platform after changes constitutes acceptance of the new terms.'
  },
  {
    title: '8. Contact',
    content: 'For questions about these terms, please contact us at amanpathan221@gmail.com or visit our About page.'
  },
]

const PRIVACY = [
  {
    title: '1. Information We Collect',
    content: 'We collect information you provide when creating an account (name, email), content you upload (clips, music preferences), and usage data (pages visited, features used) to improve our service.'
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use your information to provide and improve FragBeats services, send important account notifications, personalize your experience, and analyze platform usage to build better features.'
  },
  {
    title: '3. Data Sharing',
    content: 'We do not sell your personal data to third parties. We may share anonymized usage data with analytics providers. Your public profile and clips are visible to other FragBeats users.'
  },
  {
    title: '4. Data Security',
    content: 'We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. Please use strong passwords and keep them safe.'
  },
  {
    title: '5. Cookies',
    content: 'FragBeats uses cookies to maintain your session, remember your preferences (like dark mode), and analyze platform usage. You can disable cookies in your browser settings.'
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to access, update, or delete your personal data at any time through Settings. You may also request a copy of all data we hold about you by contacting us.'
  },
  {
    title: '7. Children\'s Privacy',
    content: 'FragBeats is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.'
  },
  {
    title: '8. Contact',
    content: 'For privacy concerns or data requests, contact us at amanpathan221@gmail.com. We will respond within 48 hours.'
  },
]

function Terms() {
  const [activeTab, setActiveTab] = useState('Terms of Service')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// LEGAL</p>
        <h1 className="font-black text-4xl text-white mb-2" style={{ fontFamily: 'monospace' }}>
          Legal Stuff 📋
        </h1>
        <p className="text-slate-400 mb-8">Last updated: January 2025</p>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-widest transition-all duration-200 ${activeTab === tab
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black'
                : 'bg-[#0b1425] border border-cyan-500/20 text-slate-400 hover:border-cyan-400 hover:text-cyan-400'}`}
              style={{ fontFamily: 'monospace' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {(activeTab === 'Terms of Service' ? TERMS : PRIVACY).map((section, i) => (
            <div key={i} className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6 hover:border-cyan-400/20 transition-all duration-300">
              <h3 className="font-black text-white text-sm tracking-widest mb-3" style={{ fontFamily: 'monospace' }}>
                {section.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl text-center">
          <p className="text-slate-400 text-sm">
            Questions? Contact us at{' '}
            <span className="text-cyan-400 font-bold">amanpathan221@gmail.com</span>
          </p>
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Terms