import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import api from '../api'
import AuthContext from '../auth'
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_LISTS: "LOAD_LISTS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    UNMARK_LIST_FOR_DELETION: "UNMARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_EDIT_ACTIVE: "SET_EDIT_ACTIVE",
    RESET_STORE: "RESET_STORE",
    SET_VIEW_MODE: "SET_VIEW_MODE"
}

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        lists: [],
        currentList: null,
        newListCounter: 0,
        editActive: false,
        listMarkedForDeletion: null,
        mode: "home"
    });
    const history = useHistory();

    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    lists: store.lists,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: "home"
                })
            }
            // CREATE A NEW LIST AND LOAD IT IN
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    lists: store.lists,
                    currentList: payload,
                    newListCounter: store.newListCounter + 1,
                    editActive: true,
                    listMarkedForDeletion: null,
                    mode: "home"
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_LISTS: {
                return setStore({
                    lists: payload.lists,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: store.mode
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    lists: store.lists,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: payload,
                    mode: store.mode
                });
            }
            // STOP PREPARING TO DELETE A LIST
            case GlobalStoreActionType.UNMARK_LIST_FOR_DELETION: {
                return setStore({
                    lists: store.lists,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: store.mode
                });
            }
            // LOAD A LIST FOR EDITING
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    lists: store.lists,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    editActive: true,
                    listMarkedForDeletion: null,
                    mode: store.mode
                });
            }
            // RESET TO DEFAULTS
            case GlobalStoreActionType.RESET_STORE: {
                return setStore({
                    lists: [],
                    currentList: null,
                    newListCounter: 0,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: "home"
                });
            }
            // SET VIEW MODE
            case GlobalStoreActionType.SET_VIEW_MODE: {
                return setStore({
                    lists: [],
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: payload
                });
            }
            default:
                return store;
        }
    }

    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });

        history.push("/");
    }

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = async function () {
        let newListName = "Untitled" + store.newListCounter;
        let payload = {
            name: newListName,
            items: ["?", "?", "?", "?", "?"],
            ownerUsername: auth.user.username,
            published: false,
            publishDate: null,
            views: 0,
            ratings: new Map(),
            comments: []
        };
        const response = await api.createTop5List(payload);
        if (response.data.success) {
            let newList = response.data.top5List;
            storeReducer({
                type: GlobalStoreActionType.CREATE_NEW_LIST,
                payload: newList
            }
            );

            // IF IT'S A VALID LIST THEN LET'S START EDITING IT
            history.push("/top5list/" + newList._id);
        }
        else {
            console.log("API FAILED TO CREATE A NEW LIST");
        }
    }

    // THIS FUNCTION LOADS ALL THE LISTS SO WE CAN LIST ALL THE LISTS
    store.loadLists = async function () {
        const response = await api.getTop5Lists();
        if (response.data.success) {
            storeReducer({
                type: GlobalStoreActionType.LOAD_LISTS,
                payload: {
                    lists: response.data.data
                }
            });
        }
        else {
            console.log("API FAILED TO GET THE LISTS");
        }
    }

    // THE FOLLOWING 4 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = async function (id) {
        // GET THE LIST
        let response = await api.getTop5ListById(id);
        if (response.data.success && response.data.top5List.ownerUsername === auth.user.username) {
            let top5List = response.data.top5List;
            storeReducer({
                type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                payload: top5List
            });
        }
    }

    store.deleteList = async function (listToDelete) {
        let response = await api.deleteTop5ListById(listToDelete._id);
        if (response.data.success) {
            store.loadLists();
            history.push("/");
        }
    }

    store.deleteMarkedList = function () {
        store.deleteList(store.listMarkedForDeletion);
    }

    store.unmarkListForDeletion = function () {
        storeReducer({
            type: GlobalStoreActionType.UNMARK_LIST_FOR_DELETION,
            payload: null
        });
    }

    // THE FOLLOWING 4 FUNCTIONS ARE FOR COORDINATING THE LOADING AND UPDATING OF A LIST
    store.setCurrentList = async function (id) {
        let response = await api.getTop5ListById(id);
        if (response.data.success && response.data.top5List.ownerUsername === auth.user.username) {
            let top5List = response.data.top5List;

            response = await api.updateTop5ListById(top5List._id, top5List);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: top5List
                });
                history.push("/top5list/" + top5List._id);
            }
        }
    }

    store.updateItem = function (index, newItem) {
        store.currentList.items[index] = newItem;
    }

    store.updateName = function (newName) {
        store.currentList.name = newName;
    }

    store.saveCurrentList = async function () {
        const list = store.currentList;
        store.closeCurrentList();
        const response = await api.updateTop5ListById(list._id, list);
        if (response.data.success) {
            store.loadLists();
        }
    }

    store.publishCurrentList = async function () {
        const list = store.currentList;
        list.published = true;
        store.closeCurrentList();
        const response = await api.updateTop5ListById(list._id, list);
        if (response.data.success) {
            store.loadLists();
        }
    }

    store.viewList = async function (index) {
        let list = store.lists[index];
        list.views += 1;
        await api.updateTop5ListById(list._id, list);
    }

    // FUNCTION TO RESET STORE ON LOGOUT
    store.resetStore = function () {
        storeReducer({
            type: GlobalStoreActionType.RESET_STORE,
            payload: null
        });
    }

    // FUNCTION TO SET VIEW MODE
    store.setViewMode = function (mode) {
        storeReducer({
            type: GlobalStoreActionType.SET_VIEW_MODE,
            payload: mode
        });
    }

    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };