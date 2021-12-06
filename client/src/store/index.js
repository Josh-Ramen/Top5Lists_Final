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
    SET_VIEW_MODE: "SET_VIEW_MODE",
    SET_SORT: "SET_SORT"
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
        mode: "home",
        sort: "publishNewest"
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
                    mode: "home",
                    sort: store.sort
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
                    mode: "home",
                    sort: store.sort
                })
            }
            // GET THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_LISTS: {
                return setStore({
                    lists: payload.lists,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: store.mode,
                    sort: store.sort
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
                    mode: store.mode,
                    sort: store.sort
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
                    mode: store.mode,
                    sort: store.sort
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
                    mode: store.mode,
                    sort: store.sort
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
                    mode: "home",
                    sort: "publishNewest"
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
                    mode: payload,
                    sort: store.sort
                });
            }
            // SET SORT MODE
            case GlobalStoreActionType.SET_SORT: {
                return setStore({
                    lists: store.lists,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    editActive: false,
                    listMarkedForDeletion: null,
                    mode: store.mode,
                    sort: payload.sort
                })
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
            likes: 0,
            dislikes: 0,
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
            // CONDITIONAL FILTERING BASED ON CURRENT MODE
            let lists = response.data.data;

            if (store.mode === "home") {
                lists = lists.filter((list) => list.ownerUsername === auth.user.username);
            } else if (store.mode === "all" || store.mode === "user") {
                lists = lists.filter((list) => list.published);
            }

            // SORT BASED ON CURRENT SORTBY
            function compareDates(a, b) {
                if (!a && !b) {
                    return 0;
                } else if (!a) {
                    return 1;
                } else if (!b) {
                    return -1;
                }
                return a.localeCompare(b);
            }
            if (store.sort === "publishNewest") {
                lists.sort((a,b) => compareDates(a.publishDate, b.publishDate));
            } else if (store.sort === "publishOldest") {
                lists.sort((a,b) => compareDates(b.publishDate, a.publishDate));
            } else if (store.sort === "views") {
                lists.sort((a,b) => b.views - a.views);
            } else if (store.sort === "likes") {
                lists.sort((a,b) => b.likes - a.likes);
            } else if (store.sort === "dislikes") {
                lists.sort((a,b) => b.dislikes - a.dislikes);
            }

            storeReducer({
                type: GlobalStoreActionType.LOAD_LISTS,
                payload: {
                    lists: lists
                }
            });
            return lists;
        }
        else {
            console.log("API FAILED TO GET THE LISTS");
        }
    }

    // THIS FUNCTION IS FOR WHEN YOU SEARCH FOR LISTS, AND IS BASED ON MODE
    store.searchLists = async function (query) {
        let newLists = await store.loadLists();

        // Now determine how to search and then filter our lists based on the mode
        if (store.mode === "home" || store.mode === "all") {
            newLists = newLists.filter((list) => list.name.toLowerCase().indexOf(query.toLowerCase()) === 0);
        } else if (store.mode === "user") {
            newLists = newLists.filter((list) => list.ownerUsername.toLowerCase() === query.toLowerCase());
        } else if (store.mode === "community") {
            newLists = newLists.filter((list) => list.name.toLowerCase() === query.toLowerCase())
        }

        storeReducer({
            type: GlobalStoreActionType.LOAD_LISTS,
            payload: {
                lists: newLists
            }
        });
    }

    // SETS THE SORT METHOD
    store.setSort = async function (by) {
        storeReducer({
            type: GlobalStoreActionType.SET_SORT,
            payload: {
                sort: by
            }
        });
    }

    // THIS FUNCTION IS FOR SORTING CURRENTLY-DISPLAYED LISTS, BASED ON CURRENT SORTBY SETTING
    store.sortLists = function () {
        let sortedLists = store.lists;

        
        function compareDates(a, b) {
            if (!a && !b) {
                return 0;
            } else if (!a) {
                return 1;
            } else if (!b) {
                return -1;
            }
            return a.localeCompare(b);
        }
        
        if (store.sort === "publishNewest") {
            sortedLists.sort((a,b) => compareDates(a.publishDate, b.publishDate));
        } else if (store.sort === "publishOldest") {
            sortedLists.sort((a,b) => compareDates(b.publishDate, a.publishDate));
        } else if (store.sort === "views") {
            sortedLists.sort((a,b) => b.views - a.views);
        } else if (store.sort === "likes") {
            sortedLists.sort((a,b) => b.likes - a.likes);
        } else if (store.sort === "dislikes") {
            sortedLists.sort((a,b) => b.dislikes - a.dislikes);
        }

        storeReducer({
            type: GlobalStoreActionType.LOAD_LISTS,
            payload: {
                lists: sortedLists
            }
        });
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

    // THESE TWO FUNCTIONS ARE FOR SAVING OR PUBLISHING A LIST BEING EDITED
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

    // FUNCTION TO DEAL WITH EXPANDING (VIEWING) A LIST
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

    // FUNCTIONS TO DEAL WITH LIKING AND DISLIKING LISTS
    store.likeList = async function (id, adding, switching) {
        let response = await api.getTop5ListById(id);
        if (response.data.success) {
            let top5List = response.data.top5List;
            if (adding) {
                top5List.likes += 1;
                top5List.ratings[auth.user.username] = 1;
            } else {
                top5List.likes -= 1;
                top5List.ratings[auth.user.username] = 0;
            }
            if (switching) {
                top5List.dislikes -= 1;
            }

            response = await api.updateTop5ListById(top5List._id, top5List);
        }
    }

    store.dislikeList = async function (id, adding, switching) {
        let response = await api.getTop5ListById(id);
        if (response.data.success) {
            let top5List = response.data.top5List;
            if (adding) {
                top5List.dislikes += 1;
                top5List.ratings[auth.user.username] = -1;
            } else {
                top5List.dislikes -= 1;
                top5List.ratings[auth.user.username] = 0;
            }
            if (switching) {
                top5List.likes -= 1;
            }

            response = await api.updateTop5ListById(top5List._id, top5List);
        }
    }

    // DEALS WITH ADDING COMMENTS TO A LIST
    store.addComment = async function (comment, id) {
        let response = await api.getTop5ListById(id);
        if (response.data.success) {
            let top5List = response.data.top5List;
            top5List.comments.unshift(comment);

            response = await api.updateTop5ListById(top5List._id, top5List);
        }
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