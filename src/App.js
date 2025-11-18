import './App.css';
import Context from './components/Context.js';
import BetBoard from './components/BetBoard.js';
import LastNumbers from './components/LastNumbers.js';
import Chips from './components/Chips.js';
import Balance from './components/Balance.js';
import Faucet from './components/FaucetModal.js';
import Board from './components/Board.js';
import Confetti from './components/Confetti.js';

function App() {
  return (
    <div className="App">
      <Context>
        <Balance />
        <Faucet />

        <div className='upper-container'>
          <Board />
          <Confetti />
        </div>

        <div className='bottom-conteiner'>
          <LastNumbers />
          <BetBoard />
          <Chips />
        </div>
      </Context>
    </div>
  );
}

export default App;
