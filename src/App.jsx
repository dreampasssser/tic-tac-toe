import { useMemo, useState } from 'react';

function Square({ shouldHighLight, value, onSquareClick }) {
  return (
    <button
      className={'square' + (shouldHighLight ? ' highlight' : '')}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const handleClick = (i, position) => {
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares, position);
  };

  const renderSquare = (i, j, winLine) => {
    const index = 3 * i + j;
    const position = [i, j];
    return (
      <Square
        key={index}
        shouldHighLight={winLine.includes(index)}
        value={squares[index]}
        onSquareClick={() => handleClick(index, [...position])}
      />
    );
  };

  const renderBoard = winLine => {
    const board = [];
    for (let i = 0; i < 3; i++) {
      const boardRow = [];
      for (let j = 0; j < 3; j++) {
        boardRow.push(renderSquare(i, j, winLine));
      }
      board.push(
        <div key={`row-${i}`} className="board-row">
          {boardRow}
        </div>
      );
    }
    return board;
  };

  const { winner, winLine } = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.some(square => square === null)) {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  } else {
    status = 'The game ended in a draw.';
  }
  const board = renderBoard(winLine);

  return (
    <>
      <div className="status">{status}</div>
      {board}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),
      position: Array(2).fill(0),
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [ascOrder, setAscOrder] = useState(true);
  const xIsNext = stepNumber % 2 === 0;
  const currentSquares = history[stepNumber].squares.slice();
  const orderTxt = ascOrder
    ? '升序（点击切换为降序）'
    : '降序（点击切换为升序）';

  const handlePlay = (squares, position) => {
    setHistory([...history.slice(), { squares, position }]);
    setStepNumber(stepNumber + 1);
  };

  const jumpTo = step => {
    setStepNumber(step);
  };

  const handleOrder = () => {
    setAscOrder(!ascOrder);
  };

  const moves = useMemo(
    () =>
      history
        .map((value, move) => ({ ...value, move }))
        .sort((a, b) => (ascOrder ? a.move - b.move : b.move - a.move))
        .map(({ move, position }) => {
          const desc = move
            ? `Go to move #${move} (${position[0]}, ${position[1]})`
            : 'Go to game start';
          return (
            <li key={move}>
              <button onClick={() => jumpTo(move)}>{desc}</button>
            </li>
          );
        }),
    [history, ascOrder]
  );

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <div>You are at move #{stepNumber}</div>
        <div>
          <button onClick={handleOrder}>{orderTxt}</button>
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
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
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], winLine: lines[i] };
    }
  }
  return { winner: null, winLine: [] };
}
