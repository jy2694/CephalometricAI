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
      if(timerEnable === undefined && props.session !== undefined){
        setTimerEnable(setInterval(() => {
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
          }, 5000));
      } else if(timerEnable !== undefined && props.session === undefined){
        clearInterval(timerEnable);
        setTimerEnable(undefined);
      }
    }, [props.session]);

    return <>
    <NavigationBar session={props.session} setSession={props.setSession} setImageData={refreshImageData}/>
    <Container className="d-flex m-5" style={{height:"78.5vh"}}>
      <ImageViewer img={select < 0 ? "" : "http://localhost:8080/files/"+props.session+"/"+imageData[select]["systemPath"]}/>
      <Menu data={imageData} setImage={selectImageUrl} selected={select} session={props.session}/>
    </Container>
    </>;
}