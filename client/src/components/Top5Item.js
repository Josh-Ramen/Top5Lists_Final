import { React, useContext, useState } from "react";
import { GlobalStoreContext } from '../store'
import { TextField, Box, ListItem, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    let { index, text } = props;
    const [editActive, setEditActive] = useState(false);
    const [draggedTo, setDraggedTo] = useState(0);
    const [editedText, setEditedText] = useState(text);

    function toggleEdit() {
        let newActive = !editActive;
        if (newActive) {
            store.setIsItemEditActive();
        }
        setEditActive(newActive);
        setEditedText(text);
    }

    function handleDragStart(event, targetId) {
        event.dataTransfer.setData("item", targetId);
    }

    function handleDragOver(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragEnter(event) {
        event.preventDefault();
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event, targetId) {
        event.preventDefault();
        let sourceId = event.dataTransfer.getData("item");
        sourceId = parseInt(sourceId.substring(sourceId.indexOf("-") + 1));
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }

    function handleKeyPress(event) {
        if (event.code === "Enter") {
            let id = event.target.id.substring("list-".length);
            store.addUpdateItemTransaction(id - 1, editedText);
            setEditActive(false);
        }
    }
    function handleUpdateText(event) {
        setEditedText(event.target.value);
    }

    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }
    let allowDrag = "true";
    if (store.isItemEditActive) {
        allowDrag = "false"; 
    }

    let itemElement = 
        <ListItem
            id={'item-' + (index + 1)}
            key={props.key}
            className={itemClass}
            onDragStart={(event) => {
                handleDragStart(event, (index + 1))
            }}
            onDragOver={(event) => {
                handleDragOver(event, (index + 1))
            }}
            onDragEnter={(event) => {
                handleDragEnter(event, (index + 1))
            }}
            onDragLeave={(event) => {
                handleDragLeave(event, (index + 1))
            }}
            onDrop={(event) => {
                handleDrop(event, (index + 1))
            }}
            draggable={allowDrag}
            sx={{ display: 'flex', p: 1 }}
            style={{
                fontSize: '48pt',
                width: '100%'
            }}
        >
            <Box sx={{ p: 1 }}>
                <IconButton aria-label='edit' onClick={toggleEdit} >
                    <EditIcon style={{ fontSize: '48pt' }}/>
                </IconButton>
            </Box>
            <Box sx={{ p: 1, flexGrow: 1, fontSize: '32pt' }}>{text}</Box>
        </ListItem>;

    if (editActive) {
        itemElement = 
        <TextField
                margin="normal"
                required
                fullWidth
                id={'item-' + (index + 1)}
                key={props.key}
                className={itemClass}
                onKeyPress={handleKeyPress}
                onChange={handleUpdateText}
                defaultValue={text}
                inputProps={{style: {fontSize: 48}}}
                InputLabelProps={{style: {fontSize: 24}}}
                autoFocus
        />
    }

    return (
        itemElement
    )
}

export default Top5Item;