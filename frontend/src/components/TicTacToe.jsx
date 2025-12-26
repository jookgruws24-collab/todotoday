import { useState } from 'react'

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const winner = calculateWinner(board)
  const isDraw = !winner && board.every(cell => cell !== null)

  function handleClick(index) {
    if (board[index] || winner) return

    const newBoard = board.slice()
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
  }

  function resetGame() {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
  }

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-semibold z-40"
      >
        🎮 Play Tic Tac Toe
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 p-6 rounded-lg shadow-2xl border-2 border-purple-500 z-40 max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">🎮 Tic Tac Toe</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="mb-4 text-center">
        {winner ? (
          <div className="text-2xl font-bold text-green-400 animate-pulse">
            🎉 Player {winner} Wins! 🎉
          </div>
        ) : isDraw ? (
          <div className="text-xl font-bold text-yellow-400">
            🤝 It's a Draw!
          </div>
        ) : (
          <div className="text-lg text-white">
            Current Player: <span className="font-bold text-blue-400">{isXNext ? 'X' : 'O'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 text-3xl font-bold rounded-lg transition-all ${
              cell === 'X' 
                ? 'bg-blue-500 text-white' 
                : cell === 'O' 
                ? 'bg-red-500 text-white' 
                : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
            } ${!cell && !winner ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
            disabled={cell !== null || winner !== null}
          >
            {cell}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-semibold transition-all"
      >
        🔄 New Game
      </button>

      <div className="mt-3 text-xs text-gray-400 text-center">
        Take a break and play! 🎄
      </div>
    </div>
  )
}
