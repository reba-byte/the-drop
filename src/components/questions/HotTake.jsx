import { useState, useEffect } from 'react'

export default function HotTake({ week, onAnswer, answers, myAnswer }) {
  const [selected, setSelected] = useState(myAnswer?.answer || null)
  const [revealed, setRevealed] = useState(!!myAnswer)

  useEffect(() => {
    if (myAnswer) {
      setSelected(myAnswer.answer)
      setRevealed(true)
    }
  }, [myAnswer])

  const handleSelect = async (option) => {
    if (selected) return
    setSelected(option)
    await onAnswer(option)
    setRevealed(true)
  }

  const agreeAnswers = answers.filter(a => a.answer === 'agree')
  const disagreeAnswers = answers.filter(a => a.answer === 'disagree')

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl">🔥</span>
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Hot Take</h2>
        <p className="text-xl text-slate-200">"{week.question}"</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect('agree')}
          className={`p-6 rounded-xl text-center transition-all ${
            selected === 'agree'
              ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
              : 'bg-slate-800 active:bg-slate-700 text-white'
          }`}
        >
          <div className="text-3xl mb-2">👍</div>
          <span className="font-semibold">Agree</span>
          {revealed && agreeAnswers.length > 0 && (
            <div className="mt-3 flex justify-center gap-1 flex-wrap">
              {agreeAnswers.map((a) => (
                <span key={a.id} className="text-xl">{a.member?.emoji}</span>
              ))}
            </div>
          )}
        </button>

        <button
          onClick={() => handleSelect('disagree')}
          className={`p-6 rounded-xl text-center transition-all ${
            selected === 'disagree'
              ? 'bg-red-600 text-white ring-2 ring-red-400'
              : 'bg-slate-800 active:bg-slate-700 text-white'
          }`}
        >
          <div className="text-3xl mb-2">👎</div>
          <span className="font-semibold">Disagree</span>
          {revealed && disagreeAnswers.length > 0 && (
            <div className="mt-3 flex justify-center gap-1 flex-wrap">
              {disagreeAnswers.map((a) => (
                <span key={a.id} className="text-xl">{a.member?.emoji}</span>
              ))}
            </div>
          )}
        </button>
      </div>

      {revealed && (
        <div className="mt-6 text-center text-slate-400 text-sm">
          {answers.length === 1 
            ? "You're the first to weigh in!" 
            : `${answers.length} people have voted`}
        </div>
      )}
    </div>
  )
}