import ListCardUnpublished from "./ListCardUnpublished";
import ListCardPublished from "./ListCardPublished";
import ListCardCommunity from "./ListCardCommunity";

export default function ListCard(props) {
    const { list, key, index } = props;
    
    if (list.published) {
        if (!list.ownerUsername) {
            return <ListCardCommunity list={list} key={key} index={index}/>
        } else {
            return <ListCardPublished list={list} key={key} index={index}/>
        }
    }
    else {
        return <ListCardUnpublished list={list} key={key} index={index}/>
    }
}