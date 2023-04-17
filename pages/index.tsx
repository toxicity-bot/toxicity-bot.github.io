import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react";

import HeatMeter from "@/lib/components/HeatMeter";
import QuickSettings from "@/lib/components/QuickSettings";
import ScoredSentenceList from "@/lib/components/ScoredSentenceList";
import PerspectiveScores, {
  AllScoreCategorySettings,
  ScoreCategory,
  SummaryScoreMode,
  SummaryScores,
} from "@/lib/models/perspectiveScores";
import {
  calcAdjustedScoresHighest,
  calcAdjustedScoresWeighted,
} from "@/lib/utils/scoreCalculations";
import styles from "@/styles/Home.module.scss";
import Suggestion from "@/lib/components/Suggestion";

const DEFAULT_SCORE_THRESHOLD = 0.4;
const AUTO_FETCH_INTERVAL = 1000;
const DEFAULT_CATEGORY_SETTINGS: AllScoreCategorySettings = {
  [ScoreCategory.toxic]: { enabled: true, weight: 0.5 },
  [ScoreCategory.profane]: { enabled: true, weight: 0.5 },
  [ScoreCategory.threat]: { enabled: true, weight: 0.5 },
  [ScoreCategory.insult]: { enabled: true, weight: 0.5 },
};

export default function Home() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [userInput, setUserInput] = useState("");
  const [textFromLastUpdate, setTextFromLastUpdate] = useState("");
  const [suggestedEdit, setSuggestedEdit] = useState("")


  // Settings
  const [summaryScoreMode, setSummaryScoreMode] = useState(SummaryScoreMode.highest);
  const [allCategorySettings, setAllCategorySettings] = useState(DEFAULT_CATEGORY_SETTINGS);
  const [scoreThreshold, setScoreThreshold] = useState(DEFAULT_SCORE_THRESHOLD);

  // Scores
  const [scores, setScores] = useState<PerspectiveScores | null>(null);
  const [adjustedScores, setAdjustedScores] = useState<SummaryScores | null>(null);

  /** Get scores from API.
   * @modifies scores
   */
  const updateScore = useCallback(async () => {
    const text: string = textareaRef.current?.value ?? "";
    const response = await fetch("/api/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text }),
    });
    // data is PerspectiveScores interface or error
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      return;
    }
    const scores = data as PerspectiveScores;
    setScores(scores);
  }, []);

  /** Reset the quick settings to default values.
   * @modifies allCategorySettings, scoreThreshold
   */
  function resetQuickSettings() {
    setAllCategorySettings(DEFAULT_CATEGORY_SETTINGS);
    setScoreThreshold(DEFAULT_SCORE_THRESHOLD);
  }

  const updateSuggestion = async () => {
    const response = await fetch("/api/moderation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: userInput }),
    });
    // data is OpenAI suggested edit response or error
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      return;
    }
    const suggestionText = data["rewritten"];
    setSuggestedEdit(suggestionText);
  };

  /* Automatically fetch the score based on the interval if the text changes.
   * Sets: scores, textFromLastUpdate
   */
  useEffect(() => {
    const interval = setInterval(() => {
      // Use ref so interval isn't restarted when text changes
      const text = textareaRef.current?.value ?? "";
      if (text === "") {
        setScores(null);
        setTextFromLastUpdate("");
        return;
      }
      if (text === textFromLastUpdate) return;
      updateScore();
      setTextFromLastUpdate(text);
    }, AUTO_FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, [textFromLastUpdate, updateScore]);

  /* Calculate the adjusted scores
   * Sets: adjustedScores
   */
  useEffect(() => {
    if (scores === null) {
      setAdjustedScores(null);
      return;
    }
    if (summaryScoreMode === SummaryScoreMode.highest) {
      setAdjustedScores(calcAdjustedScoresHighest(scores, allCategorySettings));
    } else if (summaryScoreMode === SummaryScoreMode.weighted) {
      setAdjustedScores(calcAdjustedScoresWeighted(scores, allCategorySettings));
    } else {
      throw new Error("Invalid or unimplemented summary score mode");
    }
  }, [scores, summaryScoreMode, allCategorySettings]);

  return (
    <>
      <Head>
        <title>Toxicity Bot</title>
        <meta name="description" content="Reduce toxicity in your post with the power of AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.header}>Toxicity Bot</h1>

        <form className={styles.inputForm}>
          <input style={{ display: "none" }} autoComplete="off" hidden />
          <div>
            <span>Input text to test for toxicity:</span>
          </div>
          <textarea
            ref={textareaRef}
            className={styles.inputForm__textarea}
            maxLength={15000}
            onChange={(e) => setUserInput(e.currentTarget.value)}
            value={userInput}
          />
        </form>

        <div className={styles.heatmeter}>
          <HeatMeter percentage={adjustedScores?.main.score ?? null} />
        </div>

        <div className={styles.scores}>
          <ScoredSentenceList
            text={textFromLastUpdate}
            spanScores={adjustedScores?.spans ?? []}
            scoreThreshold={scoreThreshold}
          ></ScoredSentenceList>
        </div>

        <div className={styles.settings}>
          <QuickSettings
            summaryScoreMode={summaryScoreMode}
            handleSummaryScoreModeChange={(newSummaryScoreMode) =>
              setSummaryScoreMode(newSummaryScoreMode)
            }
            settings={allCategorySettings}
            handleScoreCategorySettingsChange={(newSettings) => setAllCategorySettings(newSettings)}
            threshold={scoreThreshold}
            handleDisplayThresholdChange={(newThreshold) => setScoreThreshold(newThreshold)}
            handleReset={resetQuickSettings}
          />
        </div>

        <div className={styles.suggestion}>
          <Suggestion text={suggestedEdit} />
          <button
            className={styles.submitButton}
            onClick={(e) => {
              e.preventDefault();
              updateSuggestion();
            }}
            disabled={!userInput}
          >
            Request
          </button>
        </div>
      </div>
    </>
  );
}
