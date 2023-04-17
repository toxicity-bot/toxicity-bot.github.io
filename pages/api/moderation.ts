import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const editQuery = (text: string) => (`Rewrite the following text, removing any profanity, toxicity, insulting and/or threatening language.

text: ${text}


Provide your response in the following JSON format:
{
    "rewritten": <RewrittenText>
}

where <RewrittenText> is the rewritten version.
`)

const parseResponseText = (responseText: string) => JSON.parse(responseText.trim())

async function getEditSuggestion(text: string) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: editQuery(text),
    temperature: 0,
    max_tokens: 150,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    stop: ["You:"],
  })

  const responseText = response.data.choices[0].text

  console.info(response.data.choices[0].text)

  if (responseText) {
    return parseResponseText(responseText)
  } else {
    throw "response had no text"
  }
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  rewritten: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  console.info(`[moderation] Received request with text: ${req.body["text"]}`)
  res.status(200).json(await getEditSuggestion(req.body["text"]));
}
