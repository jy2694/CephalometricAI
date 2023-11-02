import {useEffect, useRef, useState} from "react";
import { Container } from "react-bootstrap";
import ImageViewer from "../component/ImageViewer";
import Menu from "../component/Menu";
import axios from "axios";
import NavigationBar from "../component/NavigationBar";
import {MutableRefObject} from "react";

export default (props) => {
    const [imageData, setImageData] = useState([]);
    const [timerFlag, setTimerFlag] = useState(false);
    const [select, setSelect] = useState(-1);
    const downloadCanvas: MutableRefObject<HTMLCanvasElement> = useRef()
  
    const selectImageUrl = (number) => {
      setSelect(number);
    }

    const refreshImageData = (datas) => {
      setImageData(datas);
    }
    
    const postImageList = () => {
      if(props.session === undefined) return;
      var sendData = JSON.stringify({
          "sessionKey":props.session
      });
      axios({
          method:"POST",
          url: 'http://localhost:8080/api/file/list',
          data:sendData,
          headers: {'Content-type': 'application/json'}
      }).then((res)=>{
          setImageData(res.data);
      }).catch((error)=>{
        props.setSession(undefined);
        alert("Session Expired.");
      });
    }
    useEffect(()=> {
      postImageList();
      if(props.session !== undefined){
        setTimerFlag(!timerFlag);
      }
    }, [props.session]);

    useEffect(()=>{
      const timer = setInterval(() => {
        postImageList();
        setTimerFlag(!timerFlag);
      }, 10000);
      return () => clearInterval(timer);
    }, [timerFlag]);

    return <>
    <canvas ref={downloadCanvas} style={{display: "none"}}>

    </canvas>
    <NavigationBar session={props.session} setSession={props.setSession} setImageData={refreshImageData}/>
    <Container className="mw-100 d-flex mt-5 justify-content-center align-items-center" style={{height:"78.5vh"}}>
      <ImageViewer img={select < 0 ? "" : "http://localhost:8080/api/files/"+props.session+"/"+imageData[select]["systemPath"]} setSession={props.setSession} session={props.session} selected={select} data={imageData}/>
      <Menu downloadCanvas={downloadCanvas} setImageData={refreshImageData} data={imageData} setImage={selectImageUrl} selected={select} session={props.session}/>
    </Container>
    </>;
}