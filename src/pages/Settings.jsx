import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useTheme } from '../context/ThemeContext'

const SECTIONS = ['Account', 'Notifications', 'Privacy', 'Appearance']

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${value ? 'bg-gradient-to-r from-cyan-400 to-purple-500' : 'bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${value ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

function Settings() {
  const [activeSection, setActiveSection] = useState('Account')
  const { isDark, toggleTheme } = useTheme()

  const [notifSettings, setNotifSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: false,
    newsletter: false,
  })

  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showViews: true,
    allowComments: true,
    showFollowers: true,
  })

  const [account, setAccount] = useState({
    username: '@fragkingAman',
    email: 'amanpathan221@gmail.com',
    bio: 'Dropping frags and vibes since 2021. BGMI rank — Conqueror 🏆',
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-8 pt-32 pb-16">

        {/* Header */}
        <p className="text-cyan-400 text-xs tracking-widest uppercase mb-3">// SETTINGS</p>
        <h1 className="font-black text-4xl text-white mb-8" style={{ fontFamily: 'monospace' }}>
          Settings ⚙️
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl overflow-hidden">
              {SECTIONS.map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 border-b border-cyan-500/10 last:border-0 ${activeSection === section
                    ? 'text-cyan-400 bg-cyan-500/10 font-bold'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5'}`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">

            {/* Account Settings */}
            {activeSection === 'Account' && (
              <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6">
                <h3 className="font-black text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
                  ACCOUNT SETTINGS
                </h3>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-cyan-500/10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-3xl">
                    🎮
                  </div>
                  <div>
                    <button className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-4 py-2 rounded text-xs font-black tracking-widest" style={{ fontFamily: 'monospace' }}>
                      CHANGE AVATAR
                    </button>
                    <p className="text-slate-500 text-xs mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Username</label>
                    <input
                      value={account.username}
                      onChange={e => setAccount({ ...account, username: e.target.value })}
                      className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Email</label>
                    <input
                      value={account.email}
                      onChange={e => setAccount({ ...account, email: e.target.value })}
                      className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs tracking-widest uppercase mb-2 block">Bio</label>
                    <textarea
                      value={account.bio}
                      onChange={e => setAccount({ ...account, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-[#040810] border border-cyan-500/20 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400 transition-colors duration-200 resize-none"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-cyan-400 to-purple-500 text-black px-6 py-3 rounded-lg font-black text-sm tracking-widest hover:brightness-110 transition-all duration-200 self-start" style={{ fontFamily: 'monospace' }}>
                    SAVE CHANGES
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === 'Notifications' && (
              <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6">
                <h3 className="font-black text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
                  NOTIFICATION SETTINGS
                </h3>
                <div className="flex flex-col gap-4">
                  {Object.entries(notifSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-cyan-500/10 last:border-0">
                      <div>
                        <div className="text-white text-sm font-bold capitalize">{key}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {key === 'likes' && 'Get notified when someone likes your clip'}
                          {key === 'comments' && 'Get notified when someone comments'}
                          {key === 'follows' && 'Get notified when someone follows you'}
                          {key === 'mentions' && 'Get notified when someone mentions you'}
                          {key === 'newsletter' && 'Receive FragBeats weekly newsletter'}
                        </div>
                      </div>
                      <Toggle
                        value={value}
                        onChange={v => setNotifSettings({ ...notifSettings, [key]: v })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'Privacy' && (
              <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6">
                <h3 className="font-black text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
                  PRIVACY SETTINGS
                </h3>
                <div className="flex flex-col gap-4">
                  {Object.entries(privacySettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-3 border-b border-cyan-500/10 last:border-0">
                      <div>
                        <div className="text-white text-sm font-bold">
                          {key === 'publicProfile' && 'Public Profile'}
                          {key === 'showViews' && 'Show View Count'}
                          {key === 'allowComments' && 'Allow Comments'}
                          {key === 'showFollowers' && 'Show Followers Count'}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          {key === 'publicProfile' && 'Anyone can see your profile and clips'}
                          {key === 'showViews' && 'Display view count on your clips'}
                          {key === 'allowComments' && 'Allow others to comment on your clips'}
                          {key === 'showFollowers' && 'Display your followers count publicly'}
                        </div>
                      </div>
                      <Toggle
                        value={value}
                        onChange={v => setPrivacySettings({ ...privacySettings, [key]: v })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'Appearance' && (
              <div className="bg-[#0b1425] border border-cyan-500/10 rounded-xl p-6">
                <h3 className="font-black text-white tracking-widest mb-6" style={{ fontFamily: 'monospace' }}>
                  APPEARANCE SETTINGS
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between py-3 border-b border-cyan-500/10">
                    <div>
                      <div className="text-white text-sm font-bold">Dark Mode</div>
                      <div className="text-slate-500 text-xs mt-0.5">Switch between dark and light theme</div>
                    </div>
                    <Toggle value={isDark} onChange={toggleTheme} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-cyan-500/10">
                    <div>
                      <div className="text-white text-sm font-bold">Accent Color</div>
                      <div className="text-slate-500 text-xs mt-0.5">Choose your preferred accent color</div>
                    </div>
                    <div className="flex gap-2">
                      {['#00f5ff', '#bf00ff', '#ff6b35', '#00ff88', '#ff3366'].map(color => (
                        <div
                          key={color}
                          className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 border-2 border-white/20"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-white text-sm font-bold">Compact Mode</div>
                      <div className="text-slate-500 text-xs mt-0.5">Show more content with less spacing</div>
                    </div>
                    <Toggle value={false} onChange={() => {}} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Settings