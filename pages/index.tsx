"use client";

import { BoardViewModel } from "../viewModels/board";
import BoardModel from "../ui/boardModel";

const Board = () => {
  const viewModel = new BoardViewModel();
  return <BoardModel viewModel={viewModel} />;
};

export default Board;
