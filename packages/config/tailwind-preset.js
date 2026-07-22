/**
 * Shared Tailwind preset encoding the PazyPro / Grew Mail design tokens (UI.md).
 * Apps must extend this preset rather than redefining colors, radii, or type scale.
 */
export default {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#FAF7F2",
          secondary: "#F3EFEA",
          surface: "#FFFFFF",
        },
        text: {
          primary: "#121212",
          secondary: "#5A5A5C",
          muted: "#8C8C8E",
          inverse: "#FFFFFF",
        },
        accent: {
          lavender: "#F3E6F7",
          "lavender-border": "#E8D3EE",
          sage: "#C7E8BC",
          "sage-border": "#B2DEA4",
          yellow: "#FFF7D6",
        },
        btn: {
          primary: "#121212",
          "primary-hover": "#2D2D2D",
        },
        status: {
          success: "#22C55E",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        border: {
          subtle: "rgba(18, 18, 18, 0.08)",
          strong: "rgba(18, 18, 18, 0.16)",
        },
        // Numeric-scale aliases onto the same UI.md tokens above, for
        // components that prefer carbon-900 / cream-100 style utilities.
        carbon: {
          900: "#121212",
          800: "#2D2D2D",
          700: "#3A3A3C",
          600: "#5A5A5C",
          500: "#8C8C8E",
          400: "#A8A8AA",
          200: "#D6D6D6",
          100: "#EDEDED",
        },
        cream: {
          50: "#FCFAF7",
          100: "#F3EFEA",
          200: "#ECE6DE",
        },
        pastel: {
          lavender: "#F3E6F7",
          sage: "#C7E8BC",
        },
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Space Grotesk", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        xl: "24px",
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      boxShadow: {
        subtle: "0 4px 20px rgba(0, 0, 0, 0.04)",
        floating: "0 12px 32px rgba(0, 0, 0, 0.08)",
        pill: "0 2px 8px rgba(0, 0, 0, 0.06)",
      },
      transitionTimingFunction: {
        fast: "cubic-bezier(0.4, 0, 0.2, 1)",
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        smooth: "300ms",
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
};
