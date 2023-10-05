package kr.ac.wku.cephalometricai.properties;

import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@ConfigurationProperties("privatecloud")
@Getter
public class PrivateCloudProperties {
    private String path = "cloud";
}
