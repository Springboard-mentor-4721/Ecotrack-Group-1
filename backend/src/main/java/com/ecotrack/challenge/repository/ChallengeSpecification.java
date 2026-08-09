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

    public static Specification<Challenge> exploreFilter(String search, com.ecotrack.challenge.enums.ChallengeEvaluationType evaluationType, TrackingMethod trackingMethod, Long userId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ChallengeStatus.ACTIVE));
            
            if (userId != null) {
                var subquery = query.subquery(Long.class);
                var subRoot = subquery.from(com.ecotrack.challenge.entity.ChallengeParticipant.class);
                subquery.select(subRoot.get("challenge").get("id"));
                subquery.where(cb.equal(subRoot.get("userId"), userId));
                
                predicates.add(cb.not(root.get("id").in(subquery)));
            }

            if (StringUtils.hasText(search)) {
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%")
                ));
            }
            if (evaluationType != null) {
                predicates.add(cb.equal(root.get("challengeEvaluationType"), evaluationType));
            }
            if (trackingMethod != null) {
                predicates.add(cb.equal(root.get("trackingMethod"), trackingMethod));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Challenge> filter(String search, ChallengeStatus status, TrackingMethod trackingMethod, com.ecotrack.challenge.enums.ChallengeEvaluationType evaluationType, Long categoryId) {
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
            if (evaluationType != null) {
                predicates.add(cb.equal(root.get("challengeEvaluationType"), evaluationType));
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
