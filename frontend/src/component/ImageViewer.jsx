import { Button, Form, Modal } from "react-bootstrap"
import { useEffect, useRef, useState } from "react"
import { Container } from "react-bootstrap"
import axios from "axios";


export default (props) => {

    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const wideRef = useRef(null);
    const [edit, setEdit] = useState(false);
    const [alert, setAlert] = useState(false);
    const [show, setShow] = useState(false);
    const [points, setPoints] = useState([]);
    const [serverPoint, setServerPoint] = useState();
    const [canvasX, setCanvasX] = useState(0);
    const [canvasHeight, setCanvasHeight] = useState(0);
    const [canvasWidth, setCanvasWidth] = useState(0);
    const [canvasRemoveMode, setCanvasRemoveMode] = useState(false);
    const [wideX, setWideX] = useState(0);
    const [wideY, setWideY] = useState(0);
    const [wideWidth, setWideWidth] = useState(0);
    const [wideHeight, setWideHeight] = useState(0);
    const [wideRelativeX, setWideRelativeX] = useState(0);
    const [wideRelativeY, setWideRelativeY] = useState(0);
    const [wideShow, setWideShow] = useState(false);

    const [isImageLoaded, setImageLoaded] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertContent, setAlertContent] = useState("");


    const resizeHandler = () => {
        if(imgRef.current.naturalHeight === 0) {
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
    }

    useEffect(()=>{
        if(wideRef !== null){
            console.log(wideRef);
            // setWideWidth(wideRef.current.width);
            // setWideHeight(wideRef.current.height);
        }
    }, [wideRef]);

    useEffect(()=>{
        // console.log("wideX : " + wideX);
        // console.log("wideY : " + wideY);
        // console.log("wideHeight : " + wideHeight);
        // console.log("wideWidth : " + wideWidth);
        setWideRelativeX(wideX+wideWidth);
        setWideRelativeY(wideY+wideHeight);
    }, [wideX, wideY, wideHeight, wideWidth]);

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
            for(const point of serverPoint["predicted"]){
                context.beginPath();
                context.globalCompositeOperation = "source-over";
                context.arc(point["x"]*scale, point["y"]*scale, 3, 0, 2 * Math.PI, false);
                context.fillStyle = "red";
                context.fill();
                context.closePath();
            }
            for(const point of serverPoint["normal"]){
                context.beginPath();
                context.globalCompositeOperation = "source-over";
                context.arc(point["x"]*scale, point["y"]*scale, 3, 0, 2 * Math.PI, false);
                context.fillStyle = "blue";
                context.fill();
                context.closePath();
            }
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

    useEffect(()=>{
        window.addEventListener("resize", resizeHandler);
        return ()=> window.removeEventListener("resize", resizeHandler);
    }, []);

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
            "lines": serverPoint["lines"]
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
                    } : (e)=>{
                        if(e.ctrlKey){
                            setWideShow(true)
                        } else {
                            setWideShow(false)
                        }
                        setWideX(e.nativeEvent.offsetX);
                        setWideY(e.nativeEvent.offsetY);
                        
                    }}
                    onMouseLeave={(e)=>setWideShow(false)}
                    />
                    <Container className="position-absolute w-25 h-50 border border-white"
                        ref={wideRef}
                        style={{
                            top: (wideRelativeY+10) + "px",
                            left: (wideRelativeX+10) + "px",
                        }}>
                         
                    </Container>
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