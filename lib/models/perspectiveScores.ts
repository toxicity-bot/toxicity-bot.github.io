export default PerspectiveScores;

/** Score categories that Perspective calculates. */
export enum ScoreCategory {
  toxic,
  profane,
  threat,
  insult,
}
export const ScoreCategoryStrings = {
  [ScoreCategory.toxic]: "Toxic",
  [ScoreCategory.profane]: "Profane",
  [ScoreCategory.threat]: "Threat",
  [ScoreCategory.insult]: "Insult",
};

/** Model for Perspective API response. */
export interface PerspectiveScores {
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

export interface ScoreCategorySettings {
  enabled: boolean;
  weight: number;
}

export interface AllScoreCategorySettings {
  [ScoreCategory.toxic]: ScoreCategorySettings;
  [ScoreCategory.profane]: ScoreCategorySettings;
  [ScoreCategory.threat]: ScoreCategorySettings;
  [ScoreCategory.insult]: ScoreCategorySettings;
}

export enum SummaryScoreMode {
  highest,
  weighted,
}

export interface SummaryScore {
  score: number;
  category?: ScoreCategory;
}

export interface SummarySpanScore {
  begin: number;
  end: number;
  summaryScore: SummaryScore;
}

export interface SummaryScores {
  main: SummaryScore;
  spans: SummarySpanScore[];
}
