"use client";

import { BoardViewModel } from "../src/viewModels/boardViewModel";
import BoardModel from "../src/ui/boardModel";
import { RivalBot } from "../src/bot/rivalBot";
import { useEffect, useRef } from "react";

const Board = () => {
  const viewModel = new BoardViewModel();
  const bot = useRef<RivalBot>(RivalBot.getInstance(viewModel));

  // useEffect(() => {
  //   bot.current = new RivalBot(viewModel);
  // }, []);

  return <BoardModel viewModel={viewModel} />;
};

export default Board;
