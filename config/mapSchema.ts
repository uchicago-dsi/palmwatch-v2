export const forestLossColorBreaks = [
  {
    value: .25,
    color: [255,255,178],
    label: '0 - 0.25km',
    tooltip: 'First Quartile (0 - 20th Percentile) of all mills in 2022'
  },
  {
    value: 1.5,
    color: [254,204,92],
    label: '0.25 - 1.5km',
    tooltip: 'Second Quartile (20th - 40th Percentile) of all mills in 2022'
  },
  {
    value: 4.5,
    color: [253,141,60],
    label: '1.5 - 4.5km',
    tooltip: 'Third Quartile (40th - 60th Percentile) of all mills in 2022'
  },
  {
    value: 10,
    color: [240,59,32],
    label: '4.5 - 10km',
    tooltip: 'Fourth Quartile (60th - 80th Percentile) of all mills in 2022'
  },
  {
    value: Math.pow(10, 12),
    color: [189,0,38],
    label: '> 10km',
    tooltip: 'Fifth Quartile (80th - 100th Percentile) of all mills in 2022'
  }
]