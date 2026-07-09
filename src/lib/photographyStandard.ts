// Always-on photographic quality standard, appended to every generated prompt regardless
// of provider or form values. Keeps output looking like an authentic photograph rather than
// obviously AI-generated art, unless the user's own prompt edits say otherwise.

export const PHOTOGRAPHY_STANDARD_CLAUSE =
  "Shot as an ultra-realistic editorial fashion photograph, resembling an authentic photo " +
  "taken with a professional camera or modern smartphone rather than digital artwork. " +
  "Natural, spontaneous-feeling composition and believable candid camera angle, not overly posed. " +
  "Realistic human anatomy and natural body proportions. Most of the body naturally visible in " +
  "frame, without unnecessary cropping of arms, legs, hands or feet, unless the framing specifically " +
  "calls for a close-up. Realistic skin texture with natural pores and imperfections, avoiding " +
  "plastic, waxy, airbrushed or uncanny-valley skin. Lighting consistent with and natural to the " +
  "environment. Cinematic depth of field only where appropriate for the shot. Premium lifestyle and " +
  "editorial fashion photography quality.";

export const PHOTOGRAPHY_STANDARD_NEGATIVE_TERMS =
  "cropped limbs, cropped hands, cropped feet, awkward cropping, overly posed, stiff unnatural pose, " +
  "uncanny valley, cgi render, 3d render, video game graphics, doll-like skin, airbrushed plastic skin, " +
  "fake ai-generated look";
