import ScoreCategory from "@/lib/models/ScoreCategory";
import ScoreCategorySettings from "@/lib/models/ScoreCategorySettings";

interface ScoreCategoriesSettings {
  [ScoreCategory.toxic]: ScoreCategorySettings;
  [ScoreCategory.profane]: ScoreCategorySettings;
  [ScoreCategory.threat]: ScoreCategorySettings;
  [ScoreCategory.insult]: ScoreCategorySettings;
}

export default ScoreCategoriesSettings;
