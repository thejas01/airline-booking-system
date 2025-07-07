package com.thejas.user_service.model;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table (name = "userDb")

public class User implements UserDetails {
    @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        private long id;
        private String name;

        @Column(unique = true,nullable = false)
        private String email;
        private String password;
        private String role;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role));
    }
    @Override
    public String getUsername() {
        return this.email;
    }
    @Override
    public boolean isAccountNonExpired() {
            return true;
    }

    @Override
    public boolean isAccountNonLocked() {
            return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
            return true;
    }

    @Override
    public boolean isEnabled() {
            return true;
    }
}
