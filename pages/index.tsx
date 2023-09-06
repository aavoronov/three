//TODO анимации
//TODO автоопределение конца хода
//TODO экстра мувы
//TODO сервер, доска рекордов ограниченных режимов
//TODO ход из двух спецфишек
//TODO бустеры
//TODO больше абилок
// // obsolete переписать проверку матчей под совпадение двух подряд фишек
//? kinda done перемешать
//fixed первая ячейка не падает
//fixed спецфишки не отрабатывают в первом столбце
//fixed фишки не успевают падать и схлопываются по 3 вместо 4
//fixed бомбы образуются из плюса с предыдущих рядов
//DONE абилки
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

const _classesRegular = Object.freeze({
  square: "square",
  diamond: "diamond",
  circle: "circle",
  triangle: "triangle",
  pentagon: "pentagon",
  star: "star",
});
const _classesSpecial = Object.freeze({
  arrowHorizontal: "arrowHorizontal",
  arrowVertical: "arrowVertical",
  bomb: "bomb",
  lightning: "lightning",
});

const classesRegular = Object.values(_classesRegular);
// const classesRegular = ["square", "diamond", "circle", "triangle", "pentagon", "star"] as const;
const classesSpecial = Object.values(_classesSpecial);
const colorGamemodes = Object.freeze({ regular: "regular", fiveColors: "fiveColors" });
const constraintGamemodes = Object.freeze({ regular: "regular", time: "time", multiplayer: "multiplayer", moves: "moves" });
const perks = Object.freeze({ shuffle: "shuffle", bomb: "bomb", hammer: "hammer" });

// type ClassRegular = (typeof classesRegular)[number];
type ClassRegular = (typeof classesRegular)[number];
type ClassSpecial = (typeof classesSpecial)[number];
type ColorGamemode = keyof typeof colorGamemodes;
type ConstraintGamemode = keyof typeof constraintGamemodes;
type Perk = keyof typeof perks;

const App = () => {
  const [currentPieces, setCurrentPieces] = useState<string[]>([]);
  const [boardSize, setBoardSize] = useState(8);
  const [sizeHasChanged, setSizeHasChanged] = useState(false);
  const [modeHasChanged, setModeHasChanged] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [movesMade, setMovesMade] = useState(0);
  const [count, setCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [colorGamemode, setColorGamemode] = useState<ColorGamemode>(colorGamemodes.regular);
  const [constraintGamemode, setConstraintGamemode] = useState<ConstraintGamemode>(constraintGamemodes.regular);
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
  const [perksUsedBlue, setPerksUsedBlue] = useState<Perk[]>([]);
  const [perksUsedRed, setPerksUsedRed] = useState<Perk[]>([]);
  // const [hammerMode, setHammerMode] = useState(false);

  // const [validatingMove, setValidatingMove] = useState(false);

  const classes: ClassRegular[] = colorGamemode === colorGamemodes.regular ? classesRegular : classesRegular.slice(0, 5);

  const perkAction = (type: Perk) => {
    if (type === perks.shuffle) {
      currentPieces.sort(() => Math.random() - 0.5);
      setCurrentPieces([...currentPieces]);
      if (turn === 1) {
        // perksUsedBlue.push("shuffle");
        setPerksUsedBlue([perks.shuffle, ...perksUsedBlue]);
      } else {
        // perksUsedRed.push("shuffle");
        setPerksUsedRed([perks.shuffle, ...perksUsedRed]);
      }
    } else if (type === perks.bomb) {
      bombExplode(boardSize % 2 === 0 ? (boardSize * boardSize + boardSize) / 2 : (boardSize * boardSize - 1) / 2);
      // console.log(boardSize % 2 === 0 ? (boardSize * boardSize + boardSize) / 2 : (boardSize * boardSize - 1) / 2);
      if (turn === 1) {
        //   // perksUsedBlue.push("bomb");
        setTimeout(() => {
          setPerksUsedBlue([perks.bomb, ...perksUsedBlue]);
        }, 300);
      } else {
        setTimeout(() => {
          setPerksUsedRed([perks.bomb, ...perksUsedRed]);
        }, 300);
      }
    } else if (type === perks.hammer) {
      // setHammerMode(true);
      // console.log("on");
      alert("not implemented");
      if (turn === 1) {
        //   // perksUsedBlue.push("bomb");
        setPerksUsedBlue([perks.hammer, ...perksUsedBlue]);
      } else {
        setPerksUsedRed([perks.hammer, ...perksUsedRed]);
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
    const rawPieces: ClassRegular[] = [];
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

  let indices = new Set<number>();
  let arrowsVertical = new Set<number>();
  let arrowsHorizontal = new Set<number>();
  let bombs = new Set<number>();
  let lightnings = new Set<number>();

  const checkForCorners = (currentPieces: string[]) => {
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

  const checkForTsAndPluses = (currentPieces: string[]) => {
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

  const explodeSpecials = (item: number) => {
    if (currentPieces[item].includes(_classesSpecial.arrowHorizontal)) {
      arrowHorizontalExplode(item);
    }
    if (currentPieces[item].includes(_classesSpecial.arrowVertical)) {
      arrowVerticalExplode(item);
    }
    if (currentPieces[item].includes(_classesSpecial.bomb)) {
      bombExplode(item);
    }
    if (currentPieces[item].includes(_classesSpecial.lightning)) {
      lightningExplode(12);
    }
  };

  const checkForRowsOfFive = (currentPieces: string[]) => {
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

  const checkForRowsOfFour = (currentPieces: string[]) => {
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

  const checkForRowsOfThree = (currentPieces: string[]) => {
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

  const checkForColumnsOfFive = (currentPieces: string[]) => {
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

  const checkForColumnsOfFour = (currentPieces: string[]) => {
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

  const checkForColumnsOfThree = (currentPieces: string[]) => {
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
  const arrowHorizontalExplode = (index: number) => {
    let start = index;
    while (start % boardSize > 0) {
      start -= 1;
      // console.log(start);
    }
    let row: number[] = [];
    for (let i = 0; i < boardSize; i++) {
      row.push(start);
      start++;
    }
    // return row;
    row.forEach((item) => indices.add(item));
  };

  //!ok
  const arrowVerticalExplode = (index: number) => {
    let start = index % boardSize;
    let column: number[] = [];
    for (let i = 0; i < boardSize; i++) {
      column.push(start + i * boardSize);
    }
    // return column;
    column.forEach((item) => indices.add(item));
  };

  //!ok
  const bombExplode = (i: number) => {
    let pieces: (number | false)[][] = [];
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
      .filter((item): item is number => item !== false)
      .forEach((item) => indices.add(item));
  };

  //!ok
  const lightningExplode = (num: number) => {
    let idx: number[] = [];
    currentPieces.map((el, index) => {
      idx.push(index);
    });
    const shuffled = idx.sort(() => 0.5 - Math.random());

    // return shuffled.slice(0, num);
    // shuffled.slice(0, num);
    shuffled.slice(0, num).forEach((item) => indices.add(item));
    console.log(shuffled.slice(0, num));
  };

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
          raw += (classes as string[]).indexOf(currentPieces[item].split(" ")[0]) + 1;
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
      if (!currentPieces[item].includes(_classesSpecial.lightning)) {
        currentPieces[item] = currentPieces[item] + " bomb";
      }
    });
    arrowsHorizontal.forEach((item) => {
      if (!currentPieces[item].includes(_classesSpecial.lightning) && !currentPieces[item].includes(_classesSpecial.bomb)) {
        currentPieces[item] = currentPieces[item] + " arrowHorizontal";
      }
    });
    arrowsVertical.forEach((item) => {
      if (
        !currentPieces[item].includes(_classesSpecial.lightning) &&
        !currentPieces[item].includes(_classesSpecial.bomb) &&
        !currentPieces[item].includes(_classesSpecial.arrowHorizontal)
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

  const recursivelyDropColumn = (currentPieces: string[]) => {
    const dropAllAbove = (index: number) => {
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

  const swapPieces = (index: number, index2: number) => {
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

  const dragStart = (event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) => {
    if (!gameOver && movesLeft) {
      // console.log(event.target.attributes["data-key"].nodeValue);
      setDraggedPiece((event.target as HTMLSpanElement).attributes["data-key"].nodeValue);
    }
  };
  const dragDrop = (event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) => {
    // console.log(event);
    // console.log(event.currentTarget);
    // setValidatingMove(true);
    const targetPiece = (event.target as HTMLSpanElement).attributes["data-key"].nodeValue;
    if (
      (draggedPiece == targetPiece - 1 && draggedPiece % boardSize != boardSize - 1) ||
      (draggedPiece! - 1 == targetPiece && draggedPiece! % boardSize != 0) ||
      draggedPiece! - boardSize == targetPiece ||
      draggedPiece == targetPiece - boardSize ||
      adminMode
    ) {
      let piecesToCheck = [...currentPieces];
      let temp = currentPieces[draggedPiece!];
      piecesToCheck[draggedPiece!] = currentPieces[targetPiece];
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
        swapPieces(draggedPiece!, targetPiece);
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

      removeAllIndices();
      recursivelyDropColumn(currentPieces);
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
        style={menuIsOpen ? { display: "flex", zIndex: 10, width: 300, transition: "all 0.2s", height: "90vh" } : void 0}>
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
              setColorGamemode(colorGamemode === colorGamemodes.regular ? colorGamemodes.fiveColors : colorGamemodes.regular);
              // setMovesMade(0);
              // setCount(0);
              // // setReplay(!replay);
              // setGameOver(false);
              resetEverything();

              // !modeHasChanged && setModeHasChanged(true);
            }
          }}>
          {colorGamemode === colorGamemodes.regular ? "Режим пяти цветов" : "Цвета: обычный режим"}
        </button>
        <button
          onClick={() => {
            if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
              setFreeMode(!freeMode);
              resetEverything();

              // !modeHasChanged && setModeHasChanged(true);
            }
          }}>
          {!freeMode ? "Режим свободных ходов" : "Режим строгих ходов"}
        </button>

        {constraintGamemode === constraintGamemodes.regular ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode(constraintGamemodes.moves);
                setMovesLeft(20);
                resetEverything();
              }
            }}>
            {constraintGamemode === constraintGamemodes.regular ? "Ограниченные ходы" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode === constraintGamemodes.regular ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("time");
                setTimeLeft(60);
                resetEverything();
              }
            }}>
            {constraintGamemode === constraintGamemodes.regular ? "Ограниченное время" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {constraintGamemode === constraintGamemodes.regular ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode("multiplayer");
                setMovesLeft(3);

                resetEverything();
              }
            }}>
            {constraintGamemode === constraintGamemodes.regular ? "Два игрока" : "Ограничения: обычный режим"}
          </button>
        ) : null}
        {constraintGamemode !== constraintGamemodes.regular ? (
          <button
            onClick={() => {
              if (modeHasChanged || window.confirm("Сменить режим? Счет будет обнулен")) {
                setConstraintGamemode(constraintGamemodes.regular);
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
          Режим: {colorGamemode === colorGamemodes.regular ? "обычный" : colorGamemode === colorGamemodes.fiveColors ? "пять цветов" : null}
          {adminMode && ", админ"}
          {freeMode && ", свободные ходы"}
          {constraintGamemode === constraintGamemodes.moves
            ? ", ограниченные ходы"
            : constraintGamemode === constraintGamemodes.time
            ? ", ограниченное время"
            : constraintGamemode === constraintGamemodes.multiplayer
            ? ", два игрока"
            : null}
          {differentValueMode && ", разная ценность"}
        </span>
        {constraintGamemode === constraintGamemodes.multiplayer && (
          <span className='gamemode'>
            Раунд {roundNumber}/5. Очередь:{" "}
            <span style={turn === 1 ? { color: "#3498db" } : { color: "#e74c3c" }}>{turn === 1 ? "синий" : "красный"}</span>. Осталось
            ходов: {movesLeft}.
          </span>
        )}
        {movesMade > 0 ? (
          <>
            {constraintGamemode !== constraintGamemodes.multiplayer && (
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
                    <span style={turn === 1 ? { color: "#3498db" } : { color: "white" }}>{count}</span>
                    <div className='perks blue'>
                      <span
                        className={`perk blue shuffle${perksUsedBlue.includes(perks.shuffle) || perksUsedBlue.length === 3 ? " used" : ""}${
                          turn === 1 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedBlue.includes(perks.shuffle) && perksUsedBlue.length < 3 && turn === 1 && movesLeft !== 0) ||
                            adminMode) &&
                            perkAction(perks.shuffle);
                        }}></span>
                      <span
                        className={`perk blue bomb${perksUsedBlue.includes(perks.bomb) || perksUsedBlue.length === 3 ? " used" : ""}${
                          turn === 1 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedBlue.includes(perks.bomb) && perksUsedBlue.length < 3 && turn === 1 && movesLeft !== 0) ||
                            adminMode) &&
                            perkAction(perks.bomb);
                          // setPerksUsedBlue(["bomb", ...perksUsedBlue]);
                        }}></span>
                      <span
                        className={`perk blue hammer${perksUsedBlue.includes(perks.hammer) || perksUsedBlue.length === 3 ? " used" : ""}${
                          turn === 1 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedBlue.includes(perks.hammer) && perksUsedBlue.length < 3 && turn === 1 && movesLeft !== 0) ||
                            adminMode) &&
                            perkAction(perks.hammer);
                          // setPerksUsedBlue(["bomb", ...perksUsedBlue]);
                        }}></span>
                    </div>
                  </div>
                  <div className='playerWrap'>
                    <span style={turn === 2 ? { color: "#e74c3c" } : { color: "white" }}> {count2}</span>
                    <div className='perks red'>
                      <span
                        className={`perk red shuffle${perksUsedRed.includes(perks.shuffle) || perksUsedRed.length === 3 ? " used" : ""}${
                          turn === 2 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedRed.includes(perks.shuffle) && perksUsedRed.length < 3 && turn === 2 && movesLeft !== 0) ||
                            adminMode) &&
                            perkAction(perks.shuffle);
                        }}></span>
                      <span
                        className={`perk red bomb${perksUsedRed.includes(perks.bomb) || perksUsedRed.length === 3 ? " used" : ""}${
                          turn === 2 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedRed.includes(perks.bomb) && perksUsedRed.length < 3 && turn === 2 && movesLeft !== 0) || adminMode) &&
                            perkAction(perks.bomb);
                        }}></span>
                      <span
                        className={`perk red hammer${perksUsedRed.includes(perks.hammer) || perksUsedRed.length === 3 ? " used" : ""}${
                          turn === 2 && movesLeft !== 0 ? "" : " disabled"
                        }`}
                        onClick={() => {
                          ((!perksUsedRed.includes(perks.hammer) && perksUsedRed.length < 3 && turn === 2 && movesLeft !== 0) ||
                            adminMode) &&
                            perkAction(perks.hammer);
                          // setPerksUsedBlue(["bomb", ...perksUsedBlue]);
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
                    Передать ход красному
                  </button>
                )}
                {movesLeft === 0 && turn === 2 && roundNumber < 5 && (
                  <button
                    onClick={() => {
                      setTurn(1);
                      setMovesLeft(3);
                      setRoundNumber(roundNumber + 1);
                    }}>
                    Передать ход синему
                  </button>
                )}

                {gameOver && (
                  <span style={count > count2 ? { color: "#3498db" } : count < count2 ? { color: "#e74c3c" } : { color: "#fff" }}>
                    {count > count2
                      ? "Победитель: синий!"
                      : count2 === 0
                      ? "Вы вообще пытались?"
                      : count === count2
                      ? "Ничья!"
                      : "Победитель: красный!"}
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
        onClick={(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) => {
          adminMode && explodeSpecials(parseInt((event.target as HTMLSpanElement).attributes["data-key"].value));
          // hammerMode && explodeSpecials([event.target.attributes["data-key"].value]) && setHammerMode(false);
          // adminMode && console.log(currentPieces[event.target.attributes["data-key"].value].split(" ")[0]);
        }}
        style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, height: boardSize * 50, width: boardSize * 50 }}>
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
                <span style={{ position: "absolute", left: 17, color: "#29323c" }}>{index + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
