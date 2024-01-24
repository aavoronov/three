import { BoardViewModel } from "../viewModels/board";
import TestUi from "../ui/testUi";

const TestView = () => {
  const viewModel = new BoardViewModel();
  return <TestUi viewModel={viewModel} />;
};

export default TestView;
