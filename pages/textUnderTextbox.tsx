import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { useState, useEffect } from "react";
import styles from "@/styles/textUnderTextbox.module.scss";
import Popup from 'reactjs-popup';

export interface SentenceAndScore {
    text: string;
    percentage: number;
    suggestion: string;
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
                    {/* <button onClick={() => EnableModal(item.text)} className={styles.inline}>Suggestions</button> */}
                    <Popup trigger={<button> Suggestions </button>} position="right center">                        
                        <div className={`${styles.suggestionBox}`}>
                            <p>{item.suggestion}</p>
                        </div>
                    </Popup>
                </div>
            ))}
        </div>
    );
}