//DONE режим максимального счета за время
//DONE режим максимального счета за ходы
//TODO режим свободных ходов
//TODO режим разного веса фигур
//TODO режим двух игроков
//TODO перемешать
//TODO реализовать умную генерацию доски
//TODO переписать проверку матчей под совпадение двух подряд фишек
//DONE панель управления
//DONE режим пяти цветов
//DONE счет ходов
//DONE починить счет
//DONE формат времени

// import "./index.css";
import React, { useState, useEffect } from "react";
// import Draggable from "react-draggable";

// const rowsTest = [
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "pentagon",
//   "star",
//   "square",
//   "square",
//   "square",
//   "square",
//   "circle",
//   "triangle",
//   "pentagon",
//   "star",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "triangle",
//   "pentagon",
//   "star",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "pentagon",
//   "star",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "star",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "square",
//   "triangle",
//   "pentagon",
//   "star",
//   "pentagon",
//   "square",
//   "square",
//   "square",
//   "triangle",
//   "triangle",
//   "pentagon",
//   "star",
// ];

// const boardSize = 8;
// const classes = () =>
//   gamemode === "fiveColors"
//     ? ["square", "diamond", "circle", "triangle", "pentagon", "star"]
//     : ["square", "diamond", "circle", "triangle", "pentagon"];

const classes = ["square", "diamond", "circle", "triangle", "pentagon", "star"];
const classesFiveColors = ["square", "diamond", "circle", "triangle", "pentagon"];

const App = () => {
  const [currentPieces, setCurrentPieces] = useState([]);
  const [boardSize, setBoardSize] = useState(8);
  const [sizeHasChanged, setSizeHasChanged] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [freeMode, setFreeMode] = useState(false);
  const [movesMade, setMovesMade] = useState(0);
  const [count, setCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [colorGamemode, setColorGamemode] = useState("regular");
  const [constraintGamemode, setConstraintGamemode] = useState("regular");
  const [movesLeft, setMovesLeft] = useState(2);
  const [gameOver, setGameOver] = useState(false);
  const [replay, setReplay] = useState(false);

  const rowGeneral = (i) => [...Array(boardSize)].map((item, index) => i + index);
  const columnGeneral = (i) => [...Array(boardSize)].map((item, index) => i + index * boardSize);

  const getRandomPiece = () => {
    return colorGamemode === "fiveColors"
      ? classesFiveColors[Math.floor(Math.random() * classesFiveColors.length)]
      : classes[Math.floor(Math.random() * classes.length)];
  };

  // const populateBoard = () => {
  //   const rawPieces = [];
  //   for (let i = 0; i < boardSize * boardSize; i++) {
  //     rawPieces.push(getRandomPiece());
  //   }
  //   setCurrentPieces(rawPieces);
  // };

  const populateBoard = () => {
    const rawPieces = [];
    for (let i = 0; i < boardSize * boardSize; i++) {
      rawPieces.push(getRandomPiece());
      while (i % boardSize > 1 && rawPieces[i - 1] === rawPieces[i - 2] && rawPieces[i] === rawPieces[i - 1]) {
        rawPieces[i] = getRandomPiece();
      }
      while (i > 2 * boardSize && rawPieces[i - boardSize] === rawPieces[i - 2 * boardSize] && rawPieces[i] === rawPieces[i - boardSize]) {
        rawPieces[i] = getRandomPiece();
      }
    }
    // console.log(rawPieces);

    setCurrentPieces(rawPieces);
  };

  let indices = new Set();

  const checkForHorizontalMatches = () => {
    for (let i = 0; i < boardSize * boardSize - 2; i++) {
      if (i % boardSize === 6) {
        i += 2;
        // console.log(i + "t");
      }

      const row = rowGeneral(i);
      // console.log(row);

      const currentType = currentPieces[i];

      if (currentType) {
        for (let j = row.length; j > 2; j--) {
          let currentRow = row.slice(0, j);
          // if (rowOfThree.every((item) => currentPieces[item] === currentType)) {
          //   rowOfThree.forEach((index) => (currentPieces[index] = ""));
          //   console.log(i + " " + rowOfThree.length + "h " + currentType);
          // }
          if (
            currentRow.every((piece) => currentPieces[piece] === currentType) &&
            currentRow[currentRow.length - 1] % boardSize >= currentRow.length - 1
            // currentRow[0] % boardSize <= boardSize - currentRow.length
          ) {
            // console.log(currentRow);
            currentRow.forEach((index) => {
              // currentPieces[index] = "";
              // console.log(index);
              indices.add(index);
              // console.log(indices);
            });
            console.log(i + " " + currentRow.length + "h " + currentType);
          }
        }
      }
    }
  };

  const checkForVerticalMatches = () => {
    for (let i = 0; i < boardSize * (boardSize - 2); i++) {
      const column = columnGeneral(i);
      const currentType = currentPieces[i];

      if (currentType) {
        for (let j = column.length; j >= 3; j--) {
          let currentColumn = column.slice(0, j);
          if (
            currentColumn.every((piece) => currentPieces[piece] === currentType) &&
            currentColumn[currentColumn.length - 1] <= currentPieces.length
          ) {
            // console.log(currentColumn);
            currentColumn.forEach((index) => {
              // currentPieces[index] = "";
              indices.add(index);
              // console.log(indices);
            });
            console.log(i + " " + currentColumn.length + "v " + currentType);
          }
        }
      }
    }
  };

  // const removeAllIndices = (array) => {
  //   let copy = [...array];
  //   // console.log(copy);
  //   indices.forEach((item) => {
  //     copy[item] = "";
  //   });
  //   // for (let item in indices) {
  //   //   copy[item] = "";
  //   // }
  //   // console.log(copy);
  //   return copy;
  // };

  const removeAllIndices = () => {
    indices.forEach((item) => {
      if (!currentPieces[item].includes("shrink")) {
        currentPieces[item] = currentPieces[item] + " shrink";
      }
      // currentPieces[item] = "";
      // indices.delete(item);
    });

    movesMade && setCount(count + indices.size);

    // setTimeout(() => {
    //   indices.forEach((item) => {
    //     currentPieces[item] = "";
    //     setCurrentPieces([...currentPieces]);
    //     console.log(item);
    //     firstMoveMade && setCount(count + 1);
    //     // currentPieces[item] = "";
    //     // indices.delete(item);
    //   });
    // }, 100);

    setTimeout(() => {
      for (let i = 0; i < boardSize * boardSize; i++) {
        if (currentPieces[i].includes("shrink")) {
          currentPieces[i] = "";
          setCurrentPieces([...currentPieces]);
        }
      }
    }, 100);

    // for (let item in indices) {
    //   copy[item] = "";
    // }
    // console.log(copy);
  };

  const moveIntoSquareBelow = () => {
    for (let i = 0; i < boardSize * boardSize; i++) {
      if (currentPieces[i] === "") {
        if (i > boardSize) {
          currentPieces[i] = currentPieces[i - boardSize];
          currentPieces[i - boardSize] = "";
          setCurrentPieces([...currentPieces]);
        } else {
          currentPieces[i] = getRandomPiece();
          setCurrentPieces([...currentPieces]);
        }
      }
    }
  };

  const recursivelyDropColumn = () => {
    const dropAllAbove = (index) => {
      if (index > boardSize) {
        currentPieces[index] = currentPieces[index - boardSize];
        setCurrentPieces([...currentPieces]);
        dropAllAbove(index - boardSize);
      } else {
        currentPieces[index] = getRandomPiece();
        setCurrentPieces([...currentPieces]);
      }
    };

    for (let i = 0; i < boardSize * boardSize; i++) {
      if (currentPieces[i] === "") {
        dropAllAbove(i);
      }
    }
  };

  const swapPieces = (index, index2) => {
    let temp = currentPieces[index];
    currentPieces[index] = currentPieces[index2];
    currentPieces[index2] = temp;
    setCurrentPieces([...currentPieces]);
    setMovesMade(movesMade + 1);
    !movesMade && setTimeElapsed(0);
    !movesMade && constraintGamemode === "moves" && setMovesLeft(20);
    !movesMade && constraintGamemode === "time" && setTimeLeft(10);
    setMovesLeft(movesLeft - 1);
  };

  const dragStart = (event) => {
    console.log(event.target.attributes["data-key"].nodeValue);
    setDraggedPiece(event.target.attributes["data-key"].nodeValue);
  };
  const dragDrop = (event) => {
    // console.log(event);
    // console.log(event.currentTarget);
    const targetPieceIndex = event.target.attributes["data-key"].nodeValue;
    if (
      (draggedPiece == targetPieceIndex - 1 && draggedPiece % boardSize != boardSize - 1) ||
      (draggedPiece - 1 == targetPieceIndex && draggedPiece % boardSize != 0) ||
      draggedPiece - boardSize == targetPieceIndex ||
      (draggedPiece == targetPieceIndex - boardSize && 1)
    ) {
      swapPieces(draggedPiece, targetPieceIndex);
    }
  };
  const dragEnd = () => {
    setDraggedPiece(null);
  };

  useEffect(() => {
    populateBoard();
    // console.log(currentPieces);
  }, [boardSize, colorGamemode, constraintGamemode, replay]);

  useEffect(() => {
    const timeIncrement = setInterval(() => {
      if (!gameOver) {
        setTimeElapsed(timeElapsed + 1);
        constraintGamemode === "time" && setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => {
      clearInterval(timeIncrement);
    };
  }, [timeElapsed]);

  useEffect(() => {
    if ((constraintGamemode === "time" && timeLeft === 0) || (constraintGamemode === "moves" && movesLeft === 0)) {
      setGameOver(true);
    }
  }, [timeLeft, movesLeft]);

  // const InitialWork = () => {
  //   useEffect(() => {
  //     const timer = setInterval(() => {
  //       checkForHorizontalMatches();
  //       checkForVerticalMatches();
  //       // console.log(indices);
  //       // console.log(removeAllIndices(currentPieces));
  //       setCurrentPieces(removeAllIndices(currentPieces));
  //       // console.log(currentPieces);
  //       // setInterval(() => {
  //       //   moveIntoSquareBelow();
  //       // }, 2000);
  //       moveIntoSquareBelow();
  //     }, 100);
  //     return () => {
  //       clearInterval(timer);
  //     };
  //   }, []);
  // };

  // InitialWork();

  useEffect(() => {
    const timer = setInterval(() => {
      checkForHorizontalMatches();
      checkForVerticalMatches();
      // console.log(indices);
      // console.log(removeAllIndices(currentPieces));
      removeAllIndices();
      // console.log(currentPieces);
      // setInterval(() => {
      //   moveIntoSquareBelow();
      // }, 2000);
      moveIntoSquareBelow();
      // recursivelyDropColumn();
      console.log("ended");
    }, 250);
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <div className='App'>
      <div className='controlPanel'>
        <div className='boardSizeBtns'>
          <button
            className='boardSizeBtn'
            onClick={() => {
              if (sizeHasChanged) {
                boardSize != 5 && setBoardSize(boardSize - 1);
              } else {
                if (window.confirm("Изменить размер доски? Счет будет обнулен") && boardSize != 5) {
                  setBoardSize(boardSize - 1);
                  setSizeHasChanged(true);
                  setMovesMade(0);
                  setCount(0);
                }
              }
            }}>
            -
          </button>
          <span>Размер доски: {boardSize}</span>
          <button
            className='boardSizeBtn'
            onClick={() => {
              if (sizeHasChanged) {
                setBoardSize(boardSize + 1);
              } else {
                if (window.confirm("Изменить размер доски? Счет будет обнулен")) {
                  setBoardSize(boardSize + 1);
                  setSizeHasChanged(true);
                  setMovesMade(0);
                  setCount(0);
                }
              }
            }}>
            +
          </button>
          {/* <button
          onClick={() => {
            setFreeMode(!freeMode);
          }}>
          Свободный режим: {freeMode ? "включен" : "выключен"}
        </button> */}
        </div>
        <button
          onClick={() => {
            if (window.confirm("Сменить режим? Счет будет обнулен")) {
              setColorGamemode(colorGamemode === "regular" ? "fiveColors" : "regular");
              setMovesMade(0);
              setCount(0);
              // setReplay(!replay);
              setGameOver(false);
            }
          }}>
          {colorGamemode === "regular" ? "Режим пяти цветов" : "Цвета: обычный режим"}
        </button>

        {constraintGamemode !== "time" ? (
          <button
            onClick={() => {
              if (window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode(constraintGamemode === "regular" ? "moves" : "regular");
                setMovesMade(0);
                setCount(0);
                // setReplay(!replay);
                setGameOver(false);
              }
            }}>
            {constraintGamemode === "regular" ? "Ограниченные ходы" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode !== "moves" ? (
          <button
            onClick={() => {
              if (window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode(constraintGamemode === "regular" ? "time" : "regular");
                setMovesMade(0);
                setCount(0);
                // setReplay(!replay);
                setGameOver(false);
              }
            }}>
            {constraintGamemode === "regular" ? "Ограниченное время" : "Ограничения: обычный режим"}
          </button>
        ) : null}
      </div>
      <div className='stats'>
        <span>
          Режим: {colorGamemode === "regular" ? "обычный" : colorGamemode === "fiveColors" ? "пять цветов" : null}
          {constraintGamemode === "moves" ? ", ограниченные ходы" : constraintGamemode === "time" ? ", ограниченное время" : null}
        </span>
        {movesMade > 0 ? (
          <>
            <span>
              Счет: {count}
              {count > 1000 && ". Сумасшедший!"}
            </span>
            {constraintGamemode !== "time" ? (
              <span>
                Время: {timeElapsed >= 3600 && Math.floor(timeElapsed / 3600) + ":"}
                {timeElapsed % 3600 < 600 && 0}
                {Math.floor((timeElapsed % 3600) / 60)}:{timeElapsed % 60 < 10 && 0}
                {timeElapsed % 60}
                {timeElapsed > 3600 && ". Безумец!"}
              </span>
            ) : !gameOver ? (
              <span>
                Осталось времени: 0{Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 && 0}
                {timeLeft % 60}
              </span>
            ) : (
              <span>Время вышло!</span>
            )}
            {constraintGamemode !== "moves" ? (
              <span>
                Ходов сделано: {movesMade}
                {movesMade > 100 && ". Невероятно!"}
              </span>
            ) : !gameOver ? (
              <span>Ходов осталось: {movesLeft}</span>
            ) : (
              <span>Ходы закончились!</span>
            )}
          </>
        ) : null}
        {gameOver && (
          <button
            onClick={() => {
              setReplay(!replay);
              setGameOver(false);
              setMovesLeft(2);
              setMovesMade(0);
              setCount(0);
            }}>
            Переиграть
          </button>
        )}
      </div>

      {!gameOver && (
        <div
          className='board'
          style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, height: `${boardSize}` * 50, width: `${boardSize}` * 50 }}>
          {currentPieces.map((e, i) => (
            <span
              className={"piece " + e}
              key={i}
              data-key={i}
              draggable={true}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
              }}
              onDrop={dragDrop}
              onDragStart={dragStart}
              onDragEnd={dragEnd}>
              {/* <span className='index'>{i}</span> */}
            </span>
          ))}
          {/* <PopulateBoard /> */}
        </div>
      )}
      <style jsx>{`
        .App {
          background: linear-gradient(90deg, #29323c 0%, #485563 100%);
          width: 100vw;
          height: 100vh;
        }

        .controlPanel {
          position: absolute;
          left: 0;
          top: 0;
          width: 300px;
          height: 100vh;
          background: linear-gradient(90deg, #485563 0%, #29323c 100%);
          border: 5px solid #ffffff88;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .board {
          /* width: 400px; */
          /* height: 400px; */
          /* max-width: 800px; */
          /* max-height: 800px; */
          position: absolute;
          top: calc(50vh - 200px);
          left: 350px;
          /* background-color: #fff; */
          display: grid;
          /* grid-template-columns: repeat(8, 1fr); */
          column-gap: 5px;
          row-gap: 5px;
        }

        .piece {
          width: 0;
          height: 0;
          margin: auto auto;
          /* box-shadow: 0 0 2px #000; */
          filter: blur(100%);
          /* transition: 2s ease; */
          border-radius: 5px;
          background-repeat: no-repeat;
          background-position: 50%;
          cursor: grab;
          transition: all 0.1s;
        }

        .shrink {
          transform: scale(0.01);
          transform-origin: 50%;
        }

        .square {
          width: 100%;
          height: 100%;
          background: #e74c3c;
        }

        .diamond {
          background: #8e44ad;
          transform: rotate(45deg) !important;
          width: 80%;
          height: 80%;
          margin: auto;
        }

        .index {
          /* background-color: white;
  color: black;
  /* padding: 3px; */
          /* border-radius: 50%; */
          display: block;
          /* width: 15px; */
          /* height: 15px;   */
        }

        .diamond .index {
          transform: rotate(-45deg);
        }

        .circle {
          width: 100%;
          height: 100%;
          background: #3498db;
          border-radius: 50%;
          transform: rotate(360deg);
        }

        .triangle {
          width: 100%;
          height: 100%;
          /* background: #e67e22; */
          filter: brightness(0) saturate(100%) invert(55%) sepia(87%) saturate(1542%) hue-rotate(349deg) brightness(96%) contrast(88%);
          background-image: url("/img/triangle.svg");
          background-size: 45px;
          /* transform: rotate(120deg); */
        }

        .pentagon {
          width: 100%;
          height: 100%;
          /* background: #2ecc71; */
          filter: brightness(0) saturate(100%) invert(65%) sepia(75%) saturate(431%) hue-rotate(91deg) brightness(88%) contrast(90%);
          background-image: url("/img/pentagon.svg");
          background-size: 40px;
          transform: rotate(144deg);
        }

        .star {
          width: 100%;
          height: 100%;
          /* background: #e0e933; */
          filter: brightness(0) saturate(100%) invert(67%) sepia(97%) saturate(298%) hue-rotate(19deg) brightness(102%) contrast(114%);
          background-image: url("/img/star.svg");
          background-size: 45px;
          transform: rotate(288deg);
        }

        .boardSizeBtns {
          bottom: 20px;
          left: calc(50vw - 90px);
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .boardSizeBtn {
          background-color: #fff;
          /* padding: 10px; */
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: block;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .boardSizeBtns button:hover {
          opacity: 0.5;
          transition: all 0.2s;
        }

        .boardSizeBtns span {
          color: white;
          padding: 0 10px;
        }

        .stats {
          font-size: 20px;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default App;
