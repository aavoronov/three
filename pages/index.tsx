"use client";

import { BoardViewModel } from "../src/board/boardViewModel";
import BoardModel from "../src/board/board";

const Board = () => {
  const viewModel = new BoardViewModel();

  return <BoardModel vm={viewModel} />;
};

export default Board;
