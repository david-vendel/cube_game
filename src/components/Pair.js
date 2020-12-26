import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

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

const Pair = () => {
    const classes = useStyles();

    const find = () => {};

    return (
        <div style={{ width: 350, margin: '10px auto' }}>
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    find();
                }}
            >
                Find opponent!
            </Button>
        </div>
    );
};

export default Pair;
