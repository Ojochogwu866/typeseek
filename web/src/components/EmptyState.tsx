import { useGoogleFonts } from "../hooks/useGoogleFonts";

const SEGMENTS = [
  { word: "Bold", font: "Bungee" },
  { word: "Elegant", font: "Playfair Display" },
  { word: "Playful", font: "Pacifico" },
  { word: "Geometric", font: "Righteous" },
  { word: "Script", font: "Caveat" },
  { word: "Rounded", font: "Fredoka" },
  { word: "Display", font: "Abril Fatface" },
  { word: "Sans", font: "Space Mono" },
];

// Repeated so the text wraps all the way around the ring with no empty gap.
const RING_SEQUENCE = [...SEGMENTS, ...SEGMENTS, ...SEGMENTS];

export function EmptyState() {
  useGoogleFonts(SEGMENTS.map((segment) => segment.font));

  return (
    <div className="empty-state">
      <div className="empty-state__ring">
        <svg viewBox="0 0 400 400" className="empty-state__ring-svg">
          <defs>
            <path id="ringPath" d="M 200,200 m -170,0 a 170,170 0 1,0 340,0 a 170,170 0 1,0 -340,0" />
          </defs>
          <text className="empty-state__ring-text">
            <textPath href="#ringPath" xlinkHref="#ringPath">
              {RING_SEQUENCE.map((segment, i) => (
                <tspan key={i} style={{ fontFamily: `"${segment.font}", sans-serif` }}>
                  {segment.word}
                  {" • "}
                </tspan>
              ))}
            </textPath>
          </text>
        </svg>

        <div className="empty-state__brand">
          <h1>typeseek</h1>
          <p>Find a font by uploading an image of lettering.</p>
        </div>
      </div>
    </div>
  );
}
