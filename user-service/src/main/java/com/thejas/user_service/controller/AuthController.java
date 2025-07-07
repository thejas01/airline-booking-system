package com.thejas.user_service.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import com.thejas.user_service.auth.JwtHelper;
import com.thejas.user_service.config.AuthConfig;
import com.thejas.user_service.dto.req.JwtRequest;
import com.thejas.user_service.dto.req.RefreshTokenRequest;

import com.thejas.user_service.dto.req.UserRequestDto;
import com.thejas.user_service.dto.response.JwtResponse;
import com.thejas.user_service.dto.response.UserResponseDto;
import com.thejas.user_service.exception.UserAlreadyExistsException;
import com.thejas.user_service.service.RefreshTokenService;
import com.thejas.user_service.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthConfig authConfig;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private AuthenticationManager manager;
    @Autowired
    private JwtHelper helper;


    @Autowired
    private UserService userService;

   @Autowired
    private RefreshTokenService refreshTokenService;
    
    @PostMapping("/create")
    public ResponseEntity<JwtResponse> createUser(@RequestBody UserRequestDto userRequestDto) {
        try {
            UserResponseDto userResponseDto = userService.createUser(userRequestDto);
            UserDetails userDetails = userDetailsService.loadUserByUsername(userResponseDto.getEmail());
            System.out.println("from db info");
            System.out.println(userDetails.getUsername());
            System.out.println(userDetails.getPassword());

            String token = this.helper.generateToken(userDetails);
            JwtResponse jwtResponse = JwtResponse.builder().token(token).build();
            return new ResponseEntity<>(jwtResponse, HttpStatus.CREATED);
        } catch (UserAlreadyExistsException ex) {
            // Handle the exception and return an appropriate response
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new JwtResponse("User already exists: " + ex.getMessage(), null));
        }
    }


    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest jwtRequest) {
        this.doAuthenticate(jwtRequest.getEmail(), jwtRequest.getPassword());
        UserDetails userDetails = userDetailsService.loadUserByUsername(jwtRequest.getEmail());
        String token = this.helper.generateToken(userDetails);
        String refreshToken = refreshTokenService.createRefreshToken(jwtRequest.getEmail());
        JwtResponse jwtResponse = JwtResponse.builder().token(token) .refreshToken(refreshToken).build();
        return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
    }

    @GetMapping("/logout")
    public ResponseEntity<String> logout() {
        SecurityContextHolder.clearContext();
        return new ResponseEntity<>("Logged out successfully", HttpStatus.OK);
    }
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteUser(@RequestParam String email) {

        try{
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        this.doAuthenticate(email, email);
        userService.deleteUser(email);
        return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
        }
        catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User not found: " + ex.getMessage());
        }
    }
    @PostMapping("/refresh-token")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        String email = refreshTokenService.validateRefreshToken(refreshTokenRequest.getRefreshToken());
        if (email != null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String newAccessToken = helper.generateToken(userDetails);
            JwtResponse jwtResponse = JwtResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(refreshTokenRequest.getRefreshToken())
                    .build();
            return ResponseEntity.ok(jwtResponse);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new JwtResponse("Invalid Refresh Token", email));
        }
    }
    

    private void doAuthenticate(String email, String password) {
        System.out.println("Login Info");
        System.out.println(email);
        System.out.println(password);
        System.out.println("------");
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email, password);
        System.out.println(authentication.toString()+"  do authenticarte");
        try {
            System.out.println("Started");
            manager.authenticate(authentication);
            System.out.println("Eneded");
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("Authentication successful for user: " + email);


        } catch (BadCredentialsException e) {
            System.out.println("Authentication not-successful for user: " + email);
            throw new BadCredentialsException(" Invalid Username or Password  !!");

        }

    }

    @ExceptionHandler(BadCredentialsException.class)
    public String exceptionHandler(BadCredentialsException ex) {
        return "Credentials Invalid !!";
    }
}