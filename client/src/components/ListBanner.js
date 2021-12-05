import { useContext, useState } from 'react';
import GlobalStoreContext from '../store';
import AuthContext from '../auth';
import { Button, Grid, TextField, Menu, MenuItem, Typography, IconButton } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import FunctionsIcon from '@mui/icons-material/Functions';
import SortIcon from '@mui/icons-material/Sort';

/*
    This toolbar is a functional React component that
    manages the undo/redo/close buttons.
    
    @author McKilla Gorilla
*/
function ListBanner(props) {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const menuId = 'primary-search-account-menu';

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    function setViewMode(mode) {
        if (store.mode !== mode) {
            console.log("setting mode to " + mode);
            store.setViewMode(mode);
        }
    }

    let menu =
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem>Publish Date (Newest)</MenuItem>
            <MenuItem>Publish Date (Oldest)</MenuItem>
            <MenuItem>Views</MenuItem>
            <MenuItem>Likes</MenuItem>
            <MenuItem>Dislikes</MenuItem>
        </Menu>

    let banner =
        <div>
            {auth.loggedIn &&
                <Grid container justifyContent="flex-start" sx={{ p: 1 }}>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("home")} >
                            <HomeOutlinedIcon style={{ fontSize: '32pt', color: "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("all")} >
                            <GroupsOutlinedIcon style={{ fontSize: '32pt', color: "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("user")} >
                            <PersonOutlinedIcon style={{ fontSize: '32pt', color: "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("community")}>
                            <FunctionsIcon style={{ fontSize: '32pt', color: "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth varient="filled" label="Search" />
                    </Grid>
                    <Grid item xs={2}>
                        <Grid container justifyContent="center" alignItems="center">
                            <Grid item>
                                <Typography><strong>SORT BY</strong></Typography>
                            </Grid>
                            <Grid item>
                                <IconButton
                                    size="large"
                                    edge="end"
                                    aria-label="sorting"
                                    aria-controls={menuId}
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    <SortIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    {
                        menu
                    }
                </Grid>
            }
        </div>

    return (banner);
}

export default ListBanner;