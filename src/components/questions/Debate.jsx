import { useState, useEffect } from 'react'

export default function Debate({ week, onAnswer, answers, myAnswer, member, totalMembers }) {  const [selected, setSelected] = useState(myAnswer?.answer || null)
const [revealed, setRevealed] = useState(!!myAnswer && week.shouldReveal)
  useEffect(() => {
  if (myAnswer) {
    setSelected(myAnswer.answer)
    if (week.shouldReveal) {
      setRevealed(true)
    }
  }
}, [myAnswer, week.shouldReveal])

 const handleSelect = async (option) => {
  if (selected) return
  setSelected(option)
  await onAnswer(option)
  if (week.shouldReveal) {
    setRevealed(true)
  }
}

  const optionAAnswers = answers.filter(a => a.answer === 'option_a')
  const optionBAnswers = answers.filter(a => a.answer === 'option_b')

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        {week.question}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect('option_a')}
          className={`relative p-6 rounded-xl text-center transition-all ${
            selected === 'option_a'
              ? 'bg-rose-600 text-white ring-2 ring-rose-400'
              : 'bg-slate-800 active:bg-slate-700 text-white'
          }`}
        >
          <span className="text-lg font-semibold">{week.option_a}</span>
          {revealed && optionAAnswers.length > 0 && (
            <div className="mt-3 flex justify-center gap-1 flex-wrap">
              {optionAAnswers.map((a) => (
                <span key={a.id} className="text-xl" title={a.member?.name}>
                  {a.member?.emoji}
                </span>
              ))}
            </div>
          )}
        </button>

        <button
          onClick={() => handleSelect('option_b')}
          className={`relative p-6 rounded-xl text-center transition-all ${
            selected === 'option_b'
              ? 'bg-rose-600 text-white ring-2 ring-rose-400'
              : 'bg-slate-800 active:bg-slate-700 text-white'
          }`}
        >
          <span className="text-lg font-semibold">{week.option_b}</span>
          {revealed && optionBAnswers.length > 0 && (
            <div className="mt-3 flex justify-center gap-1 flex-wrap">
              {optionBAnswers.map((a) => (
                <span key={a.id} className="text-xl" title={a.member?.name}>
                  {a.member?.emoji}
                </span>
              ))}
            </div>
          )}
        </button>
      </div>

      {/* Waiting message - shows after answering but before reveal */}
        {selected && !revealed && (
          <div className="mt-6 text-center text-slate-400 text-sm">
            ✓ Answer submitted! {answers.length} of {totalMembers} have answered...
          </div>
        )}

      {revealed && (
        <div className="mt-6 text-center text-slate-400 text-sm">
          {answers.length === 1 
            ? "You're the first to answer!" 
            : `${answers.length} people have answered`}
        </div>
      )}
    </div>
  )
}