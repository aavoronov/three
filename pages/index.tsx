import { GameViewModel } from "../src/game/gameViewModel";
import Board from "../src/components/board";

const App = () => {
  const viewModel = new GameViewModel();

  return <Board vm={viewModel} />;
};

export default App;
