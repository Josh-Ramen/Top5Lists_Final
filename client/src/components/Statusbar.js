import { useContext } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth';
import { Typography, IconButton, Grid } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';

/*
    Our Status bar React component goes at the bottom of our UI.
    
    @author McKilla Gorilla
*/
function Statusbar() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);

    function handleCreateNewList() {
        store.createNewList();
    }

    return (
        <div id="top5-statusbar">
            {store.mode === "home" && auth.loggedIn &&
            <Grid container justifyContent="center" alignItems="center">
                <Grid item>
                    <IconButton disabled={store.editActive}>
                        <AddIcon onClick={handleCreateNewList} style={{ color: "black", opacity: store.editActive ? 0.25 : 1, fontSize: "36pt" }}/>
                    </IconButton>
                </Grid>
                <Grid item><Typography variant="h4">Your Lists</Typography></Grid>
            </Grid>
            }
        </div>
    );
}

export default Statusbar;