import { Container, Form, ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap"
import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate, faCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

export default (props) => {

    const [hover, setHover] = useState(-1)
    const [filter, setFilter] = useState("");

    const tooltip = (
        <Tooltip id="tooltip">
          Artificial intelligence is processing.
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
            {data["name"]}
            {data["status"] === "PROCESSING" && <FontAwesomeIcon className="ms-1" spin icon={faArrowsRotate} />}
            {data["status"] === "COMPLETED" && <FontAwesomeIcon className="ms-1" icon={faCheck} style={{color: "#00f900",}} />}
        </ListGroup.Item>;
            if(data["status"] === "PROCESSING"){
                result.push(<OverlayTrigger placement="top" overlay={tooltip}>
                    {element}
                </OverlayTrigger>)
            } else{
                result.push(element);
            }
        }
        return result;
    }

    return <>
        <Container className="border border-white rounded d-flex justify-content-start align-items-center w-100 h-50" style={{overflow:"auto", flexDirection:"column"}}>
            <Container className="w-100">
                <span>Search</span>
                <Form.Control type="text" placeholder="Search by name." value={filter} onChange={(e)=>setFilter(e.target.value)}/>
            </Container>
            <ListGroup className="mt-3 mb-3 w-100">
                {listRenderer()}
            </ListGroup>
        </Container>
    </>
}