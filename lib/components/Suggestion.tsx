import styles from "@/styles/Suggestion.module.scss";
import CopyButton from "./CopyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

interface SuggestionProps {
  text: string | null;
}

export default function Suggestion({ text }: SuggestionProps): JSX.Element {
  return (
    <div className={styles.suggestion}>
      <h2 className={styles.heading}>
        Suggested Revision
        <sup>
          <small>
            {/* #TODO: Add hover functionality */}
            <FontAwesomeIcon className={styles["heading__helpMenu"]} icon={faCircleQuestion} />
          </small>
        </sup>
      </h2>
      <div className={styles.textBox}>
        <p className={styles.text}>
          {text}
        </p>
        {text && <CopyButton text={text} />}
      </div>
    </div>
  );
}
