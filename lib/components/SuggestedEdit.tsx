import styles from "@/styles/HeatMeter.module.scss";
import CopyButton from "./CopyButton";

interface SuggestedEditProps {
  text: string | null;
}

export default function SuggestedEdit({ text }: SuggestedEditProps): JSX.Element {
  return (
    <div className={styles.box}>
      <p className={styles.text}>{text}</p>
      <CopyButton text={text} />
    </div>
  );
}
