import "./InfoPanel.css";

const InfoPanel = () => {
  return (
    <section className="squid-info">
      <h2>Squid Fishing in Seattle</h2>

      <div className="info-grid">
        <div className="info-card">
          <h3>Best Season</h3>
          <p>
            Squid are found in Puget Sound year-round, but the best fishing is
            typically from <strong>October through January</strong> when squid
            move into shallow water and are easier to catch from piers.
          </p>
        </div>

        <div className="info-card">
          <h3>Best Time</h3>
          <p>
            Squid feed mostly <strong>after dark</strong> and are strongly
            attracted to light. Fishing near illuminated docks during
            <strong> high tide</strong> often produces the best results.
          </p>
        </div>

        <div className="info-card">
          <h3>Popular Locations</h3>
          <p>
            Popular spots around Seattle include <strong>Elliott Bay piers,
            Edmonds Pier, Seacrest Park (West Seattle), Shilshole Bay Marina,
            and Des Moines Pier</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}

export default InfoPanel