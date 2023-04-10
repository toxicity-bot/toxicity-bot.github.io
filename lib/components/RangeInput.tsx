import { useEffect, useState } from "react";
import styles from "@/styles/components/RangeInput.module.scss";

type RangeInputProps = {
  id: number;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (id: number, value: number) => void;
} & typeof defaultRangeInputProps;

const defaultRangeInputProps = {
  min: 0,
  max: 1,
  step: 0.01,
  disabled: true,
};

export default function RangeInput(props: RangeInputProps): JSX.Element {
  const [background, setBackground] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const percent = (props.value - props.min) / (props.max - props.min);
    const fillColor = styles.colorPrimary;
    const emptyColor = "rgba(0, 0, 0, 0.1)";
    setBackground(
      `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${percent * 100}%, ${emptyColor} ${
        percent * 100
      }%, ${emptyColor} 100%)`
    );
  }, [props.max, props.min, props.value]);

  useEffect(() => {
    setFilter(props.disabled ? "grayscale(100%)" : "");
  }, [props.disabled]);

  if (background === null) return <></>;

  return (
    <input
      className={styles.rangeInput}
      style={{ background: background, filter: filter }}
      type="range"
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      onChange={event => {
        props.onChange(props.id, Number(event.currentTarget.value));
      }}
      onClick={event => {
        event.stopPropagation();
      }}
    />
  );
}
RangeInput.defaultProps = defaultRangeInputProps;
