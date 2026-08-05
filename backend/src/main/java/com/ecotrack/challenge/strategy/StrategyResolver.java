package com.ecotrack.challenge.strategy;

import com.ecotrack.challenge.enums.ChallengeEvaluationType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class StrategyResolver {

    private final Map<ChallengeEvaluationType, ChallengeEvaluationStrategy> strategyMap;

    public StrategyResolver(List<ChallengeEvaluationStrategy> strategies) {
        this.strategyMap = new EnumMap<>(ChallengeEvaluationType.class);
        for (ChallengeEvaluationType type : ChallengeEvaluationType.values()) {
            strategies.stream()
                    .filter(s -> s.supports(type))
                    .findFirst()
                    .ifPresent(s -> strategyMap.put(type, s));
        }
    }

    public ChallengeEvaluationStrategy resolve(ChallengeEvaluationType type) {
        if (type == null) {
            type = ChallengeEvaluationType.ACHIEVEMENT;
        }
        ChallengeEvaluationStrategy strategy = strategyMap.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("No strategy found for type: " + type);
        }
        return strategy;
    }
}
