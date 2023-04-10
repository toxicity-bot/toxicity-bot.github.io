import { Span } from "./Span";



export default interface Suggestion {
  target: Span;
  text: string;
}
