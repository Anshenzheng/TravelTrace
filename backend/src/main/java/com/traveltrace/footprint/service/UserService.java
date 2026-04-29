package com.traveltrace.footprint.service;

import com.traveltrace.footprint.dto.UserProfileDTO;
import com.traveltrace.footprint.entity.CityStatus;
import com.traveltrace.footprint.entity.Post;
import com.traveltrace.footprint.entity.PostStatus;
import com.traveltrace.footprint.entity.User;
import com.traveltrace.footprint.repository.PostRepository;
import com.traveltrace.footprint.repository.UserCityRepository;
import com.traveltrace.footprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserCityRepository userCityRepository;
    private final PostRepository postRepository;
    private final AuthService authService;

    public UserProfileDTO getCurrentUserProfile() {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }
        return getUserProfile(user);
    }

    public UserProfileDTO getUserProfileById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return getUserProfile(user);
    }

    private UserProfileDTO getUserProfile(User user) {
        long visitedCount = userCityRepository.countByUserAndStatus(user, CityStatus.VISITED);
        long wantToVisitCount = userCityRepository.countByUserAndStatus(user, CityStatus.WANT_TO_VISIT);
        long postsCount = postRepository.countByUserAndStatusIn(
                user, List.of(PostStatus.APPROVED, PostStatus.PENDING)
        );

        return UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .visitedCitiesCount(visitedCount)
                .wantToVisitCitiesCount(wantToVisitCount)
                .postsCount(postsCount)
                .build();
    }

    @Transactional
    public UserProfileDTO updateProfile(UserProfileDTO profileDTO) {
        User user = authService.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("用户未登录");
        }

        if (profileDTO.getNickname() != null) {
            user.setNickname(profileDTO.getNickname());
        }
        if (profileDTO.getAvatar() != null) {
            user.setAvatar(profileDTO.getAvatar());
        }
        if (profileDTO.getBio() != null) {
            user.setBio(profileDTO.getBio());
        }

        user = userRepository.save(user);
        return getUserProfile(user);
    }
}
