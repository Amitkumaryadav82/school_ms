package com.school.fee.repository;

import com.school.fee.model.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {
    Optional<TransportRoute> findByRouteName(String routeName);

    boolean existsByRouteName(String routeName);
}