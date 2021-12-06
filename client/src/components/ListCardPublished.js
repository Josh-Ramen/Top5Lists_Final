import { useContext, useState, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import AuthContext from '../auth'
import { Box, ListItem, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/*
    This is a card in our list of top 5 lists. It lets select
    a list for editing and it has controls for changing its 
    name or deleting it.
    
    @author McKilla Gorilla
*/
function ListCardPublished(props) {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext);
    const { list, index } = props;
    const [expanded, setExpanded] = useState(false);
    const [rating, setRating] = useState(0);
    const date = new Date(list.publishDate).toDateString();

    useEffect(() => { 
        // Rating decider:
        if (list.ratings[auth.user.username]) {
            setRating(list.ratings[auth.user.username]);
        } else {
            setRating(0);
        }
    }, []);

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        store.markListForDeletion(id);
    }

    function handleExpandList(event) {
        event.stopPropagation();
        setExpanded(!expanded);

        if (!expanded) {
            store.viewList(index);
        }
    }

    function handleLikeList(event, id) {
        event.stopPropagation();
        let adding = true;
        let switching = false;
        if (rating !== 1) {
            if (rating === -1) {
                list.dislikes -= 1;
                switching = true;
            }
            setRating(1);
            list.likes += 1;
        } else {
            setRating(0);
            list.likes -= 1;
            adding = false;
        }
        store.likeList(id, adding, switching);
    }

    function handleDislikeList(event, id) {
        event.stopPropagation();
        let adding = true;
        let switching = false;
        if (rating !== -1) {
            if (rating === 1) {
                list.likes -= 1;
                switching = true;
            }
            setRating(-1);
            list.dislikes += 1;
        } else {
            setRating(0);
            list.dislikes -= 1;
            adding = false;
        }
        store.dislikeList(id, adding, switching);
    }

    let listCard =
        <ListItem
            id={list._id}
            key={list._id}
            sx={{ marginTop: '15px', display: 'flex' }}
            style={{
                width: '100%'
            }} >
            <Grid container spacing={0} direction="column" wrap="nowrap">
                <Grid item>
                    <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start">
                        <Grid item xs={7}>
                            <Grid container direction="column">
                                <Grid item><div id="list-name"><strong>{list.name}</strong></div></Grid>
                                <Grid item><div id="list-owner"><strong>By: {list.ownerUsername}</strong></div></Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={2}>
                            <Grid container direction="row" alignItems="center">
                                <Grid item>
                                    <IconButton disabled={auth.guest} onClick={(event) => { handleLikeList(event, list._id) }} aria-label='delete'>
                                        {rating !== 1 && <ThumbUpOutlinedIcon style={{ fontSize: '28pt' }} />}
                                        {rating === 1 && <ThumbUpIcon style={{ fontSize: '28pt' }} />}
                                    </IconButton>
                                </Grid>
                                <Grid item><div id="list-likes"><strong>{list.likes}</strong></div></Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={2}>
                            <Grid container direction="row" alignItems="center">
                                <Grid item>
                                    <IconButton disabled={auth.guest} onClick={(event) => { handleDislikeList(event, list._id) }} aria-label='delete'>
                                        {rating !== -1 && <ThumbDownOutlinedIcon style={{ fontSize: '28pt' }} />}
                                        {rating === -1 && <ThumbDownIcon style={{ fontSize: '28pt' }} />}
                                    </IconButton>
                                </Grid>
                                <Grid item><div id="list-likes"><strong>{list.dislikes}</strong></div></Grid>
                            </Grid>
                        </Grid>
                        {store.mode === "home" &&
                        <Grid item xs={1}>
                            <IconButton onClick={(event) => { handleDeleteList(event, list._id) }} aria-label='delete'>
                                <DeleteIcon style={{ fontSize: '28pt' }} />
                            </IconButton>
                        </Grid>
                        }
                    </Grid>
                </Grid>
                {expanded &&
                    <Grid item>
                        <Grid container direction="row" justifyContent="flex-start" alignItems="center" wrap="nowrap">
                            <Grid item xs={6}>
                                <Box sx={{ bgcolor: '#1976d2', borderColor: 'text.primary', border: 1, p: 2, borderRadius: '16px' }}>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item><div id="expand-list-item"><strong>1: {list.items[0]}</strong></div></Grid>
                                        <Grid item><div id="expand-list-item"><strong>2: {list.items[1]}</strong></div></Grid>
                                        <Grid item><div id="expand-list-item"><strong>3: {list.items[2]}</strong></div></Grid>
                                        <Grid item><div id="expand-list-item"><strong>4: {list.items[3]}</strong></div></Grid>
                                        <Grid item><div id="expand-list-item"><strong>5: {list.items[4]}</strong></div></Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                }
                <Grid item>
                    <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                        <Grid item xs={7}>
                            <div id="list-published"><strong>Published: {date}</strong></div>
                        </Grid>
                        <Grid item xs={4}>
                            <div id="list-views"><strong>Views: {list.views}</strong></div>
                        </Grid>
                        <Grid item xs={1}>
                            {!expanded &&
                                <IconButton onClick={(event) => { handleExpandList(event) }} aria-label='expand'>
                                    <ExpandMoreIcon style={{ fontSize: '28pt' }} />
                                </IconButton>
                            }
                            {expanded &&
                                <IconButton onClick={(event) => { handleExpandList(event) }} aria-label='expand'>
                                    <ExpandLessIcon style={{ fontSize: '28pt' }} />
                                </IconButton>
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </ListItem>;

    return (listCard);
}

export default ListCardPublished;