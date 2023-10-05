import axios from 'axios';
import { useState } from 'react'
import {Container, Navbar, Nav, Modal, Form, Button} from 'react-bootstrap'

export default (props) => {

  const [show, setShow] = useState(false);
  const [folderEnable, setFolderEnable] = useState(false);

  const fileList = []; // 업로드한 파일들을 저장하는 배열

  const onSaveFiles = (e) => {
      const uploadFiles = Array.prototype.slice.call(e.target.files);

      uploadFiles.forEach((uploadFile) => {
          fileList.push(uploadFile);
      });
  };

  const onLogout = (e) => {
    if(props.session === undefined) return;
    var sendData = JSON.stringify({
        "sessionKey":props.session
    });
    axios({
        method:"POST",
        url: 'http://localhost:8080/auth/logout',
        data:sendData,
        headers: {'Content-type': 'application/json'}
    }).then((res)=>{
        props.setSession(undefined);
    });
  }

  const onUpload = () => {
    if(props.session === undefined) return;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('sessionDTO',props.session);
    console.log(formData);
    axios.post('http://localhost:8080/file/upload', formData)
    .then((res)=> {
      props.setImageData(res.data);
      setShow(false);
    })
  }

    return <>
    <Navbar expand="lg" bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">CEPHALOMETRIC</Navbar.Brand>
        <Nav className="me-auto">
        <Nav.Link onClick={()=>{
            setShow(true);
            setFolderEnable(false);
            }}>Import file</Nav.Link>
          <Nav.Link onClick={()=>{
            setShow(true);
            setFolderEnable(true);
            }}>Import folder</Nav.Link>
          <Nav.Link href="#link">Edit</Nav.Link>
        </Nav>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <span 
              className='text-white text-decoration-underline'
              style={{cursor:"pointer"}}
              onClick={onLogout}>Logout</span>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    <Modal show={show} onHide={()=>setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="h5">Importing Image {folderEnable ? "Folder" : "File"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control directory={folderEnable ? "" : false} webkitdirectory={folderEnable ? "" : false} type="file" onChange={onSaveFiles}/>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={()=>onUpload()}>
            Import
          </Button>
        </Modal.Footer>
      </Modal>
    </>
}