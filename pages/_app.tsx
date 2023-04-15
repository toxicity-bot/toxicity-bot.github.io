import "@/styles/globals.scss";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Jost } from "next/font/google";

import { config } from "@fortawesome/fontawesome-svg-core";

import type { AppProps } from "next/app";

config.autoAddCss = false;

// If loading a variable font, you don't need to specify the font weight
const jostFont = Jost({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={jostFont.className}>
      <Component {...pageProps} />
    </main>
  );
}
