import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import ImageViewer from "../component/ImageViewer";
import Menu from "../component/Menu";
import axios from "axios";
import NavigationBar from "../component/NavigationBar";

export default (props) => {
    const [imageData, setImageData] = useState([]);
    const [timerEnable, setTimerEnable] = useState();
    const [select, setSelect] = useState(-1);
  
    const selectImageUrl = (number) => {
      setSelect(number);
    }

    const refreshImageData = (datas) => {
      setImageData(datas);
    }

    useEffect(()=> {
      if(props.session === undefined) return;
              var sendData = JSON.stringify({
                  "sessionKey":props.session
              });
              axios({
                  method:"POST",
                  url: 'http://localhost:8080/file/list',
                  data:sendData,
                  headers: {'Content-type': 'application/json'}
              }).then((res)=>{
                  setImageData(res.data);
              });
    }, [props.session]);

    return <>
    <NavigationBar session={props.session} setSession={props.setSession} setImageData={refreshImageData}/>
    <Container className="mw-100 d-flex mt-5 justify-content-center align-items-center" style={{height:"78.5vh"}}>
      <ImageViewer img={select < 0 ? "" : "http://localhost:8080/files/"+props.session+"/"+imageData[select]["systemPath"]}/>
      <Menu setImageData={refreshImageData} data={imageData} setImage={selectImageUrl} selected={select} session={props.session}/>
    </Container>
    </>;
}