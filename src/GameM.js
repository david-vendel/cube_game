import React, { Component } from 'react';
import Intro from './components/Intro';
import Board from './components/Board';
import Bottom from './components/Bottom';
import Player from './components/Player';
import LoadingOverlay from 'react-loading-overlay';
import Button from '@material-ui/core/Button';

//intro is the first line, changing between instructions, win or lose statement.
const GameM = ({
    clickedCB,
    player1,
    player2,
    userID,
    gameID,
    moves,
    lost,
    newGame,
    cancelGame,
    notStarted,
    broadcast,
    resetBoard,
}) => {
    const multiplayer = true; // this is true for multiplayer mode

    React.useEffect(() => {
        console.log('GameM DID MOUNT');
    }, []);

    React.useEffect(() => {
        if (userID === player1.id) {
            console.log('you are player1');
            setYourColor('limegreen');
        }
        if (userID === player2.id) {
            console.log('you are player2');
            setYourColor('red');
        }
    }, [userID, player1, player2]);

    let diceHere = localStorage.getItem('dice');

    if (diceHere == 'number') {
        diceHere = 'number';
    } else {
        diceHere = 'dice';
    }

    const [green, setGreen] = React.useState(0);
    const sizex = 5;
    const sizey = 5;
    const [turn, setTurn] = React.useState(true);
    const [dice, setDice] = React.useState(diceHere);
    const [yourColor, setYourColor] = React.useState('undefined');

    const reset = () => {
        // setResetBoard(!resetBoard);
    };

    const changeDice = () => {
        if (dice == 'dice') {
            setDice('number');
            localStorage.setItem('dice', 'number');
        } else {
            setDice('dice');
            localStorage.setItem('dice', 'dice');
        }
    };

    return (
        <div className="App" style={{ width: 70 * sizex }}>
            {!notStarted && (
                <Intro
                    yourColor={yourColor}
                    green={green}
                    sizex={sizex}
                    sizey={sizey}
                    turn={turn}
                    lost={lost}
                    newGame={newGame}
                />
            )}

            {!notStarted && <Player number={1} object={player1} />}
            <LoadingOverlay
                active={lost || !(player1?.id && player2?.id)}
                spinner={!(notStarted || lost)}
                // text={'Waiting for an opponent...'}
                text={
                    Boolean(notStarted || lost) ? (
                        ''
                    ) : (
                        <div>
                            <div>Waiting for an opponent...</div>
                            <div>
                                <Button
                                    variant="contained"
                                    style={{ marginTop: 20 }}
                                    onClick={() => {
                                        cancelGame();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )
                }
            >
                <Board
                    sizex={sizex}
                    sizey={sizey}
                    clickedCB={clickedCB}
                    turn={turn}
                    setTurn={setTurn}
                    dice={dice ? dice : 'dice'}
                    resetBoard={resetBoard}
                    yourColor={yourColor}
                    moves={moves}
                    multiplayer={multiplayer}
                    broadcast={broadcast}
                    gameID={gameID}
                />
            </LoadingOverlay>
            {!notStarted && <Player number={2} object={player2} />}

            {!notStarted && (
                <Bottom
                    dice={dice}
                    changeDice={changeDice}
                    reset={reset}
                    turn={turn}
                    lost={lost}
                />
            )}
        </div>
    );
};

export default GameM;
