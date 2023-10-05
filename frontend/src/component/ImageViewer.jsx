import { Container } from "react-bootstrap"

export default (props) => {
    return <>
        <Container className="w-100 h-100 d-flex align-item-center" style={{objectFit:"none"}}>
            <img width="100%"
            alt="Image not selected."
            src={props.img}
            style={{cursor:"crosshair"}}>
            </img>
        </Container>
    </>
}