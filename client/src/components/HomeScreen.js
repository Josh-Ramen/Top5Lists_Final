import React, { useContext, useEffect } from 'react'
import { GlobalStoreContext } from '../store'
import ListCard from './ListCard.js'
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
        store.loadIdNamePairs();
    }, []);

    function handleCreateNewList() {
        store.createNewList();
    }
    let listCard = "";
    if (store) {
        listCard =
            <List sx={{ width: '90%', left: '5%', bgcolor: 'background.paper' }}>
                {
                    store.idNamePairs.map((pair) => (
                        <ListCard
                            key={pair._id}
                            idNamePair={pair}
                            selected={false}
                        />
                    ))
                }
            </List>;
    }
    return (
        <div id="top5-list-selector">
            <div id="list-selector-heading">
                <Fab
                    color="primary"
                    aria-label="add"
                    id="add-list-button"
                    onClick={handleCreateNewList}
                >
                    <AddIcon />
                </Fab>
                <Typography variant="h2">Your Lists</Typography>
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
            </div>
            <div id="list-selector-list">
                {listCard}
            </div>
        </div>)
}

export default HomeScreen;