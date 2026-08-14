package com.ecotrack.user.repository;

import com.ecotrack.user.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {
    List<UserInterest> findByUser_Id(Long userId);
    void deleteByUser_Id(Long userId);
}
