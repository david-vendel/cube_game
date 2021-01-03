import React, { useRef, useState } from 'react';
import './App.css';
import Game from './Game';
import GameM from './GameM';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import Board from './components/Board';
import io from 'socket.io-client';
import { socket } from './service/socket';

let timeout;
const CONSTANT = 1;
const EMPTY_PLAYER = { id: null, name: '?', active: false };
const USERNAME = 'cube_game_username';

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

    const [userName, setUserName] = React.useState('');
    const [mode, setMode] = React.useState(0);
    const [userID, setUserID] = React.useState('');
    const [gameID, setGameID] = useAsyncReference('-');
    const [waiting, setWaiting] = React.useState(false);
    const [online, setOnline] = React.useState(false);
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

    const [playing, setPlaying] = useState(false);

    function usePrevious(value) {
        const ref = React.useRef();
        React.useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    const leaveMultiplayer = (prevMode) => {
        if (prevMode === 2) {
            console.log('You left multiplayer, so you resigned.');
            socket.send(
                JSON.stringify({
                    type: 'resign',
                    userID: userID,
                    gameID: gameID.current,
                })
            );
            restartGame();
        }
    };

    const setAsyncData = async () => {
        let userNameHere = await localStorage.getItem(USERNAME);
        console.log('userNameHere', userNameHere);
        if (userNameHere) {
            setUserName(userNameHere);
        } else {
            setUserName('Anonym ' + Math.ceil(Math.random() * 99));
        }
    };

    React.useEffect(() => {
        socket.on('echo', (message) => {
            enqueueSnackbar(message, {
                variant: 'success',
                autoHideDuration: 1300,
            });
            setOnline(true);
        });
        socket.on('connect', () => {
            setOnline(true);
            console.log('WebSocket Client Connected');
            enqueueSnackbar('Server online', {
                variant: 'success',
                autoHideDuration: 1300,
            });
        });

        socket.on('disconnect', (reason) => {
            setOnline(false);
            console.log('WebSocket Client disconnected', reason);
            enqueueSnackbar('Server offline' + reason, {
                variant: 'error',
                autoHideDuration: 1600,
            });
        });

        socket.on('clicked', (dataFromServer) => {
            console.log('clicked', dataFromServer);

            if (dataFromServer.gameID !== gameID.current) {
                console.error('this is wrong game');
                enqueueSnackbar('this is wrong game', {
                    variant: 'error',
                });
            }
            console.log(
                'opponent - ',
                dataFromServer.who,
                '  clicked',
                dataFromServer.x,
                dataFromServer.y
            );
            const newMoves = moves;
            newMoves.push({
                x: dataFromServer.x,
                y: dataFromServer.y,
                iteration: dataFromServer.iteration,
            });
            console.log('newMoves', newMoves);
            setMoves(newMoves);
            setRender((render) => render + 1);
        });

        setAsyncData();

        socket.emit('broadcast');

        return () => socket.disconnect();
    }, []);

    React.useEffect(
        () => {
            console.log('CDU ');

            socket.on('playersCount', (message) => {
                setPlayersCount(message.playersCount);
            });

            socket.on('logIn', (dataFromServer) => {
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
            });

            socket.on('broadcast', (dataFromServer) => {
                console.log(
                    'received broadcast',
                    dataFromServer?.gamesToSend?.length
                );
                setGamesToSend(dataFromServer.gamesToSend);
                setRender((render) => render + 1);
            });

            socket.on('message', (message) => {
                console.log('message', message);
                const dataFromServer = JSON.parse(message);
                if (dataFromServer.type !== 'playersCount') {
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

                // if (dataFromServer.type === 'broadcast') {
                //
                //     // setGrid(dataFromServer.grid);
                //     console.log(
                //         'received broadcast',
                //         dataFromServer?.gamesToSend?.length
                //     );
                //     setGamesToSend(dataFromServer.gamesToSend);
                //     setRender((render) => render + 1);
                // }

                // if (dataFromServer.type === 'leftGame') {
                //     console.log('leftGame', dataFromServer, player1, player2, mode);
                //     const who = dataFromServer.who;
                //     const what = dataFromServer.what;
                //     let who_name;
                //     let you_what;
                //     if (player1.id === who) {
                //         who_name = player1.name;
                //     }
                //     if (player2.id === who) {
                //         who_name = player2.name;
                //     }
                //     if (who === userID) {
                //         you_what = 'You lost!';
                //         who_name = 'You ';
                //     } else {
                //         you_what = 'You won!';
                //         who_name = 'Player ' + who_name;
                //     }
                //     console.log(who_name + ' ' + what + '. ' + you_what);
                //     enqueueSnackbar(who_name + ' ' + what + '. ' + you_what, {
                //         variant: 'info',
                //     });
                //     endGame(who_name);
                // }
            });
        },
        [
            /*player1, player2, gameID.current, mode*/
        ]
    );

    const handleNameChange = (e) => {
        setUserName(e.target.value);
    };

    const logMeIn = () => {
        setMode(2);
        console.log('log me in', userName);
        localStorage.setItem(USERNAME, userName);
        socket.emit('logIn', { userName: userName });

        // this.setState({ isLoggedIn: true, userName: value, loading: true })
    };

    const restartGame = () => {
        console.log('restartGame', mode);
        if (mode !== 0) {
            setLost(null);
            setTimeout(() => {
                setLost(null);
            }, 100);
            setMode(2);
            console.log('set gameID', null);

            // setGameID(null);
            setGameIDExernal('-');
            setPlayer1(EMPTY_PLAYER);
            setPlayer2(EMPTY_PLAYER);
            enqueueSnackbar('Game end', {
                variant: 'warning',
            });
            setMoves([]);
            setResetBoard((resetBoard) => resetBoard + 1);
        }
    };

    const endGame = (whoname) => {
        setLost(whoname);
    };

    const cancelGame = () => {
        socket.send(
            JSON.stringify({
                type: 'cancel',
                userID: userName,
                gameID: gameID.current,
            })
        );

        restartGame();
    };

    const closed = () => {
        console.warn('closed');
        // setMode(0);
        // setPlayer1(EMPTY_PLAYER);
        // setPlayer2(EMPTY_PLAYER);
        setPlayersCount('?');
        setOnline(false);
    };

    const clickedCB = (x, y, iteration) => {
        console.log('clickedCB', x, y);

        socket.emit('clicked', {
            x: x,
            y: y,
            userID: userID,
            gameID: gameID.current,
            iteration,
        });
    };

    const setGameIDExernal = (x) => {
        console.log('externally setting game ID', x);
        setGameID(x);
    };

    const broadcast = (x, y, gridStringified, iteration) => {
        console.log('broadcast', x, y, gameID.current);
        if (!gameID.current) {
            console.error('missing game ID');
        }

        socket.emit('broadcast', {
            gameID: gameID.current,
            grid: gridStringified,
            // iteration,
        });
    };

    // console.log('multiplayer render');
    return (
        <div style={{ paddingTop: 50 }}>
            <div
                style={{
                    maxWidth: 350,
                    margin: '0 auto',
                }}
            >
                <div
                    style={{ display: 'flex' }}
                    onClick={() => {
                        socket.emit('echo', 'Echoes successfully');
                    }}
                >
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: !online ? 'red' : 'green',
                            margin: 8,
                        }}
                    ></div>
                    {!online ? (
                        <div>Offline</div>
                    ) : (
                        <div>Number of players online: {playersCount}</div>
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
                            value={userName}
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
                            onClick={() => {
                                setMode(1);
                            }}
                        >
                            Playing as&nbsp;
                            <b>{userName}</b>&nbsp;({userID})&nbsp;{' '}
                            <span>[change]</span>{' '}
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
            {mode == 2 && (
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
                    key={resetBoard}
                />
            )}
            {/* {mode === 1 && (
                <GameM
                    userID={userID}
                    player1={player1}
                    player2={player2}
                    clickedCB={clickedCB}
                    notStarted={mode === 1}
                    newGame={restartGame}
                    cancelGame={cancelGame}
                />
            )} */}

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
