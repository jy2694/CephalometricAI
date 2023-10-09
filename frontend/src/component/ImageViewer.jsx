import { Form, Modal } from "react-bootstrap"
import { useState } from "react"
import { Container } from "react-bootstrap"

export default (props) => {

    const [show, setShow] = useState(false);

    return <>
        <Container className="d-flex justify-content-around align-item-center h-100 flex-column" style={{width:"73%"}}>
            
            <Container className="border border-white rounded mb-3 d-flex flex-column justify-content-between align-item-center w-100" style={{height:"20%"}}>
                <h5 className="border-bottom pb-2 mt-3">Filter</h5>
                <Container className="d-flex justify-content-around align-item-center w-100">
                <Form.Check
                    type="switch"
                    label="Filter 1"
                />
                <Form.Check
                    type="switch"
                    label="Filter 2"
                />
                <Form.Check
                    type="switch"
                    label="Filter 3"
                />
                <Form.Check
                    type="switch"
                    label="Filter 4"
                />
                </Container>
                <Container className="d-flex justify-content-around align-item-center w-100 mb-3">
                <Form.Check
                    type="switch"
                    label="Filter 5"
                />
                <Form.Check
                    type="switch"
                    label="Filter 6"
                />
                <Form.Check
                    type="switch"
                    label="Filter 7"
                />
                <Form.Check
                    type="switch"
                    label="Filter 8"
                />
                </Container>
            </Container>

            <img height="80%"
                alt="Image not selected."
                src={props.img}
                style={{cursor:"crosshair", objectFit:"none"}}
                onClick={()=>setShow(true)}>
            </img>
        </Container>

        <Modal show={show} onHide={()=>setShow(false)} className="modal-xl mh-100">
          <Modal.Header closeButton/>
          <Modal.Body className="d-flex justify-content-center align-item-center mh-100">
          <img
                width="100%"
                alt="Image not selected."
                src={props.img}
                style={{cursor:"crosshair", objectFit:"fit"}}
                onClick={()=>setShow(true)}>
            </img>
          </Modal.Body>
        </Modal>
    </>
}