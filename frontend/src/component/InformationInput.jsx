import { faCheck, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";

export default (props) => {

    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [patient, setPatient] = useState("");

    const [nameEnable, setNameEnable] = useState(true);
    const [dateEnable, setDateEnable] = useState(true);
    const [patientEnable, setPatientEnable] = useState(true);

    useEffect(()=>{
        const data = props.data[props.selected];
        if(data === undefined) {
            setNameEnable(false);
            setDateEnable(false);
            setPatientEnable(false);
            return;
        }
        setNameEnable(true);
        setDateEnable(true);
        setPatientEnable(true);
        setName(data["name"] === undefined ? "" : data["name"]);
        setDate(data["createAt"] === undefined || data["createAt"] === null ? "" : data["createAt"]);
        setPatient(data["patient"] === undefined || data["patient"] === null ? "" : data["patient"]);
    }, [props.selected]);

    const modifyImageData = (e) => {
        const data = props.data[props.selected];
        if(data === undefined) return;
        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "id": data["id"],
            "name": name,
            "patient": patient,
            "date": date
        });
        axios({
            method:"POST",
            url: 'http://localhost:8080/api/file/modify',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res)=>{
            alert("The information has been reflected.");
            if(props.session === undefined) return;
              var sendData = JSON.stringify({
                  "sessionKey":props.session
              });
              axios({
                  method:"POST",
                  url: 'http://localhost:8080/api/file/list',
                  data:sendData,
                  headers: {'Content-type': 'application/json'}
              }).then((r)=>{
                  props.setImageData(r.data);
              });
              
        }).catch(error=>{
            alert("Internal Server Error.")
        });
    }

    const onRawDownload = (e) => {
        window.open(props.selected < 0 ? "" : "http://localhost:8080/api/files/"+props.session+"/"+props.data[props.selected]["systemPath"], '_blank');
    }

    const onProcessedDownload = () => {

    }

    return <>
    <Container 
        className="border border-white rounded d-flex justify-content-start align-items-start w-100 h-50 mt-3"
        style={{flexDirection:"column", overflow:"auto"}}>

        <span className="h6 mt-3 mb-3">Photo Name : </span>
        <Form.Control disabled={!nameEnable} type="text" value={name} onChange={(e) => setName(e.target.value)}/>
        
        <span className="h6 mt-3 mb-3">Patient : </span>
        <Form.Control disabled={!patientEnable} type="text" value={patient} onChange={(e) => setPatient(e.target.value)}/>

        <span className="h6 mt-3 mb-3">Uploaded At : </span>
        <Form.Control disabled={!dateEnable} type="text" value={date} onChange={(e) => setDate(e.target.value)}/>

        <Container className="d-flex justify-content-around align-items-start w-100 mt-3 mb-3 mt-auto">
            <Button className="bg-secondary border-white" onClick={onRawDownload}> Raw <FontAwesomeIcon icon={faDownload} style={{color: "#ffffff"}}/></Button>
            <Button className="bg-secondary border-white"> Processed <FontAwesomeIcon icon={faDownload} style={{color: "#ffffff"}}/></Button>
            <Button className="bg-success border-white " onClick={modifyImageData}> Done <FontAwesomeIcon icon={faCheck} style={{color: "#ffffff"}}/></Button>
        </Container>
    </Container>
    </>;
}