package kr.ac.wku.cephalometricai.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@ConfigurationProperties("encryptor")
public class EncryptorProperties {
    public String encryptPassword(String text){
        try{
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(text.getBytes());
            StringBuilder builder = new StringBuilder();
            for (byte b : md.digest()) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch(NoSuchAlgorithmException e){
            return "";
        }
    }
}
