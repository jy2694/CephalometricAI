import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Modal } from "react-bootstrap";

export default (props) => {

    const [ID, setID] = useState("");
    const [PW, setPW] = useState("");
    const [buttonHover, setButtonHover] = useState(false);
    const [registerHover, setRegisterHover] = useState(false);
    const [show, setShow] = useState(false);

    const onLogin = (e) => {
        var sendData = JSON.stringify({
            "userId": ID,
            "userPw": PW
        });
        axios({
            method:"POST",
            url: 'http://localhost:8080/auth/signin',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res)=>{
            console.log(res.data);
            props.createSession(res.data);
        }).catch(error=>{
            setShow(true);
        });
    }

    return <>
        <Container className="d-flex justify-content-center align-items-center" style={{height:"100vh"}}>
            <Container
                style={{width:"35%"}}>
                <Card className="bg-dark text-white border border-white">
                    <Card.Header className="border-white">
                        <h4>Sign In</h4>
                    </Card.Header>
                    <Card.Body>
                        <Container 
                        className="p-2 d-flex justify-content-start align-items-start"
                        style={{flexDirection:"column"}}>
                            <p>ID : </p>
                            <Form.Control 
                                className="mb-3" 
                                type="text"
                                value={ID}
                                onChange={(e) => setID(e.target.value)}/>
                            <p>Password : </p>
                            <Form.Control 
                                className="mb-3" 
                                type="password"
                                value={PW}
                                onChange={(e) => setPW(e.target.value)}/>
                            <Container className="d-flex justify-content-center mb-3 mt-3">
                                <Button 
                                    className={(buttonHover ? "bg-white text-black" : "bg-secondary text-white") + " w-50 border border-white"}
                                    onMouseEnter={()=>setButtonHover(true)}
                                    onMouseLeave={()=>setButtonHover(false)}
                                    onClick={onLogin}>Sign In</Button>
                            </Container>
                            <Container className="d-flex justify-content-center">
                                <p 
                                    className={registerHover ? "text-decoration-underline" : ""}
                                    style={{cursor:"pointer"}}
                                    onMouseEnter={()=>setRegisterHover(true)}
                                    onMouseLeave={()=>setRegisterHover(false)}
                                    onClick={()=>props.setLogin(false)}>Register</p>
                            </Container>
                        </Container>
                    </Card.Body>
                </Card>
            </Container>
        </Container>
        <Modal show={show} onHide={()=>setShow(false)} >
          <Modal.Header closeButton>
            <Modal.Title>
              Error
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            The ID or password is incorrect.
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={()=>setShow(false)}>Close</Button>
          </Modal.Footer>
        </Modal>
    </>;
}