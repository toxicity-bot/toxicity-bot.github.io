import Head from "next/head";
import { useState } from "react";
import styles from "@/styles/About.module.css";

export default function About() {
    return (
        <><h1>
            About Toxicity Bot
        </h1><div className={styles.container}>
                <p className={styles.column}>This project owes its importance to how prominent the internet is in our lives. There are an increasing number of platforms through which various forms of discrimination, hate speech, or misinformation can be conveyed.</p>
                <p className={styles.column}>Our application will ensure that users always have some sort of moderation on the content they choose to put out. The words we use online both shape our image and affect others' experience. </p>
                <p className={styles.column}>The feedback provided by the application can serve as a tool for educating users on the insensitive parts of their communication overlooked by themselves or peers.</p>
            </div></>
            
    );
}