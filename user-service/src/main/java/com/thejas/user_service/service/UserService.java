package com.thejas.user_service.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.thejas.user_service.dto.req.UserRequestDto;
import com.thejas.user_service.dto.response.UserResponseDto;

public interface UserService extends UserDetailsService  {

    List<UserResponseDto> getAllUser();
    public UserResponseDto createUser(UserRequestDto userRequestDto);
    void deleteUser(String email);
    
    // Admin methods
    Page<UserResponseDto> getAllUsers(Pageable pageable);
    UserResponseDto getUserById(Long id);
    List<UserResponseDto> searchUsers(String email, String name, String role);
    UserResponseDto updateUserRole(Long id, String role);
    UserResponseDto updateUserStatus(Long id, boolean enabled);
    void deleteUser(Long id);
    long getTotalUsersCount();
    Map<String, Long> getUserCountByRole();
    long getActiveUsersCount();
    long getRecentRegistrationsCount();
    List<UserResponseDto> getRecentRegistrations(int days);
   
}
