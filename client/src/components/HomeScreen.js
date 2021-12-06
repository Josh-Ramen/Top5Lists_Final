import React, { useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import ListCard from './ListCard';
import ListBanner from './ListBanner'
import { List, Box, Modal, Typography, Button } from '@mui/material'

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

    useEffect(() => {
        if (store.mode !== "community") {
            store.loadLists();
        } else {
            // TODO load community lists
        }
    }, [store.mode])

    let listCard = "";
    if (store) {
        listCard =
            <List sx={{ width: '90%', left: '5%' }}>
                {
                    store.lists.map((list, index) => (
                        <Box sx={{ bgcolor: list.published ? '#e8eaff' : '#fffff1', borderColor: 'text.primary', m: 1, border: 1, borderRadius: '16px' }}>
                            <ListCard
                                key={list._id}
                                index={index}
                                list={list}
                            />
                        </Box>
                    ))
                }
            </List>;
    }
    return (
        <div id="top5-list-selector">
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Really delete the {listName} Top 5 List?
                    </Typography>
                    <Button onClick={handleDelete}>
                        Yes
                    </Button>
                    <Button onClick={handleClose}>
                        No
                    </Button>
                </Box>
            </Modal>
            <ListBanner />
            <div id="list-selector-list">
                {listCard}
            </div>
        </div>)
}

export default HomeScreen;