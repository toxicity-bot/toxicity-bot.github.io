// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

import PerspectiveScores from "@/lib/models/PerspectiveScores";
import ScoreCategory from "@/lib/models/ScoreCategory";

const API_KEY = "AIzaSyCZpPWR-zsuAHsdYrhVR1i0Qhr9Wc21FiY";
const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

let client: Readonly<any> | undefined;
(async () => (client = await google.discoverAPI(DISCOVERY_URL)))();

/**
 * @param timout Amount of time in milliseconds to wait before timing out.
 */
function waitForClientOrTimeout(timeout: number): Promise<Readonly<any>> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    function checkGlobalVariable() {
      if (client !== undefined) {
        resolve(client);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Timeout (${timeout}ms) exceeded while waiting for client to resolve`));
      } else {
        setTimeout(checkGlobalVariable, 100);
      }
    }

    checkGlobalVariable();
  });
}

function parsePerspectiveApi(data: any): PerspectiveScores {
  const spans = (attribute: string) => {
    const spans = data.attributeScores[attribute].spanScores;
    return Object.keys(spans).map((key) => {
      const span = spans[key];
      return {
        begin: span.begin,
        end: span.end,
        score: span.score.value,
      };
    });
  };

  return {
    summary: {
      [ScoreCategory.toxic]: data.attributeScores.TOXICITY.summaryScore.value,
      [ScoreCategory.insult]: data.attributeScores.INSULT.summaryScore.value,
      [ScoreCategory.profane]: data.attributeScores.PROFANITY.summaryScore.value,
      [ScoreCategory.threat]: data.attributeScores.THREAT.summaryScore.value,
    },
    spans: {
      [ScoreCategory.toxic]: spans("TOXICITY"),
      [ScoreCategory.insult]: spans("INSULT"),
      [ScoreCategory.profane]: spans("PROFANITY"),
      [ScoreCategory.threat]: spans("THREAT"),
    },
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PerspectiveScores>
) {
  try {
    const client = await waitForClientOrTimeout(5000);

    const { method } = req;

    if (method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      return;
    }

    // Get text parameter from body
    const { text } = req.body;
    // If text is empty, return 400
    if (!text) {
      res.status(400).end("Text parameter is required");
      return;
    }

    // Perspective API request body
    const analyzeRequest = {
      comment: {
        text: text,
      },
      requestedAttributes: {
        TOXICITY: {},
        INSULT: {},
        PROFANITY: {},
        THREAT: {},
      },
      spanAnnotations: true,
    };

    // Call Perspective API
    client.comments.analyze(
      {
        key: API_KEY,
        resource: analyzeRequest,
      },
      // Handle response or error
      (err: any, response: any) => {
        if (err) {
          console.error(err);
          res.status(500).end(err.message); // Server error
          return;
        }
        res.status(200).json(parsePerspectiveApi(response.data));
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500); // Server error
  }
}
