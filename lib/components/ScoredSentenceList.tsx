import { SummarySpanScore } from "@/lib/models/perspectiveScores";
import styles from "@/styles/ScoredSentenceList.module.scss";

interface ScoreTextZip {
  text: string;
  spanScore: SummarySpanScore;
}

interface ScoredSentenceListProps {
  text: string;
  spanScores: SummarySpanScore[];
  scoreThreshold: number;
  onMouseEnter?: (begin: number, end: number) => void;
  onMouseLeave?: (begin: number, end: number) => void;
  onClick?: (begin: number, end: number) => void;
}
export default function ScoredSentenceList(props: ScoredSentenceListProps): JSX.Element {
  const filteredSpanScores = props.spanScores.filter(
    (spanScore) => spanScore.summaryScore.score >= props.scoreThreshold
  );
  const filteredSentences: ScoreTextZip[] = filteredSpanScores.map((spanScore) => ({
    text: props.text.substring(spanScore.begin, spanScore.end),
    spanScore: spanScore,
  }));
  // Sort by score then by begin index
  filteredSentences.sort((a, b) => {
    if (a.spanScore.summaryScore.score == b.spanScore.summaryScore.score) {
      return a.spanScore.begin - b.spanScore.begin;
    }
    return b.spanScore.summaryScore.score - a.spanScore.summaryScore.score;
  });

  /** Convert a decimal score to a percentage string.
   * @param score A decimal score from 0 to 1
   * @returns A string in the format "XX%" where XX is the rounded percentage
   */
  function getPercentString(score: number): string {
    return Math.round(score * 100).toString() + "%";
  }

  return filteredSentences.length == 0 ? (
    <p>No toxic sentence! Good job!</p>
  ) : (
    <div className={styles.container}>
      {filteredSentences.map((scoreTextZip: ScoreTextZip) => (
        <button
          key={scoreTextZip.spanScore.begin}
          className={styles.sentence}
          onMouseEnter={() => props.onMouseEnter}
          onMouseLeave={() => props.onMouseLeave}
          onClick={() => props.onClick}
        >
          <div className={styles.sentence__percentage}>
            {getPercentString(scoreTextZip.spanScore.summaryScore.score)}
          </div>
          <div>{scoreTextZip.text}</div>
        </button>
      ))}
    </div>
  );
}
