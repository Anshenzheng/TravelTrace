package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.ApiResponse;
import com.traveltrace.footprint.dto.JwtResponse;
import com.traveltrace.footprint.dto.LoginRequest;
import com.traveltrace.footprint.dto.RegisterRequest;
import com.traveltrace.footprint.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            JwtResponse response = authService.login(request);
            return ApiResponse.success("登录成功", response);
        } catch (Exception e) {
            return ApiResponse.error("登录失败: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ApiResponse<JwtResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            JwtResponse response = authService.register(request);
            return ApiResponse.success("注册成功", response);
        } catch (Exception e) {
            return ApiResponse.error("注册失败: " + e.getMessage());
        }
    }
}
