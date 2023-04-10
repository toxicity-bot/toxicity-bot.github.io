import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const editQuery = (text: string, target: string, n: number) => (`Provide ${n} editing suggestions which make the indicated sentence less toxic within the context of the included text.

sentence: ${target}
text: ${text}

Provide your response in the following JSON format:
{
    <SpanText>: <SuggestedChange>,
}

where <SpanText> is the original sentence text and <SuggestedChange> is the suggested edited version that reduces toxicity.
`)

const parseResponseText = (responseText: string) => JSON.parse(responseText.trim())

async function getEditSuggestions(text: string, span: Span, n = 1) {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: editQuery(text, getTextSpan(text, span), n),
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
import { getTextSpan } from "@/lib/spans";
import { Span } from "@/lib/models/Span";

type Data = {
  name: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ name: "John Doe" });
}
