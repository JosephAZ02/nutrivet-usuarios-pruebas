package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    boolean existsByCodeIgnoreCase(String code);

    List<Product> findByActiveFalse();

    boolean existsByCodeIgnoreCaseAndIdNot(String code, int id);

    List<Product> findByActiveTrue();

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    Optional<Product> findByCodeIgnoreCaseAndActiveTrue(String code);

    // Buscar por id bloqueando la fila hasta que termine la venta
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Product> findWithLockById(Integer id);
}
