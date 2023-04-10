import RangeInput from "@/lib/components/RangeInput";
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
  function onClick(): void {
    props.onChange(props.id, !props.enabled, props.value);
  }

  return (
    <div
      // Add disabled class if disabled
      className={
        styles.toggleSlider + (props.enabled ? "" : ` ${styles["toggleSlider--disabled"]}`)
      }
      onClick={onClick}
      onMouseDown={event => {
        // Disable text selection on double click
        if (event.detail > 1) event.preventDefault();
      }}
    >
      <span>{props.label}</span>

      <RangeInput
        id={props.id}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        disabled={!props.enabled}
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
    .filter(key => isNaN(Number(key)))
    .map(key => ScoreCategory[key as keyof typeof ScoreCategory]);

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
      <h2>
        <FontAwesomeIcon icon={faCog} /> Settings <FontAwesomeIcon icon={faCircleQuestion} />
      </h2>

      {/* Toggle for summary score mode */}
      <div>
        <span>Highest</span>

        {/* #TODO: Animated toggle */}
        <input
          type="checkbox"
          value={props.summaryScoreMode === SummaryScoreMode.weighted ? "on" : "off"}
          onChange={onToggleClick}
        />

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
      <button onClick={props.handleReset}>
        <FontAwesomeIcon icon={faRotate} /> Reset
      </button>
    </div>
  );
}
