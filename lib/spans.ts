import { Span } from "./models/Span";

export const getTextSpan = (text: string, span: Span) => text.substring(span.begin, span.end)

export const spanId = (span: Span) => `${span.begin}-${span.end}`
