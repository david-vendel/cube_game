import React, { useRef, useState } from "react";

//intro is the first line, changing between instructions, win or lose statement.
const INTERVAL = 160;
const STAR = "✸";

function useAsyncReference(value) {
  const ref = useRef(value);
  const [, forceRender] = useState(false);

  function updateState(newState) {
    ref.current = newState;
    forceRender((s) => !s);
  }

  return [ref, updateState];
}

const AUDIOS = [
  "https://freesound.org/data/previews/467/467583_9892063-lq.mp3",
  "https://freesound.org/data/previews/421/421150_5820033-lq.mp3",
  "https://freesound.org/data/previews/171/171104_2394245-lq.mp3",
  "https://freesound.org/data/previews/377/377017_1172853-lq.mp3",
  "https://freesound.org/data/previews/71/71393_685248-lq.mp3",
  "https://freesound.org/data/previews/110/110314_1460197-lq.mp3",
  "https://freesound.org/data/previews/51/51620_610202-lq.mp3",
  "https://freesound.org/data/previews/41/41116_27322-lq.mp3",
  "https://freesound.org/data/previews/13/13113_35389-lq.mp3",
  "https://freesound.org/data/previews/322/322697_2195044-lq.mp3",
  "https://freesound.org/data/previews/546/546069_12187289-lq.mp3",
  "https://freesound.org/data/previews/184/184557_19852-lq.mp3",
];

const AUDIO_HERE = AUDIOS[Math.floor(AUDIOS.length * Math.random())];
const AUDIO_HERE_OPPONENT = AUDIOS[Math.floor(AUDIOS.length * Math.random())];

const Board = ({
  sizex,
  sizey,
  clickedCB,
  broadcast,
  turn,
  setTurn,
  dice,
  resetBoard,
  yourColor,
  moves,
  multiplayer,
  forcedGrid,
  gameID,
}) => {
  // const [audio, setAudio] = React.useState(
  //     new Audio(AUDIOS[Math.floor(AUDIOS.length * Math.random())])
  // );

  //dice is whether graphics is number or dice

  // const drawBoard = () => {
  // const GRID = Object.freeze(
  //     Array.from({ length: sizey }, () =>
  //         Object.freeze(
  //             Array.from({ length: sizex }, () => ({
  //                 p: 0,
  //                 d: 'black',
  //                 c: '',
  //                 p: 0,
  //                 buttonGrid: 35,
  //                 diceGrid: 55,
  //             }))
  //         )
  //     )
  // );

  const GRID = [0, 0, 0, 0, 0].map((line) => {
    return [0, 0, 0, 0, 0].map((x) => {
      return {
        p: 0,
        d: "black",
        c: "",
        p: 0,
        buttonGrid: 35,
        diceGrid: 55,
        e: false,
      };
    });
  });
  // .map((line, a) => {
  //     return line.map((x, b) => {
  //         if (a < 2 && b < 2) {
  //             x.c = 'limegreen';
  //             x.p = 5;
  //         }
  //         return x;
  //     });
  // });

  GRID[1][1].c = "limegreen";
  GRID[0][1].c = "limegreen";
  GRID[1][0].c = "limegreen";
  GRID[0][0].c = "limegreen";
  // GRID[2][0].c = 'limegreen';
  // GRID[2][1].c = 'limegreen';
  // GRID[0][2].c = 'limegreen';
  // GRID[1][2].c = 'limegreen';

  GRID[3][3].c = "red";
  GRID[3][4].c = "red";
  GRID[4][3].c = "red";
  GRID[4][4].c = "red";
  // GRID[2][4].c = 'red';
  // GRID[2][3].c = 'red';
  // GRID[3][2].c = 'red';
  // GRID[4][2].c = 'red';

  GRID[1][1].p = 5;
  GRID[0][1].p = 3;
  GRID[1][0].p = 3;
  GRID[0][0].p = 6;

  GRID[3][3].p = 5;
  GRID[3][4].p = 3;
  GRID[4][3].p = 3;
  GRID[4][4].p = 6;

  //     return GRID;
  // };

  // const GRID = drawBoard();

  const [grid, setGrid] = useAsyncReference(GRID);

  // const [grid, setGrid] = React.useState(GRID);
  const [render, setRender] = React.useState(0);
  const [queue, setQueue] = React.useState([]);
  const [gameInterval, setGameInterval] = React.useState(null);
  const [iteration, setIteration] = useAsyncReference(0);

  React.useEffect(() => {
    if (forcedGrid && forcedGrid !== "-") {
      console.log("forcedGrid", JSON.parse(forcedGrid)[0][0]);
      setGrid(JSON.parse(forcedGrid));
    }
  }, [forcedGrid]);

  React.useEffect(() => {
    console.log("Board DID MOUNT");
  }, []);

  // React.useEffect(() => {
  //     console.log('gamesToSend', gamesToSend);
  //     if (gamesToSend && gamesToSend !== '-') {
  //         console.log('changing gamesToSend');

  //         const gamesParsed = JSON.parse(gamesToSend);
  //         console.log('games parsed', gamesParsed);
  //         gamesParsed.forEach((g) => {
  //             console.log('g', g);
  //         });
  //         // setGrid(JSON.parse(forcedGrid));
  //     }
  // }, [gamesToSend]);

  const colorBlink = (a, b, color = "white", who) => {
    console.log("colorblink", a, b, iteration.current);

    let newGrid = [...grid.current];

    newGrid = newGrid.map((line) => {
      return line.map((x) => {
        if (
          x.iteration === iteration.current ||
          x.iteration + 1 === iteration.current
        ) {
        } else {
          x.e = false;
        }
        return x;
      });
    });

    newGrid[a][b].d = color;
    newGrid[a][b].buttonGrid = 56;
    newGrid[a][b].iteration = iteration.current;

    console.log("newgrid", newGrid);

    setGrid(newGrid);

    setTimeout(() => {
      let newGrid = [...grid.current];
      newGrid[a][b].d = "black";
      newGrid[a][b].e = true;
      newGrid[a][b].buttonGrid = 35;
      setGrid(newGrid);
    }, 100);

    // this.updateGraph();
  };

  //parametres are: 2 coordinates, color of given move (color is changing during explosion, when player is conquering surrounding squares. color is stored in state field c. source tells if move is exploding move, to animate it accordingly)
  const moveDice = (a, b, thatColor, source = "none", who, hardSet) => {
    console.log("dice moved", a, b, thatColor, source, who);

    if (who === "opponent") {
      new Audio(AUDIO_HERE_OPPONENT).play();
    } else {
      new Audio(AUDIO_HERE).play();
    }

    // setAudio(new Audio(AUDIOS[Math.floor(AUDIOS.length * Math.random())]));

    if (who !== "opponent" && source !== "explode") {
      console.log("sending to server");
      clickedCB(a, b, iteration.current + 1);
      setIteration(iteration.current + 1);
    }

    setTimeout(() => {
      if (source == "explode") {
        colorBlink(a, b, "red", who);
      } else {
        colorBlink(a, b, "white", who);
      }
    }, 10);

    // const newGrid =_.cloneDeep(grid);
    // const newGrid = [...grid];
    const newGrid = grid.current.map((inner) => inner.slice());

    // var cc = this.state.c;
    // pp[a][b] = boxValue;
    // cc[a][b] = ccc;
    // this.setState({
    //     p: pp,
    //     c: cc,
    //     turn: false,
    // });

    //if explo ding, just pass forward the color of explosion (ccc) to know how to color surrounding squares
    // if (boxValue > 6) {
    //     this.explode(a, b, ccc);
    // }

    if (newGrid[a][b].p === STAR) {
      console.log("it's a star!");
      newGrid[a][b].p = 0;
    }

    if (1 + newGrid[a][b].p > 6) {
      explode(a, b, thatColor, who);
    } else {
      newGrid[a][b].p = 1 + newGrid[a][b].p;
      newGrid[a][b].c = thatColor;
      console.log("not exploding");
      setGrid(newGrid);

      if (who === "opponent") {
        console.log("click was by opponent. your turn");
        setTurn(true);
      } else {
        console.log("click was by you. not your turn");
        console.log("gameID:", gameID);
        setTurn(false);
        setTimeout(() => {
          broadcast(a, b, JSON.stringify(newGrid), gameID, iteration.current);
        }, 130);
      }
    }

    if (queue.length === 1) {
      console.log("queu length is 1, explosion happened");
      if (who === "opponent") {
        console.log("click was by opponent. your turn");
        setTurn(true);
      } else {
        console.log("click was by you. not your turn");
        setTurn(false);
      }
    }

    // setRender(render + 1);
  };

  const explode = (a, b, thatColor, who) => {
    console.log("dice explode ", a, b, thatColor, who);
    // var qq = this.state.queue;
    // var cc = this.state.c;
    //var ccc = cc[a][b] //current color from c array
    // var pp = this.state.p; //current number

    const qq = queue;

    // const newGrid = [...grid];
    const newGrid = grid.current.map((inner) => inner.slice());

    newGrid[a][b].p = STAR;

    if (a > 0) {
      qq.unshift([a - 1, b, thatColor, "explode", who]);
    } else {
      qq.unshift([5 - 1, b, thatColor, "explode", who]);
    }

    if (b > 0) {
      qq.unshift([a, b - 1, thatColor, "explode", who]);
    } else {
      qq.unshift([a, 5 - 1, thatColor, "explode", who]);
    }

    if (a < sizey - 1) {
      qq.unshift([a + 1, b, thatColor, "explode", who]);
    } else {
      qq.unshift([0, b, thatColor, "explode", who]);
    }

    if (b < sizex - 1) {
      qq.unshift([a, b + 1, thatColor, "explode", who]);
    } else {
      qq.unshift([a, 0, thatColor, "explode", who]);
    }
    qq.unshift([a, b, thatColor, "explode", who, 1]);

    setGrid(newGrid);

    setQueue(qq);

    // setTimeout(() => {
    //     const newGrid2 = [...grid];
    //     newGrid2[a][b].p = 1;
    //     setGrid(newGrid2);
    // }, 500);
  };

  const boxClicked = (e, a, b) => {
    if (multiplayer) {
      if (grid.current[a][b].c != yourColor) {
        return;
      }
      if (queue.length) {
        return;
      }
      if (!turn) {
        return;
      }
    }

    if (forcedGrid) {
      return;
    }

    console.log("boxClicked ", a, b, " setting turn false");
    setTurn(false);
    moveDice(a, b, grid.current[a][b].c, "my move", "me");
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // Core of whole game is gameCycle function, which runs in regular intervals (this.state.render) and makes the game move - function moveDice
  const gameCycle = (aa, bb, custom = "no") => {
    // console.log('gameCycle');
    // if (this.state.autoplay) {
    //     //makes number in right bottom change between 1 and 5 to animate autoplay
    //     var randomNumber = 4 * (Math.ceil(Date.now() / 1000) % 2) + 1;
    //     this.setState({ randomNumber });
    //     this.boxClicked();
    // }

    // update graph once in a while randomly, just to be sure
    // if (Math.random() < 0.02) {
    //     this.updateGraph();
    // }

    // Each game cycle, one and only one move is made, move being single number increase. The moves are drawn from queue of moves.

    const qq = queue;
    //if there are moves to be done in queue, do those moves. else carry on and do opponent moves
    if (qq.length > 0) {
      var next = qq.shift();
      console.log("game cycle, ", qq, qq.length);
      moveDice(next[0], next[1], next[2], next[3], next[4], next[5]);
      setQueue(qq);
    } else {
      // this.setState({
      //     turn: true,
      //     bigturn: true,
      // });
      // if (this.state.allowOpponentMove) {
      //     //if there is autoplay, also green has to play
      //     if (this.state.autoplay) {
      //         this.aiGreen();
      //     }
      //     //these AIs will play, each will add up moves to the queue, and then queue is processed move by move. If given AI has no single dice of its color on Dice anymore, it will simply not be able to play.
      //     // this.aiRed();
      //     // this.aiBlue();
      //     // this.aiViolet();
      //     // console.log('AI run');
      //     // this.setState({ allowOpponentMove: false });
      // }
    }
  };

  React.useEffect(() => {
    if (!gameInterval) {
      const interval = setInterval(() => {
        gameCycle();
      }, INTERVAL);
      setGameInterval(interval);
    }
    return () => {
      clearInterval(gameInterval);
    };
  }, []);

  React.useEffect(() => {
    console.log("resetBoard", resetBoard);
    if (resetBoard && resetBoard > 1) {
      drawBoard();
    }
  }, [resetBoard]);

  const drawBoard = () => {
    console.log("draw board");
    const GRID = [0, 0, 0, 0, 0].map((line) => {
      return [0, 0, 0, 0, 0].map((x) => {
        return {
          p: 0,
          d: "black",
          c: "",
          p: 0,
          buttonGrid: 35,
          diceGrid: 55,
        };
      });
    });

    GRID[1][1].c = "limegreen";
    GRID[0][1].c = "limegreen";
    GRID[1][0].c = "limegreen";
    GRID[0][0].c = "limegreen";

    GRID[3][3].c = "red";
    GRID[3][4].c = "red";
    GRID[4][3].c = "red";
    GRID[4][4].c = "red";

    GRID[1][1].p = 5;
    GRID[0][1].p = 3;
    GRID[1][0].p = 3;
    GRID[0][0].p = 6;

    GRID[3][3].p = 5;
    GRID[3][4].p = 3;
    GRID[4][3].p = 3;
    GRID[4][4].p = 6;

    setGrid(GRID);
    setQueue([]);
  };

  React.useEffect(() => {
    console.log("moves changed", moves?.length, moves);
    if (moves?.length) {
      const lastMove = moves[moves.length - 1];
      const a = lastMove.x;
      const b = lastMove.y;
      setIteration(lastMove.iteration);
      moveDice(a, b, grid.current[a][b].c, "opponents move", "opponent");
      console.log("settingturn true");
    }
  }, [moves?.length]);

  const makeButtonOne = (a, b) => {
    if (dice == "dice") {
      return (
        <div key={`key-${a}-${b}-dice`}>
          <button
            className="stlpec dice"
            style={{
              backgroundColor: makeBgColor(
                grid.current[a][b].c,
                grid.current[a][b].e
              ),
              color: grid.current[a][b].d,
              fontSize: grid.current[a][b].diceGrid,
            }}
            onClick={(e) => boxClicked(e, a, b)}
          >
            {grid.current[a][b].p}
          </button>
        </div>
      );
    } else {
      return (
        <div key={`key-${a}-${b}-number`}>
          <button
            className="stlpec number"
            style={{
              backgroundColor: makeBgColor(
                grid.current[a][b].c,
                grid.current[a][b].e
              ),
              color: grid.current[a][b].d,
              fontSize: grid.current[a][b].buttonGrid,
            }}
            onClick={(e) => boxClicked(e, a, b)}
          >
            {grid.current[a][b].p}
          </button>
        </div>
      );
    }
  };

  const makeButtonLine = (a) => {
    const arr = [];
    for (let i = 0; i < sizex; i++) {
      arr.push(makeButtonOne(a, i));
    }
    return (
      <div key={`riadok-${a}`} className="riadok" style={{ width: 70 * sizex }}>
        {/* {arr} */}
        {Array(sizex)
          .fill()
          .map((_, i) => makeButtonOne(a, i))}
      </div>
    );
  };

  const makeSquare = () => {
    const arr2 = [];
    for (let y = 0; y < sizey; y++) {
      arr2.push(makeButtonLine(y));
    }

    return Array(sizey)
      .fill()
      .map((_, i) => makeButtonLine(i));
    return arr2;
  };

  const makeBgColor = (c, e) => {
    if (!e) {
      if (c === "limegreen") {
        return "rgb(45,200,45)";
      }
      if (c === "red") {
        return "rgb(194,24,10)";
      }
    } else {
      if (c === "limegreen") {
        return "rgb(10,230,10)";
      }
      if (c === "red") {
        return "red";
      }
    }
  };
  // console.log('board render', forcedGrid?.length, gameID);

  return (
    <div>
      {/* {gameID} -- {iteration.current} */}
      {makeSquare()}
    </div>
  );
};

export default Board;
