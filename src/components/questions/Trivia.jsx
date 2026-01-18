import { useState, useEffect } from 'react'

export default function Trivia({ week, onAnswer, answers, myAnswer }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(!!myAnswer)

  useEffect(() => {
    if (myAnswer) {
      setSubmitted(true)
    }
  }, [myAnswer])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    await onAnswer(answer.trim())
    setSubmitted(true)
  }

  const correctAnswer = week.correct_answer?.toLowerCase()
  
  const sortedAnswers = [...answers].sort((a, b) => {
    const aCorrect = a.answer?.toLowerCase() === correctAnswer
    const bCorrect = b.answer?.toLowerCase() === correctAnswer
    if (aCorrect && !bCorrect) return -1
    if (!aCorrect && bCorrect) return 1
    return 0
  })

  if (!submitted) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {week.question}
        </h2>

        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-center text-xl placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />

        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className={`w-full mt-4 py-4 rounded-xl font-semibold transition-all ${
            answer.trim()
              ? 'bg-cyan-600 active:bg-cyan-500 text-white'
              : 'bg-slate-700 text-slate-500'
          }`}
        >
          Lock it in 🔒
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-6">
        {week.question}
      </h2>

      <div className="text-center p-4 bg-cyan-900/30 rounded-xl border border-cyan-700/50 mb-6">
        <div className="text-slate-400 text-sm mb-1">Correct answer</div>
        <div className="text-3xl font-bold text-cyan-400">{week.correct_answer}</div>
      </div>

      {sortedAnswers.length > 0 && (
        <>
          <div className="text-slate-400 text-sm uppercase tracking-wider mb-3">Answers</div>
          
          <div className="space-y-2">
            {sortedAnswers.map((entry, index) => {
              const isCorrect = entry.answer?.toLowerCase() === correctAnswer
              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-xl flex items-center justify-between ${
                    isCorrect 
                      ? 'bg-emerald-900/30 border border-emerald-700/50' 
                      : 'bg-slate-800/50 border border-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{entry.member?.emoji}</span>
                    <span className={isCorrect ? 'text-emerald-300' : 'text-slate-400'}>
                      {entry.member?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                      {entry.answer}
                    </span>
                    {isCorrect && index === 0 && <span>🏆</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}