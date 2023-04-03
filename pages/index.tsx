import Head from "next/head";
import { useState } from "react";

import { HeatMeter } from "@/lib/components/heatmeter";
import PerspectiveScores from "@/lib/models/PerspectiveScores";
import styles from "@/styles/Home.module.scss";

export default function Home() {
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [scores, setScores] = useState<PerspectiveScores | null>(null);
  const [userInput, setUserInput] = useState("");

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
  };

  /**
   * Get text to display for main score
   */
  const getMainScoreText = () => {
    if (scores === null) {
      return "Submit to see score";
    }
    // Get category and score of highest score
    const highestScore = Object.entries(scores.summary).reduce((a, b) => (a[1] > b[1] ? a : b));
    const category = highestScore[0];
    const score = highestScore[1];
    // Format score to percentage and round to 2 decimal places
    const scorePercentage = Math.round(score * 10000) / 100;
    return `${scorePercentage}% (${category})`;
  };

  return (
    <>
      <Head>
        <title>Toxicity Bot</title>
        <meta name="description" content="Reduce toxicity in your post with the power of AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Toxicity Bot</h1>

      <form>
        <span>Input text to test for toxicity:</span>
        <textarea
          rows={4}
          maxLength={15000}
          onChange={e => {
            e.preventDefault();
            setUserInput(e.target.value);
            setButtonEnabled(e.target.value !== "");
            console.log(e.target.value);
          }}
          value={userInput}
        />
        <div>
          <button
            onClick={e => {
              e.preventDefault();
              updateScore();
            }}
            disabled={!buttonEnabled}
          >
            Submit
          </button>
          <span>{getMainScoreText()}</span>
        </div>
      </form>

      {/* #FIXME: Add state for percentage */}
      <HeatMeter percentage={90} />
    </>
  );
}
