import { useContext, useState, useEffect } from 'react'
import { Button, Grid, TextField, Typography, Box } from '@mui/material';
import { GlobalStoreContext } from '../store/index.js'
/*
    This React component lets us edit a loaded list, which only
    happens when we are on the proper route.
    
    @author McKilla Gorilla
*/
function WorkspaceScreen() {
    const { store } = useContext(GlobalStoreContext);
    const [canPublish, setCanPublish] = useState(false);

    useEffect(() => {
        checkCanPublish();
      });

    async function saveList() {
        store.saveCurrentList();
    }

    function handleChange(event, id) {
        if (id === 0) {
            store.updateName(event.target.value);
        } else {
            store.updateItem(id - 1, event.target.value);
        }
        checkCanPublish();
    }

    function startsAlphanumeric(str) {
        let code = str.charCodeAt(0);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
        return true;
    };

    function noDuplicates(array) {
        return (new Set(array)).size === array.length;
    }

    function checkCanPublish() {
        // CONDITION 1: List name and entries must start with an alphanumeric character.
        let cond1 = (startsAlphanumeric(store.currentList.name) && startsAlphanumeric(store.currentList.items[0]) && startsAlphanumeric(store.currentList.items[1]) && startsAlphanumeric(store.currentList.items[2]) && startsAlphanumeric(store.currentList.items[3]) && startsAlphanumeric(store.currentList.items[4]));
        
        // CONDITION 2: No duplicate list entries.
        let cond2 = noDuplicates(store.currentList.items);

        // CONDITION 3: No lists of the same name. (Assumption: store.lists only contains current user's lists right now)
        let cond3 = true;
        store.lists.forEach(list => {
            if (list.name.toLowerCase() === store.currentList.name && list._id !== store.currentList._id) {
                cond3 = false;
            }
        });

        setCanPublish(cond1 && cond2 && cond3);
    }

    return (
        <div id="top5-workspace">
            <Grid container direction="column" wrap="nowrap" justifyContent="space-evenly" sx={{ p: 2 }}>
                <Grid item>
                    <Box sx={{ bgcolor: '#ffffff', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '8px', width: "50%" }}>
                        <TextField defaultValue={store.currentList.name} fullWidth variant="standard" onChange={(event) => { handleChange(event, 0) }}></TextField>
                    </Box>
                </Grid>
                <Grid item>
                    <Box sx={{ bgcolor: '#2c2f70', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '8px' }}>
                        <Grid container direction="row" spacing={0} alignItems="center">
                            <Grid item>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                    <Typography variant="h5"><strong>1.</strong></Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={11}>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px', height: "100%" }}>
                                    <TextField defaultValue={store.currentList.items[0]} fullWidth variant="standard" onChange={(event) => { handleChange(event, 1) }}></TextField>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid container direction="row" spacing={0} alignItems="center">
                            <Grid item>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                    <Typography variant="h5"><strong>2.</strong></Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={11}>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px', height: "100%" }}>
                                    <TextField defaultValue={store.currentList.items[1]} fullWidth variant="standard" onChange={(event) => { handleChange(event, 2) }}></TextField>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid container direction="row" spacing={0} alignItems="center">
                            <Grid item>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                    <Typography variant="h5"><strong>3.</strong></Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={11}>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px', height: "100%" }}>
                                    <TextField defaultValue={store.currentList.items[2]} fullWidth variant="standard" onChange={(event) => { handleChange(event, 3) }}></TextField>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid container direction="row" spacing={0} alignItems="center">
                            <Grid item>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                    <Typography variant="h5"><strong>4.</strong></Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={11}>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px', height: "100%" }}>
                                    <TextField defaultValue={store.currentList.items[3]} fullWidth variant="standard" onChange={(event) => { handleChange(event, 4) }}></TextField>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid container direction="row" spacing={0} alignItems="center">
                            <Grid item>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                    <Typography variant="h5"><strong>5.</strong></Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={11}>
                                <Box sx={{ bgcolor: '#d4af37', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px', height: "100%" }}>
                                    <TextField defaultValue={store.currentList.items[4]} fullWidth variant="standard" onChange={(event) => { handleChange(event, 5) }}></TextField>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item>
                    <Grid container direction="row" spacing={2} justifyContent="flex-end">
                        <Grid item>
                            <Box sx={{ bgcolor: '#dddddd', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                <Button sx={{ color: 'black' }} onClick={saveList}><strong>Save</strong></Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box sx={{ bgcolor: '#dddddd', borderColor: 'text.primary', m: 1, p: 1, border: 1, borderRadius: '4px' }}>
                                <Button disabled={!canPublish} sx={{ color: 'black' }}><strong>Publish</strong></Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}

export default WorkspaceScreen;