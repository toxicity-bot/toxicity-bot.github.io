import PerspectiveScores, {
  AllScoreCategorySettings,
  ScoreCategory,
  SummaryScores,
  SummarySpanScore,
} from "@/lib/models/perspectiveScores";
import { enumToArray } from "./enumManip";

/** Filter the categories to only include the enabled ones and verify that at least one is enabled. */
function filterAndVerifyCategories(
  allScoreCategorySettings: AllScoreCategorySettings
): ScoreCategory[] {
  const enabledCategories: ScoreCategory[] = enumToArray(ScoreCategory).filter((category) => {
    return allScoreCategorySettings[category].enabled;
  });
  // Confirm that at least one category is enabled
  if (enabledCategories.length === 0) {
    throw new Error("No categories are enabled");
  }
  return enabledCategories;
}

/** Calculate the adjusted scores using the top score of the enabled categories. */
export function calcAdjustedScoresHighest(
  scores: PerspectiveScores,
  allScoreCategorySettings: AllScoreCategorySettings
): SummaryScores | null {
  if (scores === null) return null;

  const enabledCategories: ScoreCategory[] = filterAndVerifyCategories(allScoreCategorySettings);

  // Calculate the main score and category
  const [mainCategory, mainScore]: [ScoreCategory, number] = enabledCategories
    .map((category): [ScoreCategory, number] => [category, scores.summary[category]])
    .reduce((acc, curr) => (acc[1] > curr[1] ? acc : curr));

  // Calculate scores for each span
  // Every category has the same number of spans
  const numSpans = scores.spans[ScoreCategory.toxic].length;
  // Initialize an empty array of size numSpans
  const spanScores: (SummarySpanScore | null)[] = Array(numSpans).fill(null);
  // Iterate over each span
  for (let i = 0; i < numSpans; ++i) {
    // Get the highest score and its category for this span
    const [spanCategory, spanScore]: [ScoreCategory, number] = enabledCategories
      .map((category): [ScoreCategory, number] => [category, scores.spans[category][i].score])
      .reduce((acc, curr) => (acc[1] > curr[1] ? acc : curr));
    // Fill in the span score
    spanScores[i] = {
      begin: scores.spans[spanCategory][i].begin,
      end: scores.spans[spanCategory][i].end,
      summaryScore: {
        score: spanScore,
        category: spanCategory,
      },
    };
  }

  // Confirm that all spans have been filled
  if (spanScores.some((spanScore) => spanScore === null)) {
    throw new Error("Some spans were not filled");
  }
  return {
    main: {
      category: mainCategory,
      score: mainScore,
    },
    spans: spanScores as SummarySpanScore[],
  };
}

/** Calculate the adjusted scores using the weighted average of the categories. */
export function calcAdjustedScoresWeighted(
  scores: PerspectiveScores,
  allScoreCategorySettings: AllScoreCategorySettings
): SummaryScores | null {
  if (scores === null) return null;

  const enabledCategories: ScoreCategory[] = filterAndVerifyCategories(allScoreCategorySettings);

  // Calculate the cumulative weight
  const cumulativeWeight: number = enabledCategories
    .map((category): number => allScoreCategorySettings[category].weight)
    .reduce((acc, curr) => acc + curr, 0);

  // Calculate the main score
  const mainScore: number =
    enabledCategories
      .map((category): [ScoreCategory, number] => [category, scores.summary[category]])
      // Add the weighted scores and normalize by the cumulative weight
      .reduce((acc, curr) => {
        const [category, score] = curr;
        return acc + score * allScoreCategorySettings[category].weight;
      }, 0) / cumulativeWeight;

  // Calculate scores for each span
  // Every category has the same number of spans
  const numSpans = scores.spans[ScoreCategory.toxic].length;
  // Initialize an empty array of size numSpans
  const spanScores: (SummarySpanScore | null)[] = Array(numSpans).fill(null);
  // Iterate over each span
  for (let i = 0; i < numSpans; ++i) {
    // Get the weighted average score for this span
    const spanScore: number =
      enabledCategories
        .map((category): [ScoreCategory, number] => [category, scores.spans[category][i].score])
        // Add the weighted scores and normalize by the cumulative weight
        .reduce((acc, curr) => {
          const [category, score] = curr;
          return acc + score * allScoreCategorySettings[category].weight;
        }, 0) / cumulativeWeight;
    // Fill in the span score
    spanScores[i] = {
      begin: scores.spans[ScoreCategory.toxic][i].begin,
      end: scores.spans[ScoreCategory.toxic][i].end,
      summaryScore: {
        score: spanScore,
      },
    };
  }

  // Confirm that all spans have been filled
  if (spanScores.some((spanScore) => spanScore === null)) {
    throw new Error("Some spans were not filled");
  }
  return {
    main: {
      score: mainScore,
    },
    spans: spanScores as SummarySpanScore[],
  };
}
