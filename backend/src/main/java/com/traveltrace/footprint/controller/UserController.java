package com.traveltrace.footprint.controller;

import com.traveltrace.footprint.dto.ApiResponse;
import com.traveltrace.footprint.dto.UserProfileDTO;
import com.traveltrace.footprint.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileDTO> getCurrentUserProfile() {
        try {
            UserProfileDTO profile = userService.getCurrentUserProfile();
            return ApiResponse.success(profile);
        } catch (Exception e) {
            return ApiResponse.error("获取用户信息失败: " + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserProfileDTO> getUserProfile(@PathVariable Long userId) {
        try {
            UserProfileDTO profile = userService.getUserProfileById(userId);
            return ApiResponse.success(profile);
        } catch (Exception e) {
            return ApiResponse.error("获取用户信息失败: " + e.getMessage());
        }
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileDTO> updateProfile(@RequestBody UserProfileDTO profileDTO) {
        try {
            UserProfileDTO updated = userService.updateProfile(profileDTO);
            return ApiResponse.success("更新成功", updated);
        } catch (Exception e) {
            return ApiResponse.error("更新失败: " + e.getMessage());
        }
    }
}
