import { useEffect, useState } from "react";

import RangeInput from "@/lib/components/RangeInput";
import ColorLayer from "@/lib/models/ColorLayer";
import ScoreCategoriesSettings from "@/lib/models/ScoreCategoriesSettings";
import ScoreCategory, { ScoreCategoryStrings } from "@/lib/models/ScoreCategory";
import SummaryScoreMode from "@/lib/models/SummaryScoreMode";
import styles from "@/styles/components/QuickSettings.module.scss";
import { faCircleQuestion, faCog, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ToggleSliderProps = {
  id: number;
  label: string;
  enabled?: boolean;
  value?: number;
  min: number;
  max: number;
  step: number;
  onChange: (id: number, enabled: boolean, value: number) => void;
} & typeof defaultToggleSliderProps;

const defaultToggleSliderProps = {
  enabled: true,
  value: 0.5,
  min: 0,
  max: 1,
  step: 0.01,
};

function ToggleSlider(props: ToggleSliderProps): JSX.Element {
  const [toggleClass, setToggleClass] = useState(styles.toggleSlider);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let newClass = styles.toggleSlider;
    if (!props.enabled) newClass += ` ${styles["toggleSlider--disabled"]}`;
    if (pressed) newClass += ` ${styles["toggleSlider--pressed"]}`;
    setToggleClass(newClass);
  }, [props.enabled, pressed]);

  return (
    <div
      // Add disabled class if disabled
      className={toggleClass}
      onClick={() => props.onChange(props.id, !props.enabled, props.value)}
      onMouseDown={(event) => {
        // Disable text selection on double click
        if (event.detail > 1) event.preventDefault();
        setPressed(true);
      }}
      onMouseUp={() => setPressed(false)}
    >
      <span>{props.label}</span>

      <RangeInput
        id={props.id}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        colorLayer={ColorLayer.secondary}
        onChange={(id, value) => props.onChange(id, props.enabled, value)}
      />
    </div>
  );
}
ToggleSlider.defaultProps = defaultToggleSliderProps;

interface QuickSettingsProps {
  summaryScoreMode: SummaryScoreMode;
  handleSummaryScoreModeChange: (summaryScoreMode: SummaryScoreMode) => void;
  scoreCategoriesSettings: ScoreCategoriesSettings;
  handleScoreCategoriesSettingsChange: (scoreCategoriesSettings: ScoreCategoriesSettings) => void;
  handleReset: () => void;
}

export default function QuickSettings(props: QuickSettingsProps): JSX.Element {
  const scoreCategories = Object.keys(ScoreCategory)
    .filter((key) => isNaN(Number(key)))
    .map((key) => ScoreCategory[key as keyof typeof ScoreCategory]);

  function onToggleClick(event: React.ChangeEvent<HTMLInputElement>): void {
    const summaryScoreMode = event.currentTarget.checked
      ? SummaryScoreMode.weighted
      : SummaryScoreMode.highest;
    props.handleSummaryScoreModeChange(summaryScoreMode);
  }

  function onSliderChange(category: ScoreCategory, enabled: boolean, weight: number): void {
    props.handleScoreCategoriesSettingsChange({
      ...props.scoreCategoriesSettings,
      ...{ [category]: { enabled: enabled, weight: weight } },
    });
  }

  return (
    <div className={styles.mainContainer}>
      {/* Heading */}
      <h2 className={styles.heading}>
        <FontAwesomeIcon icon={faCog} /> Settings{" "}
        <sup>
          <small>
            {/* #TODO: Add hover functionality */}
            <FontAwesomeIcon className={styles["heading__helpMenu"]} icon={faCircleQuestion} />
          </small>
        </sup>
      </h2>

      {/* Toggle for summary score mode */}
      <div className={styles.scoreCalcModeGroup}>
        <span>Highest</span>

        {/* #TODO: Animated toggle */}
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            value={props.summaryScoreMode === SummaryScoreMode.weighted ? "on" : "off"}
            onChange={onToggleClick}
          />
          <span className={styles["toggleSwitch__switch"]}></span>
        </label>

        <span>Weighted</span>
      </div>

      <div style={{ height: 15 }}></div>

      {/* Toggles and sliders for each score category */}
      <div className={styles.toggleSliders}>
        {scoreCategories.map((category, _) => {
          const settings = props.scoreCategoriesSettings[category];
          return (
            <ToggleSlider
              key={category}
              id={category}
              label={ScoreCategoryStrings[category]}
              enabled={settings.enabled}
              value={settings.weight}
              onChange={onSliderChange}
            />
          );
        })}
      </div>

      <div style={{ height: 25 }}></div>

      {/* Reset button */}
      <button className="secondary" onClick={props.handleReset}>
        <FontAwesomeIcon icon={faRotate} /> Reset
      </button>
    </div>
  );
}
