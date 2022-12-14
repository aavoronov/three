//TODO перемешать
//TODO анимации
//TODO автоопределение конца хода
//TODO экстра мувы
//TODO сервер, доска рекордов ограниченных режимов
//TODO абилки
//TODO ход из двух спецфишек
// // obsolete переписать проверку матчей под совпадение двух подряд фишек
//fixed первая ячейка не падает
//fixed спецфишки не отрабатывают в первом столбце
//fixed фишки не успевают падать и схлопываются по 3 вместо 4
//fixed бомбы образуются из плюса с предыдущих рядов
//DONE режим админа
//DONE разделить логику ходов
//DONE стрелки
//DONE бомбы
//DONE молнии
//DONE случайная цена фишек и соответствующие правила
//DONE PWA
//DONE режим свободных/строгих ходов
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
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Script from "next/script";
// import Draggable from "react-draggable";

// const ArrowHorizontal = (props) => (
//   <svg {...props} width={100} height={100} fill='none' xmlns='http://www.w3.org/2000/svg'>
//     <path
//       d='M93.036 47.1c2.052 1.389 2.052 4.411 0 5.799L71.96 67.153c-2.325 1.572-5.461-.094-5.461-2.9V35.746c0-2.806 3.136-4.47 5.46-2.899l21.076 14.254ZM6.964 52.899c-2.052-1.388-2.052-4.41 0-5.799L28.04 32.847c2.324-1.572 5.461.093 5.461 2.9v28.506c0 2.806-3.137 4.471-5.46 2.9L6.963 52.898Z'
//       fill='red'
//       stroke='#000'
//       strokeWidth={3}
//     />
//     <path fill='red' d='M23.334 43.333h53.333v13.333H23.334z' />
//     <path stroke='#000' strokeWidth={3} d='M32 44.5h36M32 55.5h36' />
//   </svg>
// );

// const ArrowVertical = (props) => (
//   <svg {...props} width={100} height={100} fill='none' xmlns='http://www.w3.org/2000/svg'>
//     <path
//       d='M47.1 6.964c1.389-2.052 4.411-2.052 5.799 0L67.153 28.04c1.572 2.324-.094 5.461-2.9 5.461H35.746c-2.806 0-4.47-3.137-2.899-5.46L47.101 6.963ZM52.899 93.036c-1.388 2.052-4.41 2.052-5.799 0L32.847 71.96c-1.572-2.325.093-5.461 2.9-5.461h28.506c2.806 0 4.471 3.136 2.9 5.46L52.898 93.037Z'
//       fill='red'
//       stroke='#000'
//       strokeWidth={3}
//     />
//     <path fill='red' d='M43.332 76.666V23.333h13.333v53.333z' />
//     <path stroke='#000' strokeWidth={3} d='M44.5 68V32M55.5 68V32' />
//   </svg>
// );

// const Bomb = (props) => (
//   <svg {...props} width={100} height={100} fill='none' xmlns='http://www.w3.org/2000/svg'>
//     <circle cx={46.578} cy={58.626} r={28.245} transform='rotate(20 46.578 58.626)' fill='red' stroke='#000' strokeWidth={3} />
//     <path fill='red' d='m51.467 24.319 13.156 4.788-3.079 8.458-13.155-4.789z' />
//     <path
//       d='m55.251 33.926 1.73-4.752c3.662-10.062 6.535-11.866 13.828-13.643 7.294-1.776 10.622 3.866 10.622 3.866s2.87 5.16 1.599 6.914'
//       stroke='red'
//       strokeWidth={3}
//     />
//     <path
//       d='M86.055 24.131c.218-.36 1.035-.62 1.404-.84.534-.316 1.383-.545 1.745-1.045.363-.5 1.64-.263 1.886-.937M86.583 27.297c1.398.294 2.958.172 4.287.655.356.13 1.506.744 1.754.51M84.03 29.34c.102.307.02.608.149.932.11.275.216.716.235 1.012.031.494.106 1.084.254 1.55.15.476.184 1.283.159 1.775-.02.4.174.801.217 1.178M80.926 28.987c-.155.264-.493.434-.739.608-.23.163-.37.456-.6.586-.487.273-.865.702-1.273 1.088-.144.136-.498.28-.576.437-.08.16-.07.243-.222.335-.243.148-.183.552-.567.412M80.054 25.696c-2.095-.763-3.975-2.093-6.071-2.856'
//       stroke='red'
//       strokeWidth={2}
//       strokeLinecap='round'
//     />
//   </svg>
// );

// const Lightning = (props) => (
//   <svg {...props} width={100} height={100} fill='none' xmlns='http://www.w3.org/2000/svg'>
//     <path
//       d='M35.797 53.373 67.395 6.79c.663-.978 2.174-.2 1.766.907L55.728 44.106a1 1 0 0 0 .938 1.346h13.242a1 1 0 0 1 .778 1.628l-36.76 45.573c-.754.933-2.212-.008-1.671-1.08l17.772-35.188a1 1 0 0 0-.893-1.45h-12.51a1 1 0 0 1-.828-1.562Z'
//       fill='red'
//       stroke='#000'
//       strokeWidth={3}
//     />
//     <path
//       d='m31.664 35.764 2.824-1.502-.555-3.15 2.301 2.222 2.825-1.502-1.403 2.876 2.301 2.222-3.168-.445-1.402 2.875-.555-3.15-3.168-.446ZM72.956 64.543l-1.936-2.478-2.955 1.075 1.758-2.607-1.936-2.477 3.023.866 1.758-2.607.11 3.143 3.023.867-2.955 1.075.11 3.143Z'
//       fill='red'
//     />
//   </svg>
// );

const classesRegular = ["square", "diamond", "circle", "triangle", "pentagon", "star"];

const App = () => {
  const [currentPieces, setCurrentPieces] = useState([]);
  const [boardSize, setBoardSize] = useState(8);
  const [sizeHasChanged, setSizeHasChanged] = useState(false);
  const [modeHasChanged, setModeHasChanged] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState(null);
  const [movesMade, setMovesMade] = useState(0);
  const [count, setCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [colorGamemode, setColorGamemode] = useState("regular");
  const [constraintGamemode, setConstraintGamemode] = useState("regular");
  const [adminMode, setAdminMode] = useState(false);
  const [movesLeft, setMovesLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [replay, setReplay] = useState(false);
  const [count2, setCount2] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turn, setTurn] = useState(1);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [differentValueMode, setDifferentValueMode] = useState(false);
  const [extraMoveAwarded, setExtraMoveAwarded] = useState(false);
  const [perksUsedBlue, setPerksUsedBlue] = useState([]);
  const [perksUsedRed, setPerksUsedRed] = useState([]);

  // const [validatingMove, setValidatingMove] = useState(false);

  const classes = colorGamemode === "regular" ? classesRegular : classesRegular.slice(0, 5);

  const perkAction = (type) => {
    if (type === "shuffle") {
      currentPieces.sort(() => Math.random() - 0.5);
      setCurrentPieces([...currentPieces]);
      if (turn === 1) {
        // perksUsedBlue.push("shuffle");
        setPerksUsedBlue(["shuffle", ...perksUsedBlue]);
      } else {
        // perksUsedRed.push("shuffle");
        setPerksUsedRed(["shuffle", ...perksUsedRed]);
      }
    } else if (type === "bomb") {
      bombExplode(boardSize % 2 === 0 ? (boardSize * boardSize + boardSize) / 2 : (boardSize * boardSize - 1) / 2);
      // console.log(boardSize % 2 === 0 ? (boardSize * boardSize + boardSize) / 2 : (boardSize * boardSize - 1) / 2);
      if (turn === 1) {
        //   // perksUsedBlue.push("bomb");
        setTimeout(() => {
          setPerksUsedBlue(["bomb", ...perksUsedBlue]);
        }, 300);
      } else {
        setTimeout(() => {
          setPerksUsedRed(["bomb", ...perksUsedRed]);
        }, 300);
        //   // perksUsedRed.push("bomb");
        //   setPerksUsedRed(["bomb", ...perksUsedRed]);
        // }
      }
    }
  };

  const classesInRandomOrder = () => {
    classes.sort(() => Math.random() - 0.5);
  };

  const getRandomPiece = () => {
    return classes[Math.floor(Math.random() * classes.length)];
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
  let arrowsVertical = new Set();
  let arrowsHorizontal = new Set();
  let bombs = new Set();
  let lightnings = new Set();

  const checkForCorners = (currentPieces) => {
    for (let i = 0; i < boardSize * boardSize - 2; i++) {
      if (i % boardSize === boardSize - 2) {
        i += 2;
      }
      const upperLeft = [i, i + 1, i + 2, i + boardSize, i + 2 * boardSize];
      const lowerLeft = [i, i + boardSize, i + 2 * boardSize, i + 2 * boardSize + 1, i + 2 * boardSize + 2];
      const currentType = currentPieces[i];
      if (currentType) {
        if (upperLeft.every((piece) => currentPieces[piece] === currentType)) {
          console.log("upper left");
          bombs.add(i);
          return true;
        }
        if (lowerLeft.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower left");
          bombs.add(i + 2 * boardSize);

          return true;
        }
      }
    }

    for (let i = 0; i < boardSize * (boardSize - 2); i++) {
      if (i % boardSize === boardSize - 2) {
        i += 2;
      }
      const upperRight = [i, i + 1, i + 2, i + 2 + boardSize, i + 2 + 2 * boardSize];
      const lowerRight = [i, i + 1, i + 2, i + 2 - boardSize, i + 2 - 2 * boardSize];
      const currentType = currentPieces[i];
      if (currentType) {
        if (upperRight.every((piece) => currentPieces[piece] === currentType)) {
          console.log("upper right");
          bombs.add(i + 2);

          return true;
        }
        if (lowerRight.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower right");
          bombs.add(i + 2);

          return true;
        }
      }
    }
  };

  const checkForTsAndPluses = (currentPieces) => {
    for (let i = 0; i < boardSize * boardSize - 2; i++) {
      if (i % boardSize === boardSize - 2) {
        i += 2;
      }
      const upper = [i, i + 1, i + 2, i + 1 + boardSize, i + 1 + 2 * boardSize];
      const left = [i, i + boardSize, i + 2 * boardSize, i + boardSize + 1, i + boardSize + 2];
      const lower = [i, i + 1, i + 2, i + 1 - boardSize, i + 1 - 2 * boardSize];
      const right = [i, i + 1, i + 2, i + 2 - boardSize, i + 2 + boardSize];
      const plus = [i, i + 1, i + 2, i + 1 - boardSize, i + 1 + boardSize];
      const currentType = currentPieces[i];
      if (currentType) {
        if (upper.every((piece) => currentPieces[piece] === currentType)) {
          console.log("upper");
          bombs.add(i + 1);
          return true;
        }
        if (left.every((piece) => currentPieces[piece] === currentType)) {
          console.log("left");
          bombs.add(i + boardSize);
          return true;
        }
        if (lower.every((piece) => currentPieces[piece] === currentType)) {
          console.log("lower");
          bombs.add(i + 1);
          return true;
        }
        if (right.every((piece) => currentPieces[piece] === currentType)) {
          console.log("right");
          bombs.add(i + 2);
          return true;
        }
        if (plus.every((piece) => currentPieces[piece] === currentType)) {
          console.log("plus");
          bombs.add(i + 1);

          return true;
        }
      }
    }
  };

  const explodeSpecials = (item) => {
    // !validatingMove &&
    // array.forEach((item) => {
    if (currentPieces[item].includes("arrowHorizontal")) {
      arrowHorizontalExplode(item);
    }
    if (currentPieces[item].includes("arrowVertical")) {
      arrowVerticalExplode(item);
    }
    if (currentPieces[item].includes("bomb")) {
      bombExplode(item);
    }
    if (currentPieces[item].includes("lightning")) {
      lightningExplode(12);
    }
    // });
  };

  const checkForRowsOfFive = (currentPieces) => {
    for (let i = 0; i < boardSize * boardSize - 4; i++) {
      if (i % boardSize === boardSize - 4) {
        i += 4;
      }
      const rowOfFive = [i, i + 1, i + 2, i + 3, i + 4];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (rowOfFive.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          rowOfFive.forEach((index) => {
            indices.add(index);
          });

          // if (!rowOfFive.every((item) => {currentPieces[item]}))
          lightnings.add(i);
          console.log(i + " row of five " + currentType);
          return true;
        }
      }
    }
  };

  const checkForRowsOfFour = (currentPieces) => {
    for (let i = 0; i < boardSize * boardSize - 3; i++) {
      if (i % boardSize === boardSize - 3) {
        i += 3;
      }
      const rowOfFour = [i, i + 1, i + 2, i + 3];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (rowOfFour.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          rowOfFour.forEach((index) => {
            indices.add(index);
          });
          arrowsHorizontal.add(i);
          console.log(i + " row of four " + currentType);
          return true;
        }
      }
    }
  };

  const checkForRowsOfThree = (currentPieces) => {
    for (let i = 0; i < boardSize * boardSize - 2; i++) {
      if (i % boardSize === boardSize - 2) {
        i += 2;
      }
      const rowOfThree = [i, i + 1, i + 2];
      const currentType = currentPieces[i].split(" ")[0];
      if (currentType) {
        if (rowOfThree.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          rowOfThree.forEach((index) => {
            console.log(index);
            indices.add(index);
          });
          console.log(i + " row of three " + currentType);
          return true;
        }
      }
    }
  };

  // const checkForVerticalMatches = (currentPieces) => {
  //   for (let i = 0; i < boardSize * (boardSize - 2); i++) {
  //     // const column = columnGeneral(i);
  //     const column = [i, i + boardSize, i + 2 * boardSize, i + 3 * boardSize, i + 4 * boardSize];
  //     const currentType = currentPieces[i];

  //     if (currentType) {
  //       for (let j = column.length; j >= 3; j--) {
  //         let currentColumn = column.slice(0, j);
  //         if (
  //           currentColumn.every((piece) => currentPieces[piece] === currentType) &&
  //           currentColumn[currentColumn.length - 1] <= currentPieces.length
  //         ) {
  //           // console.log(currentColumn);
  //           currentColumn.forEach((index) => {
  //             // currentPieces[index] = "";
  //             indices.add(index);
  //             // console.log(indices);
  //           });
  //           console.log(i + " " + currentColumn.length + "v " + currentType);
  //           return true;
  //         }
  //       }
  //     }
  //   }
  // };

  const checkForColumnsOfFive = (currentPieces) => {
    for (let i = 0; i < boardSize * (boardSize - 4); i++) {
      // const column = columnGeneral(i);
      const column = [i, i + boardSize, i + 2 * boardSize, i + 3 * boardSize, i + 4 * boardSize];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            indices.add(index);
          });
          lightnings.add(i);
          console.log(i + " column of five " + currentType);
          return true;
        }
      }
    }
  };

  const checkForColumnsOfFour = (currentPieces) => {
    for (let i = 0; i < boardSize * (boardSize - 3); i++) {
      // const column = columnGeneral(i);
      const column = [i, i + boardSize, i + 2 * boardSize, i + 3 * boardSize];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            indices.add(index);
          });
          arrowsVertical.add(i);
          console.log(i + " column of four " + currentType);
          return true;
        }
      }
    }
  };

  const checkForColumnsOfThree = (currentPieces) => {
    for (let i = 0; i < boardSize * (boardSize - 2); i++) {
      // const column = columnGeneral(i);
      const column = [i, i + boardSize, i + 2 * boardSize];
      const currentType = currentPieces[i].split(" ")[0];

      if (currentType) {
        if (column.every((piece) => currentPieces[piece].split(" ")[0] === currentType)) {
          column.forEach((index) => {
            indices.add(index);
          });
          console.log(i + " column of three " + currentType);
          return true;
        }
      }
    }
  };

  //!ok
  const arrowHorizontalExplode = (index) => {
    let start = index;
    while (start % boardSize > 0) {
      start -= 1;
      // console.log(start);
    }
    let row = [];
    for (let i = 0; i < boardSize; i++) {
      row.push(start);
      start++;
    }
    // return row;
    row.forEach((item) => indices.add(item));
  };

  //!ok
  const arrowVerticalExplode = (index) => {
    let start = index % boardSize;
    let column = [];
    for (let i = 0; i < boardSize; i++) {
      column.push(start + i * boardSize);
    }
    // return column;
    column.forEach((item) => indices.add(item));
  };

  // console.log(arrowVerticalExplode(35));

  //!ok
  const bombExplode = (i) => {
    let pieces = [];
    pieces.push([i - 2 * boardSize >= 0 && i - 2 * boardSize]);

    pieces.push([
      i - 1 - boardSize >= 0 && i % boardSize > 0 && i - 1 - boardSize,
      i - boardSize >= 0 && i - boardSize,
      i + 1 - boardSize >= 0 && i % boardSize < boardSize - 1 && i + 1 - boardSize,
    ]);

    pieces.push([
      i % boardSize > 1 && i - 2,
      i % boardSize > 0 && i - 1,
      i,
      i % boardSize < boardSize - 1 && i + 1,
      i % boardSize < boardSize - 2 && i + 2,
    ]);

    pieces.push([
      i - 1 + boardSize < boardSize * boardSize && i % boardSize > 0 && i - 1 + boardSize,
      i + boardSize < boardSize * boardSize && i + boardSize,
      i + 1 + boardSize < boardSize * boardSize && i % boardSize < boardSize - 1 && i + 1 + boardSize,
    ]);

    pieces.push([i + 2 * boardSize < boardSize * boardSize && i + 2 * boardSize]);

    // return pieces.flat().filter((item) => item !== false);
    pieces
      .flat()
      .filter((item) => item !== false)
      .forEach((item) => indices.add(item));
  };

  //!ok
  const lightningExplode = (num) => {
    let idx = [];
    currentPieces.map((el, index) => {
      idx.push(index);
    });
    const shuffled = idx.sort(() => 0.5 - Math.random());

    // return shuffled.slice(0, num);
    // shuffled.slice(0, num);
    shuffled.slice(0, num).forEach((item) => indices.add(item));
    console.log(shuffled.slice(0, num));
  };

  // addTwoNumbers(1, 2);
  // subtractTwoNumbers(5, 2);

  const removeAllIndices = () => {
    indices.forEach((item) => {
      explodeSpecials(item);
    });
    let score = () => {
      if (!differentValueMode) {
        return indices.size;
      } else {
        let raw = 0;
        indices.forEach((item) => {
          raw += classes.indexOf(currentPieces[item].split(" ")[0]) + 1;
        });
        // console.log(raw);
        return raw;
      }
    };
    indices.forEach((item) => {
      if (
        !currentPieces[item].includes("shrink") &&
        !arrowsHorizontal.has(item) &&
        !arrowsVertical.has(item) &&
        !bombs.has(item) &&
        !lightnings.has(item)
      ) {
        currentPieces[item] = currentPieces[item] + " shrink";
      }
    });
    lightnings.forEach((item) => {
      currentPieces[item] = currentPieces[item] + " lightning";
    });
    bombs.forEach((item) => {
      if (!currentPieces[item].includes("lightning")) {
        currentPieces[item] = currentPieces[item] + " bomb";
      }
    });
    arrowsHorizontal.forEach((item) => {
      if (!currentPieces[item].includes("lightning") && !currentPieces[item].includes("bomb")) {
        currentPieces[item] = currentPieces[item] + " arrowHorizontal";
      }
    });
    arrowsVertical.forEach((item) => {
      if (
        !currentPieces[item].includes("lightning") &&
        !currentPieces[item].includes("bomb") &&
        !currentPieces[item].includes("arrowHorizontal")
      ) {
        currentPieces[item] = currentPieces[item] + " arrowVertical";
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
      if (index > boardSize - 1) {
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
    (constraintGamemode === "moves" || constraintGamemode === "multiplayer") && setMovesLeft(movesLeft - 1);

    if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 1) {
      setTurn(2);
      setMovesLeft(3);
    }
    if (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 2) {
      setTurn(1);
      setMovesLeft(3);
    }
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
    // setValidatingMove(true);
    const targetPiece = event.target.attributes["data-key"].nodeValue;
    if (
      (draggedPiece == targetPiece - 1 && draggedPiece % boardSize != boardSize - 1) ||
      (draggedPiece - 1 == targetPiece && draggedPiece % boardSize != 0) ||
      draggedPiece - boardSize == targetPiece ||
      draggedPiece == targetPiece - boardSize ||
      adminMode
    ) {
      let piecesToCheck = [...currentPieces];
      let temp = currentPieces[draggedPiece];
      piecesToCheck[draggedPiece] = currentPieces[targetPiece];
      piecesToCheck[targetPiece] = temp;
      if (
        // checkForVerticalMatches(piecesToCheck) ||
        // checkForHorizontalMatches(piecesToCheck) ||
        checkForColumnsOfFive(piecesToCheck) ||
        checkForColumnsOfFour(piecesToCheck) ||
        checkForColumnsOfThree(piecesToCheck) ||
        checkForRowsOfFive(piecesToCheck) ||
        checkForRowsOfFour(piecesToCheck) ||
        checkForRowsOfThree(piecesToCheck) ||
        freeMode ||
        adminMode
      )
        swapPieces(draggedPiece, targetPiece);
    }
    // setValidatingMove(false);
  };
  const dragEnd = () => {
    setDraggedPiece(null);
  };

  const resetEverything = () => {
    setMovesMade(0);
    setCount(0);
    setCount2(0);
    setRoundNumber(1);
    setTurn(1);
    // if (constraintGamemode === "moves") ;
    //  if (constraintGamemode === "time") setTimeLeft(60);
    // // constraintGamemode === "multiplayer" && setMovesLeft(3);
    // constraintGamemode === "moves" && setMovesLeft(20);
    // constraintGamemode === "time" && setTimeLeft(60);

    // setReplay(!replay);
    setGameOver(false);
    setPerksUsedBlue([]);
    setPerksUsedRed([]);
    !modeHasChanged && setModeHasChanged(true);
    !sizeHasChanged && setSizeHasChanged(true);
  };

  useEffect(() => {
    classesInRandomOrder();

    populateBoard();
    // console.log(currentPieces);
  }, [boardSize, freeMode, colorGamemode, constraintGamemode, replay, differentValueMode]);

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
    if (
      (constraintGamemode === "time" && timeLeft === 0) ||
      (constraintGamemode === "moves" && movesLeft === 0) ||
      (constraintGamemode === "multiplayer" && movesLeft === 0 && turn === 2 && roundNumber === 5)
    ) {
      setGameOver(true);
    }
  }, [timeLeft, movesLeft, turn]);

  useEffect(() => {
    const timer = setInterval(() => {
      checkForRowsOfFive(currentPieces);
      checkForColumnsOfFive(currentPieces);
      checkForCorners(currentPieces);
      checkForTsAndPluses(currentPieces);
      checkForRowsOfFour(currentPieces);
      checkForColumnsOfFour(currentPieces);
      checkForRowsOfThree(currentPieces);
      checkForColumnsOfThree(currentPieces);

      // if (!checkForRowsOfFive(currentPieces) && !checkForColumnsOfFive(currentPieces)) {
      //   if (!checkForCorners(currentPieces) && !checkForTsAndPluses(currentPieces)) {
      //     checkForRowsOfFour(currentPieces);
      //     checkForColumnsOfFour(currentPieces);
      //   }
      // }

      // checkForRowsOfThree(currentPieces);
      // checkForColumnsOfThree(currentPieces);

      // checkForHorizontalMatches(currentPieces);
      // checkForVerticalMatches(currentPieces);
      // console.log(indices);
      // console.log(removeAllIndices(currentPieces));
      removeAllIndices();
      // console.log(currentPieces);
      // setInterval(() => {
      //   moveIntoSquareBelow();
      // }, 2000);
      // moveIntoSquareBelow();
      recursivelyDropColumn();
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
                  // setMovesMade(0);
                  // setCount(0);
                  // setPerksUsedBlue([]);
                  // setPerksUsedRed([]);
                  resetEverything();
                }
              } else {
                if (window.confirm("Изменить размер доски? Счет будет обнулен") && boardSize != 5) {
                  setBoardSize(boardSize - 1);
                  // setMovesMade(0);
                  // setCount(0);
                  // setPerksUsedBlue([]);
                  // setPerksUsedRed([]);
                  resetEverything();
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
                // setMovesMade(0);
                // setCount(0);
                resetEverything();
              } else {
                if (window.confirm("Изменить размер доски? Счет будет обнулен")) {
                  setBoardSize(boardSize + 1);
                  // setSizeHasChanged(true);
                  // setMovesMade(0);
                  // setCount(0);
                  resetEverything();
                }
              }
            }}>
            +
          </button>
        </div>
        <button
          onClick={() => {
            if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
              setColorGamemode(colorGamemode === "regular" ? "fiveColors" : "regular");
              // setMovesMade(0);
              // setCount(0);
              // // setReplay(!replay);
              // setGameOver(false);
              resetEverything();

              // !modeHasChanged && setModeHasChanged(true);
            }
          }}>
          {colorGamemode === "regular" ? "Режим пяти цветов" : "Цвета: обычный режим"}
        </button>
        <button
          onClick={() => {
            if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
              setFreeMode(!freeMode);
              // setMovesMade(0);
              // setCount(0);
              // setCount2(0);
              // setRoundNumber(1);
              // setTurn(1);
              // setMovesLeft(3);
              // // setReplay(!replay);
              // setGameOver(false);
              resetEverything();

              // !modeHasChanged && setModeHasChanged(true);
            }
          }}>
          {!freeMode ? "Режим свободных ходов" : "Режим строгих ходов"}
        </button>

        {constraintGamemode === "regular" ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("moves");
                // setMovesMade(0);
                // setCount(0);
                // // setReplay(!replay);
                // setGameOver(false);
                // !modeHasChanged && setModeHasChanged(true);
                setMovesLeft(20);
                resetEverything();
              }
            }}>
            {constraintGamemode === "regular" ? "Ограниченные ходы" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode === "regular" ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("time");
                // setMovesMade(0);
                // setCount(0);
                // // setReplay(!replay);
                // setGameOver(false);
                // !modeHasChanged && setModeHasChanged(true);
                setTimeLeft(60);
                resetEverything();
              }
            }}>
            {constraintGamemode === "regular" ? "Ограниченное время" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode === "regular" ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("multiplayer");
                // setMovesMade(0);
                // setCount(0);
                // setCount2(0);
                // setRoundNumber(1);
                // setTurn(1);
                // setMovesLeft(3);
                // // setReplay(!replay);
                // setGameOver(false);
                // !modeHasChanged && setModeHasChanged(true);
                setMovesLeft(3);

                resetEverything();
              }
            }}>
            {constraintGamemode === "regular" ? "Два игрока" : "Ограничения: обычный режим"}
          </button>
        ) : null}
        {constraintGamemode !== "regular" ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("regular");
                // setMovesMade(0);
                // setCount(0);
                // // setReplay(!replay);
                // setGameOver(false);
                // !modeHasChanged && setModeHasChanged(true);
                setMovesLeft(3);

                resetEverything();
              }
            }}>
            Обычный режим
          </button>
        ) : null}

        <button
          onClick={() => {
            if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
              setDifferentValueMode(!differentValueMode);
              // setMovesMade(0);
              // setCount(0);
              // setCount2(0);
              // setRoundNumber(1);
              // setTurn(1);
              // constraintGamemode === "multiplayer" && setMovesLeft(3);
              // constraintGamemode === "moves" && setMovesLeft(20);
              // // setReplay(!replay);
              // setGameOver(false);
              // !modeHasChanged && setModeHasChanged(true);
              resetEverything();
            }
          }}>
          {!differentValueMode ? "Ценность фишек: режим разной ценности" : "Ценность фишек: обычный режим"}
        </button>
        <button
          onClick={() => {
            if (adminMode || window.prompt("Ага, думаешь, так просто? Введи пароль") === "test") {
              //да, я знаю, что его здесь видно, но много ли кто сюда полезет, кроме тебя?
              setAdminMode(!adminMode);
              // setMovesMade(0);
              // setCount(0);
              // setReplay(!replay);
              setGameOver(false);
              // !modeHasChanged && setModeHasChanged(true);
            }
          }}>
          {!adminMode ? "Режим администратора" : "Обычный режим"}
        </button>
        <span style={{ display: "none" }}>Ага, думаешь, так просто? Введи пароль . Попался! Ищешь пароль? Страждущий да обрящет</span>
      </div>
      <div className='stats'>
        <span
          className='gamemode'
          onClick={() => {
            console.log(perksUsedBlue, perksUsedRed);
          }}>
          Режим: {colorGamemode === "regular" ? "обычный" : colorGamemode === "fiveColors" ? "пять цветов" : null}
          {adminMode && ", админ"}
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
            Раунд {roundNumber}/5. Очередь: <span style={turn === 1 ? { color: "#3498db" } : { color: "#e74c3c" }}>игрок {turn}</span>.
            Осталось ходов: {movesLeft}.
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
              <span style={{ fontSize: 18 }}>
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
                  <div className='playerWrap'>
                    <span style={turn === 1 ? { color: "#3498db" } : { color: "white" }}>Игрок 1 - счет: {count}</span>
                    <div className='perks blue'>
                      <span
                        className={`perk blue shuffle${perksUsedBlue.includes("shuffle") || perksUsedBlue.length === 2 ? " used" : ""}${
                          turn === 1 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedBlue.includes("shuffle") && perksUsedBlue.length < 2 && turn === 1 && movesLeft !== 0) ||
                            adminMode) &&
                            perkAction("shuffle");
                        }}></span>
                      <span
                        className={`perk blue bomb${perksUsedBlue.includes("bomb") || perksUsedBlue.length === 2 ? " used" : ""}${
                          turn === 1 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedBlue.includes("bomb") && perksUsedBlue.length < 2 && turn === 1 && movesLeft !== 0) || adminMode) &&
                            perkAction("bomb");
                          // setPerksUsedBlue(["bomb", ...perksUsedBlue]);
                        }}></span>
                    </div>
                  </div>
                  <div className='playerWrap'>
                    <span style={turn === 2 ? { color: "#e74c3c" } : { color: "white" }}>Игрок 2 - счет: {count2}</span>
                    <div className='perks red'>
                      <span
                        className={`perk red shuffle${perksUsedRed.includes("shuffle") || perksUsedRed.length === 2 ? " used" : ""}${
                          turn === 2 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedRed.includes("shuffle") && perksUsedRed.length < 2 && turn === 2 && movesLeft !== 0) || adminMode) &&
                            perkAction("shuffle");
                        }}></span>
                      <span
                        className={`perk red bomb${perksUsedRed.includes("bomb") || perksUsedRed.length === 2 ? " used" : ""}${
                          turn === 2 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedRed.includes("bomb") && perksUsedRed.length < 2 && turn === 2 && movesLeft !== 0) || adminMode) &&
                            perkAction("bomb");
                        }}></span>
                    </div>
                  </div>
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
                    {count > count2
                      ? "Победитель: игрок 1!"
                      : count2 === 0
                      ? "Вы вообще пытались?"
                      : count === count2
                      ? "Ничья!"
                      : "Победитель: игрок 2!"}
                  </span>
                )}
              </div>
            ) : constraintGamemode !== "moves" ? (
              <span>
                Ходов сделано: {movesMade}
                {movesMade > 99 && ". Невероятно!"}
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
              setMovesMade(0);
              setCount(0);
              setTurn(1);

              if (constraintGamemode === "multiplayer") {
                setCount2(0);
                setRoundNumber(1);
                setMovesLeft(3);
              }
            }}>
            Переиграть
          </button>
        )}
      </div>

      <div
        className='board'
        // ref={board}
        onClick={(event) => {
          adminMode && explodeSpecials([event.target.attributes["data-key"].value]);
          // adminMode && console.log(currentPieces[event.target.attributes["data-key"].value].split(" ")[0]);
        }}
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
      <div className='rules'>
        <div className='moveRules'>
          <div className='rule'>
            <div className='arrowRule' style={{ marginRight: 10 }}></div>
            <span style={{ color: "white" }}>=</span>
            <span className='piece arrowHorizontal rule' style={{ width: 40, height: 40 }}></span>
          </div>
          <div className='rule'>
            <div className='bombRule' style={{ marginRight: 10 }}></div>
            <span style={{ color: "white" }}>=</span>
            <span className='piece bomb rule' style={{ width: 40, height: 40 }}></span>
          </div>
          <div className='rule'>
            <div className='lightningRule' style={{ marginRight: 10 }}></div>
            <span style={{ color: "white" }}>=</span>
            <span className='piece lightning rule' style={{ width: 40, height: 40 }}></span>
          </div>
        </div>

        {differentValueMode && (
          <div className='valueRules'>
            {classes.map((item, index) => (
              <div className='rule' key={index}>
                <span className={`piece ${item}`} style={{ width: 40, height: 40, marginRight: 10 }}></span>
                <span style={{ color: "white", position: "absolute", left: 17, color: "#29323c" }}>{index + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .App {
          background: linear-gradient(90deg, #29323c 0%, #485563 100%);
          width: 100vw;
          height: 100vh;
        }
        .rules {
          position: absolute;
          bottom: 50px;
          left: 350px;
          margin-top: 100px;
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
        .arrowRule {
          background-image: url("/arrow.png");
          background-size: 37px 8px;
          width: 37px;
          height: 8px;
        }
        .bombRule {
          background-image: url("/bombs.png");
          background-size: 105px 27px;
          width: 105px;
          height: 27px;
        }
        .lightningRule {
          background-image: url("/lightning.png");
          background-size: 47px 8px;
          width: 47px;
          height: 8px;
        }
        .moveRules {
          display: flex;
          flex-direction: column;
          margin-right: 10px;
        }
        .moveRules .rule {
          justify-content: space-between;
        }

        .piece.rule {
          filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%);
          margin: 0;
        }
        .valueRules {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          column-gap: 5px;
          row-gap: 5px;
        }
        .rule {
          display: flex;
          flex-direction: row;
          align-items: center;
          position: relative;
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
          z-index: 100;
        }

        .controlPanel button:not(.boardSizeBtn) {
          padding: 5px 0;
          background-color: white;
          border-radius: 10px;
          margin-bottom: 5px;
          width: 100%;
          color: #29323c;
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
          transition: all 0.09s;
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
        .arrowHorizontal,
        .arrowVertical,
        .bomb,
        .lightning {
          width: 100%;
          height: 100%;
        }
        .arrowHorizontal {
          background-image: url("/img/arrowHorizontal.svg") !important;
          background: none;
          transform: rotate(0deg) !important;
          background-repeat: no-repeat;
          background-size: 100%;
          background-position: 50%;
        }
        .arrowVertical {
          background-image: url("/img/arrowVertical.svg") !important;
          background: none;
          transform: rotate(0deg) !important;
          background-repeat: no-repeat;
          background-size: 100%;
          background-position: 50%;
        }
        .bomb {
          background-image: url("/img/bomb.svg") !important;
          background: none;
          transform: rotate(0deg) !important;
          background-repeat: no-repeat;
          background-size: 100%;
          background-position: 50%;
        }
        .lightning {
          background-image: url("/img/lightning.svg") !important;
          background: none;
          transform: rotate(0deg) !important;
          background-repeat: no-repeat;
          background-size: 100%;
          background-position: 50%;
        }
        .square.arrowHorizontal,
        .square.arrowVertical,
        .square.bomb,
        .square.lightning {
          filter: brightness(0) saturate(100%) invert(35%) sepia(80%) saturate(1235%) hue-rotate(335deg) brightness(94%) contrast(92%);
        }

        .diamond.arrowHorizontal,
        .diamond.arrowVertical,
        .diamond.bomb,
        .diamond.lightning {
          filter: brightness(0) saturate(100%) invert(33%) sepia(14%) saturate(4964%) hue-rotate(251deg) brightness(94%) contrast(87%);
        }

        .circle.arrowHorizontal,
        .circle.arrowVertical,
        .circle.bomb,
        .circle.lightning {
          filter: brightness(0) saturate(100%) invert(58%) sepia(98%) saturate(2345%) hue-rotate(178deg) brightness(91%) contrast(88%);
        }

        .boardSizeBtns {
          bottom: 20px;
          left: calc(50vw - 90px);
          display: flex;
          flex-direction: row;
          align-items: center;
          margin: 20px 0;
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

        .twoPlayerStatsWrap button {
          padding: 5px 0;
          background-color: white;
          border-radius: 10px;
          margin-bottom: 5px;
          width: 50%;
          color: #29323c;
        }
        .twoPlayersStats {
          width: 320px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .playerWrap * {
          font-size: 18px;
        }

        .playerWrap {
          display: flex;
          flex-direction: column;
        }
        .perks {
          display: flex;
          flex-direction: row;
        }
        .perks.red {
          justify-content: flex-end;
        }
        .perk {
          width: 40px;
          height: 40px;
          margin-right: 3px;
          border-radius: 10px;
          border: 3px solid black;
          cursor: pointer;
          transition: all 0.3s;
        }
        .perk:hover {
          filter: brightness(120%);
          transition: all 0.3s;
        }
        .perk.blue {
          background-color: #3498db;
          border-color: #0b2637;
        }
        .perk.red {
          background-color: #e74c3c;
          border-color: #992013;
        }
        .perk.used {
          opacity: 0.5;
        }
        .perk.disabled {
          filter: grayscale(0.4);
        }
        .shuffle {
          background-image: url("/shuffle.png");
          background-position: 50%;
          background-repeat: no-repeat;
        }
        .perk.bomb {
          background-image: url("/bomb.png") !important;
          background-position: 50%;
          background-repeat: no-repeat;
          background-size: 30px;
        }

        @media screen and (max-width: 768px) {
          .App {
            overflow: hidden;
            height: 90vh;
          }

          .rules {
            left: 10px;
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
            top: calc(50vh - 160px);
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
