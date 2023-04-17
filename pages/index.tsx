import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import HeatMeter from "@/lib/components/HeatMeter";
import QuickSettings from "@/lib/components/QuickSettings";
import ScoredSentenceList, { SentenceAndScore } from "@/lib/components/ScoredSentenceList";
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

const AUTO_FETCH_INTERVAL = 500;
const DEFAULT_CATEGORY_SETTINGS: AllScoreCategorySettings = {
  [ScoreCategory.toxic]: { enabled: true, weight: 0.5 },
  [ScoreCategory.profane]: { enabled: true, weight: 0.5 },
  [ScoreCategory.threat]: { enabled: true, weight: 0.5 },
  [ScoreCategory.insult]: { enabled: true, weight: 0.5 },
};

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [textFromLastUpdate, setTextFromLastUpdate] = useState("");

  // Settings
  const [summaryScoreMode, setSummaryScoreMode] = useState(SummaryScoreMode.highest);
  const [allCategorySettings, setAllCategorySettings] = useState(DEFAULT_CATEGORY_SETTINGS);
  const [toxicityThreshold] = useState(40);

  // Scores
  const [scores, setScores] = useState<PerspectiveScores | null>(null);
  const [adjustedScores, setAdjustedScores] = useState<SummaryScores | null>(null);
  const [sentencesAndScores, setSentencesAndScores] = useState<SentenceAndScore[]>([]);

  /** Get scores from API.
   * @modifies scores
   */
  const updateScore = useCallback(async () => {
    const response = await fetch("/api/score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: userInput }),
    });
    // data is PerspectiveScores interface or error
    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      return;
    }
    const scores = data as PerspectiveScores;
    setScores(scores);
  }, [userInput]);

  const formatForSentencesAnalysis = useCallback(
    (scores: PerspectiveScores | null) => {
      if (scores) {
        const temp = [];
        for (let i = 0; i < scores.spans[ScoreCategory.toxic].length; i++) {
          let toxicity;
          if (summaryScoreMode === SummaryScoreMode.highest) {
            toxicity = Math.trunc(
              Math.max(
                scores.spans[ScoreCategory.toxic][i].score,
                scores.spans[ScoreCategory.profane][i].score,
                scores.spans[ScoreCategory.insult][i].score,
                scores.spans[ScoreCategory.threat][i].score
              ) * 100
            );
          } else {
            toxicity = Math.trunc(
              getWeightedScores(
                scores.spans[ScoreCategory.toxic][i].score,
                scores.spans[ScoreCategory.profane][i].score,
                scores.spans[ScoreCategory.insult][i].score,
                scores.spans[ScoreCategory.threat][i].score
              ) * 100
            );
          }
          if (toxicity >= toxicityThreshold) {
            temp.push({
              text: textFromLastUpdate
                .substring(
                  scores.spans[ScoreCategory.toxic][i].begin,
                  scores.spans[ScoreCategory.toxic][i].end
                )
                .trim(),
              percentage: toxicity,
              suggestion: "Kimi",
            });
          }
        }
        // get rid of duplicate texts
        const out = temp.reduce(function (p, c) {
          /* eslint-disable */
          if (
            !p.some(function (el) {
              return el.text === c.text;
            })
          )
            p.push(c);
          return p;
          /* eslint-enable */
        }, []);
        // sort by percentage
        out.sort(function (left: SentenceAndScore, right: SentenceAndScore): number {
          if (left.percentage < right.percentage) {
            return 1;
          }
          if (left.percentage > right.percentage) {
            return -1;
          }
          return 0;
        });
        setSentencesAndScores(out);
      }
    },
    [toxicityThreshold, textFromLastUpdate]
  );

  function editInputText(original: string, suggestion: string) {
    const temp: string = userInput.replace(original, suggestion);
    setUserInput(temp);
  }

  function getWeightedScores(
    toxicScore: number,
    profaneScore: number,
    insultScore: number,
    threatScore: number
  ): number {
    let sumWeight = 0,
      out = 0;
    sumWeight += allCategorySettings[ScoreCategory.toxic].enabled
      ? allCategorySettings[ScoreCategory.toxic].weight
      : 0;
    sumWeight += allCategorySettings[ScoreCategory.profane].enabled
      ? allCategorySettings[ScoreCategory.profane].weight
      : 0;
    sumWeight += allCategorySettings[ScoreCategory.insult].enabled
      ? allCategorySettings[ScoreCategory.insult].weight
      : 0;
    sumWeight += allCategorySettings[ScoreCategory.threat].enabled
      ? allCategorySettings[ScoreCategory.threat].weight
      : 0;
    out += allCategorySettings[ScoreCategory.toxic].enabled
      ? toxicScore * (allCategorySettings[ScoreCategory.toxic].weight / sumWeight)
      : 0;
    out += allCategorySettings[ScoreCategory.profane].enabled
      ? profaneScore * (allCategorySettings[ScoreCategory.profane].weight / sumWeight)
      : 0;
    out += allCategorySettings[ScoreCategory.insult].enabled
      ? insultScore * (allCategorySettings[ScoreCategory.insult].weight / sumWeight)
      : 0;
    out += allCategorySettings[ScoreCategory.threat].enabled
      ? threatScore * (allCategorySettings[ScoreCategory.threat].weight / sumWeight)
      : 0;
    return out;
  }

  /** Automatically fetch the score based on the interval if the text changes. */
  useEffect(() => {
    const interval = setInterval(() => {
      if (userInput === "") {
        setScores(null);
        setTextFromLastUpdate("");
        return;
      }
      if (userInput === textFromLastUpdate) return;
      updateScore();
      setTextFromLastUpdate(userInput);
    }, AUTO_FETCH_INTERVAL);
    return () => clearInterval(interval);
  });

  /** Calculate the adjusted scores */
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

  // #FIXME: Use adjustedScores instead of scores
  /** Recalculate sentence scores automatically. */
  useEffect(() => {
    if (scores === null) return;
    formatForSentencesAnalysis(scores);
  }, [formatForSentencesAnalysis, scores, toxicityThreshold]);

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
            content={sentencesAndScores}
            callbackFunction={editInputText}
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
            handleReset={() => setAllCategorySettings(DEFAULT_CATEGORY_SETTINGS)}
          />
        </div>
      </div>
    </>
  );
}
