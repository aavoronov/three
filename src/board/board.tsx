// // TODO анимации уточнить, какие именно
//done экстра мувы
//? сервер, доска рекордов ограниченных режимов
//? бустеры
//? больше абилок
//done тики //? и так все на тиках. Откалибровать задержки?
//done автоопределение конца хода: отслеживание отсутствия изменений
//done расчет возможных ходов
//done расчет возможных ходов со спецфишками и с образованием спецфишек
//done ход из двух спецфишек
//done перемешать доску без схлопываний
//done перемешивание, если нет ходов
//done бот-соперник
//done перки боту
//done свайп вместо перетаскивания
//done анимация свайпа
//done индикация блокировки хода
//fixed вычисление ходов перепроверить
//fixed не создавать две спецфишки одновременно
//fixed http://joxi.ru/D2Pp4aZT1plZZ2 такой ход заставит стрелку сработать первой,
//      уничтожив среднюю фишку внизу, матч исчезнет. Аналогично для стрелки слева
//? ! молнии уничтожают другие молнии, не активируя? не должны вроде
//fixed ограничить рекурсию, которая проявляется неизвестно как? - проявлялась взаимным уничтожением спецфишек
//fixed не уничтожать только что созданную бомбу стрелкой - неправильно вычислялся тип фишки
//fixed бомба некоторыми уголками не создается - частный случай ^ ?
//fixed расчет ходов с образованием двух спецфишек
//fixed сложность бота, вероятно, обратно пропорциональна заданной
//fixed более гибкий расчет предпочтительного хода для бота
//done бот сложного уровня всегда предпочитает лучший ход
//! бот уходит в минус по оставшимся ходам
//done научить бота делать двойные ходы спецфишками
//done изменить приоритет ходов у бота в пользу экстра мувов
//done указатель для двойных спецфишечных ходов
//fixed исправить начисление экстра мувов
//fixed бот зависает на перке
//fixed на пятом раунде красный получает заново 3 хода
//done указатель текущего хода
//done перк-молот
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

import { runInAction } from "mobx";
import { observer } from "mobx-react";
import Head from "next/head";
import Script from "next/script";
import React, { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { RivalBot } from "../bot/rivalBot";
import LightningsLayer from "../components/lightnings";
import MoveIndicator from "../components/moveIndicator";
import { colorGamemodes, constraintGamemodes, perks } from "../constants";
import { BoardViewModel } from "./boardViewModel";

interface Props {
  vm: BoardViewModel;
}

const swipeConfig = {
  delta: 10, // min distance(px) before a swipe starts. *See Notes*
  preventScrollOnSwipe: true, // prevents scroll during swipe (*See Details*)
  trackTouch: true, // track touch input
  trackMouse: true, // track mouse input
  rotationAngle: 0, // set a rotation angle
  swipeDuration: 250, // allowable duration of a swipe (ms). *See Notes*
  touchEventOptions: { passive: true }, // options for touch listeners (*See Details*)
};

const BoardModel = observer(({ vm }: Props) => {
  const bot = useRef<RivalBot>();

  const swipeHandlers = useSwipeable({
    onSwiped: (eventData) => {
      vm.swipeEnd(eventData);
    },

    onTouchStartOrOnMouseDown: (eventData) => {
      vm.swipeStart(eventData.event);
    },
    ...swipeConfig,
  });

  useEffect(() => {
    bot.current = RivalBot.getInstance(vm);

    return () => (bot.current = null);
  }, []);

  useEffect(() => {
    vm.populateBoard();

    const timeIncrement = setInterval(() => {
      if (vm.gameOver || !vm.movesMade) return;
      runInAction(() => {
        vm.timeElapsed++;
        vm.constraintGamemode === "time" && vm.timeLeft > 0 && vm.timeLeft--;
      });
    }, 1000);

    const timer = setInterval(() => vm.gameTick(), 250);

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
      {!!vm.movePointerParams && <MoveIndicator startPoint={vm.movePointerParams.startPoint} endPoint={vm.movePointerParams.endPoint} />}
      <div className={`controlPanel${vm.menuIsOpen ? " opened" : ""}`}>
        <div className='boardSizeBtns'>
          <button className='boardSizeBtn' onClick={() => vm.changeBoardSize(-1)}>
            -
          </button>
          <span>Размер доски: {vm.boardSize}</span>
          <button className='boardSizeBtn' onClick={() => vm.changeBoardSize(1)}>
            +
          </button>
        </div>
        <button onClick={vm.toggleColorGamemode}>
          {vm.colorGamemode === colorGamemodes.regular ? "Режим пяти цветов" : "Цвета: обычный режим"}
        </button>
        <button onClick={vm.toggleFreeMode}>{!vm.freeMode ? "Режим свободных ходов" : "Режим строгих ходов"}</button>

        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={() => vm.toggleConstraintGamemode(constraintGamemodes.moves)}>Ограниченные ходы</button>
        ) : null}

        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={() => vm.toggleConstraintGamemode(constraintGamemodes.time)}>Ограниченное время</button>
        ) : null}

        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={() => vm.toggleConstraintGamemode(constraintGamemodes.multiplayer)}>Два игрока</button>
        ) : null}
        {vm.constraintGamemode === constraintGamemodes.regular ? (
          <button onClick={() => vm.toggleConstraintGamemode(constraintGamemodes.bot)}>Игра против бота</button>
        ) : null}
        {vm.constraintGamemode !== constraintGamemodes.regular ? (
          <button onClick={() => vm.toggleConstraintGamemode(constraintGamemodes.regular)}>
            {vm.constraintGamemode === constraintGamemodes.multiplayer ? "Один игрок" : "Обычный режим"}
          </button>
        ) : null}

        {vm.constraintGamemode === constraintGamemodes.bot && (
          <div className='bot-difficulty'>
            <span>Сложность бота</span>
            <button className={vm.botDifficulty === 0 ? "active" : ""} onClick={() => vm.changeBotDifficulty(0)}>
              Легко
            </button>
            <button className={vm.botDifficulty === 1 ? "active" : ""} onClick={() => vm.changeBotDifficulty(1)}>
              Средне
            </button>
            <button className={vm.botDifficulty === 2 ? "active" : ""} onClick={() => vm.changeBotDifficulty(2)}>
              Сложно
            </button>
          </div>
        )}

        <button onClick={vm.toggleDifferentValueMode}>
          {!vm.differentValueMode ? "Ценность фишек: режим разной ценности" : "Ценность фишек: обычный режим"}
        </button>
        <button onClick={vm.toggleDebugMode}>{!vm.debugMode ? "Режим отладки" : "Обычный режим"}</button>
        <span style={{ display: "none" }}>Ага, думаешь, так просто? Введи пароль . Попался! Ищешь пароль? Страждущий да обрящет</span>
      </div>
      <div className='game'>
        <div className='stats'>
          <span className='stats-line'>{vm.modeText}</span>

          {(() => {
            if (!vm.multiplayerText) return;
            return (
              <span className='stats-line'>
                {vm.multiplayerText.startText}
                <span style={{ color: vm.multiplayerText.currentColor.code }}>{vm.multiplayerText.currentColor.name}. </span>
                <span className={`movesLeft ${vm.extraMoveAwarded ? "extraMoveAwarded" : ""}`}>{vm.multiplayerText.endText}</span>
              </span>
            );
          })()}

          {/* <button onClick={() => bot.current.checkForPossibleMoves(vm.currentPieces)}>possible moves</button>
          <button onClick={() => bot.current.makeMove()}>selected move</button> */}

          {vm.movesMade ? (
            <>
              <span className='stats-line'>{vm.time}</span>

              {vm.constraintGamemode !== constraintGamemodes.multiplayer && vm.constraintGamemode !== constraintGamemodes.bot && (
                <span className='stats-line'>{vm.singleplayerScore}</span>
              )}
              {vm.constraintGamemode === constraintGamemodes.multiplayer || vm.constraintGamemode === constraintGamemodes.bot ? (
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
                        <span
                          className={vm.calculatePerksClassNames(perks.hammer, 2)}
                          onClick={() => vm.usePerk(perks.hammer, "red")}></span>
                      </div>
                    </div>
                  </div>

                  {vm.gameOver && <span style={{ color: vm.winner.color }}>{vm.winner.text}</span>}
                </div>
              ) : vm.constraintGamemode !== "moves" ? (
                <span className='stats-line'>
                  Ходов сделано: {vm.movesMade}
                  {vm.movesMade > 99 && ". Невероятно!"}
                </span>
              ) : !vm.gameOver ? (
                <span className='stats-line'>Ходов осталось: {vm.movesLeft}</span>
              ) : (
                <span className='stats-line'>Ходы закончились!</span>
              )}
            </>
          ) : null}
          {vm.gameOver && <button onClick={vm.handleReplay}>Переиграть</button>}
        </div>

        <div
          className={`board${vm.hammerMode ? " hammerMode" : ""}${!vm.boardStabilized ? " locked" : ""}`}
          // ref={board}
          onClick={(event: React.SyntheticEvent<HTMLSpanElement, MouseEvent>) => {
            vm.breakPieceInHammerMode(event);
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
          {/* {!vm.boardStabilized ? " moveLocked" : ""} */}
          {vm.currentPieces.map((e, i) => (
            <span
              className={"piece " + e}
              key={i}
              data-key={i}
              draggable={vm.debugMode ? true : false}
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
              onDragEnd={vm.dragEnd}
              {...swipeHandlers}></span>
          ))}
        </div>
        <div className='rules'>
          <div className='moveRules'>
            <div className='rule'>
              <div className='arrowRule' style={{ marginRight: 10 }}></div>
              <span style={{ color: "white" }}>=</span>
              <span className='piece arrowHorizontal' style={{ width: 40, height: 40 }}></span>
            </div>
            <div className='rule'>
              <div className='bombRule' style={{ marginRight: 10 }}></div>
              <span style={{ color: "white" }}>=</span>
              <span className='piece bomb' style={{ width: 40, height: 40 }}></span>
            </div>
            <div className='rule'>
              <div className='lightningRule' style={{ marginRight: 10 }}></div>
              <span style={{ color: "white" }}>=</span>
              <span className='piece lightning' style={{ width: 40, height: 40 }}></span>
            </div>
            <div className='rule'>
              <div className='doubleSpecialRule' style={{ marginRight: 10 }}></div>
              <span style={{ color: "white" }}>=</span>
              <div className='explosion' style={{ marginRight: 10 }}></div>
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
    </div>
  );
});

export default BoardModel;
