package com.skt.user_service.repository;

import com.skt.user_service.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByKeycloakId(String keycloakId);
}