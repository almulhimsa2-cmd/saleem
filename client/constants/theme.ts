import { Platform } from "react-native";

export const SaleemColors = {
  primary: "#003366",
  accent: "#50C878",
  background: "#F8F9FA",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#666666",
  error: "#DC3545",
  success: "#50C878",
  warning: "#FFC107",
};

export const Colors = {
  light: {
    text: SaleemColors.textPrimary,
    textSecondary: SaleemColors.textSecondary,
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: SaleemColors.primary,
    link: SaleemColors.primary,
    accent: SaleemColors.accent,
    backgroundRoot: SaleemColors.background,
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#F0F0F0",
    backgroundTertiary: "#E6E6E6",
    primary: SaleemColors.primary,
    error: SaleemColors.error,
    success: SaleemColors.success,
    warning: SaleemColors.warning,
    border: "#E0E0E0",
    cardBackground: "#FFFFFF",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: SaleemColors.accent,
    link: SaleemColors.accent,
    accent: SaleemColors.accent,
    backgroundRoot: "#0D1117",
    backgroundDefault: "#161B22",
    backgroundSecondary: "#21262D",
    backgroundTertiary: "#30363D",
    primary: SaleemColors.primary,
    error: "#F85149",
    success: SaleemColors.accent,
    warning: "#F0B429",
    border: "#30363D",
    cardBackground: "#161B22",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
    fontFamily: "Cairo_700Bold",
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "700" as const,
    fontFamily: "Cairo_700Bold",
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
    fontFamily: "Cairo_600SemiBold",
  },
  h4: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    fontFamily: "Cairo_600SemiBold",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: "Cairo_400Regular",
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
    fontFamily: "Cairo_400Regular",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Cairo_600SemiBold",
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600" as const,
    fontFamily: "Cairo_600SemiBold",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
    fontFamily: "Cairo_400Regular",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Cairo_400Regular",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "Cairo_400Regular",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Cairo, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};
