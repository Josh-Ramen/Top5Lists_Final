import ListCardUnpublished from "./ListCardUnpublished";
import ListCardPublished from "./ListCardPublished";

export default function ListCard(props) {
    const { list } = props;
    
    if (list.published)
        return <ListCardPublished list={list}/>
    else
        return <ListCardUnpublished list={list}/>
}