export default interface PerspectiveScores {
  summary: {
    toxicity: number;
    insult: number;
    profanity: number;
    threat: number;
  };

  spans: {
    toxicity: {
      begin: number;
      end: number;
      score: number;
    }[];

    insult: {
      begin: number;
      end: number;
      score: number;
    }[];

    profanity: {
      begin: number;
      end: number;
      score: number;
    }[];

    threat: {
      begin: number;
      end: number;
      score: number;
    }[];
  };
}
