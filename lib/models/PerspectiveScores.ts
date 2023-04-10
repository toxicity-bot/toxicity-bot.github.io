import { Span } from "./Span";

interface SpanWithScore extends Span {
  score: number;
}

export default interface PerspectiveScores {
  summary: {
    toxicity: number;
    insult: number;
    profanity: number;
    threat: number;
  };

  spans: {
    toxicity: SpanWithScore[];
    insult: SpanWithScore[];
    profanity: SpanWithScore[];
    threat: SpanWithScore[];
  };
}
