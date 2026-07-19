import { useEffect } from "react";

const LINK_ID = "typeseek-google-fonts";

/** Loads the given font families live from the Google Fonts CDN instead of static specimen images. */
export function useGoogleFonts(fontNames: string[]) {
  useEffect(() => {
    if (fontNames.length === 0) return;

    const families = fontNames
      .map((name) => `family=${encodeURIComponent(name).replace(/%20/g, "+")}`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = LINK_ID;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [fontNames]);
}
