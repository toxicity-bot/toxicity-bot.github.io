import Popup from "reactjs-popup";

import styles from "@/styles/ScoredSentenceList.module.scss";

export interface SentenceAndScore {
  text: string;
  percentage: number;
  suggestion: string;
}

interface textEnablePair {
  text: string;
  enabled: boolean;
}

export default function ScoredSentenceList(props: any) {
  let sentenceAndScores: SentenceAndScore[] = props.content;

  return sentenceAndScores.length == 0 ? (
    <div>
      <p>No toxic sentence! Good job!</p>
    </div>
  ) : (
    <div className={styles.box}>
      {sentenceAndScores.map((item: SentenceAndScore) => (
        <div key={item.text}>
          <p className={`${styles.inline} ${styles.percentageSign}`}>
            {item.percentage.toString() + "%"}
          </p>
          <p
            onClick={() => {
              props.callbackFunction(item.text);
            }}
            className={`${styles.inline} ${styles.sentence}`}
          >
            {item.text}
          </p>
          <Popup trigger={<button> Suggestions </button>} position="right center">
            <div className={`${styles.suggestionBox}`}>
              <p>{item.suggestion}</p>
            </div>
          </Popup>
        </div>
      ))}
    </div>
  );
}
