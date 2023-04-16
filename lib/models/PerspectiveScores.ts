import ScoreCategory from "./ScoreCategory";

interface PerspectiveScores {
  summary: {
    [ScoreCategory.toxic]: number;
    [ScoreCategory.insult]: number;
    [ScoreCategory.profane]: number;
    [ScoreCategory.threat]: number;
  };

  spans: {
    [ScoreCategory.toxic]: {
      begin: number;
      end: number;
      score: number;
    }[];

    [ScoreCategory.insult]: {
      begin: number;
      end: number;
      score: number;
    }[];

    [ScoreCategory.profane]: {
      begin: number;
      end: number;
      score: number;
    }[];

    [ScoreCategory.threat]: {
      begin: number;
      end: number;
      score: number;
    }[];
  };
}

export default PerspectiveScores;
