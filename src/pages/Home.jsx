import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGroup } from '../context/GroupContext'
import { supabase } from '../lib/supabase'
import NotificationPrompt from '../components/NotificationPrompt'

export default function Home() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { member, group, loading: groupLoading } = useGroup()
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!group) {
      setLoading(false)
      return
    }

    async function loadWeeks() {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('group_id', group.id)
        .or(`drops_at.is.null,drops_at.lte.${now}`)
        .order('week_number', { ascending: false })

      if (error) {
        console.log('Error loading weeks:', error.message)
      } else {
        setWeeks(data)
      }
      setLoading(false)
    }

    loadWeeks()
  }, [group])

  if (groupLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-md mx-auto pt-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">The Drop</h1>
          <p className="text-slate-400 mb-8">You're not in a group yet</p>
          
          <button
            onClick={() => navigate('/join')}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-4 px-6 rounded-xl mb-4"
          >
            Join a Group
          </button>
          
          <button
            onClick={signOut}
            className="text-slate-500 hover:text-slate-300 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const currentWeek = weeks[0]
  const pastWeeks = weeks.slice(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <NotificationPrompt />
      <div className="max-w-md mx-auto pt-8">
        
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <div className="relative">
              {/* Bold outlined badge */}
              <div className="border-4 border-violet-500 rounded-2xl px-8 py-4 bg-slate-900/50 backdrop-blur-sm shadow-2xl transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-4">
                  {/* Flame icon - custom SVG */}
                  <svg width="40" height="40" viewBox="0 0 40 40" className="animate-pulse">
                    <defs>
                      <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
                        <stop offset="50%" style={{stopColor: '#ef4444', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#dc2626', stopOpacity: 1}} />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M20 5 Q 25 12, 28 18 Q 30 22, 30 27 Q 30 35, 20 38 Q 10 35, 10 27 Q 10 22, 12 18 Q 15 12, 20 5 Z" 
                      fill="url(#flameGradient)"
                    />
                    <path 
                      d="M20 15 Q 22 18, 23 21 Q 24 24, 24 27 Q 24 31, 20 33 Q 16 31, 16 27 Q 16 24, 17 21 Q 18 18, 20 15 Z" 
                      fill="#fbbf24"
                      opacity="0.7"
                    />
                  </svg>
                  <h1 className="text-4xl font-black text-white tracking-tight">THE DROP</h1>
                </div>
              </div>
            </div>
          </div>
          <p className="text-slate-400">{group.name}</p>
        </div>

        {/* User info */}
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center justify-between mb-6 px-2 w-full"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{member.emoji}</span>
            <span className="text-slate-300">{member.name}</span>
            {member.is_curator && (
              <span className="bg-violet-600/30 text-violet-300 text-xs px-2 py-0.5 rounded-full">
                Curator
              </span>
            )}
          </div>
          <span className="text-slate-500 text-sm">Edit →</span>
        </button>

        {/* Curator link */}
        {member.is_curator && (
          <button
            onClick={() => navigate('/curator')}
            className="w-full bg-violet-900/30 border border-violet-700/50 text-violet-300 rounded-xl p-3 mb-6 text-sm"
          >
            ✨ Manage Questions
          </button>
        )}

        {/* Current Week Card */}
        {currentWeek ? (
          <button 
            onClick={() => navigate(`/question/${currentWeek.id}`)}
            className="block w-full text-left bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 mb-6 active:scale-95 transition-transform"
          >
            <p className="text-violet-200 text-sm font-medium mb-2">THIS WEEK</p>
            <p className="text-white text-xl font-bold mb-3">{currentWeek.category}</p>
            <p className="text-violet-100">{currentWeek.question}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-violet-200 text-sm">Tap to play →</span>
            </div>
          </button>
        ) : (
          <div className="bg-slate-800/30 rounded-2xl p-6 mb-6 text-center">
            <p className="text-slate-500">No questions yet this week</p>
          </div>
        )}

        {/* Past Weeks */}
        {pastWeeks.length > 0 && (
          <>
            <h2 className="text-slate-400 text-sm font-medium mb-3 uppercase tracking-wider">
              Past Weeks
            </h2>
            <div className="space-y-2">
              {pastWeeks.map((week) => (
                <button 
                  key={week.id} 
                  onClick={() => navigate(`/question/${week.id}`)}
                  className="block w-full text-left bg-slate-800/30 active:bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-xs">{week.category}</span>
                      <p className="text-slate-300 text-sm">{week.question}</p>
                    </div>
                    <span className="text-slate-600">→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}