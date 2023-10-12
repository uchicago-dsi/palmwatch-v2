const FAQ = [
  {
    title: "What variables are available in this data?",
    content: "hello",
  },
  {
    title: "How is the risk score calculated?",
    content: <ul>

<li>
            <b>Current Risk Score</b> Calculated risk score based on most recent
            2 years worth of data. Calculation: Average treeloss area over the
            specified years (currently 2021-2022). Convert averages to z-score.
            Convert to risk score (1-5) where 1: z{"<"}-1, 2: -1
            {"<"}=z{"<"}-.5, 3: -.5{"<"}=z{"<"}.5, 4: .5{"<"}=z{"<"}1, 5: z{">"}
            =1
            <b></b>
          </li>
          <li>
            <b>Past Risk Score</b> Calculated risk score based on past treeloss.
            Calculation: Convert treeloss sum proportion of forest to z-score.
            Convert averages to z-score. Convert to risk score (1-5) where 1: z
            {"<"}-1, 2: -1{"<"}=z{"<"}
            -.5, 3: -.5{"<"}=z{"<"}.5, 4: .5{"<"}=z{"<"}1, 5: z{">"}=1
            <b></b>
          </li>
          <li>
            <b>Future Risk Score</b> - Calculated risk score based on future
            treeloss. Calculation: Convert remaining proportion of forest to
            z-score.. Convert averages to z-score. Convert to risk score (1-5)
            where 1: z{"<"}-1, 2: -1{"<"}=z{"<"}-.5, 3: -.5{"<"}=z{"<"}.5, 4: .5
            {"<"}=z
            {"<"}1, 5: z{">"}=1
          </li>
    </ul>
  },
  {
    title: "Where is the data from?",
    content: "hello",
  },
  {
    title: "How are catchment areas assigned?",
    content: "hello",
  },
];

export default function Page() {
  return (
    <div className="prose max-w-3xl mx-auto py-4">
      <h1>Inclusive Development International (IDI)</h1>
      <p>
        Inclusive Development International works with communities and local
        civil society groups to hold governments, development finance
        institutions, and corporate actors accountable for human rights
        violations and environmental damage caused by irresponsible development
        and business conduct. We support affected communities to understand
        their rights and potential advocacy strategies; identify responsible
        actors; document harms and violations of human rights, laws and
        policies; and seek recourse through evidence-based advocacy and by
        accessing a range of transnational judicial and non-judicial remedies.
      </p>
      <h2>Project</h2>
      <p>
        This project highlights the impact that different consumer brands have
        had on deforestation and tree cover loss in Indonesia as it relates to
        palm oil.
      </p>
      <h2>Methodology</h2>
      <p>
        Public information coming from various consumer brands is matched with
        data for the Global Forest Watch{`'`}s Universal Mill List. A
        calculation in which the previous two years of deforestation is used to
        calculate deforestation risk score.
      </p>
      <h2>Variables</h2>
      <p>
        <ul>
          <li>
            <b>Treeloss Sum</b> - Sum of treeloss over time, where land has gone
            from {`"`}forest{`"`} to {`"`}non-forest{`"`} state.{" "}
          </li>
          <li>
            <b>Land Area</b> - Pixels where there is mapped land compared to no
            ocean or no data.
          </li>
          <li>
            <b>Forest Area</b> - Pixels where there is land was in a {`"`}forest
            {`"`}
            state in 2000.
          </li>
          <li>
            <b>Treeloss 2019</b> - Treeloss in 2019, where land has gone from
            {`"`}forest{`"`} to {`"`}non-forest{`"`} state.
            <b></b>
          </li>
          <li>
            <b>Treeloss Sum</b> - Proporiton of Land Treeloss sum divided by
            land area.
            <b></b>
          </li>
          <li>
            <b>Treeloss Sum</b> - Proporiton of Forest Treeloss sum divided by
            forest area.
            <b></b>
          </li>
          <li>
            <b>Remaining Proportion of Forest</b> - Inverse of treeloss (1 minus
            the sum proportion of forest).
          </li>
          <li>
            Fraction of forest that has not experienced loss.
            <b></b>
          </li>
        </ul>
        <div>
          <h3>FAQ</h3>
          {FAQ.map((item, index) => (
            <div key={index} className="collapse bg-base-200 my-4 shadow-xl">
              <input type="radio" name={`faq-accordion`} />
              <div className="collapse-title text-xl font-medium">
                {item.title}
              </div>
              <div className="collapse-content">
                <p>{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </p>
    </div>
  );
}
