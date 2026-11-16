export type Example = {
  id: string;
  title: string;
  blurb: string;
  source: string;
  answer: string;
};

export const examples: Example[] = [
  {
    id: "grounded",
    title: "Mostly grounded",
    blurb: "A short summary that stays close to the source.",
    source:
      "The Eiffel Tower was completed in 1889 for the Exposition Universelle in Paris. " +
      "It was designed by the engineer Gustave Eiffel. The tower stands 330 metres tall after the addition of an antenna. " +
      "It is made of wrought iron and was originally criticised by some Parisian artists.",
    answer:
      "The Eiffel Tower was completed in 1889. Gustave Eiffel designed it. The structure is made of wrought iron.",
  },
  {
    id: "mixed",
    title: "Mixed claims",
    blurb: "Some facts match the source, one number is wrong, and one product is invented.",
    source:
      "Nimbus Labs launched the Atlas weather probe in March 2021. " +
      "The probe weighs 12 kilograms and records temperature, humidity and wind speed. " +
      "The company is based in Austin and has 80 employees. Atlas was funded by a 4 million dollar seed round.",
    answer:
      "Nimbus Labs launched the Atlas weather probe in March 2021. " +
      "The probe weighs 25 kilograms and records temperature and humidity. " +
      "The company also sells a consumer smartwatch. Nimbus Labs is based in Austin.",
  },
  {
    id: "contradicted",
    title: "Mostly contradicted",
    blurb: "The answer flips several facts from a short wildlife note.",
    source:
      "The river otter is a semi-aquatic mammal. Adults typically weigh between 5 and 14 kilograms. " +
      "They eat mainly fish and crustaceans. River otters can close their ears and nostrils when they dive.",
    answer:
      "The river otter is a fully aquatic reptile. Adults typically weigh 40 kilograms. " +
      "They eat mainly fish and crustaceans. They cannot close their nostrils when they dive.",
  },
];
