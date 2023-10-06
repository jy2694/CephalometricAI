import { Container } from "react-bootstrap"

export default (props) => {
    return <>
        <Container className="d-flex align-item-center" style={{width:"73%", objectFit:"none"}}>
            <img width="100%"
            alt="Image not selected."
            src={props.img}
            style={{cursor:"crosshair"}}>
            </img>
        </Container>
    </>
}