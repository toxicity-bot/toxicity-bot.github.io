enum ScoreCategory {
  toxic,
  profane,
  threat,
  insult,
}

const ScoreCategoryStrings = {
  [ScoreCategory.toxic]: "Toxic",
  [ScoreCategory.profane]: "Profane",
  [ScoreCategory.threat]: "Threat",
  [ScoreCategory.insult]: "Insult",
};

export default ScoreCategory;
export { ScoreCategoryStrings };
