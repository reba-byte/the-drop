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
  <div className="inline-block mb-3 relative">
    {/* Glowing background effect */}
    <div className="absolute inset-0 bg-red-500 blur-xl opacity-30 animate-pulse"></div>
    
    {/* Main badge */}
    <div className="relative bg-gradient-to-br from-slate-900 to-black border-2 border-red-500 rounded-lg px-6 py-3 shadow-2xl">
      <div className="flex items-center gap-3">
        {/* Lightning bolt SVG */}
        <svg width="35" height="35" viewBox="0 0 35 35" className="drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
          <path 
            d="M20 2 L8 18 L16 18 L14 32 L28 14 L19 14 Z" 
            fill="#ef4444"
            stroke="#fca5a5"
            strokeWidth="1"
          />
        </svg>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wider uppercase" style={{textShadow: '0 0 10px rgba(239,68,68,0.5)'}}>
            THE DROP
          </h1>
        </div>
        {/* Target/crosshair accent */}
        <div className="w-8 h-8 rounded-full border-2 border-red-500 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
  <p className="text-slate-400 text-sm uppercase tracking-widest">{group.name}</p>
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