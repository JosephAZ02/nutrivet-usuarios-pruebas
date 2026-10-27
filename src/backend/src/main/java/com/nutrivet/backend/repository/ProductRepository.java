package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.Product;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, int id);
    List<Product> findByActiveTrue();

     // Buscar por código de barras (coincidencia exacta)
    List<Product> findByCode(String code);

    // Buscar por nombre (contiene el texto, sin distinguir mayúsculas)
    List<Product> findByNameContainingIgnoreCase(String name);

    // Buscar por id bloqueando la fila hasta que termine la venta
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Product> findWithLockById(Integer id);
}
