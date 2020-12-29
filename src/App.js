import React, { Component } from 'react';
import './App.css';
import MultiPlayer from './MultiPlayer';
import { SnackbarProvider } from 'notistack';

const App = () => {
    return (
        <SnackbarProvider maxSnack={3}>
            <MultiPlayer />
        </SnackbarProvider>
    );
};

export default App;
