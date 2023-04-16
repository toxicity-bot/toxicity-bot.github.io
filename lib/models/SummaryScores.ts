import ScoreCategory from "./ScoreCategory";

interface SummaryScores {
  main: {
    score: number;
    category?: ScoreCategory;
  };
  spans: {
    begin: number;
    end: number;
    score: number;
    category?: ScoreCategory;
  }[];
}

export default SummaryScores;
