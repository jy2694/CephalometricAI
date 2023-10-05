import { Container, ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate, faCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

export default (props) => {

    const [hover, setHover] = useState(-1)

    const tooltip = (
        <Tooltip id="tooltip">
          Artificial intelligence is processing. If the processing time is longer than 10 minutes, the photo cannot be processed and needs to be removed.
        </Tooltip>
      );
    

    const listRenderer = () => {
        const result = [];
        for(let i = 0; i < props.data.length; i ++){
            const data = props.data[i];
            let element = <ListGroup.Item 
            key={i}
            onClick={()=>props.setImage(i)}
            onMouseEnter={()=>setHover(i)}
            onMouseLeave={()=>setHover(-1)}
            variant={props.selected == i ? "primary" : (hover == i ? "secondary" : "none")}
        >
            {data["originName"]}
            {data["status"] === "PROCESSING" && <FontAwesomeIcon className="ms-1" spin icon={faArrowsRotate} />}
            {data["status"] === "COMPLETED" && <FontAwesomeIcon className="ms-1" icon={faCheck} style={{color: "#00f900",}} />}
        </ListGroup.Item>;
            if(data["status"] === "PROCESSING"){
                result.push(<OverlayTrigger placement="right" overlay={tooltip}>
                    {element}
                </OverlayTrigger>)
            } else{
                result.push(element);
            }
        }
        return result;
    }

    return <>
        <Container className="bg-secondary rounded d-block w-25 h-100" style={{overflow:"auto"}}>
            <ListGroup className="mt-2 mb-2">
                {listRenderer()}
            </ListGroup>
        </Container>
    </>
}