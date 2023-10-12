package kr.ac.wku.cephalometricai.controller;

import kr.ac.wku.cephalometricai.dto.SessionDTO;
import kr.ac.wku.cephalometricai.dto.SignInDTO;
import kr.ac.wku.cephalometricai.dto.SignUpDTO;
import kr.ac.wku.cephalometricai.entity.Member;
import kr.ac.wku.cephalometricai.exception.AlreadyExistUserIdException;
import kr.ac.wku.cephalometricai.service.MemberService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;

@RestController
@AllArgsConstructor
public class AuthController {

    private final MemberService memberService;

    @PostMapping("api/auth/signin")
    public ResponseEntity<Object> signInProcess(@RequestBody SignInDTO dto){
        Optional<UUID> optionalUUID = memberService.signInProcess(dto);
        return optionalUUID.
                <ResponseEntity<Object>>map(uuid -> ResponseEntity.ok().body(uuid))
                .orElseGet(() -> ResponseEntity.status(401).body("Incorrect ID or PW."));
    }

    @PostMapping("api/auth/signup")
    public ResponseEntity<Object> signUpProcess(@RequestBody SignUpDTO dto){
        try {
            memberService.signUpProcess(dto);
            return ResponseEntity.ok().build();
        } catch (AlreadyExistUserIdException e) {
            return ResponseEntity.status(304).body(e.getMessage());
        }
    }

    @PostMapping("api/auth/logout")
    public ResponseEntity<Object> logOutProcess(@RequestBody SessionDTO dto){
        memberService.logOutProcess(dto.getSessionKey());
        return ResponseEntity.ok().build();
    }
}
