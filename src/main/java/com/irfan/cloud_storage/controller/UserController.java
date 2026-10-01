
package com.irfan.cloud_storage.controller;

import com.irfan.cloud_storage.dto.LoginRequest;
import com.irfan.cloud_storage.dto.RegisterRequest;
import com.irfan.cloud_storage.exception.InvalidCredentialsException;
import com.irfan.cloud_storage.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {

        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @Valid @RequestBody LoginRequest request) {

        try {

            String token = userService.loginUser(request);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful!",
                            "token", token
                    )
            );

        } catch (InvalidCredentialsException exception) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Unauthorized",
                            "message", "Invalid username or password"
                    ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(
            @Valid @RequestBody RegisterRequest request) {

        userService.registerUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("User registered successfully!");
    }
}