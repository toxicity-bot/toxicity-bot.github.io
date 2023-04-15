import Head from "next/head";
import { useState } from "react";

import HeatMeter from "@/lib/components/HeatMeter";
import QuickSettings from "@/lib/components/QuickSettings";
import ScoredSentenceList, { SentenceAndScore } from "@/lib/components/ScoredSentenceList";
import PerspectiveScores from "@/lib/models/PerspectiveScores";
import ScoreCategoriesSettings from "@/lib/models/ScoreCategoriesSettings";
import ScoreCategory from "@/lib/models/ScoreCategory";
import SummaryScoreMode from "@/lib/models/SummaryScoreMode";
import styles from "@/styles/Home.module.scss";

export default function Home() {
  const defaultScoreCategoriesSettings: ScoreCategoriesSettings = {
    [ScoreCategory.toxic]: { enabled: true, weight: 0.5 },
    [ScoreCategory.profane]: { enabled: true, weight: 0.5 },
    [ScoreCategory.threat]: { enabled: true, weight: 0.5 },
    [ScoreCategory.insult]: { enabled: true, weight: 0.5 },
  };

  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [scores, setScores] = useState<PerspectiveScores | null>(null);
  const [userInput, setUserInput] = useState("");
  const [sentencesAndScores, setSentencesAndScores] = useState<SentenceAndScore[]>([]);
  const [toxicityThreshold, setToxicityThreshold] = useState(40);
  const [summaryScoreMode, setSummaryScoreMode] = useState(SummaryScoreMode.highest);
  const [scoreCategoriesSettings, setScoreCategoriesSettings] = useState(
    defaultScoreCategoriesSettings
  );

  /**
   * Get scores from API
   */
  const updateScore = async () => {
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
    formatForSentencesAnalysis(scores);
    formatForSentencesAnalysis(scores);
  };

  function formatForSentencesAnalysis(scores: PerspectiveScores): any {
    let temp = [];
    for (let i = 0; i < scores.spans.insult.length; i++) {
      let toxicity = Math.trunc(
        Math.max(
          scores.spans.insult[i].score,
          scores.spans.profanity[i].score,
          scores.spans.threat[i].score,
          scores.spans.toxicity[i].score
        ) * 100
      );
      if (toxicity >= toxicityThreshold) {
        temp.push({
          text: userInput
            .substring(scores.spans.insult[i].begin, scores.spans.insult[i].end)
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

  function editInputText(original: string, suggestion: string) {
    console.log(original);
    console.log(suggestion);
    let temp: string = userInput.replace(original, suggestion);
    setUserInput(temp);
  }

  /**
   * Get text to display for main score
   */
  const getPercentage = () => {
    if (scores === null) {
      return 0;
    }
    const highestScore = Object.entries(scores.summary).reduce((a, b) => (a[1] > b[1] ? a : b));
    const category = highestScore[0];
    const score = highestScore[1];
    // Format score to percentage and round to 2 decimal places
    const scorePercentage = Math.round(score * 10000) / 100;
    return scorePercentage;
  };

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
            onChange={(e) => {
              e.preventDefault();
              setUserInput(e.target.value);
              setButtonEnabled(e.target.value !== "");
            }}
            value={userInput}
          />
          <div>
            <button
              className={styles.submitButton}
              onClick={(e) => {
                e.preventDefault();
                updateScore();
              }}
              disabled={!buttonEnabled}
            >
              Submit
            </button>
          </div>
        </form>

        {/* #FIXME: Add state for percentage */}
        <div className={styles.heatmeter}>
          <HeatMeter percentage={getPercentage()} />
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
