import styles from "@/styles/ScoredSentenceList.module.scss";

export interface SentenceAndScore {
  text: string;
  percentage: number;
}

export default function ScoredSentenceList(props: any) {
  const sentenceAndScores: SentenceAndScore[] = props.content;

  return sentenceAndScores.length == 0 ? (
    <div>
      <p>No toxic sentence! Good job!</p>
    </div>
  ) : (
    <div>
      {sentenceAndScores.map((item: SentenceAndScore) => (
        <div key={item.text} className={styles.individualItem}>
          <p className={`${styles.inline} ${styles.percentageSign}`} id={styles.pctg}>
            {/* Convert from decimal to percentage and round */}
            {Math.round(item.percentage * 100).toString() + "%"}
          </p>
          <p
            onClick={() => {
              props.callbackFunction(item.text);
            }}
            className={`${styles.inline} ${styles.sentence}`}
          >
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}
