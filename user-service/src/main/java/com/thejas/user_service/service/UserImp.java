package com.thejas.user_service.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.HashMap;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.thejas.user_service.dto.req.UserRequestDto;
import com.thejas.user_service.config.AuthConfig;
import com.thejas.user_service.dto.response.UserResponseDto;
import com.thejas.user_service.exception.UserAlreadyExistsException;
import com.thejas.user_service.model.User;
import com.thejas.user_service.repository.UserRepository;



@Service
public class UserImp implements UserService{

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private AuthConfig authConfig;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(username).orElseThrow(()->new RuntimeException("User not found"));
        System.out.println("Retrived Data");
        System.out.println(user.getPassword()+"Retrived Password");
        System.out.println(user.getUsername());
        System.out.println(user.getId());
        System.out.println(user.getEmail());
        System.out.println("-----");
        return user;
    }

   @Override
    public List<UserResponseDto> getAllUser() {
        List<User> userEnitiys = userRepo.findAll();
        List<UserResponseDto> userResponseDtoList = userEnitiys.stream().map(user->this.userEntityToUserRespDto(user)).collect(Collectors.toList());
        return userResponseDtoList;

    }

    @Override
    public UserResponseDto createUser(UserRequestDto userRequestDto) {
        Optional<User> foundUser = this.userRepo.findByEmail(userRequestDto.getEmail());
        if (foundUser.isEmpty()) {
            User user = this.userReqDtoToUserEntity(userRequestDto);
            // Default role to USER if not provided
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }
            user.setPassword(authConfig.passwordEncoder().encode(user.getPassword()));
            User createdUser = userRepo.save(user);
            return this.userEntityToUserRespDto(createdUser);
        } else {
            // User already exists, throw an exception
            throw new UserAlreadyExistsException("User with email " + userRequestDto.getEmail() + " already exists");
        }
    }

    @Override
    public void deleteUser(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
        userRepo.delete(user);
    }

    public User getUserByIdEntity(Long id){
        return userRepo.findById(id).orElseThrow(()->new RuntimeException("User not found"));
    }

    // Admin method implementations
    @Override
    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepo.findAll(pageable);
        return userPage.map(this::userEntityToUserRespDto);
    }

    @Override
    public UserResponseDto getUserById(Long id) {
        User user = getUserByIdEntity(id);
        return userEntityToUserRespDto(user);
    }

    @Override
    public List<UserResponseDto> searchUsers(String email, String name, String role) {
        List<User> users = userRepo.findAll();
        
        return users.stream()
            .filter(user -> (email == null || user.getEmail().contains(email)))
            .filter(user -> (name == null || user.getName().contains(name)))
            .filter(user -> (role == null || user.getRole().equals(role)))
            .map(this::userEntityToUserRespDto)
            .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto updateUserRole(Long id, String role) {
        User user = getUserByIdEntity(id);
        user.setRole(role);
        User updatedUser = userRepo.save(user);
        return userEntityToUserRespDto(updatedUser);
    }

    @Override
    public UserResponseDto updateUserStatus(Long id, boolean enabled) {
        User user = getUserByIdEntity(id);
        // Since User doesn't have an enabled field, we'll need to add it
        // For now, we'll just return the user as is
        return userEntityToUserRespDto(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = getUserByIdEntity(id);
        userRepo.delete(user);
    }

    @Override
    public long getTotalUsersCount() {
        return userRepo.count();
    }

    @Override
    public Map<String, Long> getUserCountByRole() {
        List<User> users = userRepo.findAll();
        Map<String, Long> roleCount = new HashMap<>();
        
        for (User user : users) {
            roleCount.merge(user.getRole(), 1L, Long::sum);
        }
        
        return roleCount;
    }

    @Override
    public long getActiveUsersCount() {
        // Since we don't have an enabled field, return all users
        return userRepo.count();
    }

    @Override
    public long getRecentRegistrationsCount() {
        // Count users registered in the last 7 days
        // Since we don't have a createdAt field, return 0 for now
        return 0;
    }

    @Override
    public List<UserResponseDto> getRecentRegistrations(int days) {
        // Since we don't have a createdAt field, return empty list for now
        return List.of();
    }

    


    public User userReqDtoToUserEntity(UserRequestDto userReqDto){
        User user = this.modelMapper.map(userReqDto,User.class);
        return user;
    }
    public UserResponseDto userEntityToUserRespDto(User user){
        UserResponseDto userRespDto = this.modelMapper.map(user,UserResponseDto.class);
        return userRespDto;
    }

}
