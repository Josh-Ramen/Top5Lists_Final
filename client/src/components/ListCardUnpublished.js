import { useContext, useState } from 'react'
import { GlobalStoreContext } from '../store'
import { Box, ListItem, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/*
    This is a card in our list of top 5 lists. It lets select
    a list for editing and it has controls for changing its 
    name or deleting it.
    
    @author McKilla Gorilla
*/
function ListCardUnpublished(props) {
    const { store } = useContext(GlobalStoreContext);
    const { list } = props;
    const [expanded, setExpanded] = useState(false);

    function handleLoadList(event, id) {
        event.stopPropagation();
        store.setCurrentList(id);
    }

    async function handleDeleteList(event, id) {
        event.stopPropagation();
        store.markListForDeletion(id);
    }

    function handleExpandList(event, id) {
        event.stopPropagation();
        setExpanded(!expanded);
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
                        <Grid item xs={11}>
                            <Grid container direction="column">
                                <Grid item><div id="list-name"><strong>{list.name}</strong></div></Grid>
                                <Grid item><div id="list-owner"><strong>By: {list.ownerUsername}</strong></div></Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton onClick={(event) => { handleDeleteList(event, list._id) }} aria-label='delete'>
                                <DeleteIcon style={{ fontSize: '28pt' }} />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
                {expanded &&
                    <Grid item>
                    <Grid container direction="row" justifyContent="flex-start" alignItems="center" wrap="nowrap">
                        <Grid item xs={6}>
                            <Box sx={{ bgcolor: '#2c2f70', borderColor: 'text.primary', border: 1, p: 2, borderRadius: '16px' }}>
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
                        <Grid item xs={11}>
                            <div id="list-edit" onClick={(event) => { handleLoadList(event, list._id) }}><strong>Edit</strong></div>
                        </Grid>
                        <Grid item xs={1}>
                            {!expanded && 
                            <IconButton onClick={(event) => { handleExpandList(event, list._id) }} aria-label='expand'>
                                <ExpandMoreIcon style={{ fontSize: '28pt' }} />
                            </IconButton>
                            }
                            {expanded &&
                            <IconButton onClick={(event) => { handleExpandList(event, list._id) }} aria-label='expand'>
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

export default ListCardUnpublished;