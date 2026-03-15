import React from "react";
import QRCode from "react-qr-code";

interface QRGeneratorProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: "L" | "M" | "Q" | "H";
}

const QRGenerator: React.FC<QRGeneratorProps> = ({
  value,
  size = 150,
  bgColor = "#ffffff",
  fgColor = "#000000",
  level = "H",
}) => {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <QRCode
        value={value}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
      />
    </div>
  );
};

export default QRGenerator;
