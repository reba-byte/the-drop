import { useState, useEffect } from 'react'

export default function RankThese({ week, onAnswer, answers, myAnswer }) {
  const [rankOrder, setRankOrder] = useState([])
  const [revealed, setRevealed] = useState(!!myAnswer)

  // Parse items from week data (stored as JSON)
  const items = week.items ? JSON.parse(week.items) : []

  useEffect(() => {
    if (myAnswer) {
      setRankOrder(JSON.parse(myAnswer.answer))
      setRevealed(true)
    }
  }, [myAnswer])

  const handleItemClick = (item) => {
    if (revealed) return
    
    if (rankOrder.includes(item)) {
      // Remove from ranking
      setRankOrder(rankOrder.filter(i => i !== item))
    } else if (rankOrder.length < items.length) {
      // Add to ranking
      setRankOrder([...rankOrder, item])
    }
  }

  const handleSubmit = async () => {
    if (rankOrder.length !== items.length) return
    await onAnswer(JSON.stringify(rankOrder))
    setRevealed(true)
  }

  const availableItems = items.filter(item => !rankOrder.includes(item))

  return (
    <div>
      <div className="text-center mb-6">
        <span className="text-4xl">📊</span>
        <h2 className="text-2xl font-bold text-white mt-4 mb-2">Rank These</h2>
        <p className="text-xl text-slate-200 mb-2">{week.question}</p>
        <p className="text-orange-400 text-sm">Tap to order from worst to best</p>
      </div>

      {!revealed ? (
        <div className="space-y-4">
          {/* Available items to rank */}
          {availableItems.length > 0 && (
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Tap items in order:</p>
              <div className="flex flex-wrap gap-2">
                {availableItems.map(item => (
                  <button
                    key={item}
                    onClick={() => handleItemClick(item)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ranking slots */}
          <div className="space-y-2">
            {items.map((_, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                  rankOrder[index] 
                    ? 'bg-orange-900/30 border border-orange-700/50' 
                    : 'bg-slate-800/30 border border-slate-700/50 border-dashed'
                }`}
              >
                <span className="text-slate-500 font-medium w-8">
                  {index === 0 ? '😢' : index === items.length - 1 ? '🔥' : `${index + 1}.`}
                </span>
                {rankOrder[index] ? (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-white font-medium">{rankOrder[index]}</span>
                    <button 
                      onClick={() => handleItemClick(rankOrder[index])}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-600 text-sm">
                    {index === 0 ? 'Worst' : index === items.length - 1 ? 'Best' : '...'}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={rankOrder.length !== items.length}
            className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all ${
              rankOrder.length === items.length
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {rankOrder.length === items.length ? 'Lock in ranking' : `Rank ${items.length - rankOrder.length} more`}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Show everyone's rankings */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
            <p className="text-slate-400 text-sm mb-2">Your ranking:</p>
            <div className="space-y-1">
              {rankOrder.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-500 w-6">{idx + 1}.</span>
                  <span className="text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other members' rankings */}
          {answers.filter(a => a.member_id !== myAnswer?.member_id).map((answer) => (
            <div key={answer.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{answer.member?.emoji}</span>
                <span className="font-medium text-white">{answer.member?.name}</span>
              </div>
              <div className="space-y-1">
                {JSON.parse(answer.answer).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-6">{idx + 1}.</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Commentary */}
          <div className="mt-6 text-center text-slate-400 text-sm italic">
            Interesting how everyone's priorities differ here.
          </div>
        </div>
      )}
    </div>
  )
}