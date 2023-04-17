import Head from "next/head";

import styles from "@/styles/Login.module.scss";

export default function Login() {
  return <>
    <Head>
      <title>Toxicity Bot</title>
      <meta name="description" content="Reduce toxicity in your post with the power of AI." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className={styles.container}>
      <h1 className={styles.header}>Login</h1>
      <div className={styles.login}>
        <form className={styles.inputForm} action="/" method="post">
          <input style={{ display: "none" }} autoComplete="off" hidden />
          <div className={styles.labeledInput}>
            <span className={styles.label}>Username </span>
            <input type="text"></input>
          </div>
          <div className={styles.labeledInput}>
            <span className={styles.label}>Password </span>
            <input type="password"></input>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div >
  </>;
}
