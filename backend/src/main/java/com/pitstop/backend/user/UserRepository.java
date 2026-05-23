package com.pitstop.backend.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data-access for {@link User}. Spring Data JPA implements these methods at runtime
 * from their names -- no SQL needed here.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
