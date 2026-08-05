package com.ecotrack.challenge.repository;

import com.ecotrack.challenge.entity.Challenge;
import com.ecotrack.challenge.enums.ChallengeStatus;
import com.ecotrack.challenge.enums.TrackingMethod;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class ChallengeSpecification {

    public static Specification<Challenge> filter(String search, ChallengeStatus status, TrackingMethod trackingMethod, Long categoryId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (trackingMethod != null) {
                predicates.add(cb.equal(root.get("trackingMethod"), trackingMethod));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("linkedCategoryId"), categoryId));
            }

            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            if (predicates.size() == 1) {
                return predicates.get(0);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
