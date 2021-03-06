import React, { Component } from 'react';
import './App.css';
import Menu from './Menu';
import ScoreBoard from './ScoreBoard';
import Game from './Game';
import { placePiece, moveCpu, isGameOver, otherPiece } from './actions';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pause: false,
      cpu: null,
      message: null,
      playerPiece: 'O', 
      playerScore: 0,
      otherScore: 0,
      board: [
        [ null, null, null ],
        [ null, null, null ],
        [ null, null, null ]
      ]
    };
  }

  resetBoard = () => {
    this.setState(prevState => ({
      playerPiece: prevState.cpu ? prevState.playerPiece : 'O', 
      board: [
        [ null, null, null ],
        [ null, null, null ],
        [ null, null, null ]
      ]
    }));
  }
  resetState = () => {
    clearTimeout(this.waitTimer);
    this.setState({
      pause: false,
      playerPiece: 'O', 
      playerScore: 0,
      otherScore: 0
    }, () => this.resetBoard());
  }
  handleOnePlayer = e => {
    this.resetState();
    this.setState({ 
      cpu: true
    }, this.showMessage("Player vs CPU"));
  }
  handleTwoPlayer = e => {
    this.resetState();
    this.setState({ 
      cpu: false
    }, this.showMessage("Two Player"));
  }

  showMessage = text => {
    clearTimeout(this.msgTimer);
    this.setState({ 
      message: text
    }, () => this.msgTimer = setTimeout(
      () => this.setState({ message: null }),
      2000
    ));
  }

  gameComplete = winner => {
    this.setState({
      pause: true
    }, () => {
      this.waitTimer = setTimeout(() => this.gameWon(winner), 1000);
    });
  }

  gameWon = winner => {
    var text, targetScore;

    if (winner === 'tie')
      text = "Draw";
    else
      text = winner.concat(" won!");

    this.setState({ 
      pause: false
    }, () => {
      this.showMessage(text);
      this.resetBoard();
    });

    if (this.state.cpu) { 

      if (winner === this.state.playerPiece)
        targetScore = "playerScore";
      else if (winner === otherPiece(this.state.playerPiece))
        targetScore = "otherScore";

      this.setState(prevState => {
        let baseState = { 
          playerPiece: otherPiece(prevState.playerPiece)
        };

        if (targetScore) {
          return { 
            ...baseState, 
            [targetScore]: prevState[targetScore] + 1
          };
        } else {
          return baseState;
        }
      }, () => {
        if (this.state.playerPiece === 'X' && this.state.cpu)
          this.cpuTurn();
      });
    }
  }

  cpuTurn = () => {
    let cpuPiece = otherPiece(this.state.playerPiece);

    this.setState(prevState => {
      let move = moveCpu(prevState.board, cpuPiece);

      return {
        board: placePiece(move.i, move.j, prevState.board, cpuPiece)
      };
    }, () => {
      let winner = isGameOver(this.state.board);
      if (winner)
        this.gameComplete(winner);
    });
  }

  handleClickCell = (i, j) => () => {
    if (this.state.board[i][j] === null && !this.state.pause) {
      this.setState(prevState => ({
        board: placePiece(i, j, 
          prevState.board, 
          prevState.playerPiece
        )
      }), () => {
        let winner = isGameOver(this.state.board);
        if (winner) {
          this.gameComplete(winner);
        } else {
          if (this.state.cpu) {
            this.cpuTurn();
          } else {
            this.setState(prevState => ({ 
              playerPiece: otherPiece(prevState.playerPiece)
            }));
          }
        }
      });
    }
  }

  render() {
    return (
      <div className="App">
        <Menu
          onOnePlayer={this.handleOnePlayer}
          onTwoPlayer={this.handleTwoPlayer}
        />
        <Main 
          cpu={this.state.cpu}
          message={this.state.message}
          handleClickCell={this.handleClickCell}
          board={this.state.board}
        />
        {this.state.cpu && (
          <ScoreBoard 
            playerScore={this.state.playerScore}
            otherScore={this.state.otherScore}
            cpu={this.state.cpu}
          />
        )}
      </div>
    );
  }
}

export default App;

const Main = props => {
  if (props.cpu === null) {
    return (
      <p className="placeholder-text">
        Choose a game mode!
      </p>
    );
  } else if (props.message) {
    return (
      <p className="placeholder-text">
        {props.message}
      </p>
    );
  } else {
    return (
      <Game 
        onClickCell={props.handleClickCell}
        board={props.board}
      />
    );
  }
}
