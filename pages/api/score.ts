// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

import PerspectiveScores, { ScoreCategory } from "@/lib/models/perspectiveScores";

const API_KEY = "AIzaSyCZpPWR-zsuAHsdYrhVR1i0Qhr9Wc21FiY";
const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";

interface ExpectedClient {
  comments: {
    analyze: (params: unknown, callback: (err: unknown, response: unknown) => void) => void;
  };
}

let client: Readonly<ExpectedClient>;
(async () => (client = await google.discoverAPI(DISCOVERY_URL)))();

/**
 * @param timeout Amount of time in milliseconds to wait before timing out.
 */
function waitForClientOrTimeout(timeout: number): Promise<Readonly<ExpectedClient>> {
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

interface ExpectedPerspectiveApiResponse {
  attributeScores: {
    [key: string]: {
      spanScores: {
        [key: string]: {
          begin: number;
          end: number;
          score: {
            value: number;
          };
        };
      };
      summaryScore: {
        value: number;
      };
    };
  };
}

/**
 * @throws Error if data isn't in the expected format.
 */
function parsePerspectiveApi(data: unknown): PerspectiveScores {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data");
  }

  const expectedData = data as ExpectedPerspectiveApiResponse;

  function getSpans(attribute: string) {
    const spans = expectedData.attributeScores[attribute].spanScores;
    return Object.keys(spans).map((key) => {
      const span = spans[key];
      return {
        begin: span.begin,
        end: span.end,
        score: span.score.value,
      };
    });
  }

  return {
    summary: {
      [ScoreCategory.toxic]: expectedData.attributeScores.TOXICITY.summaryScore.value,
      [ScoreCategory.insult]: expectedData.attributeScores.INSULT.summaryScore.value,
      [ScoreCategory.profane]: expectedData.attributeScores.PROFANITY.summaryScore.value,
      [ScoreCategory.threat]: expectedData.attributeScores.THREAT.summaryScore.value,
    },
    spans: {
      [ScoreCategory.toxic]: getSpans("TOXICITY"),
      [ScoreCategory.insult]: getSpans("INSULT"),
      [ScoreCategory.profane]: getSpans("PROFANITY"),
      [ScoreCategory.threat]: getSpans("THREAT"),
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
      (err: unknown, response: unknown) => {
        /* eslint-disable */
        if (err) {
          console.error(err);
          res.status(500).end(err.message); // Server error
          return;
        }
        try {
          res.status(200).json(parsePerspectiveApi(response.data));
        } catch (error) {
          if (error instanceof Error) {
            console.error(error);
            res.status(500).end(error.message); // Server error
          }
        }
        /* eslint-enable */
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      res.status(500).end(error.message); // Server error
    }
  }
}
