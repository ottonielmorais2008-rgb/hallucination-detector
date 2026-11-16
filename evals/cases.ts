import type { Label } from "../lib/schema";

export type EvalCase = {
  id: string;
  source: string;
  answer: string;
  expected: Label[];
};

export const evalCases: EvalCase[] = [
  {
    id: "all-supported-tower",
    source:
      "The Eiffel Tower was completed in 1889 for the Exposition Universelle in Paris. It was designed by the engineer Gustave Eiffel. It is made of wrought iron.",
    answer:
      "The Eiffel Tower was completed in 1889. Gustave Eiffel designed it. The structure is made of wrought iron.",
    expected: ["supported", "supported", "supported"],
  },
  {
    id: "mixed-nimbus",
    source:
      "Nimbus Labs launched the Atlas weather probe in March 2021. The probe weighs 12 kilograms and records temperature, humidity and wind speed. The company is based in Austin and has 80 employees. Atlas was funded by a 4 million dollar seed round.",
    answer:
      "Nimbus Labs launched the Atlas weather probe in March 2021. The probe weighs 25 kilograms and records temperature and humidity. The company also sells a consumer smartwatch. Nimbus Labs is based in Austin.",
    expected: ["supported", "contradicted", "not_supported", "supported"],
  },
  {
    id: "otter-contradictions",
    source:
      "The river otter is a semi-aquatic mammal. Adults typically weigh between 5 and 14 kilograms. They eat mainly fish and crustaceans. River otters can close their ears and nostrils when they dive.",
    answer:
      "The river otter is a fully aquatic reptile. Adults typically weigh 40 kilograms. They eat mainly fish and crustaceans. They cannot close their nostrils when they dive.",
    expected: ["contradicted", "contradicted", "supported", "contradicted"],
  },
  {
    id: "paraphrase-supported",
    source:
      "Lake Mira is a freshwater lake with a surface area of 18 square kilometres. It freezes over most winters. The only town on its shore is Midhaven, which has a small harbour.",
    answer:
      "Lake Mira covers 18 square kilometres. Midhaven is the only town on the shore.",
    expected: ["supported", "supported"],
  },
  {
    id: "invented-date",
    source:
      "The Cedar Line railway connects Midhaven to the port at Eastbay. Trains run every hour during the day. The line was built to move timber and grain.",
    answer:
      "The Cedar Line railway connects Midhaven to the port at Eastbay. It opened in 1924.",
    expected: ["supported", "not_supported"],
  },
  {
    id: "number-swap",
    source:
      "Helio Ceramics employs 20 people in a single workshop. The workshop produces glazed tiles and does not make tableware. Orders are fulfilled within three weeks.",
    answer:
      "Helio Ceramics employs 200 people. The workshop produces glazed tiles.",
    expected: ["contradicted", "supported"],
  },
  {
    id: "negation",
    source:
      "The Harbor Beacon is painted red and white. It uses an electric lamp and can be seen from 12 nautical miles away. The lighthouse is staffed at night.",
    answer:
      "The Harbor Beacon cannot be seen from 12 nautical miles away. It is painted red and white.",
    expected: ["contradicted", "supported"],
  },
  {
    id: "all-not-supported",
    source:
      "The orchard grows apples, pears and plums. Harvest begins in early September. Fruit is sold at a stall by the main gate and is not exported.",
    answer:
      "The orchard also grows oranges. A juice factory next door bottles the fruit for export.",
    expected: ["not_supported", "not_supported"],
  },
  {
    id: "implied-founder",
    source:
      "Northwind Maps was founded in 2019 and is still led by its founder Maya Chen. The company publishes paper hiking maps and a free trail guide. It has no office outside Portland.",
    answer:
      "Maya Chen is the founder of Northwind Maps. The company publishes paper hiking maps.",
    expected: ["supported", "supported"],
  },
  {
    id: "extra-and-wrong-weight",
    source:
      "The Atlas weather probe records temperature, humidity and wind speed. It was designed for mountain research and weighs 12 kilograms. It is not rated for underwater use.",
    answer:
      "The Atlas weather probe records temperature and wind speed. It is rated for underwater use. It weighs 12 kilograms.",
    expected: ["supported", "contradicted", "supported"],
  },
];
