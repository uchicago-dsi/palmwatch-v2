import { maxYear } from "./years";

const forestLossQuartileTooltips = [
  `First Quartile (0 - 20th Percentile) of all mills in ${maxYear}`,
  `Second Quartile (20th - 40th Percentile) of all mills in ${maxYear}`,
  `Third Quartile (40th - 60th Percentile) of all mills in ${maxYear}`,
  `Fourth Quartile (60th - 80th Percentile) of all mills in ${maxYear}`,
  `Fifth Quartile (80th - 100th Percentile) of all mills in ${maxYear}`,
];

export const forestLossColorBreaks = [
  {
    value: .25,
    color: [255,255,178],
    label: '0 - 0.25km',
    tooltip: forestLossQuartileTooltips[0],
  },
  {
    value: 1.5,
    color: [254,204,92],
    label: '0.25 - 1.5km',
    tooltip: forestLossQuartileTooltips[1],
  },
  {
    value: 4.5,
    color: [253,141,60],
    label: '1.5 - 4.5km',
    tooltip: forestLossQuartileTooltips[2],
  },
  {
    value: 10,
    color: [240,59,32],
    label: '4.5 - 10km',
    tooltip: forestLossQuartileTooltips[3],
  },
  {
    value: Math.pow(10, 12),
    color: [189,0,38],
    label: '> 10km',
    tooltip: forestLossQuartileTooltips[4],
  }
]

export const riskScoreScheme = [
  {
    value: 1,
    color: [94,60,153],
    label: '1',
    tooltip: ''
  },
  {
    value: 2,
    color: [178,171,210],
    label: '2',
    tooltip: ''
  },
  {
    value: 3,
    color: [247,247,247],
    label: '3',
    tooltip: ''
  },
  {
    value: 4,
    color: [253,184,99],
    label: '4',
    tooltip: ''
  },
  {
    value: 5,
    color: [230,97,1],
    label: '5',
    tooltip: ''
  }
]
