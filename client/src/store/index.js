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
        try {
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
                    lists.sort((a,b) => compareDates(b.publishDate, a.publishDate));
                } else if (store.sort === "publishOldest") {
                    lists.sort((a,b) => compareDates(a.publishDate, b.publishDate));
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
                let lists = [];
                storeReducer({
                    type: GlobalStoreActionType.LOAD_LISTS,
                    payload: {
                        lists: lists
                    }
                });
                return lists;
            }
        } catch (err) {
            // FAILSAFE FOR IF NO LISTS ARE FOUND
            let lists = [];
            storeReducer({
                type: GlobalStoreActionType.LOAD_LISTS,
                payload: {
                    lists: lists
                }
            });
            return lists;
        }
    }

    // THIS FUNCTION IS FOR WHEN YOU SEARCH FOR LISTS, AND IS BASED ON MODE
    store.searchLists = async function (query) {
        let newLists = await store.loadLists();

        // Now determine how to search and then filter our lists based on the mode
        if (store.mode === "home") {
            newLists = newLists.filter((list) => list.name.toLowerCase().indexOf(query.toLowerCase()) === 0);
        } else if (store.mode === "user") {
            newLists = newLists.filter((list) => list.ownerUsername.toLowerCase() === query.toLowerCase());
        } else if (store.mode === "all") {
            newLists = newLists.filter((list) => list.name.toLowerCase() === query.toLowerCase());
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
            sortedLists.sort((a,b) => compareDates(b.publishDate, a.publishDate));
        } else if (store.sort === "publishOldest") {
            sortedLists.sort((a,b) => compareDates(a.publishDate, b.publishDate));
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
            console.log("Success!");
            store.loadLists();
            history.push("/");
            store.decideCommunityList(listToDelete.name);
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
            store.loadLists().then(() => {
                store.decideCommunityList(list.name);
            });
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

    // THESE FUNCTIONS ARE GOING TO HANDLE COMMUNITY LISTS
    store.decideCommunityList = async function (name) {
        try {
            let response = await api.getCommunityLists();
            if (response.data.success) {
                // There may be a community list that we just have to update - figure it out
                let communityLists = response.data.data;
                communityLists = communityLists.filter((list) => list.name.toLowerCase() === name.toLowerCase());
                if (communityLists === undefined || communityLists === null || communityLists.length === 0) {
                    // The list doesn't already exist, so we're going to create a new one
                    store.createCommunityList(name);
                } else {
                    // There is already a list, so we're going to update it
                    let communityList = communityLists[0];
                    store.updateCommunityList(communityList);
                }
            } else {
                // There are no community lists at all, so obviously we have to make a new one
                store.createCommunityList(name);
            }
        } catch (err) {
            // There are no community lists at all, so obviously we have to make a new one
            store.createCommunityList(name);
        }
    }

    store.createCommunityList = async function (name) {
        // FIRST, generate the payload of items
        try {
            let response = await api.getTop5Lists();
            if (response.data.success) {
                // Filter down lists into all published lists whose names match the given one, case-insensitive
                let top5Lists = response.data.data
                top5Lists = top5Lists.filter((list) => list.name.toLowerCase() === name.toLowerCase() && list.published);

                // Generate points totals from these lists
                let newItems = []; // to be represented by an array of objects
                function indexOf (arr, q) {
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].item && typeof arr[i].item === 'string' && arr[i].item.toLowerCase() === q.toLowerCase()) {
                            return i;
                        }
                    }
                    return -1;
                };
                for (let i = 0; i < top5Lists.length; i++) { // For every list whose name matches
                    for (let j = 0; j < 5; j++) { // For every item in that list
                        // Figure out if that item is already in the array
                        const index = indexOf(newItems, top5Lists[i].items[j]);
                        if (index === -1) { // Item is not in the array
                            const newItem = {
                                item: top5Lists[i].items[j],
                                points: 5 - j
                            }
                            newItems.push(newItem);
                        } else { // Item is in the array
                            newItems[index].points += 5 - j;
                        }
                    }
                }

                // Lastly, sort items by points
                newItems.sort((a, b) => b.points - a.points);

                // Now we can create the list
                let payload = {
                    name: name,
                    items: newItems,
                    published: true,
                    publishDate: new Date(),
                    views: 0,
                    ratings: new Map(),
                    likes: 0,
                    dislikes: 0,
                    comments: []
                };
                const response2 = await api.createCommunityList(payload);
                if (!response2.data.success) {
                    console.log("API FAILED TO CREATE A COMMUNITY LIST");
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    store.updateCommunityList = async function (existingList) {
        // Literally going to repeat the same process as above with some minor changes
        // FIRST, generate the payload of items
        try {
            let response = await api.getTop5Lists();
            if (response.data.success) {
                // Filter down lists into all published lists whose names match the given one, case-insensitive
                let top5Lists = response.data.data
                top5Lists = top5Lists.filter((list) => list.name.toLowerCase() === existingList.name.toLowerCase() && list.published);

                // Generate points totals from these lists
                let newItems = []; // to be represented by an array of objects
                function indexOf (arr, q) {
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].item && typeof arr[i].item === 'string' && arr[i].item.toLowerCase() === q.toLowerCase()) {
                            return i;
                        }
                    }
                    return -1;
                };
                for (let i = 0; i < top5Lists.length; i++) { // For every list whose name matches
                    for (let j = 0; j < 5; j++) { // For every item in that list
                        // Figure out if that item is already in the array
                        const index = indexOf(newItems, top5Lists[i].items[j]);
                        if (index === -1) { // Item is not in the array
                            const newItem = {
                                item: top5Lists[i].items[j],
                                points: 5 - j
                            }
                            newItems.push(newItem);
                        } else { // Item is in the array
                            newItems[index].points += 5 - j;
                        }
                    }
                }

                if(newItems.length === 0) { // No lists of this category left
                    throw new Error("Deleting a community list");
                }

                // Lastly, sort items by points
                newItems.sort((a, b) => b.points - a.points);

                // Now we can modify the list
                existingList.items = newItems;
                const response2 = await api.updateCommunityListById(existingList._id, existingList);
                if (!response2.data.success) {
                    console.log("API FAILED TO UPDATE A COMMUNITY LIST");
                }
            }
        } catch (err) {
            console.log(err);
            // We've reached this point because there must be no lists left to draw from
            // Create a dummy array to update
            const response3 = await api.deleteCommunityListById(existingList._id);
            if (!response3.data.success) {
                console.log("API FAILED TO UPDATE A COMMUNITY LIST")
            }
        }
    }

    // FUNCTIONS TO DEAL WITH LOADING AND SEARCHING COMMUNITY LISTS
    store.loadCommunityLists = async function () {
        try {
            const response = await api.getCommunityLists();
            if (response.data.success) {
                // CONDITIONAL FILTERING BASED ON CURRENT MODE
                let lists = response.data.data;

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
                    lists.sort((a,b) => compareDates(b.publishDate, a.publishDate));
                } else if (store.sort === "publishOldest") {
                    lists.sort((a,b) => compareDates(a.publishDate, b.publishDate));
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
                let lists = [];
                storeReducer({
                    type: GlobalStoreActionType.LOAD_LISTS,
                    payload: {
                        lists: lists
                    }
                });
                return lists;
            }
        } catch (err) {
            // FAILSAFE FOR IF NO LISTS ARE FOUND
            let lists = [];
            storeReducer({
                type: GlobalStoreActionType.LOAD_LISTS,
                payload: {
                    lists: lists
                }
            });
            return lists;
        }
    }

    store.searchCommunityLists = async function (query) {
        let newLists = await store.loadCommunityLists();
        newLists = newLists.filter((list) => list.name.toLowerCase() === query.toLowerCase())

        storeReducer({
            type: GlobalStoreActionType.LOAD_LISTS,
            payload: {
                lists: newLists
            }
        });
    }

    // FUNCTIONS TO DEAL WITH LIKING AND DISLIKING LISTS
    store.likeCommunityList = async function (id, adding, switching) {
        let response = await api.getCommunityListById(id);
        if (response.data.success) {
            let communityList = response.data.communityList;
            if (adding) {
                communityList.likes += 1;
                communityList.ratings[auth.user.username] = 1;
            } else {
                communityList.likes -= 1;
                communityList.ratings[auth.user.username] = 0;
            }
            if (switching) {
                communityList.dislikes -= 1;
            }

            response = await api.updateCommunityListById(communityList._id, communityList);
        }
    }

    store.dislikeCommunityList = async function (id, adding, switching) {
        let response = await api.getCommunityListById(id);
        if (response.data.success) {
            let communityList = response.data.communityList;
            if (adding) {
                communityList.dislikes += 1;
                communityList.ratings[auth.user.username] = -1;
            } else {
                communityList.dislikes -= 1;
                communityList.ratings[auth.user.username] = 0;
            }
            if (switching) {
                communityList.likes -= 1;
            }

            response = await api.updateCommunityListById(communityList._id, communityList);
        }
    }

    // FUNCTIONS TO DEAL WITH COMMENTING AND VIEWING
    store.viewCommunityList = async function (index) {
        let list = store.lists[index];
        list.views += 1;
        await api.updateCommunityListById(list._id, list);
    }

    store.addCommunityComment = async function (comment, id) {
        let response = await api.getCommunityListById(id);
        if (response.data.success) {
            let communityList = response.data.communityList;
            communityList.comments.unshift(comment);

            response = await api.updateCommunityListById(communityList._id, communityList);
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