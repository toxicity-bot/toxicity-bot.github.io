import "react-tooltip/dist/react-tooltip.css";

import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";

import RangeInput from "@/lib/components/RangeInput";
import ColorLayer from "@/lib/models/ColorLayer";
import {
  AllScoreCategorySettings,
  ScoreCategory,
  ScoreCategoryStrings,
  SummaryScoreMode,
} from "@/lib/models/perspectiveScores";
import styles from "@/styles/components/QuickSettings.module.scss";
import { faCircleQuestion, faCog, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { enumToArray } from "../utils/enumManip";

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

const SCORE_CATEGORIES = enumToArray(ScoreCategory);

interface QuickSettingsProps {
  summaryScoreMode: SummaryScoreMode;
  handleSummaryScoreModeChange: (summaryScoreMode: SummaryScoreMode) => void;
  settings: AllScoreCategorySettings;
  handleScoreCategorySettingsChange: (settings: AllScoreCategorySettings) => void;
  threshold: number;
  handleDisplayThresholdChange: (threshold: number) => void;
  fakeSetAsDefault: () => void;
  handleReset: () => void;
}

export default function QuickSettings(props: QuickSettingsProps): JSX.Element {
  function onModeSwitch(event: React.ChangeEvent<HTMLInputElement>): void {
    const summaryScoreMode = event.currentTarget.checked
      ? SummaryScoreMode.weighted
      : SummaryScoreMode.highest;
    props.handleSummaryScoreModeChange(summaryScoreMode);
  }

  function onSettingChange(category: ScoreCategory, enabled: boolean, weight: number): void {
    // Prevent disabling all categories
    const isLastEnabled = Object.values(props.settings).filter((s) => s.enabled).length === 1;
    props.handleScoreCategorySettingsChange({
      ...props.settings,
      ...{ [category]: { enabled: isLastEnabled ? true : enabled, weight } },
    });
  }

  return (
    <div className={styles.mainContainer}>
      {/* Heading */}
      <div className={styles.heading}>
        <h2>
          <FontAwesomeIcon icon={faCog} />
          <span className={styles.heading__title}>Settings</span>
          <sup>
            <FontAwesomeIcon
              className={styles.heading__helpIcon}
              data-tooltip-id="help"
              data-tooltip-content='You can customize how your score above the meter is calculated. Select "Highest" to display the greatest negative score returned. To create your own weights, select "Weighted" and adjust the sliders.'
              icon={faCircleQuestion}
            />
          </sup>
          <Tooltip className={styles.heading__helpTooltip} id="help" place="right" />
        </h2>
      </div>

      {/* Toggle for summary score mode */}
      <div className={styles.scoreCalcModeGroup}>
        <span>Highest</span>

        {/* #TODO: Animated toggle */}
        <label className={styles.toggleSwitch}>
          <input
            type="checkbox"
            value={props.summaryScoreMode === SummaryScoreMode.weighted ? "on" : "off"}
            onChange={onModeSwitch}
          />
          <span className={styles["toggleSwitch__switch"]}></span>
        </label>

        <span>Weighted</span>
      </div>

      <div style={{ height: 15 }}></div>

      {/* Toggles and sliders for each score category */}
      <div className={styles.toggleSliders}>
        {SCORE_CATEGORIES.map((category) => {
          const settings = props.settings[category];
          return (
            <ToggleSlider
              key={category}
              id={category}
              label={ScoreCategoryStrings[category]}
              enabled={settings.enabled}
              value={settings.weight}
              onChange={onSettingChange}
            />
          );
        })}
      </div>

      <div style={{ height: 25 }}></div>

      <div className={styles.thresholdSliderBox}>
        <span>Score Threshold: {Math.round(props.threshold * 100)}</span>
        <RangeInput
          id={0} // #TODO: Rename id to something more appropriate
          value={props.threshold}
          colorLayer={ColorLayer.secondary}
          onChange={(_id, value) => {
            props.handleDisplayThresholdChange(value);
          }}
        />
      </div>

      <div style={{ height: 25 }}></div>

      {/* Reset button */}
      <button className="secondary" onClick={props.handleReset}>
        <FontAwesomeIcon icon={faRotate} /> Reset
      </button>
      <div style={{ height: 10 }}></div>
      <button className="secondary" onClick={props.fakeSetAsDefault}>
        <FontAwesomeIcon icon={faRotate} /> Restore to User Default
      </button>
      <div style={{ height: 10 }}></div>
      <button className="secondary">
        <FontAwesomeIcon icon={faRotate} /> Set as User Default
      </button>
    </div>
  );
}
