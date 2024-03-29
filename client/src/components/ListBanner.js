import { useContext, useState, useEffect } from 'react';
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
            store.setViewMode(mode);
        }
    }

    function search(event) {
        if (event.keyCode === 13) {
            // Two cases, one for community lists and one for all the rest
            if (store.mode === "community") {
                if (event.target.value === "") {
                    store.loadCommunityLists();
                } else {
                    store.searchCommunityLists(event.target.value);
                }
            } else {
                if (event.target.value === "") {
                    store.loadLists();
                } else {
                    store.searchLists(event.target.value);
                }
            }
            event.target.value = "";
        }
    }

    function sort(by) {
        store.setSort(by);
        handleMenuClose();
    }

    useEffect(() => {
        store.sortLists();
    }, [store.sort]);

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
            <MenuItem onClick={() => sort("publishNewest")}>Publish Date (Newest)</MenuItem>
            <MenuItem onClick={() => sort("publishOldest")}>Publish Date (Oldest)</MenuItem>
            <MenuItem onClick={() => sort("views")}>Views</MenuItem>
            <MenuItem onClick={() => sort("likes")}>Likes</MenuItem>
            <MenuItem onClick={() => sort("dislikes")}>Dislikes</MenuItem>
        </Menu>

    let banner =
        <div>
            {auth.loggedIn &&
                <Grid container justifyContent="flex-start" sx={{ p: 1 }}>
                    <Grid item xs={1}>
                        <Button disabled={auth.guest} onClick={() => setViewMode("home")} >
                            <HomeOutlinedIcon style={{ fontSize: '32pt', color: store.mode === "home" ? "#1976d2" : "black", opacity: auth.guest ? 0.25 : 1 }} />
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("all")} >
                            <GroupsOutlinedIcon style={{ fontSize: '32pt', color: store.mode === "all" ? "#1976d2" : "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("user")} >
                            <PersonOutlinedIcon style={{ fontSize: '32pt', color: store.mode === "user" ? "#1976d2" : "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={() => setViewMode("community")}>
                            <FunctionsIcon style={{ fontSize: '32pt', color: store.mode === "community" ? "#1976d2" : "black" }} />
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField fullWidth varient="filled" label="Search" onKeyDown={search} />
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