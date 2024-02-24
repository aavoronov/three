"use client";

import { BoardViewModel } from "../src/viewModels/boardViewModel";
import BoardModel from "../src/ui/boardModel";

const Board = () => {
  const viewModel = new BoardViewModel();

  return <BoardModel viewModel={viewModel} />;
};

export default Board;
