import styles from "@/styles/Suggestion.module.scss";
import CopyButton from "./CopyButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";

interface SuggestionProps {
  text: string | null;
}

export default function Suggestion({ text }: SuggestionProps): JSX.Element {
  return (
    <div className={styles.suggestion}>
      <h2 className={styles.heading}>
        <span className={styles.heading__title}>Suggested Revision</span>
        <sup>
          <FontAwesomeIcon
            className={styles.heading__helpIcon}
            data-tooltip-id="help"
            data-tooltip-content="Use AI to revise your text by clicking the request button below."
            icon={faCircleQuestion}
          />
        </sup>
        <Tooltip className={styles.heading__helpTooltip} id="help" place="right" />
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
