package com.nutrivet.backend.service;

import java.util.List;
import java.util.Optional;


import org.springframework.stereotype.Service;

import com.nutrivet.backend.domain.User;
import com.nutrivet.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Integer id) {
        return userRepository.findById(id);
    }

    public User add(User user) {
        return userRepository.save(user);
    }

    public void deleteById(Integer id) {
        userRepository.deleteById(id);
    }
}
