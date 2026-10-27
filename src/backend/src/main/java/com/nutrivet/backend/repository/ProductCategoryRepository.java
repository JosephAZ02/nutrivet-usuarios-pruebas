package com.nutrivet.backend.repository;

import com.nutrivet.backend.domain.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Integer> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, int id);
    List<ProductCategory> findByActiveTrue();

}
