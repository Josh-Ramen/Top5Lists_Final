import ListCardUnpublished from "./ListCardUnpublished";
import ListCardPublished from "./ListCardPublished";

export default function ListCard(props) {
    const { list, key, index } = props;
    
    if (list.published)
        return <ListCardPublished list={list} key={key} index={index}/>
    else
        return <ListCardUnpublished list={list} key={key} index={index}/>
}