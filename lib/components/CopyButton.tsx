import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

interface CopyButtonProps {
  text: string | null;
}

function CopyButton({ text }: CopyButtonProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <button
      className="copy-button"
      onClick={handleCopy}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <FontAwesomeIcon icon={faCopy} border />
      <span className={`tooltip ${isHovering ? "visible" : ""}`}>
        Copy to clipboard
      </span>
    </button>
  );
}

export default CopyButton;
