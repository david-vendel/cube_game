import React, { Component } from 'react';
import _ from 'lodash';

//intro is the first line, changing between instructions, win or lose statement.
const INTERVAL = 250;

const Board = ({
    sizex,
    sizey,
    clickedCB,
    turn,
    setTurn,
    dice,
    resetBoard,
}) => {
    //dice is whether graphics is number or dice

    const drawBoard = () => {
        const GRID = Array.from({ length: sizey }, () =>
            Array.from({ length: sizex }, () => ({
                p: 0,
                d: 'black',
                c: '',
                p: 0,
                buttonGrid: 35,
                diceGrid: 55,
            }))
        );

        GRID[1][1].c = 'limegreen';
        GRID[0][1].c = 'limegreen';
        GRID[1][0].c = 'limegreen';
        GRID[0][0].c = 'limegreen';

        GRID[3][3].c = 'red';
        GRID[3][4].c = 'red';
        GRID[4][3].c = 'red';
        GRID[4][4].c = 'red';

        GRID[1][1].p = 4;
        GRID[0][1].p = 3;
        GRID[1][0].p = 3;
        GRID[0][0].p = 6;

        GRID[3][3].p = 5;
        GRID[3][4].p = 3;
        GRID[4][3].p = 3;
        GRID[4][4].p = 6;

        return GRID;
    };

    const GRID = drawBoard();
    const [grid, setGrid] = React.useState([...GRID]);
    const [render, setRender] = React.useState(0);
    const [queue, setQueue] = React.useState([]);
    const [gameInterval, setGameInterval] = React.useState(null);

    const colorBlink = (a, b, color = 'white') => {
        console.log('colorblink', a, b, 'color');

        let newGrid = [...grid];
        newGrid[a][b].d = color;
        newGrid[a][b].buttonGrid = 56;

        setGrid(newGrid);

        setTimeout(() => {
            let newGrid = [...grid];
            newGrid[a][b].d = 'black';
            newGrid[a][b].buttonGrid = 35;
            setGrid(newGrid);
        }, 100);

        // this.updateGraph();
    };

    //parametres are: 2 coordinates, color of given move (color is changing during explosion, when player is conquering surrounding squares. color is stored in state field c. source tells if move is exploding move, to animate it accordingly)
    const moveDice = (a, b, myColor, source = 'none') => {
        console.log('dice moved', a, b, myColor, source);

        if (source == 'explode') {
            colorBlink(a, b, 'red');
        } else {
            colorBlink(a, b, 'white');
        }

        // const newGrid =_.cloneDeep(grid);
        const newGrid = [...grid];

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

        if (1 + grid[a][b].p > 6) {
            explode(a, b, myColor);
        } else {
            newGrid[a][b].p = 1 + grid[a][b].p;
            newGrid[a][b].c = myColor;

            setGrid(newGrid);
        }

        setTurn(false);
        setRender(render + 1);
    };

    const explode = (a, b, myColor) => {
        console.log('dice explode ', a, b, myColor);
        // var qq = this.state.queue;
        // var cc = this.state.c;
        //var ccc = cc[a][b] //current color from c array
        // var pp = this.state.p; //current number

        const qq = queue;

        if (a > 0) {
            qq.unshift([a - 1, b, myColor, 'explode']);
        }
        if (b > 0) {
            qq.unshift([a, b - 1, myColor, 'explode']);
        }
        if (a < sizey - 1) {
            qq.unshift([a + 1, b, myColor, 'explode']);
        }
        if (b < sizex - 1) {
            qq.unshift([a, b + 1, myColor, 'explode']);
        }

        const newGrid = [...grid];
        newGrid[a][b].p = '✸';
        setGrid(newGrid);
        setQueue(qq);

        setTimeout(() => {
            const newGrid2 = [...grid];
            newGrid2[a][b].p = 1;
            setGrid(newGrid2);
        }, 500);

        // setTimeout(() => {
        //     if (a > 0) {
        //         moveDice(a - 1, b, myColor, 'explode');
        //     }
        // }, 1000);

        // setTimeout(() => {
        //     if (a < sizey - 1) {
        //         moveDice(a + 1, b, myColor, 'explode');
        //     }
        // }, 2000);

        // setTimeout(() => {
        //     if (b > 0) {
        //         moveDice(a, b - 1, myColor, 'explode');
        //     }
        // }, 3000);

        // setTimeout(() => {
        //     if (b < sizex - 1) {
        //         moveDice(a, b + 1, myColor, 'explode');
        //     }
        // }, 4000);
    };

    const boxClicked = (e, a, b) => {
        console.log('boxClicked');
        if (grid[a][b].c != 'limegreen') {
            return;
        }
        if (queue.length) {
            return;
        }

        moveDice(a, b, grid[a][b].c);

        clickedCB();
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Core of whole game is gameCycle function, which runs in regular intervals (this.state.render) and makes the game move - function moveDice
    const gameCycle = (aa, bb, custom = 'no') => {
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
            moveDice(next[0], next[1], next[2], next[3]);
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
        setGrid(drawBoard());
    }, [resetBoard]);

    const makeButtonOne = (a, b) => {
        if (dice == 'dice') {
            var buttonOne = (
                <div>
                    <button
                        className="stlpec dice"
                        style={{
                            backgroundColor: grid[a][b].c,
                            color: grid[a][b].d,
                            fontSize: grid[a][b].diceGrid,
                        }}
                        onClick={(e) => boxClicked(e, a, b)}
                    >
                        {grid[a][b].p}
                    </button>
                </div>
            );
        } else {
            var buttonOne = (
                <div>
                    <button
                        className="stlpec number"
                        style={{
                            backgroundColor: grid[a][b].c,
                            color: grid[a][b].d,
                            fontSize: grid[a][b].buttonGrid,
                        }}
                        onClick={(e) => boxClicked(e, a, b)}
                    >
                        {grid[a][b].p}
                    </button>
                </div>
            );
        }

        return buttonOne;
    };

    const makeButtonLine = (a) => {
        const arr = [];
        for (let i = 0; i < sizex; i++) {
            arr.push(makeButtonOne(a, i));
        }

        var x = (
            <div className="riadok" style={{ width: 70 * sizex }}>
                {/* {arr} */}
                {Array(sizex)
                    .fill()
                    .map((_, i) => makeButtonOne(a, i))}
            </div>
        );

        return x;
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

    return <div>{makeSquare()}</div>;
};

export default Board;
