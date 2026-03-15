import React from "react";
import Barcode from "react-barcode";

interface BarcodeGeneratorProps {
  value: string;
  format?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  width = 1,
  height = 50,
  displayValue = true,
}) => {
  return (
    <div>
      <Barcode
        value={value}
        format={"CODE128"}
        width={width}
        height={height}
        displayValue={displayValue}
      />
    </div>
  );
};

export default BarcodeGenerator;
