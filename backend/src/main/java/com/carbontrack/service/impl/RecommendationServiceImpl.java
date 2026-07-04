package com.carbontrack.service.impl;

import com.carbontrack.dto.RecommendationResponse;
import com.carbontrack.entity.ActivityCategory;
import com.carbontrack.repository.ActivityLogRepository;
import com.carbontrack.security.UserPrincipal;
import com.carbontrack.service.RecommendationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RecommendationServiceImpl implements RecommendationService {

    private final ActivityLogRepository activityLogRepository;

    public RecommendationServiceImpl(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public RecommendationResponse getRecommendations(UserPrincipal currentUser) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> categoryData = activityLogRepository.sumCo2eByCategory(currentUser.getId(), thirtyDaysAgo);

        if (categoryData.isEmpty()) {
            return RecommendationResponse.builder()
                    .highestCategory("NONE")
                    .categoryEmission(0.0)
                    .totalEmission(0.0)
                    .recommendationTips(Arrays.asList(
                            "Log your carbon activities regularly to get personalized reduction tips.",
                            "Set a weekly carbon reduction goal to start your green journey.",
                            "Join an organization to participate in community challenges."
                    ))
                    .build();
        }

        String highestCategoryName = "NONE";
        double highestCategoryEmission = 0.0;
        double totalEmission = 0.0;

        for (Object[] row : categoryData) {
            ActivityCategory category = (ActivityCategory) row[0];
            Double sum = (Double) row[1];
            totalEmission += sum;

            if (sum > highestCategoryEmission) {
                highestCategoryEmission = sum;
                highestCategoryName = category.name();
            }
        }

        List<String> tips = new ArrayList<>();
        switch (highestCategoryName) {
            case "TRANSPORT":
                tips.add("Transport represents your largest carbon source. Try switching from solo car driving to public transit, carpooling, or biking.");
                tips.add("For long distances, trains emit up to 80% less carbon than short-haul flights.");
                tips.add("Consider transitioning to an electric or hybrid vehicle for daily commutes.");
                break;
            case "FOOD":
                tips.add("Food is your leading footprint source. Beef and pork produce significantly higher carbon emissions than plant-based proteins.");
                tips.add("Try a 'Meatless Monday' or swap one animal-based meal per day for a vegan alternative.");
                tips.add("Buying local, seasonal produce reduces emissions associated with transportation and cold storage.");
                break;
            case "ELECTRICITY":
                tips.add("Electricity represents your largest emissions. Switch off appliances at the outlet when not in use to avoid phantom power draw.");
                tips.add("Install energy-efficient LED light bulbs and configure smart thermostats to save energy.");
                tips.add("If available, research green energy tariff options or solar panel installations for your home.");
                break;
            case "SHOPPING":
                tips.add("Shopping makes up the largest segment of your emissions. Extend the lifecycle of your clothes and electronics by buying high-quality or second-hand items.");
                tips.add("Avoid fast-fashion brands which carry high supply-chain carbon footprints.");
                tips.add("Apply the '30-day rule' before buying non-essential items to reduce impulse shopping emissions.");
                break;
            default:
                tips.add("Maintain your current sustainable choices!");
                tips.add("Challenge yourself by setting more ambitious reduction targets.");
                break;
        }

        return RecommendationResponse.builder()
                .highestCategory(highestCategoryName)
                .categoryEmission(Math.round(highestCategoryEmission * 100.0) / 100.0)
                .totalEmission(Math.round(totalEmission * 100.0) / 100.0)
                .recommendationTips(tips)
                .build();
    }
}
