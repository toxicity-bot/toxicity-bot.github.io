import Color from "colorjs.io";
import { useEffect, useState } from "react";

import styles from "@/styles/HeatMeter.module.scss";
import {
  IconDefinition,
  faFaceAngry,
  faFaceFrown,
  faFaceLaughBeam,
  faFaceMeh,
  faFaceMehBlank,
  faFaceSmile,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const WIDTH: number = parseInt(styles.width);
const HEIGHT: number = parseInt(styles.height);
const MIN_PERCENTAGE: number = WIDTH / HEIGHT;

interface HeatMeterProps {
  /** percentage as a decimal (0-1) */
  percentage: number | null;
}

export default function HeatMeter({ percentage }: HeatMeterProps): JSX.Element {
  if (percentage !== null && (percentage < 0 || percentage > 1)) {
    throw new Error("percentage must be between 0 and 1");
  }

  const fillHeight: string = (() => {
    if (percentage === null || percentage === 0) return "0";
    // The min percentage is needed to make the fill a circle.
    if (percentage < MIN_PERCENTAGE) return `${MIN_PERCENTAGE * 100}%`;
    return `${percentage * 100}%`;
  })();

  const icon: IconDefinition = (() => {
    if (percentage === null) return faFaceMehBlank;
    if (percentage <= 0.25) return faFaceLaughBeam;
    if (percentage <= 0.4) return faFaceSmile;
    if (percentage <= 0.6) return faFaceMeh;
    if (percentage <= 0.75) return faFaceFrown;
    return faFaceAngry;
  })();

  const [fillColor, setFillColor] = useState<string | null>(null);
  const [emojiColor, setEmojiColor] = useState<string | null>(null);

  /** Update colors when percentage changes.
   * This is needed because the colors are CSS variables, which can change.
   */
  useEffect(() => {
    const cssVars = getComputedStyle(document.documentElement);

    if (percentage === null) {
      const color = cssVars.getPropertyValue("--color-on-surface");
      setFillColor(color);
      setEmojiColor(color);
      return;
    }

    const startColor = new Color(cssVars.getPropertyValue("--color-heat-meter-start"));
    const endColor = new Color(cssVars.getPropertyValue("--color-heat-meter-end"));
    const colorRange = startColor.range(endColor);
    // Need to cast to Color b/c of a bug in colorjs.io
    let color = colorRange(percentage) as unknown as Color;
    setFillColor(color.toString());
    // Ensure proper readability contrast
    // const backgroundColor = new Color(cssVars.getPropertyValue("--color-surface"));
    color.hsl.l -= 15;
    setEmojiColor(color.toString());
  }, [percentage]);

  const percentString = percentage === null ? "%" : `${Math.trunc(percentage * 100)}%`;

  if (!fillColor || !emojiColor) return <></>;

  return (
    <div className={styles.container}>
      <FontAwesomeIcon className={styles.icon} icon={icon} color={emojiColor} />
      <div className={styles.borderWrapper}>
        <div className={styles.heatMeter}>
          <div
            className={styles.heatMeter__fill}
            style={{ backgroundColor: fillColor, height: fillHeight }}
          ></div>
        </div>
      </div>
      <div className={styles.score}>{percentString}</div>
    </div>
  );
}
