import React, { Component } from 'react';

const Player = ({ number, object }) => {
    console.log('Player', object);
    return (
        <div className="player">
            <div style={{ float: number === 1 ? 'left' : 'right' }}>
                {object?.name
                    ? object.name === '?'
                        ? 'Waiting for an opponent...'
                        : object.name
                    : '<EMPTY>'}
            </div>
        </div>
    );
};

export default Player;
