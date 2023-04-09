import ScoreCategoriesSettings from "@/lib/models/ScoreCategoriesSettings";
import ScoreCategory from "@/lib/models/ScoreCategory";
import ScoreCategorySettings from "@/lib/models/ScoreCategorySettings";
import SummaryScoreMode from "@/lib/models/SummaryScoreMode";
import styles from "@/styles/components/QuickSettings.module.scss";
import { faCircleQuestion, faCog, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ToggleSliderProps = {
  category: ScoreCategory;
  label: string;
  min: number;
  max: number;
  step: number;
  settings: ScoreCategorySettings;
  onChange: (category: ScoreCategory, enabled: boolean, value: number) => void;
} & typeof defaultToggleSliderProps;

const defaultToggleSliderProps = {
  min: 0,
  max: 1,
  step: 0.01,
};

function ToggleSlider(props: ToggleSliderProps): JSX.Element {
  function onClick(): void {
    props.onChange(props.category, !props.settings.enabled, props.settings.weight);
  }

  function onSliderChange(event: React.ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    props.onChange(props.category, props.settings.enabled, Number(event.currentTarget.value));
  }

  return (
    <div
      // Add disabled class if disabled
      className={
        styles.toggleSlider + (props.settings.enabled ? "" : ` ${styles["toggleSlider--disabled"]}`)
      }
      onClick={onClick}
      onMouseDown={event => {
        // Disable text selection on double click
        if (event.detail > 1) event.preventDefault();
      }}
    >
      <span>{props.label}</span>

      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.settings.weight}
        onChange={onSliderChange}
        onClick={event => {
          // Prevent click event from bubbling up to parent
          event.stopPropagation();
        }}
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
        <label className={styles.toggle}>
          <input
            type="checkbox"
            value={props.summaryScoreMode === SummaryScoreMode.weighted ? "on" : "off"}
            onChange={onToggleClick}
          />
        </label>

        <span>Weighted</span>
      </div>

      <div style={{ height: 15 }}></div>

      {/* Toggles and sliders for each score category */}
      <div className={styles.toggleSliders}>
        <ToggleSlider
          label="Toxic"
          category={ScoreCategory.toxic}
          settings={props.scoreCategoriesSettings[ScoreCategory.toxic]}
          onChange={onSliderChange}
        />
        <ToggleSlider
          label="Profane"
          category={ScoreCategory.profane}
          settings={props.scoreCategoriesSettings[ScoreCategory.profane]}
          onChange={onSliderChange}
        />
        <ToggleSlider
          label="Threat"
          category={ScoreCategory.threat}
          settings={props.scoreCategoriesSettings[ScoreCategory.threat]}
          onChange={onSliderChange}
        />
        <ToggleSlider
          label="Insult"
          category={ScoreCategory.insult}
          settings={props.scoreCategoriesSettings[ScoreCategory.insult]}
          onChange={onSliderChange}
        />
      </div>

      <div style={{ height: 25 }}></div>

      {/* Reset button */}
      <button onClick={props.handleReset}
      className={styles.button}>
        <FontAwesomeIcon icon={faRotate} /> Reset
      </button>
    </div>
  );
}
