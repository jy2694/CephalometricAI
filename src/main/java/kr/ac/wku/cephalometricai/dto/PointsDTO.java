package kr.ac.wku.cephalometricai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PointsDTO {
    private UUID sessionKey;
    private Long imageId;
    private Point[] predicted;
    private Point[] normal;
    private Point[] user;
    private Line[] lines;

    public PointsDTO(Point[] predicted, Point[] normal, Point[] user, Line[] lines) {
        this.predicted = predicted;
        this.normal = normal;
        this.user = user;
        this.lines = lines;
    }
}