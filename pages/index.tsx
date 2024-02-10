"use client";

import { BoardViewModel } from "../src/viewModels/boardViewModel";
import BoardModel from "../src/ui/boardModel";
import { RivalBot } from "../src/bot/rivalBot";
import { useEffect, useRef } from "react";

const Board = () => {
  const viewModel = new BoardViewModel();

  return <BoardModel viewModel={viewModel} />;
};

export default Board;
