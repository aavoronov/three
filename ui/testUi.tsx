import { observer } from "mobx-react";

const TestUi = observer(({ viewModel }) => {
  const newElements = ["1", "2", "3"];
  return (
    <div>
      <button onClick={() => viewModel.addPieces(newElements)}>test</button>
      <button
        onClick={() => {
          viewModel.currentPieces = [...viewModel.currentPieces, ...newElements];
        }}>
        test2
      </button>
      <br />
      <span>{viewModel.currentPieces}</span>
    </div>
  );
});

export default TestUi;
