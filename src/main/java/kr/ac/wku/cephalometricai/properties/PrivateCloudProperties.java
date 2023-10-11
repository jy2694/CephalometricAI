package kr.ac.wku.cephalometricai.properties;

import kr.ac.wku.cephalometricai.dto.Line;
import kr.ac.wku.cephalometricai.dto.Point;
import kr.ac.wku.cephalometricai.dto.PointsDTO;
import kr.ac.wku.cephalometricai.entity.Image;
import lombok.Getter;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.io.*;
import java.util.UUID;

@ConfigurationProperties("privatecloud")
@Getter
public class PrivateCloudProperties {
    private String path = "cloud";

    public void setPoints(Image image, PointsDTO dto) throws IOException {
        UUID uuid = image.getOwner();
        String fileUUID = image.getSystemPath().substring(0, image.getSystemPath().indexOf('.'));
        File jsonFile = new File(path + "/" + uuid.toString() + "/" + fileUUID + ".json");
        if(!jsonFile.exists()) jsonFile.createNewFile();
        JSONObject object = new JSONObject();
        JSONArray predictedArray = new JSONArray();
        JSONArray normalArray = new JSONArray();
        JSONArray userArray = new JSONArray();
        JSONArray lineArray = new JSONArray();
        for(Point point : dto.getPredicted()){
            JSONObject pointObj = new JSONObject();
            pointObj.put("x", point.getX());
            pointObj.put("y", point.getY());
            pointObj.put("name", point.getName() == null ? "" : point.getName());
            predictedArray.add(pointObj);
        }
        for(Point point : dto.getNormal()){
            JSONObject pointObj = new JSONObject();
            pointObj.put("x", point.getX());
            pointObj.put("y", point.getY());
            pointObj.put("name", point.getName() == null ? "" : point.getName());
            normalArray.add(pointObj);
        }
        for(Point point : dto.getUser()){
            JSONObject pointObj = new JSONObject();
            pointObj.put("x", point.getX());
            pointObj.put("y", point.getY());
            pointObj.put("name", point.getName() == null ? "" : point.getName());
            userArray.add(pointObj);
        }
        for(Line line : dto.getLines()){
            JSONObject lineObj = new JSONObject();
            lineObj.put("start", line.getStart());
            lineObj.put("end", line.getEnd());
            lineObj.put("name", line.getName() == null ? "" : line.getName());
            lineObj.put("color", line.getColor());
            lineArray.add(lineObj);
        }
        object.put("predicted", predictedArray);
        object.put("normal", normalArray);
        object.put("user", userArray);
        object.put("line", lineArray);
        FileWriter file = new FileWriter(jsonFile);
        file.write(object.toJSONString());
        file.flush();
        file.close();
    }

    public PointsDTO getPoints(Image image){
        try{
            UUID uuid = image.getOwner();
            String fileUUID = image.getSystemPath().substring(0, image.getSystemPath().indexOf('.'));
            File jsonFile = new File(path + "/" + uuid.toString() + "/" + fileUUID + ".json");
            if(!jsonFile.exists()) return new PointsDTO(new Point[0],new Point[0],new Point[0], new Line[0]);
            String line;
            BufferedReader br = new BufferedReader(new FileReader(jsonFile));
            StringBuilder sb = new StringBuilder();
            while((line = br.readLine()) != null) sb.append(line);
            if(sb.isEmpty()) return new PointsDTO(new Point[0],new Point[0],new Point[0], new Line[0]);
            JSONObject object = (JSONObject) new JSONParser().parse(sb.toString());

            JSONArray predictedArray = (JSONArray) object.get("predicted");
            JSONArray normalArray = (JSONArray) object.get("normal");
            JSONArray userArray = (JSONArray) object.get("user");
            JSONArray lineArray = (JSONArray) object.get("line");

            Point[] predicted = predictedArray != null ? new Point[predictedArray.size()] : new Point[0];
            Point[] normal = normalArray != null ? new Point[normalArray.size()] : new Point[0];
            Point[] user = userArray != null ? new Point[userArray.size()] : new Point[0];
            Line[] lines = lineArray != null ? new Line[lineArray.size()] : new Line[0];

            if(predictedArray != null)
                for(int i = 0; i < predicted.length; i ++){
                    JSONObject pointObj = (JSONObject) predictedArray.get(i);
                    predicted[i] = new Point(
                            pointObj.get("name") == null ? "" : pointObj.get("name").toString(),
                            Float.parseFloat(pointObj.get("x").toString()),
                            Float.parseFloat(pointObj.get("y").toString())
                    );
                }
            if(normalArray != null)
                for(int i = 0; i < normal.length; i ++){
                    JSONObject pointObj = (JSONObject) normalArray.get(i);
                    normal[i] = new Point(
                            pointObj.get("name") == null ? "" : pointObj.get("name").toString(),
                            Float.parseFloat(pointObj.get("x").toString()),
                            Float.parseFloat(pointObj.get("y").toString())
                    );
                }
            if(userArray != null)
                for(int i = 0; i < user.length; i ++){
                    JSONObject pointObj = (JSONObject) userArray.get(i);
                    user[i] = new Point(
                            pointObj.get("name") == null ? "" : pointObj.get("name").toString(),
                            Float.parseFloat(pointObj.get("x").toString()),
                            Float.parseFloat(pointObj.get("y").toString())
                    );
                }
            if(lineArray != null){
                for(int i = 0; i < lines.length; i ++){
                    JSONObject lineObj = (JSONObject) lineArray.get(i);
                    lines[i] = new Line(
                            lineObj.get("name") == null ? "" : lineObj.get("name").toString(),
                            lineObj.get("start").toString(),
                            lineObj.get("end").toString(),
                            lineObj.get("color").toString()
                    );
                }
            }
            return new PointsDTO(predicted, normal, user, lines);
        } catch(IOException | ParseException e){
            e.printStackTrace();
        }
        return null;
    }
}
