import React, { Component } from 'react';

const Bottom = ({ changeDice, reset, dice, turn, lost }) => {
    return (
        <div className="resetContainer">
            {/* Resets the whole game by simply reloading the page */}
            {/* <div className="reset" onClick={reset}>
                RESET
            </div> */}
            {/* Chages graphics, between numberic or dice looking numbers */}
            {!lost && <div>{turn ? 'Your turn' : "Opponent's turn"}</div>}
            <div
                className={dice + '5'}
                title="Switch graphics"
                onClick={changeDice}
            >
                5
            </div>
        </div>
    );
};

export default Bottom;
