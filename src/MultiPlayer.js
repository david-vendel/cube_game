import React, { useRef, useState } from 'react';
import './App.css';
import Game from './Game';
import GameM from './GameM';
import Pair from './components/Pair';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import Snackbar from '@material-ui/core/Snackbar';
import { useSnackbar } from 'notistack';
import Board from './components/Board';

const PRODUCTION_MODE = process.env.NODE_ENV === 'production';

const WEBSOCKET_URL = PRODUCTION_MODE
    ? 'wss://davidvendel.com/ws/'
    : 'ws://localhost:8001';

console.log('WEBSOCKET_URL', WEBSOCKET_URL);

let client = new W3CWebSocket(WEBSOCKET_URL);
let timeout;
const CONSTANT = 1;
const EMPTY_PLAYER = { id: null, name: '?', active: false };

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
        display: 'flex',
        flexDirection: 'column',
    },
    textField: {
        width: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingBottom: 0,
        marginTop: 20,
        fontWeight: 500,
    },
    input: {
        color: '#3F51B5',
    },
}));

function useAsyncReference(value) {
    const ref = useRef(value);
    const [, forceRender] = useState(false);

    function updateState(newState) {
        ref.current = newState;
        forceRender((s) => !s);
    }

    return [ref, updateState];
}

const MultiPlayer = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [mode, setMode] = React.useState(0);
    const [name, setName] = React.useState(
        'Anonym ' + Math.ceil(Math.random() * 99)
    );
    const [userID, setUserID] = React.useState('');
    const [gameID, setGameID] = useAsyncReference('-');
    const [waiting, setWaiting] = React.useState(false);
    const [playersCount, setPlayersCount] = React.useState('?');
    const [player1, setPlayer1] = React.useState(EMPTY_PLAYER);
    const [player2, setPlayer2] = React.useState(EMPTY_PLAYER);
    const prevMode = usePrevious(mode);
    const prevPlayersCount = usePrevious(playersCount);
    const [moves, setMoves] = React.useState([]);
    const [render, setRender] = React.useState(0);
    const [lost, setLost] = React.useState(null);
    const [grid, setGrid] = React.useState('-');
    const [gamesToSend, setGamesToSend] = React.useState('[]');

    const [resetBoard, setResetBoard] = React.useState(1);

    const classes = useStyles();

    function usePrevious(value) {
        const ref = React.useRef();
        React.useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    // React.useEffect(() => {
    //     // console.log('mode changed', mode, prevMode);
    //     if (mode !== prevMode && prevMode === 2) {
    //         console.log('You left multiplayer, so you resigned.');
    //         client.send(
    //             JSON.stringify({
    //                 type: 'resign',
    //                 userID: userID,
    //                 gameID: gameID,
    //             })
    //         );
    //     }
    // }, [mode]);

    const leaveMultiplayer = (prevMode) => {
        if (prevMode === 2) {
            console.log('You left multiplayer, so you resigned.');
            client.send(
                JSON.stringify({
                    type: 'resign',
                    userID: userID,
                    gameID: gameID.current,
                })
            );
            restartGame();
        }
    };

    React.useEffect(() => {
        console.log('prevPlayersCount changed', prevPlayersCount, playersCount);
        if (playersCount === '?' && prevPlayersCount > 0) {
            console.warn('Server offline');
            enqueueSnackbar('Server offline!', {
                variant: 'error',
            });
        }
    }, [playersCount]);

    React.useEffect(() => {
        client.onopen = () => {
            console.log('WebSocket Client Connected');
            enqueueSnackbar('Server online', {
                variant: 'success',
                autoHideDuration: 1300,
            });

            setTimeout(() => {
                client.send(
                    JSON.stringify({
                        type: 'broadcast',
                    })
                );
            }, 250);
        };

        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);

            if (dataFromServer.type !== 'pingpong') {
                console.log('Got msg from server! ', dataFromServer);
            }

            // if (dataFromServer.type === 'message') {
            //     this.setState((state) => ({
            //         messages: [
            //             ...state.messages,
            //             {
            //                 msg: dataFromServer.msg,
            //                 user: dataFromServer.user,
            //             },
            //         ],
            //     }));
            // }

            if (dataFromServer.type === 'clicked') {
                if (dataFromServer.gameID !== gameID.current) {
                    console.error('this is wrong game');
                    enqueueSnackbar('this is wrong game', {
                        variant: 'error',
                    });
                }

                console.log(
                    'opponent clicked',
                    dataFromServer.x,
                    dataFromServer.y
                );
                const newMoves = moves;
                newMoves.push({ x: dataFromServer.x, y: dataFromServer.y });
                console.log('newMoves', newMoves);
                setMoves(newMoves);
                setRender((render) => render + 1);
            }

            if (dataFromServer.type === 'broadcast') {
                // console.log(
                //     'gamesToSend',
                //     dataFromServer.gameID,
                //     dataFromServer.gamesToSend
                // );
                // setGrid(dataFromServer.grid);
                console.log(
                    'received broadcast',
                    dataFromServer?.gamesToSend?.length
                );
                setGamesToSend(dataFromServer.gamesToSend);
                setRender((render) => render + 1);
            }

            if (dataFromServer.type === 'logIn') {
                console.log('loginIS is ', dataFromServer);
                if (dataFromServer?.status === 200) {
                    console.log('got 200');
                    setWaiting(dataFromServer.waiting);
                    setUserID(dataFromServer.userID);

                    if (!dataFromServer.waiting) {
                        console.log('You got an opponent!');
                        enqueueSnackbar('You got an opponent!', {
                            variant: 'success',
                        });
                        // console.log('set gameID', dataFromServer.gameID);
                        //     setGameIDExernal(dataFromServer.gameID)
                        // setGameID(dataFromServer.gameID);
                        setPlayer1({
                            id: dataFromServer.player1.id,
                            name: dataFromServer.player1.name,
                            active: dataFromServer.player1.active,
                        });
                        setPlayer2({
                            id: dataFromServer.player2.id,
                            name: dataFromServer.player2.name,
                            active: dataFromServer.player2.active,
                        });
                    } else {
                        console.log('Waiting for opponent');
                        enqueueSnackbar('Waiting for opponent', {
                            variant: 'info',
                            autoHideDuration: 2000,
                        });
                        setPlayer1({
                            id: dataFromServer.player1.id,
                            name: dataFromServer.player1.name,
                            active: dataFromServer.player1.active,
                        });
                    }

                    console.log('set gameID', dataFromServer.gameID);
                    setGameIDExernal(dataFromServer.gameID);
                } else {
                    console.error("server didn't respond with 200 to login");
                }
            }

            if (dataFromServer.type === 'leftGame') {
                console.log('leftGame', dataFromServer, player1, player2, mode);

                const who = dataFromServer.who;
                const what = dataFromServer.what;
                let who_name;
                let you_what;

                if (player1.id === who) {
                    who_name = player1.name;
                }
                if (player2.id === who) {
                    who_name = player2.name;
                }
                if (who === userID) {
                    you_what = 'You lost!';
                    who_name = 'You ';
                } else {
                    you_what = 'You won!';
                    who_name = 'Player ' + who_name;
                }
                console.log(who_name + ' ' + what + '. ' + you_what);
                enqueueSnackbar(who_name + ' ' + what + '. ' + you_what, {
                    variant: 'info',
                });

                endGame(who_name);
            }

            if (dataFromServer.type === 'pingpong') {
                // console.log('playersCount is ', dataFromServer);
                setPlayersCount(dataFromServer.playersCount);

                client.send(
                    JSON.stringify({
                        type: 'pingpong',
                        pong: true,
                        userID: dataFromServer.userID,
                    })
                );

                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    console.log("server didn't reply!");
                    closed();
                }, 1000 * CONSTANT + 2200);
            }
        };

        client.onclose = () => {
            console.log('closed');
            closed();
        };
    }, [player1, player2, gameID.current, mode]);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const logMeIn = () => {
        setMode(2);
        console.log('log me in');

        client.send(
            JSON.stringify({
                type: 'logIn',
                userID: name,
            })
        );

        // this.setState({ isLoggedIn: true, userName: value, loading: true })
    };

    const restartGame = () => {
        console.log('restartGame', mode);
        if (mode !== 0) {
            setLost(null);
            setTimeout(() => {
                setLost(null);
            }, 100);
            setMode(1);
            console.log('set gameID', null);

            // setGameID(null);
            setGameIDExernal('-');
            setPlayer1(EMPTY_PLAYER);
            setPlayer2(EMPTY_PLAYER);
            enqueueSnackbar('Game end', {
                variant: 'warning',
            });
            setResetBoard((resetBoard) => resetBoard + 1);
        }
    };

    const endGame = (whoname) => {
        setLost(whoname);
    };

    const cancelGame = () => {
        client.send(
            JSON.stringify({
                type: 'cancel',
                userID: name,
                gameID: gameID.current,
            })
        );

        restartGame();
    };

    const closed = () => {
        console.warn('closed');
        setMode(0);
        setPlayer1(EMPTY_PLAYER);
        setPlayer2(EMPTY_PLAYER);
        setPlayersCount('?');
        setInterval(() => {
            reconnect();
        }, 5000 * CONSTANT);
    };

    const reconnect = () => {
        console.log('reconnect');
        // client = new W3CWebSocket('ws://127.0.0.1:8000');
        // client.send(
        //     JSON.stringify({
        //         type: 'pingpong',
        //         pong: true,
        //         userID: userID,
        //     })
        // );
    };

    const clickedCB = (x, y) => {
        console.log('clickedCB', x, y);

        client.send(
            JSON.stringify({
                type: 'clicked',
                x: x,
                y: y,
                userID: userID,
                gameID: gameID.current,
            })
        );
    };

    const setGameIDExernal = (x) => {
        console.log('externally setting game ID', x);
        setGameID(x);
    };

    console.log('gameID mp', gameID);

    const test = () => {
        console.log('gameID test', gameID.current);
    };

    const broadcast = (x, y, gridStringified) => {
        console.log('broadcast', x, y, gameID.current);
        test();
        if (!gameID.current) {
            console.error('missing game ID');
        }

        client.send(
            JSON.stringify({
                type: 'broadcast',
                gameID: gameID.current,
                grid: gridStringified,
            })
        );
    };

    console.log('multiplayer render');
    return (
        <div style={{ paddingTop: 50 }}>
            <div
                style={{
                    maxWidth: 350,
                    margin: '0 auto',
                }}
            >
                <div style={{ display: 'flex' }}>
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor:
                                playersCount === '?' ? 'red' : 'green',
                            margin: 8,
                        }}
                    ></div>
                    {playersCount === '?' ? (
                        <span>Offline</span>
                    ) : (
                        <span>Number of players online: {playersCount}</span>
                    )}
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-evenly',
                    }}
                >
                    <button
                        style={{
                            cursor: 'pointer',
                            border: mode === 0 ? '2px solid' : '1px solid',
                            borderRadius: 3,
                        }}
                        onClick={() => {
                            const prevMode = mode;
                            setMode(0);
                            leaveMultiplayer(prevMode);
                        }}
                    >
                        Singleplayer
                    </button>
                    {playersCount !== '?' ? (
                        <button
                            style={{
                                cursor: 'pointer',
                                border:
                                    mode === 1 || mode === 2
                                        ? '2px solid'
                                        : '1px solid',
                                borderRadius: 3,
                            }}
                            onClick={() => {
                                leaveMultiplayer(mode);
                                setMode(1);
                            }}
                        >
                            Multiplayer
                        </button>
                    ) : (
                        <button
                            style={{
                                cursor: 'pointer',
                                border: '1px solid',
                                borderRadius: 3,
                            }}
                            onClick={() => window.location.reload()}
                        >
                            Refresh
                        </button>
                    )}
                </div>
                {mode === 1 && (
                    <div className={classes.root}>
                        <TextField
                            id="outlined-basic"
                            label="Your name"
                            variant="outlined"
                            className={classes.textField}
                            InputProps={{
                                className: classes.input,
                            }}
                            value={name}
                            onChange={handleNameChange}
                        />
                        <div
                            style={{
                                width: '90%',
                                margin: 0,
                                display: 'flex',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => {
                                    logMeIn();
                                }}
                            >
                                Find opponent!
                            </Button>
                        </div>
                    </div>
                )}
                {mode === 2 && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: 10,
                            }}
                        >
                            Playing as&nbsp;
                            <b>
                                {name} {userID}
                            </b>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: 10,
                            }}
                        >
                            game:&nbsp;
                            <b>{gameID.current}</b>
                        </div>
                    </>
                )}
                {mode === 2 && (
                    <>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginTop: 10,
                            }}
                        >
                            {player1.name} vs {player2.name}
                        </div>
                    </>
                )}
            </div>

            {mode === 0 && <Game />}
            {mode > 0 && (
                <GameM
                    userID={userID}
                    player1={player1}
                    player2={player2}
                    clickedCB={clickedCB}
                    moves={moves}
                    lost={lost}
                    notStarted={mode === 1}
                    newGame={restartGame}
                    cancelGame={cancelGame}
                    broadcast={broadcast}
                    gameID={gameID.current}
                    resetBoard={resetBoard}
                />
            )}

            <div style={{ display: 'flex', marginTop: 30, marginLeft: 20 }}>
                Broadcast:
            </div>
            <div
                style={{
                    marginLeft: 10,
                    marginTop: 1,
                    marginBottom: 10,
                    display: 'flex',
                    flexFlow: 'row wrap',
                }}
            >
                {gamesToSend &&
                    JSON.parse(gamesToSend).map((game) => {
                        console.log(
                            'multiplayer mapping games',
                            game.gameID,
                            game.grid?.length
                        );
                        return (
                            <div key={game.gameID} style={{ margin: 10 }}>
                                <div>game&nbsp;{game.gameID}</div>

                                <Board
                                    sizex={5}
                                    sizey={5}
                                    dice={'dice'}
                                    moves={[]}
                                    forcedGrid={game.grid}
                                />
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

export default MultiPlayer;
