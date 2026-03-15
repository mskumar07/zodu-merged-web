import "@mui/material/styles";

// Typography variant extension (from your snippet)
declare module "@mui/material/styles" {
  interface TypographyVariants {
    logo: React.CSSProperties;
    label: React.CSSProperties;
    placeholder: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    logo?: React.CSSProperties;
    label?: React.CSSProperties;
    placeholder?: React.CSSProperties;
  }

  // Palette extension
  interface Palette {
    subscription: Palette["primary"];
  }
  interface PaletteOptions {
    subscription?: PaletteOptions["primary"];
  }
  interface TypeBackground {
    light?: string;
    sidebar?: string;
    productCard?: string; // Add productCard to TypeBackground
  }

  interface Palette {
    customText: {
      productCard: string; // Add customText to Palette
    };
  }
  interface PaletteOptions {
    customText?: {
      productCard?: string; // Add customText to PaletteOptions
    };
  }
}

// Allow using the new logo variant in Typography
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    logo: true;
    label: true;
    placeholder: true;
  }
}
