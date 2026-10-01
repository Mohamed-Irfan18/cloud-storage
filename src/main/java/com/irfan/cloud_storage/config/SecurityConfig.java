package com.irfan.cloud_storage.config;

import com.irfan.cloud_storage.security.JwtAuthenticationFilter;
import com.irfan.cloud_storage.security.JwtService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }


    // ===============================
    // PASSWORD ENCODER
    // ===============================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // ===============================
    // JWT FILTER
    // ===============================

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService);
    }


    // ===============================
    // SECURITY CONFIGURATION
    // ===============================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        http

                // Disable CSRF because we are using JWT
                .csrf(csrf -> csrf.disable())


                // Disable browser login page
                .formLogin(form -> form.disable())


                // Disable HTTP Basic authentication
                .httpBasic(basic -> basic.disable())


                // JWT authentication is stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // ===============================
                // AUTHORIZATION
                // ===============================

                .authorizeHttpRequests(auth -> auth

                        // --------------------------------
                        // FRONTEND FILES
                        // --------------------------------

                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/login.html",
                                "/register.html",
                                "/dashboard.html",
                                "/css/**",
                                "/js/**",
                                "/favicon.ico"
                        ).permitAll()


                        // --------------------------------
                        // PUBLIC API
                        // --------------------------------

                        .requestMatchers(
                                "/api/health",
                                "/api/users/register",
                                "/api/users/login"
                        ).permitAll()


                        // --------------------------------
                        // EVERYTHING ELSE
                        // REQUIRES JWT
                        // --------------------------------

                        .anyRequest().authenticated()
                )


                // ===============================
                // JWT FILTER
                // ===============================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}