import { useState, useEffect } from 'react'

export default function ThisOrThat({ week, onAnswer, answers, myAnswer }) {
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

  const optionAAnswers = answers.filter(a => a.answer === 'option_a')
  const optionBAnswers = answers.filter(a => a.answer === 'option_b')

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-4">
        Would you rather...
      </h2>

      <div className="space-y-4">
        <button
          onClick={() => handleSelect('option_a')}
          className={`w-full p-6 rounded-xl text-left transition-all ${
            selected === 'option_a'
              ? 'bg-purple-600 text-white ring-2 ring-purple-400'
              : 'bg-slate-800 active:bg-slate-700 text-white'
          }`}
        >
          <div className="text-purple-300 text-sm mb-1">Option A</div>
          <div className="text-xl font-semibold">{week.option_a}</div>
          {revealed && optionAAnswers.length > 0 && (
            <div className="mt-3 flex gap-1 flex-wrap">
              {optionAAnswers.map((a) => (
                <span key={a.id} className="text-xl">{a.member?.emoji}</span>
              ))}
            </div>
          )}
        </button>

        <div className="text-center text-slate-500 font-bold">OR</div>

        <button
          onClick={() => handleSelect('option_b')}
          className={`w-full p-6 rounded-xl text-left transition-all ${
            selected === 'option_b'
              ? 'bg-purple-600 text-white ring-2 ring-purple-400'
              : 'bg-slate-800 active:bg-slate-700 text-white'
          }`}
        >
          <div className="text-purple-300 text-sm mb-1">Option B</div>
          <div className="text-xl font-semibold">{week.option_b}</div>
          {revealed && optionBAnswers.length > 0 && (
            <div className="mt-3 flex gap-1 flex-wrap">
              {optionBAnswers.map((a) => (
                <span key={a.id} className="text-xl">{a.member?.emoji}</span>
              ))}
            </div>
          )}
        </button>
      </div>

      {revealed && (
        <div className="mt-6 text-center text-slate-400 text-sm">
          {answers.length === 1 
            ? "You're the first to choose!" 
            : `${answers.length} people have decided`}
        </div>
      )}
    </div>
  )
}