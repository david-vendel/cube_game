import React, { Component } from 'react';

//intro is the first line, changing between instructions, win or lose statement.
const Intro = (green, sizex, sizey, turn) => {
    const versionSpan = <span className="version">Multi</span>;

    if (green == sizex * sizey) {
        return (
            <div className="riadok intro">
                <span style={{ fontSize: 45, color: 'green' }}>YOU WON!</span>
                {versionSpan}
            </div>
        );
    } else {
        if (green == 0) {
            return (
                <div className="riadok intro">
                    <span style={{ fontSize: 45, color: 'red' }}>
                        YOU LOST!
                    </span>
                    {versionSpan}
                </div>
            );
        } else {
            if (turn) {
                return (
                    <div className="riadok intro">
                        You are <span style={{ color: 'green' }}>green</span>.
                        Conquer <br />
                        the whole area to win.{versionSpan}
                    </div>
                );
            } else {
                return (
                    <div className="riadok intro">
                        You are <span style={{ color: 'darkred' }}>green</span>.
                        Conquer <br />
                        the whole area to win.{versionSpan}
                    </div>
                );
            }
        }
    }

    return null;
};

export default Intro;
