import React, { Component } from 'react';
import './App.css';
import Game from './Game';
import Pair from './components/Pair';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const PRODUCTION_MODE = process.env.NODE_ENV === 'production';

const WEBSOCKET_URL = PRODUCTION_MODE
    ? 'wss://davidvendel.com/ws/'
    : 'ws://localhost:8001';

console.log('WEBSOCKET_URL', WEBSOCKET_URL);

let client = new W3CWebSocket(WEBSOCKET_URL);
let timeout;
const CONSTANT = 1;

const useStyles = makeStyles((theme) => ({
    root: {
        '& > *': {
            margin: theme.spacing(1),
        },
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

const MultiPlayer = () => {
    const [mode, setMode] = React.useState(0);
    const [name, setName] = React.useState('Anonym');
    const [userID, setUserID] = React.useState('');
    const [waiting, setWaiting] = React.useState(false);
    const [playersCount, setPlayersCount] = React.useState('?');
    const [online, setOnline] = React.useState(false);
    const [player1, setPlayer1] = React.useState({ id: null, name: '?' });
    const [player2, setPlayer2] = React.useState({ id: null, name: '?' });

    const classes = useStyles();

    React.useEffect(() => {
        client.onopen = () => {
            console.log('WebSocket Client Connected');
            setOnline(true);
        };

        client.onmessage = (message) => {
            const dataFromServer = JSON.parse(message.data);

            if (dataFromServer.type !== 'pingpong') {
                console.log('Got msg from server! ', dataFromServer);
            }

            if (dataFromServer.type === 'message') {
                this.setState((state) => ({
                    messages: [
                        ...state.messages,
                        {
                            msg: dataFromServer.msg,
                            user: dataFromServer.user,
                        },
                    ],
                }));
            }

            if (dataFromServer.type === 'logIn') {
                console.log('loginIS is ', dataFromServer);
                if (dataFromServer?.status === 200) {
                    console.log('got 200');
                    setWaiting(dataFromServer.waiting);
                    setUserID(dataFromServer.userID);

                    if (!dataFromServer.waiting) {
                        console.log('You got an opponent!');
                        setPlayer1(dataFromServer.player1);
                        setPlayer2(dataFromServer.player2);
                        setMode(3);
                    }
                } else {
                    console.error("server didn't respond with 200 to login");
                }
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
    }, []);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const logMeIn = (value) => {
        setMode(2);
        console.log('log me in', value);

        client.send(
            JSON.stringify({
                type: 'logIn',
                userName: name,
            })
        );

        // this.setState({ isLoggedIn: true, userName: value, loading: true })
    };

    const closed = () => {
        setOnline(false);
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
                            backgroundColor: online ? 'green' : 'red',
                            margin: 8,
                        }}
                    ></div>
                    Number of players online: {playersCount}
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
                        onClick={() => setMode(0)}
                    >
                        Singleplayer
                    </button>
                    <button
                        style={{
                            cursor: 'pointer',
                            border:
                                mode === 1 || mode === 2
                                    ? '2px solid'
                                    : '1px solid',
                            borderRadius: 3,
                        }}
                        onClick={() => setMode(1)}
                    >
                        Multiplayer
                    </button>
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
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                logMeIn();
                            }}
                        >
                            Log me in!
                        </Button>
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
                        <div>waiting...</div>
                    </>
                )}
                {mode === 3 && (
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
        </div>
    );
};

export default MultiPlayer;
