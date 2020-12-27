import React, { Component } from 'react';
import Intro from './components/Intro';
import Board from './components/Board';
import Bottom from './components/Bottom';
import Player from './components/Player';

//intro is the first line, changing between instructions, win or lose statement.
const GameM = ({ clickedCB, player1, player2 }) => {
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
    const [resetBoard, setResetBoard] = React.useState(false);

    const reset = () => {
        setResetBoard(!resetBoard);
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
            <Intro green={green} sizex={sizex} sizey={sizey} turn={turn} />

            <Player number={1} object={player1} />

            <Board
                sizex={sizex}
                sizey={sizey}
                clickedCB={clickedCB}
                turn={turn}
                setTurn={setTurn}
                dice={dice ? dice : 'dice'}
                resetBoard={resetBoard}
            />

            <Player number={2} object={player2} />

            <Bottom dice={dice} changeDice={changeDice} reset={reset} />
        </div>
    );
};

export default GameM;
