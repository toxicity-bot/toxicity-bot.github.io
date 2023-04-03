import React from 'react';
import styles from '@/styles/HeatMeter.module.css';

interface HeatMeterProps {
  percentage: number;
}

export const HeatMeter = ({ percentage }: HeatMeterProps) => {
    const gradientColor =
      percentage < 50
        ? "#5bf5a5" // green
        : percentage < 70
        ? "#ffff00" // yellow
        : percentage < 85
        ? "#ff6600" // orange
        : "#ff0000"; // red
  
    const fillStyle = {
      height: `${percentage}%`,
      background: `linear-gradient(to bottom, ${gradientColor}, #1aff00)`,
    };
  
    let bulbEmoji;
  
    if (percentage < 10) {
        bulbEmoji = '🤔';
    } else if (percentage < 20) {
    bulbEmoji = '😕';
    } else if (percentage < 30) {
    bulbEmoji = '😐';
    } else if (percentage < 40) {
    bulbEmoji = '😒';
    } else if (percentage < 50) {
    bulbEmoji = '🙁';
    } else if (percentage < 60) {
    bulbEmoji = '😢';
    } else if (percentage < 70) {
    bulbEmoji = '😡';
    } else if (percentage < 80) {
    bulbEmoji = '🤬';
    } else if (percentage < 90) {
    bulbEmoji = '💀';
    } else {
    bulbEmoji = '☠️';
    }
  
    return (
      <div className={styles.heatMeter}>
        <div className={styles.heatMeterFill} style={fillStyle}></div>
        <div className={styles.heatMeterBulb}>{bulbEmoji}</div>
      </div>
    );
};

