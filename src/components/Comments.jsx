import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useGroup } from '../context/GroupContext'

export default function Comments({ weekId }) {
  const { member } = useGroup()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadComments()
  }, [weekId])

  async function loadComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('*, member:members(name, emoji)')
      .eq('week_id', weekId)
      .order('created_at', { ascending: true })

    if (error) {
      console.log('Error loading comments:', error.message)
    } else {
      setComments(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    setSubmitting(true)
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        week_id: weekId,
        member_id: member.id,
        text: newComment.trim()
      })
      .select('*, member:members(name, emoji)')
      .single()

    if (error) {
      console.log('Error adding comment:', error.message)
    } else {
      setComments([...comments, data])
      setNewComment('')
    }
    
    setSubmitting(false)
  }

  function timeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-700/50">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
        Comments
      </h3>

      {/* Comments list */}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : comments.length === 0 ? (
        <p className="text-slate-500 text-sm mb-4">No comments yet. Start the conversation!</p>
      ) : (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{comment.member?.emoji}</span>
                <span className="text-slate-300 text-sm font-medium">{comment.member?.name}</span>
                <span className="text-slate-600 text-xs">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-slate-200 text-sm pl-7">{comment.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            newComment.trim() && !submitting
              ? 'bg-violet-600 text-white active:bg-violet-500'
              : 'bg-slate-700 text-slate-500'
          }`}
        >
          Send
        </button>
      </form>
    </div>
  )
}