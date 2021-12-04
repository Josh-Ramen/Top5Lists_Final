import React, { useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import ListCard from './ListCard';
import ListBanner from './ListBanner'
import { Fab, Typography, Modal, Box, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import List from '@mui/material/List';
/*
    This React component lists all the top5 lists in the UI.
    
    @author McKilla Gorilla
*/

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

const HomeScreen = () => {
    const { store } = useContext(GlobalStoreContext);

    // THESE ARE FOR THE DELETE MODAL
    const [open, setOpen] = React.useState(false);
    const [listName, setListName] = React.useState("");
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        store.unmarkListForDeletion();
        setOpen(false);
    }
    const handleDelete = () => {
        store.deleteMarkedList();
        handleClose();
    }

    if (!open && store.listMarkedForDeletion) {
        setListName(store.listMarkedForDeletion.name);
        handleOpen();
    }

    useEffect(() => {
        store.loadLists();
    }, []);

    function handleCreateNewList() {
        store.createNewList();
    }
    let listCard = "";
    if (store) {
        listCard =
            <List sx={{ width: '90%', left: '5%' }}>
                {
                    store.lists.map((list) => (
                        <Box sx={{ bgcolor: '#fffff1', borderColor: 'text.primary', m: 1, border: 1, borderRadius: '16px' }}>
                            <ListCard
                                key={list._id}
                                list={list}
                                selected={false}
                            />
                        </Box>
                    ))
                }
            </List>;
    }
    return (
        <div id="top5-list-selector">
            <ListBanner />
            <div id="list-selector-list">
                {listCard}
            </div>
        </div>)
}

export default HomeScreen;