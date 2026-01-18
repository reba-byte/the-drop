import { useState, useEffect } from 'react'

export default function Confession({ week, onAnswer, answers, myAnswer }) {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(!!myAnswer)

  useEffect(() => {
    if (myAnswer) {
      setSubmitted(true)
    }
  }, [myAnswer])

  const handleSubmit = async () => {
    if (!text.trim()) return
    await onAnswer(text.trim())
    setSubmitted(true)
  }

  if (!submitted) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {week.question}
        </h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Confess..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 h-32 resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`w-full mt-4 py-4 rounded-xl font-semibold transition-all ${
            text.trim()
              ? 'bg-emerald-600 active:bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-500'
          }`}
        >
          Submit confession 🫣
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        {week.question}
      </h2>

      <div className="space-y-4">
        {answers.map((response) => (
          <div key={response.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{response.member?.emoji}</span>
              <span className="font-semibold text-white">{response.member?.name}</span>
            </div>
            <p className="text-slate-200">{response.answer}</p>
          </div>
        ))}
      </div>

      {answers.length === 0 && (
        <div className="text-center text-slate-500">
          No confessions yet...
        </div>
      )}
    </div>
  )
}