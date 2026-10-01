
package com.irfan.cloud_storage.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // 1. Check whether the Authorization header contains a Bearer token
        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            jwtToken = authorizationHeader.substring(7);

            try {
                username = jwtService.extractUsername(jwtToken);
            } catch (Exception exception) {
                // Invalid or malformed token
                username = null;
            }
        }

        // 2. Validate the token and set authentication
        if (username != null
                && SecurityContextHolder.getContext()
                .getAuthentication() == null) {

            try {
                if (!jwtService.isTokenExpired(jwtToken)) {

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    java.util.Collections.emptyList()
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }

            } catch (Exception exception) {
                // Do not authenticate an invalid token
                SecurityContextHolder.clearContext();
            }
        }

        // 3. Continue the request
        filterChain.doFilter(request, response);
    }
}