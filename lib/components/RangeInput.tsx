import { useCallback, useEffect, useState } from "react";

import ColorLayer from "@/lib/models/ColorLayer";
import styles from "@/styles/components/RangeInput.module.scss";

type RangeInputProps = {
  id: number;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  colorLayer: ColorLayer;
  onChange: (id: number, value: number) => void;
} & typeof defaultRangeInputProps;

const defaultRangeInputProps = {
  min: 0,
  max: 1,
  step: 0.01,
  disabled: false,
};

export default function RangeInput(props: RangeInputProps): JSX.Element {
  const getColors = useCallback((): { emptyColor: string; fillColor: string } => {
    const cssVars = getComputedStyle(document.documentElement);
    let emptyColor = cssVars.getPropertyValue("--color-on-surface-dimmed");
    let fillColor: string;
    switch (props.colorLayer) {
      case ColorLayer.primary:
        fillColor = cssVars.getPropertyValue("--color-primary");
        break;
      case ColorLayer.secondary:
        fillColor = cssVars.getPropertyValue("--color-secondary");
        break;
      case ColorLayer.surface:
        fillColor = cssVars.getPropertyValue("--color-surface");
        break;
    }
    return { emptyColor, fillColor };
  }, [props.colorLayer]);

  const [colors, setColors] = useState({ emptyColor: "", fillColor: "" });

  const percentage = (props.value - props.min) / (props.max - props.min);

  const getBackground = useCallback((): string => {
    return `linear-gradient(to right, ${colors.fillColor} 0%, ${colors.fillColor} ${
      percentage * 100
    }%, ${colors.emptyColor} ${percentage * 100}%, ${colors.emptyColor} 100%)`;
  }, [colors.emptyColor, colors.fillColor, percentage]);

  const [background, setBackground] = useState<string | null>(getBackground());
  const [isDark, setIsDark] = useState<boolean>(false);

  const filter = props.disabled ? "grayscale(100%)" : "none";

  const className = (() => {
    let className = styles.rangeInput;
    switch (props.colorLayer) {
      case ColorLayer.secondary:
        className += ` ${styles["rangeInput--secondary"]}`;
        break;
      case ColorLayer.surface:
        className += ` ${styles["rangeInput--surface"]}`;
        break;
      default:
        break;
    }
    return className;
  })();

  useEffect(() => {
    setColors(getColors());
  }, [getColors]);

  /** Listen for media change and update state */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    setIsDark(mediaQuery.matches);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  /** Change the fill color on dark mode change */
  useEffect(() => {
    setColors(getColors());
    setBackground(getBackground());
  }, [getBackground, getColors, isDark]);

  if (background === null) return <></>;

  return (
    <input
      className={className}
      style={{ background: background, filter: filter }}
      type="range"
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      onChange={event => props.onChange(props.id, Number(event.currentTarget.value))}
      onMouseDown={event => event.stopPropagation()}
      onClick={event => event.stopPropagation()}
      disabled={props.disabled}
    />
  );
}
RangeInput.defaultProps = defaultRangeInputProps;
