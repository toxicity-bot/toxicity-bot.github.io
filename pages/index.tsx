import Head from "next/head";
import { useCallback, useEffect, useState } from "react";

import HeatMeter from "@/lib/components/HeatMeter";
import QuickSettings from "@/lib/components/QuickSettings";
import ScoredSentenceList, { SentenceAndScore } from "@/lib/components/ScoredSentenceList";
import PerspectiveScores from "@/lib/models/PerspectiveScores";
import ScoreCategoriesSettings from "@/lib/models/ScoreCategoriesSettings";
import ScoreCategory from "@/lib/models/ScoreCategory";
import SummaryScoreMode from "@/lib/models/SummaryScoreMode";
import SummaryScores from "@/lib/models/SummaryScores";
import styles from "@/styles/Home.module.scss";

const AUTO_FETCH_INTERVAL = 500;

export default function Home() {
  const defaultScoreCategoriesSettings: ScoreCategoriesSettings = {
    [ScoreCategory.toxic]: { enabled: true, weight: 0.5 },
    [ScoreCategory.profane]: { enabled: true, weight: 0.5 },
    [ScoreCategory.threat]: { enabled: true, weight: 0.5 },
    [ScoreCategory.insult]: { enabled: true, weight: 0.5 },
  };

  const [userInput, setUserInput] = useState("");
  const [textFromLastUpdate, setTextFromLastUpdate] = useState("");

  // Settings
  const [summaryScoreMode, setSummaryScoreMode] = useState(SummaryScoreMode.highest);
  const [scoreCategoriesSettings, setScoreCategoriesSettings] = useState(
    defaultScoreCategoriesSettings
  );
  const [toxicityThreshold, setToxicityThreshold] = useState(40);

  // Scores
  const [scores, setScores] = useState<PerspectiveScores | null>(null);
  const [adjustedScores, setAdjustedScores] = useState<SummaryScores | null>(null);
  const [sentencesAndScores, setSentencesAndScores] = useState<SentenceAndScore[]>([]);

  useEffect(() => {
    formatForSentencesAnalysis(scores);
  }, [scoreCategoriesSettings, summaryScoreMode]);

  /** Get scores from API. */
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

  const formatForSentencesAnalysis = useCallback((scores: PerspectiveScores | null) => {
    if (scores) {
      let temp = [];
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
          toxicity = Math.trunc(getWeightedScores(scores.spans[ScoreCategory.toxic][i].score, scores.spans[ScoreCategory.profane][i].score, scores.spans[ScoreCategory.insult][i].score, scores.spans[ScoreCategory.threat][i].score) * 100);
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
      var out = temp.reduce(function (p: any, c: any) {
        if (
          !p.some(function (el: any) {
            return el.text === c.text;
          })
        )
          p.push(c);
        return p;
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
  }, [toxicityThreshold, textFromLastUpdate]);

  function editInputText(original: string, suggestion: string) {
    let temp: string = userInput.replace(original, suggestion);
    setUserInput(temp);
  }

  function getWeightedScores(toxicScore: number, profaneScore: number, insultScore: number, threatScore: number): number {
    var sumWeight = 0, out = 0;
    sumWeight += scoreCategoriesSettings[ScoreCategory.toxic].enabled ? scoreCategoriesSettings[ScoreCategory.toxic].weight : 0; 
    sumWeight += scoreCategoriesSettings[ScoreCategory.profane].enabled ? scoreCategoriesSettings[ScoreCategory.profane].weight : 0; 
    sumWeight += scoreCategoriesSettings[ScoreCategory.insult].enabled ? scoreCategoriesSettings[ScoreCategory.insult].weight : 0; 
    sumWeight += scoreCategoriesSettings[ScoreCategory.threat].enabled ? scoreCategoriesSettings[ScoreCategory.threat].weight : 0; 
    out += scoreCategoriesSettings[ScoreCategory.toxic].enabled ? toxicScore * (scoreCategoriesSettings[ScoreCategory.toxic].weight / sumWeight) : 0;
    out += scoreCategoriesSettings[ScoreCategory.profane].enabled ? profaneScore * (scoreCategoriesSettings[ScoreCategory.profane].weight / sumWeight) : 0;
    out += scoreCategoriesSettings[ScoreCategory.insult].enabled ? insultScore * (scoreCategoriesSettings[ScoreCategory.insult].weight / sumWeight) : 0;
    out += scoreCategoriesSettings[ScoreCategory.threat].enabled ? threatScore * (scoreCategoriesSettings[ScoreCategory.threat].weight / sumWeight) : 0;
    return out;
  }

  const getPercentage = () => {
    if (scores === null) {
      return null;
    }
    var score, _;
    if (summaryScoreMode == SummaryScoreMode.highest) {
      [_, score] = Object.entries(scores.summary).reduce((a, b) => (a[1] > b[1] ? a : b));
    } else {
      score = getWeightedScores(scores.summary[ScoreCategory.toxic], scores.summary[ScoreCategory.profane], scores.summary[ScoreCategory.insult], scores.summary[ScoreCategory.threat]);
    }
    return score;
  };

  /** Automatically fetch the score every second if the text changes. */
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
    // #FIXME: Check settings

    // Calculate the main score
    const [mainCategory, mainScore]: [ScoreCategory, number] = Object.entries(scores.summary)
      .map(([category, score]: [string, number]): [ScoreCategory, number] => [
        ScoreCategory[category as keyof typeof ScoreCategory],
        score,
      ])
      .reduce((prev, curr) => (prev[1] > curr[1] ? prev : curr));

    // Calculate scores for each span
    const numSpans = scores.spans[ScoreCategory.toxic].length;

    // Initialize an empty array of size numSpans
    const spanScores: {
      begin: number;
      end: number;
      score: number;
      category?: ScoreCategory;
    }[] = Array(numSpans).fill(null);

    // #FIXME: Fill in the array with the scores

    setAdjustedScores({
      main: {
        category: mainCategory,
        score: mainScore,
      },
      spans: spanScores,
    });
  }, [scores, summaryScoreMode, scoreCategoriesSettings]);

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
            className={styles["inputForm__textarea"]}
            maxLength={15000}
            onInput={(e) => {
              setUserInput(e.currentTarget.value);
            }}
            value={userInput}
          />
        </form>

        {/* #FIXME: Add state for percentage */}
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
            scoreCategoriesSettings={scoreCategoriesSettings}
            handleScoreCategoriesSettingsChange={(newScoreCategoriesSettings) =>
              setScoreCategoriesSettings(newScoreCategoriesSettings)
            }
            handleReset={() => setScoreCategoriesSettings(defaultScoreCategoriesSettings)}
          />
        </div>
      </div>
    </>
  );
}
