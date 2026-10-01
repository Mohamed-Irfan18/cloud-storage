
package com.irfan.cloud_storage.service;

import com.irfan.cloud_storage.dto.LoginRequest;
import com.irfan.cloud_storage.dto.RegisterRequest;
import com.irfan.cloud_storage.entity.User;
import com.irfan.cloud_storage.exception.InvalidCredentialsException;
import com.irfan.cloud_storage.repository.UserRepository;
import com.irfan.cloud_storage.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerUser(RegisterRequest request) {

        if (userRepository
                .findByUsername(request.getUsername())
                .isPresent()) {

            throw new RuntimeException("Username already exists");
        }

        if (userRepository
                .findByEmail(request.getEmail())
                .isPresent()) {

            throw new RuntimeException("Email already exists");
        }

        String encodedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(encodedPassword);

        return userRepository.save(user);
    }

    public String loginUser(LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid username or password"
                        ));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {

            throw new InvalidCredentialsException(
                    "Invalid username or password"
            );
        }

        // Generate JWT token after successful login
        String token = jwtService.generateToken(
                user.getUsername()
        );

        return token;
    }
}