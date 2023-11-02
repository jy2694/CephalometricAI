import { Button, Form, Modal } from "react-bootstrap"
import { useEffect, useRef, useState } from "react"
import { Container } from "react-bootstrap"
import axios from "axios";


export default (props) => {

    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [edit, setEdit] = useState(false);
    const [alert, setAlert] = useState(false);
    const [show, setShow] = useState(false);
    const [points, setPoints] = useState([]);
    const [serverPoint, setServerPoint] = useState();
    const [canvasX, setCanvasX] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasRemoveMode, setCanvasRemoveMode] = useState(false);

    const [isImageLoaded, setImageLoaded] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");




    useEffect(()=>setImageLoaded(false), [props.img]);
    useEffect(()=>{
        if(!isImageLoaded) return;
        setEdit(false);
        if(props.img === "") {
            setCanvasHeight(imgRef.current.height);
            setCanvasWidth(imgRef.current.width);
            setCanvasX(0);
            return;
        }
        let scale = (imgRef.current.height / imgRef.current.naturalHeight);
        let imageWidth = imgRef.current.naturalWidth * scale;
        let imageStartX = (imgRef.current.width - imageWidth) / 2;
        setCanvasWidth(imageWidth);
        setCanvasHeight(imgRef.current.height);
        setCanvasX(imageStartX);
    }, [isImageLoaded]);
    useEffect(()=> {
        if(edit){
            if(props.selected < 0){
                setAlertTitle("Unavaliable function!")
                setAlertContent("Image is not selected.");
                setAlert(true);
                setEdit(false);
                return;
            }
            const data = props.data[props.selected];
            if(data === undefined || data === null){
                setAlertTitle("Unavaliable function!")
                setAlertContent("Image is not selected.");
                setAlert(true);
                setEdit(false);
                return;
            }
            if(data["status"] === "PROCESSING"){
                setAlertTitle("Unavaliable function!")
                setAlertContent("Image is processing! Edit mode is available after processing.");
                setAlert(true);
                setEdit(false);
                return;
            }
        }
    }, [edit]);

    useEffect(() => {
        const context = canvasRef.current.getContext("2d");
        context.font = `13px Verdana`;
        context.beginPath();
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.closePath();
        for(const point of points){
            context.beginPath();
            context.globalCompositeOperation = "source-over";
            context.arc(point["x"], point["y"], 3, 0, 2 * Math.PI, false);
            context.fillStyle = "orange";
            context.fill();
            context.closePath();
        }

        if(serverPoint !== undefined && serverPoint !== null){
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            for(const line of serverPoint["lines"]){
                const startName = getPointByName(line["start"]);
                const endName = getPointByName(line["end"]);
                if(startName === null) continue;
                if(endName === null) continue;
                const color = line["color"];
                context.beginPath();
                context.moveTo(startName["x"], startName["y"]);
                context.lineTo(endName["x"], endName["y"]);
                context.strokeStyle = color;
                context.lineWidth = 3;
                context.stroke();
                context.closePath();
            }
            for(const angle of serverPoint["angles"]){
                context.beginPath();
                context.globalCompositeOperation = "source-over";
                const center = {
                    "x" : angle["center"]["x"] * scale,
                    "y" : angle["center"]["y"] * scale
                }
                const p1 = {
                    "x" : angle["p1"]["x"] * scale,
                    "y" : angle["p1"]["y"] * scale
                }
                const degree = angle["angle"]
                const rel_x = p1["x"] - center["x"];
                const rel_y = p1["y"] - center["y"];
                const radius = Math.sqrt(Math.pow(rel_x, 2) + Math.pow(rel_y, 2));
                const startAngle = Math.asin(rel_y / radius) - (Math.PI / 2);
                const endAngle = startAngle + (degree * Math.PI / 180);
                context.lineWidth = 3
                context.arc(center["x"], center["y"], radius, startAngle, endAngle, false);
                context.strokeStyle = "red";
                context.stroke();
                context.closePath();

                const centerAngle = startAngle + (degree/2 * Math.PI / 180);
                const angleTextX = center["x"] + radius * Math.cos(centerAngle);
                const angleTextY = center["y"] + radius * Math.sin(centerAngle);
                context.beginPath();
                context.lineWidth = 1;
                context.fillStyle = "red";
                context.fillText(degree + "°", angleTextX+5, angleTextY+5)
                context.strokeStyle = "red";
                context.strokeText(degree + "°", angleTextX+5, angleTextY+5)
                context.closePath();

            }
            for(const point of serverPoint["predicted"]){
                context.beginPath();
                context.globalCompositeOperation = "source-over";
                context.arc(point["x"]*scale, point["y"]*scale, 3, 0, 2 * Math.PI, false);
                context.fillStyle = "red";
                context.fill();
                context.closePath();
                context.beginPath();
                context.lineWidth = 1;
                if(point["name"] !== undefined && point["name"] !== null){
                    context.fillStyle = "red";
                    context.fillText(point["name"], (point["x"]*scale)+5, (point["y"]*scale)+5);
                    context.strokeStyle = "red";
                    context.strokeText(point["name"], (point["x"]*scale)+5, (point["y"]*scale)+5)
                }
                context.closePath();
            }
            for(const point of serverPoint["normal"]){
                context.beginPath();
                context.globalCompositeOperation = "source-over";
                context.arc(point["x"]*scale, point["y"]*scale, 3, 0, 2 * Math.PI, false);
                context.fillStyle = "blue";
                context.fill();
                context.closePath();
                context.beginPath();
                context.lineWidth = 1;
                if(point["name"] !== undefined && point["name"] !== null){
                    context.fillStyle = "blue";
                    context.fillText(point["name"], (point["x"]*scale)+5, (point["y"]*scale)+5);
                    context.strokeStyle = "blue";
                    context.strokeText(point["name"], (point["x"]*scale)+5, (point["y"]*scale)+5)
                }
                context.closePath();
            }
        }
    }, [points]);

    const getPointByName = (name) => {
        if(serverPoint !== undefined && serverPoint !== null){
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);
            for(const p of serverPoint["predicted"]){
                if(p["name"] === name){
                    return {
                        "x": p["x"] * scale,
                        "y": p["y"] * scale,
                        "name": p["name"]
                    };
                }
            }
            for(const p of serverPoint["normal"]){
                if(p["name"] === name){
                    return {
                        "x": p["x"] * scale,
                        "y": p["y"] * scale,
                        "name": p["name"]
                    };
                }
            }
        }
        return null;
    }

    useEffect(()=>{
        if(props.img === "") return;
        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "imageId": props.data[props.selected]["id"]
        });
        axios({
            method:"POST",
            url: 'http://localhost:8080/api/file/points',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).then((res)=>{
            setServerPoint(res.data);
        }).catch(error=>{});
    }, [props.selected]);

    useEffect(()=>{
        if(serverPoint === undefined) return;
        if(serverPoint === null) return;
        const point = [];
        for(let p of serverPoint["user"]){
            let scale = (imgRef.current.height / imgRef.current.naturalHeight);

            point.push({
                "x": p["x"] * scale,
                "y": p["y"] * scale,
                "name": p["name"]
            });
        }
        setPoints(point);
    }, [serverPoint]);


    const savePoints = () => {
        const userPointScaled = [];
        let scale = (imgRef.current.height / imgRef.current.naturalHeight);
        for(let p of points){
            userPointScaled.push({
                "x": p["x"] / scale,
                "y": p["y"] / scale,
                "name": p["name"]
            });
        }
        var sendData = JSON.stringify({
            "sessionKey": props.session,
            "imageId": props.data[props.selected]["id"],
            "predicted": serverPoint["predicted"],
            "normal": serverPoint["normal"],
            "user": userPointScaled,
            "lines": serverPoint["lines"],
            "angles": serverPoint["angles"]
        });
        axios({
            method:"POST",
            url: 'http://localhost:8080/api/file/pointedit',
            data:sendData,
            headers: {'Content-type': 'application/json'}
        }).catch(error=>{
            props.setSession(undefined);
            alert("Session Expired.");
        });
    }

    const drawPoint = (x, y) => {
        setPoints([...points, {"x":x, "y":y, "name":""}]);
        savePoints();
    }

    const removePoint = (x, y) => {
        if(!canvasRemoveMode) return;
        let minPoint;
        let minDistance = 10000;
        for(const point of points){
            const distance = Math.sqrt(Math.pow(x-point["x"], 2) + Math.pow(y-point["y"], 2));
            if(minDistance > distance){
                minPoint = point;
                minDistance = distance;
            }
        }
        if(minDistance <= 15){
            points.splice(points.indexOf(minPoint), 1);
            setPoints([...points]);
        }
        savePoints();
    }

    return <>
        <Container className="d-flex justify-content-around align-item-center h-100 flex-column" style={{width:"73%"}}>
            
            <Container className="border border-white rounded mb-3 d-flex flex-column justify-content-around align-item-center w-100" style={{height:"20%"}}>
                <h5 className="border-bottom pb-2 mt-3">Filter</h5>
                <Container className="d-flex justify-content-around align-item-center w-100">
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 1"
                />
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 2"
                />
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 3"
                />
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 4"
                />
                </Container>
                <Container className="d-flex justify-content-around align-item-center w-100 mb-3">
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 5"
                />
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 6"
                />
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 7"
                />
                <Form.Check
                    type="switch"
                    checked={true}
                    label="Filter 8"
                />
                </Container>
            </Container>
            <Form.Check className="d-flex"style={{top:"0px", left:"0px"}} checked={edit} label="Edit Mode" onChange={(e)=>setEdit(e.target.checked)}/>
            <Container className="w-100 position-relative" style={{height:"80%"}}>
                <img ref={imgRef} src={props.img} onLoad={()=>setImageLoaded(true)} className="w-100 h-100 position-absolute" style={{top:"0px", left:"0px", objectFit:"contain"}} alt="Image not selected."/>
                <canvas 
                    ref={canvasRef} 
                    className="border border-white position-absolute"
                    width={canvasWidth+"px"}
                    height={canvasHeight+"px"}
                    style={{top:"0px", left:canvasX+"px", cursor:"crosshair"}} 
                    onClick={edit ? (e)=>{} : ()=>setShow(true)}
                    onMouseDown={edit ? (e) => {
                        if(e.button == 0){
                            drawPoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                        } else if(e.button == 2){
                            setCanvasRemoveMode(true);
                        }
                    } : ()=>{}}
                    onMouseUp={edit ? (e)=> {
                        if(e.button == 2){
                            setCanvasRemoveMode(false);
                        }
                    } : ()=>{}} 
                    onMouseMove={edit && canvasRemoveMode ? (e) => {
                        removePoint(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                    } : (e)=>{}}
                    />
            </Container>
        </Container>

        <Modal show={show} onHide={()=>setShow(false)} className="modal-xl mh-100">
          <Modal.Header closeButton/>
          <Modal.Body className="d-flex justify-content-center align-item-center mh-100">
          <img
                width="100%"
                alt="Image not selected."
                src={props.img}
                style={{cursor:"crosshair", objectFit:"contain"}}
                onClick={()=>setShow(true)}>
            </img>
          </Modal.Body>
        </Modal>

        <Modal show={alert} onHide={()=>setAlert(false)}>
            <Modal.Header closeButton>
                <Modal.Title>{alertTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alertContent}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={()=>setAlert(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
    </>
}