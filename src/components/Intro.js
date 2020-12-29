import React, { Component } from 'react';
import Button from '@material-ui/core/Button';

//intro is the first line, changing between instructions, win or lose statement.
const Intro = ({ yourColor, green, sizex, sizey, turn, lost, newGame }) => {
    console.log('yourColor', yourColor);
    console.log('lost', lost);

    // return (
    //     <div className="riadok intro">
    //         <span style={{ fontSize: 45, color: 'green' }}>YOU WON!</span>
    //         {versionSpan}
    //     </div>
    // );
    if (lost) {
        return (
            <div className="riadok intro">
                <div
                    style={{
                        fontSize: 22,
                        color: 'red',
                        textAlign: 'center',
                        marginBottom: 7,
                    }}
                >
                    {lost} LOST!
                </div>
                <div style={{ float: 'right' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={newGame}
                    >
                        New game
                    </Button>
                </div>
            </div>
        );
    } else {
        return (
            <div className="riadok intro">
                You are{' '}
                <span style={{ color: yourColor }}>
                    {yourColor.replace('lime', '')}
                </span>
                . Conquer <br />
                the whole area to win.
            </div>
        );
    }
};

export default Intro;
