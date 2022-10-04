//TODO режим свободных/строгих ходов
//TODO перемешать
//TODO экстра мувы
//TODO сервер, доска рекордов ограниченных режимов
// ? TODO переписать проверку матчей под совпадение двух подряд фишек
//DONE режим разного веса фигур
//DONE свайп на телефоне
//DONE режим максимального счета за время
//DONE режим максимального счета за ходы
//DONE режим двух игроков
//DONE реализовать умную генерацию доски
//DONE панель управления
//DONE режим пяти цветов
//DONE счет ходов
//DONE починить счет
//DONE формат времени

// import "./index.css";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
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
  const [movesMade, setMovesMade] = useState(0);
  const [count, setCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [colorGamemode, setColorGamemode] = useState("regular");
  const [constraintGamemode, setConstraintGamemode] = useState("regular");
  const [movesLeft, setMovesLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [replay, setReplay] = useState(false);
  const [count2, setCount2] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turn, setTurn] = useState(1);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [differentValueMode, setDifferentValueMode] = useState(false);

  const getRandomPiece = () => {
    return colorGamemode === "fiveColors"
      ? classesFiveColors[Math.floor(Math.random() * classesFiveColors.length)]
      : classes[Math.floor(Math.random() * classes.length)];
  };

  const populateBoard = () => {
    const rawPieces = [];
    for (let i = 0; i < boardSize * boardSize; i++) {
      rawPieces.push(getRandomPiece());
      while (
        (i % boardSize > 1 && rawPieces[i - 1] === rawPieces[i - 2] && rawPieces[i] === rawPieces[i - 1]) ||
        (i > 2 * boardSize - 1 && rawPieces[i - boardSize] === rawPieces[i - 2 * boardSize] && rawPieces[i] === rawPieces[i - boardSize])
      ) {
        rawPieces[i] = getRandomPiece();
      }
    }
    setCurrentPieces(rawPieces);
  };

  let indices = new Set();

  const checkForHorizontalMatches = (currentPieces) => {
    for (let i = 0; i < boardSize * boardSize - 2; i++) {
      if (i % boardSize === 6) {
        i += 2;
        // console.log(i + "t");
      }

      // const row = rowGeneral(i);
      const row = [i, i + 1, i + 2, i + 3, i + 4];
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
            return true;
          }
        }
      }
    }
  };

  // const checkForHorizontalMatches = () => {
  //   for (let i = 0; i < boardSize * boardSize - 2; i++) {
  //     if (i % boardSize === 6) {
  //       i += 2;
  //     }
  //     const row = [i, i + 1, i + 2, i + 3, i + 4];
  //     const currentType = currentPieces[i];

  //     for (let j = row.length; j > 2; j--) {
  //       let currentRow = row.slice(0, j);
  //       // if (rowOfThree.every((item) => currentPieces[item] === currentType)) {
  //       //   rowOfThree.forEach((index) => (currentPieces[index] = ""));
  //       //   console.log(i + " " + rowOfThree.length + "h " + currentType);
  //       // }
  //       if (
  //         currentRow.every((piece) => currentPieces[piece] === currentType) &&
  //         currentRow[currentRow.length - 1] % boardSize >= currentRow.length - 1
  //         // currentRow[0] % boardSize <= boardSize - currentRow.length
  //       ) {
  //         // console.log(currentRow);
  //         currentRow.forEach((index) => {
  //           // currentPieces[index] = "";
  //           // console.log(index);
  //           indices.add(index);
  //           // console.log(indices);
  //         });
  //         console.log(i + " " + currentRow.length + "h " + currentType);
  //       }
  //     }
  //   }
  // };

  const checkForVerticalMatches = (currentPieces) => {
    for (let i = 0; i < boardSize * (boardSize - 2); i++) {
      // const column = columnGeneral(i);
      const column = [i, i + boardSize, i + 2 * boardSize, i + 3 * boardSize, i + 4 * boardSize];
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
            return true;
          }
        }
      }
    }
  };

  const removeAllIndices = () => {
    let score = () => {
      if (!differentValueMode) {
        return indices.size;
      } else {
        let raw = 0;
        indices.forEach((item) => {
          raw += classes.indexOf(currentPieces[item].split(" ")[0]) + 1;
          // console.log(currentPieces[item].split(" ")[0]);
          // console.log(classes.indexOf(currentPieces[item]));
          // console.log(classes.indexOf(currentPieces[item].split(" ")[0]));
        });
        // console.log(raw);
        return raw;
      }
    };
    indices.forEach((item) => {
      if (!currentPieces[item].includes("shrink")) {
        currentPieces[item] = currentPieces[item] + " shrink";
      }
    });

    if (movesMade && turn === 1) {
      // setCount(count + indices.size);

      setCount(count + score());
    }
    if (movesMade && turn === 2) {
      setCount2(count2 + score());
    }

    // movesMade && setCount(count + indices.size);
    setTimeout(() => {
      for (let i = 0; i < boardSize * boardSize; i++) {
        if (currentPieces[i].includes("shrink")) {
          currentPieces[i] = "";
          setCurrentPieces([...currentPieces]);
        }
      }
    }, 100);
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
    !movesMade && constraintGamemode === "time" && setTimeLeft(180);
    setMovesLeft(movesLeft - 1);
    // if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 1) {
    //   setTurn(2);
    //   setMovesLeft(3);
    // }
    // if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 2) {
    //   setTurn(1);
    //   setMovesLeft(3);
    // }
  };

  const dragStart = (event) => {
    if (!gameOver && movesLeft) {
      // console.log(event.target.attributes["data-key"].nodeValue);
      setDraggedPiece(event.target.attributes["data-key"].nodeValue);
    }
  };
  const dragDrop = (event) => {
    // console.log(event);
    // console.log(event.currentTarget);
    const targetPiece = event.target.attributes["data-key"].nodeValue;
    if (
      (draggedPiece == targetPiece - 1 && draggedPiece % boardSize != boardSize - 1) ||
      (draggedPiece - 1 == targetPiece && draggedPiece % boardSize != 0) ||
      draggedPiece - boardSize == targetPiece ||
      draggedPiece == targetPiece - boardSize
    ) {
      let piecesToCheck = [...currentPieces];
      let temp = currentPieces[draggedPiece];
      piecesToCheck[draggedPiece] = currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;
      if (checkForVerticalMatches(piecesToCheck) || checkForHorizontalMatches(piecesToCheck) || freeMode)
        swapPieces(draggedPiece, targetPiece);
    }
  };
  const dragEnd = () => {
    setDraggedPiece(null);
  };

  useEffect(() => {
    populateBoard();
    // console.log(currentPieces);
  }, [boardSize, colorGamemode, constraintGamemode, replay, differentValueMode]);

  useEffect(() => {
    // if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 1) {
    //   setTimeout(() => {
    //     setTurn(2);
    //     setMovesLeft(3);
    //   }, 3000);
    // }
    // if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 2 && roundNumber < 5) {
    //   setTimeout(() => {
    //     setTurn(1);
    //     setMovesLeft(3);
    //     setRoundNumber(roundNumber + 1);
    //   }, 3000);
    // }
    if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 2 && roundNumber === 5) {
      setGameOver(true);
    }
  }, [movesLeft, turn]);

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
      checkForHorizontalMatches(currentPieces);
      checkForVerticalMatches(currentPieces);
      // console.log(indices);
      // console.log(removeAllIndices(currentPieces));
      removeAllIndices();
      // console.log(currentPieces);
      // setInterval(() => {
      //   moveIntoSquareBelow();
      // }, 2000);
      moveIntoSquareBelow();
      // recursivelyDropColumn();
      // console.log("ended");
    }, 250);
    return () => {
      clearInterval(timer);
    };
  });

  return (
    <div className='App'>
      <Head>
        <title>Три в ряд</title>
        <link rel='icon' href='/favicon.ico' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
      </Head>
      <Script src='/DragDropTouch.js'></Script>
      <button
        className='openMenuBtn'
        onClick={() => {
          setMenuIsOpen(true);
        }}>
        &gt;
      </button>
      {menuIsOpen && (
        <div
          className='overlay'
          onClick={() => {
            setMenuIsOpen(false);
          }}></div>
      )}
      <div
        className='controlPanel'
        style={menuIsOpen ? { display: "flex", zIndex: 10, width: 300, transition: "all 0.2s", height: "90vh" } : null}>
        <div className='boardSizeBtns'>
          <button
            className='boardSizeBtn'
            onClick={() => {
              if (sizeHasChanged) {
                if (boardSize != 5) {
                  setBoardSize(boardSize - 1);
                  setMovesMade(0);
                  setCount(0);
                }
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
                setMovesMade(0);
                setCount(0);
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
        <button
          onClick={() => {
            if (window.confirm("Сменить режим? Счет будет обнулен")) {
              setFreeMode(!freeMode);
              setMovesMade(0);
              setCount(0);
              // setReplay(!replay);
              setGameOver(false);
            }
          }}>
          {!freeMode ? "Режим свободных ходов" : "Режим строгих ходов"}
        </button>

        {constraintGamemode === "regular" ? (
          <button
            onClick={() => {
              if (window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("moves");
                setMovesMade(0);
                setCount(0);
                // setReplay(!replay);
                setGameOver(false);
              }
            }}>
            {constraintGamemode === "regular" ? "Ограниченные ходы" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode === "regular" ? (
          <button
            onClick={() => {
              if (window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("time");
                setMovesMade(0);
                setCount(0);
                // setReplay(!replay);
                setGameOver(false);
              }
            }}>
            {constraintGamemode === "regular" ? "Ограниченное время" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode === "regular" ? (
          <button
            onClick={() => {
              if (window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("multiplayer");
                setMovesMade(0);
                setCount(0);
                setCount2(0);
                setRoundNumber(1);
                setTurn(1);
                setMovesLeft(3);
                // setReplay(!replay);
                setGameOver(false);
              }
            }}>
            {constraintGamemode === "regular" ? "Два игрока" : "Ограничения: обычный режим"}
          </button>
        ) : null}
        {constraintGamemode !== "regular" ? (
          <button
            onClick={() => {
              if (window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("regular");
                setMovesMade(0);
                setCount(0);
                // setReplay(!replay);
                setGameOver(false);
              }
            }}>
            Обычный режим
          </button>
        ) : null}

        <button
          onClick={() => {
            if (window.confirm("Сменить режим? Счет будет обнулен")) {
              setDifferentValueMode(!differentValueMode);
              setMovesMade(0);
              setCount(0);
              setCount2(0);
              setRoundNumber(1);
              setTurn(1);
              constraintGamemode === "multiplayer" && setMovesLeft(3);
              constraintGamemode === "moves" && setMovesLeft(20);
              // setReplay(!replay);
              setGameOver(false);
            }
          }}>
          {!differentValueMode ? "Ценность фишек: режим разной ценности" : "Ценность фишек: обычный режим"}
        </button>
      </div>
      <div className='stats'>
        <span className='gamemode'>
          Режим: {colorGamemode === "regular" ? "обычный" : colorGamemode === "fiveColors" ? "пять цветов" : null}
          {freeMode && ", свободные ходы"}
          {constraintGamemode === "moves"
            ? ", ограниченные ходы"
            : constraintGamemode === "time"
            ? ", ограниченное время"
            : constraintGamemode === "multiplayer"
            ? ", два игрока"
            : null}
          {differentValueMode && ", разная ценность"}
        </span>
        {constraintGamemode === "multiplayer" && (
          <span className='gamemode'>
            Раунд {roundNumber}/5. Очередь: <span style={{ color: "green" }}>игрок {turn}</span>. Осталось ходов: {movesLeft}.
          </span>
        )}
        {movesMade > 0 ? (
          <>
            {constraintGamemode !== "multiplayer" && (
              <span>
                Счет: {count}
                {count > 1000 && ". Сумасшедший!"}
              </span>
            )}
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
            {constraintGamemode === "multiplayer" ? (
              <div className='twoPlayerStatsWrap'>
                <div className='twoPlayersStats'>
                  <span style={turn === 1 ? { color: "green" } : { color: "white" }}>Игрок 1 - счет: {count}</span>
                  <span style={turn === 2 ? { color: "green" } : { color: "white" }}>Игрок 2 - счет: {count2}</span>
                </div>
                {movesLeft === 0 && turn === 1 && (
                  <button
                    onClick={() => {
                      setTurn(2);
                      setMovesLeft(3);
                    }}>
                    Передать ход игроку 2
                  </button>
                )}
                {movesLeft === 0 && turn === 2 && roundNumber < 5 && (
                  <button
                    onClick={() => {
                      setTurn(1);
                      setMovesLeft(3);
                      setRoundNumber(roundNumber + 1);
                    }}>
                    Передать ход игроку 1
                  </button>
                )}

                {gameOver && (
                  <span style={{ color: "green" }}>
                    {count > count2 ? "Победитель: игрок 1!" : count === count2 ? "Ничья!" : "Победитель: игрок 2!"}
                  </span>
                )}
              </div>
            ) : constraintGamemode !== "moves" ? (
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
              {
                constraintGamemode === "multiplayer" ? setMovesLeft(3) : setMovesLeft(20);
              }
              setMovesMade(0);
              setCount(0);
            }}>
            Переиграть
          </button>
        )}
      </div>

      <div
        className='board'
        style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, height: `${boardSize}` * 50, width: `${boardSize}` * 50 }}>
        {currentPieces.map((e, i) => (
          <span
            className={"piece " + e}
            // data-value={differentValueMode ? classes.indexOf(e) + 1 : 1}
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
      {differentValueMode && (
        <div className='valueRules'>
          <div className='rule'>
            <span className='piece square' style={{ width: 40, height: 40, marginRight: 10 }}></span>
            <span style={{ color: "white" }}>= 1</span>
          </div>

          <div className='rule'>
            <span className='piece diamond' style={{ width: 35, height: 35, marginRight: 10 }}></span>
            <span style={{ color: "white" }}>= 2</span>
          </div>
          <div className='rule'>
            <span className='piece circle' style={{ width: 40, height: 40, marginRight: 10 }}></span>
            <span style={{ color: "white" }}>= 3</span>
          </div>
          <div className='rule'>
            <span className='piece triangle' style={{ width: 40, height: 40, marginRight: 10 }}></span>
            <span style={{ color: "white" }}>= 4</span>
          </div>
          <div className='rule'>
            <span className='piece pentagon' style={{ width: 40, height: 40, marginRight: 10 }}></span>
            <span style={{ color: "white" }}>= 5</span>
          </div>

          <div className='rule'>
            <span className='piece star' style={{ width: 40, height: 40, marginRight: 10 }}></span>
            <span style={{ color: "white" }}>= 6</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .App {
          background: linear-gradient(90deg, #29323c 0%, #485563 100%);
          width: 100vw;
          height: 100vh;
        }
        .valueRules {
          position: absolute;
          bottom: 50px;
          left: 420px;
          margin-top: 100px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          column-gap: 10px;
          row-gap: 10px;
        }
        .rule {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .openMenuBtn {
          width: 40px;
          height: 40px;
          font-size: 30px;
          line-height: 40px;
          border-radius: 50%;
          display: none;
        }
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 5;
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
          width: 90%;
          height: 90%;
          background: #e74c3c;
        }

        .diamond {
          background: #8e44ad;
          transform: rotate(45deg) !important;
          width: 70%;
          height: 70%;
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
          width: 90%;
          height: 90%;
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
          color: black;
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
          width: 400px;
          margin-left: 350px;
        }
        .gamemode {
          text-align: center;
          font-size: 18px;
        }
        .twoPlayerStatsWrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .twoPlayersStats {
          width: 400px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        @media screen and (max-width: 768px) {
          .App {
            overflow: hidden;
            height: 90vh;
          }
          .valueRules {
            left: 100px;
            bottom: 75px;
          }
          .stats {
            margin-left: 20px;
            max-width: 80vw;
          }
          .openMenuBtn {
            display: block;
          }
          .board {
            /* display: none; */
            left: 20px;
            max-width: 400px;
            max-height: 400px;
            height: 80vw !important;
            width: 80vw !important;
          }
          .piece {
            width: 100%;
            height: 100%;
            max-width: 45px;
            max-height: 45px;
          }
          .triangle {
            background-size: 95%;
          }
          .star {
            background-size: 90%;
          }
          .pentagon {
            background-size: 85%;
          }
          .diamond {
            width: 75%;
            height: 75%;
            max-width: 36px;
            max-height: 36px;
          }
          .circle {
            width: 90%;
            height: 90%;
          }
          .square {
            width: 90%;
            height: 90%;
          }
          .controlPanel {
            width: 0;
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
