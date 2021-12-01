import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import api from '../api'
import { Modal, Box, Button, Typography } from '@mui/material'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    LOG_IN: "LOG_IN",
    GET_LOGGED_IN: "GET_LOGGED_IN",
    REGISTER_USER: "REGISTER_USER",
    LOG_OUT: "LOG_OUT"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });
    const history = useHistory();

    // THESE ARE FOR THE ERROR MODAL
    const [error, setError] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.LOG_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true
                })
            }
            case AuthActionType.LOG_OUT: {
                return setAuth({
                    user: null,
                    loggedIn: false
                })
            }
            default:
                return auth;
        }
    }

    auth.loginUser = async function (loginData, store) {
        try {
            const response = await api.loginUser(loginData);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOG_IN,
                    payload: {
                        loggedIn: response.data.loggedIn,
                        user: response.data.user
                    }
                })
                history.push("/");
                store.loadIdNamePairs();
            }
        } catch (err) {
            setError(err.response.data.errorMessage);
            handleOpen();
        }
    }

    auth.getLoggedIn = async function () {
        const response = await api.getLoggedIn();
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.SET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });
        }
    }

    auth.registerUser = async function (userData, store) {
        try {
            const response = await api.registerUser(userData);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
                store.loadIdNamePairs();
            }
        } catch (err) {
            setError(err.response.data.errorMessage);
            handleOpen();
        }
    }

    auth.logoutUser = async function () {
        try {
            const response = await api.logoutUser();
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOG_OUT,
                    payload: {}
                })
                history.push("/");
            }
        } catch (err) {
            setError(err.response.data.errorMessage);
            handleOpen();
        }
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>{props.children}
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Sorry!
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                    <Button onClick={handleClose}>
                        OK
                    </Button>
                </Box>
            </Modal>
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };