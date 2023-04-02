import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { useState, useEffect } from "react";
import styles from "@/styles/textUnderTextbox.module.scss";
import { Modern_Antiqua } from "next/font/google";

export interface SentenceAndScore {
    text: string;
    percentage: number;
}

interface SentenceAndScoreWrapper {
    content: SentenceAndScore[];
}

interface textEnablePair {
    text: string;
    enabled: boolean;
}

export default function Texts(props: SentenceAndScoreWrapper) {
    
    const [modelEnableList, setModalEnableList] = useState<textEnablePair[]>([]);

    let sentenceAndScores: SentenceAndScore[] = props.content;

    useEffect(() => {
        setModalEnableList([]);
        for (let i=0; i<sentenceAndScores.length; i++) {
            console.log({"text": sentenceAndScores[i].text, "enabled": false});
            setModalEnableList((modelEnableList) => [...modelEnableList, {"text": sentenceAndScores[i].text, "enabled": false}]);
        }
      }, [props.content]);

    function EnableModal(text: string) {
        let temp = [...modelEnableList];
        for (let i=0; i<temp.length; i++) {
            if (temp[i].text == text) {
                temp[i].enabled = !temp[i].enabled;
            }
        }
        setModalEnableList(temp);
    }

    return sentenceAndScores.length == 0 ? (
        <div>
            <p>No toxic sentence! Good job!</p>
        </div>
    ) :
    (
        <div className={styles.box}>
            {sentenceAndScores.map((item: SentenceAndScore) => (
                <div key={item.text}>
                    <p className={`${styles.inline} ${styles.percentageSign}`}>{item.percentage.toString() + "%"}</p>
                    <p className={`${styles.inline}`}>{item.text}</p>
                    <button onClick={() => EnableModal(item.text)} className={styles.inline}>Suggestions</button>

                    {/* <Modal toggle={() => EnableModal(item.text)} isOpen={modelEnableList.filter(pair => {
                        return pair.text == item.text;
                    })[0].enabled}>
                        <div className=" modal-header">
                        <h5 className=" modal-title" id="exampleModalLabel">
                            Modal title
                        </h5>
                        <button
                            aria-label="Close"
                            className=" close"
                            type="button"
                            onClick={() => EnableModal(item.text)}
                        >
                            <span aria-hidden={true}>×</span>
                        </button>
                        </div>
                        <ModalBody>{item.text}</ModalBody>
                    </Modal> */}
                </div>
            ))}
        </div>
    );
}