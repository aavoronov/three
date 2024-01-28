//TODO анимации
//TODO экстра мувы
//TODO сервер, доска рекордов ограниченных режимов
//TODO ход из двух спецфишек
//TODO бустеры
//TODO больше абилок

//done тики //? и так все на тиках. Откалибровать задержки?
//done автоопределение конца хода: отслеживание отсутствия изменений
//done расчет возможных ходов
//TODO расчет возможных ходов со спецфишками и с образованием спецфишек
//done перемешать доску без схлопываний
//done перемешивание, если нет ходов
//TODO бот-соперник
//TODO свайп вместо перетаскивания

//done эффект от молнии
//fixed молния срабатывает несколько раз в цепочке спецфишек
//? kinda done разобраться с гидратацией
//fixed разобраться с мутацией _currentPieces вне экшена
//fixed спецфишки уничтожают друг друга, а не активируют
//fixed молния предпочитает выбирать фишки с начала доски
// // obsolete переписать проверку матчей под совпадение двух подряд фишек
//fixed первая ячейка не падает
//fixed спецфишки не отрабатывают в первом столбце
//fixed фишки не успевают падать и схлопываются по 3 вместо 4
//fixed бомбы образуются из плюса с предыдущих рядов
//DONE абилки
//DONE режим админа/дебага
//DONE разделить логику ходов //? что я тут имел в виду?
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
import { runInAction } from "mobx";
import { observer } from "mobx-react";
import Head from "next/head";
import Script from "next/script";
import React, { useEffect } from "react";
import { colorGamemodes, constraintGamemodes, perks } from "../../constants";
import LightningsLayer from "../components/lightnings";
import { BoardViewModel } from "../viewModels/boardViewModel";

interface Props {
  viewModel: BoardViewModel;
}

const BoardModel = observer(({ viewModel }: Props) => {
  const vm = viewModel;

  useEffect(() => {
    vm.populateBoard();

    const timeIncrement = setInterval(() => {
      if (vm.gameOver || !vm.movesMade) return;
      runInAction(() => {
        vm.timeElapsed++;
        vm.constraintGamemode === "time" && vm.timeLeft--;
      });
    }, 1000);

    const timer = setInterval(() => {
      runInAction(() => {
        if (vm.boardStabilized) return;

        vm.checkForRowsOfFive(vm.currentPieces);
        vm.checkForColumnsOfFive(vm.currentPieces);
        vm.checkForCorners(vm.currentPieces);
        vm.checkForTsAndPluses(vm.currentPieces);
        vm.checkForRowsOfFour(vm.currentPieces);
        vm.checkForColumnsOfFour(vm.currentPieces);
        vm.checkForRowsOfThree(vm.currentPieces);
        vm.checkForColumnsOfThree(vm.currentPieces);

        vm.removeAllIndices();
        vm.recursivelyDropColumn();
      });
    }, 250);

    return () => {
      clearInterval(timeIncrement);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className='App'>
      <Head>
        <title>Три в ряд</title>
        <link rel='icon' href='/favicon.ico' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' />
      </Head>
      <Script src='/DragDropTouch.js'></Script>
      <button className='openMenuBtn' onClick={vm.toggleMenu}>
        &gt;
      </button>
      {vm.menuIsOpen && <div className='overlay' onClick={vm.toggleMenu}></div>}
      {!!vm.lightningsParams && (
        <LightningsLayer
          startPoint={vm.lightningsParams.startPoint}
          endPoints={vm.lightningsParams.endPoints}
          color={vm.lightningsParams.color}
        />
      )}
      <div
        className='controlPanel'
        style={vm.menuIsOpen ? { display: "flex", zIndex: 10, width: 300, transition: "all 0.2s", height: "90vh" } : undefined}>
        <div className='boardSizeBtns'>
          <button className='boardSizeBtn' onClick={vm.shrinkBoard}>
            -
          </button>
          <span>Размер доски: {vm.boardSize}</span>
          <button className='boardSizeBtn' onClick={vm.extendBoard}>
            +
          </button>
        </div>
        <button onClick={vm.toggleColorGamemode}>
          {vm.colorGamemode === colorGamemodes.regular ? "Режим пяти цветов" : "Цвета: обычный режим"}
        </button>
        <button onClick={vm.toggleFreeMode}>{!vm.freeMode ? "Режим свободных ходов" : "Режим строгих ходов"}</button>

        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={vm.enterLimitedMovesGamemode}>
            {vm.constraintGamemode === constraintGamemodes.regular ? "Ограниченные ходы" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={vm.enterLimitedTimeGamemode}>
            {vm.constraintGamemode === constraintGamemodes.regular ? "Ограниченное время" : "Ограничения: обычный режим"}
          </button>
        ) : null}

        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={vm.enterMultiplayer}>
            {vm.constraintGamemode === constraintGamemodes.regular ? "Два игрока" : "Ограничения: обычный режим"}
          </button>
        ) : null}
        {vm.constraintGamemode !== constraintGamemodes.regular ? (
          <button onClick={vm.enterRegularMode}>
            {vm.constraintGamemode === constraintGamemodes.multiplayer ? "Один игрок" : "Обычный режим"}
          </button>
        ) : null}

        <button onClick={vm.toggleDifferentValueMode}>
          {!vm.differentValueMode ? "Ценность фишек: режим разной ценности" : "Ценность фишек: обычный режим"}
        </button>
        <button onClick={vm.toggledebugMode}>{!vm.debugMode ? "Режим отладки" : "Обычный режим"}</button>
        <span style={{ display: "none" }}>Ага, думаешь, так просто? Введи пароль . Попался! Ищешь пароль? Страждущий да обрящет</span>
      </div>
      <div className='stats'>
        <span className='gamemode'>{vm.modeText}</span>

        {(() => {
          if (!vm.multiplayerText) return;
          return (
            <span className='gamemode'>
              {vm.multiplayerText.startText}
              <span style={{ color: vm.multiplayerText.currentColor.code }}>{vm.multiplayerText.currentColor.name}. </span>
              {vm.multiplayerText.endText}
            </span>
          );
        })()}

        <button onClick={() => vm.checkForPossibleMoves(vm.currentPieces)}>count moves</button>
        <button onClick={() => vm.shuffleBoard()}>shuffle</button>

        {vm.movesMade ? (
          <>
            <span style={{ fontSize: 18 }}>{vm.time}</span>

            {vm.constraintGamemode !== constraintGamemodes.multiplayer && <span>{vm.singleplayerScore}</span>}
            {vm.constraintGamemode === constraintGamemodes.multiplayer ? (
              <div className='twoPlayerStatsWrap'>
                <div className='twoPlayersStats'>
                  <div className='playerWrap'>
                    <span style={{ color: vm.multiplayerScore.blue.color }}>{vm.multiplayerScore.blue.score}</span>
                    <div className='perks blue'>
                      <span
                        className={vm.calculatePerksClassNames(perks.shuffle, 1)}
                        onClick={() => vm.usePerk(perks.shuffle, "blue")}></span>
                      <span className={vm.calculatePerksClassNames(perks.bomb, 1)} onClick={() => vm.usePerk(perks.bomb, "blue")}></span>
                      <span
                        className={vm.calculatePerksClassNames(perks.hammer, 1)}
                        onClick={() => vm.usePerk(perks.hammer, "blue")}></span>
                    </div>
                  </div>
                  <div className='playerWrap'>
                    <span style={{ color: vm.multiplayerScore.red.color }}>{vm.multiplayerScore.red.score}</span>
                    <div className='perks red'>
                      <span
                        className={vm.calculatePerksClassNames(perks.shuffle, 2)}
                        onClick={() => vm.usePerk(perks.shuffle, "red")}></span>
                      <span className={vm.calculatePerksClassNames(perks.bomb, 2)} onClick={() => vm.usePerk(perks.bomb, "red")}></span>
                      <span className={vm.calculatePerksClassNames(perks.hammer, 2)} onClick={() => vm.usePerk(perks.hammer, "red")}></span>
                    </div>
                  </div>
                </div>

                {vm.gameOver && <span style={{ color: vm.winner.color }}>{vm.winner.text}</span>}
              </div>
            ) : vm.constraintGamemode !== "moves" ? (
              <span>
                Ходов сделано: {vm.movesMade}
                {vm.movesMade > 99 && ". Невероятно!"}
              </span>
            ) : !vm.gameOver ? (
              <span>Ходов осталось: {vm.movesLeft}</span>
            ) : (
              <span>Ходы закончились!</span>
            )}
          </>
        ) : null}
        {vm.gameOver && <button onClick={vm.resetEverything}>Переиграть</button>}
      </div>

      <div
        className='board'
        // ref={board}
        onClick={(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) => {
          if (!vm.debugMode) return;
          const index = parseInt((event.target as HTMLSpanElement).attributes["data-key"].value);
          console.log(index);
          // vm.testFn(index);
          // vm.explodeSpecials(index);
          // console.log(vm.getPiecesColor(index));
          // hammerMode && explodeSpecials([event.target.attributes["data-key"].value]) && setHammerMode(false);
          // debugMode && console.log(currentPieces[event.target.attributes["data-key"].value].split(" ")[0]);
        }}
        style={{ gridTemplateColumns: `repeat(${vm.boardSize}, 1fr)`, height: vm.boardSize * 50, width: vm.boardSize * 50 }}>
        {vm.currentPieces.map((e, i) => (
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
            onDrop={vm.dragDrop}
            onDragStart={vm.dragStart}
            onDragEnd={vm.dragEnd}>
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

        {vm.differentValueMode && (
          <div className='valueRules'>
            {vm.classes.map((item, index) => (
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
});

export default BoardModel;
