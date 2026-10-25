export default function ValueStrip() {
  const values = [["01", "Curated with care", "Only things worth keeping"], ["02", "Consciously made", "Better choices, lighter footprint"], ["03", "Free shipping", "On orders over $75"], ["04", "Easy returns", "30 days, no questions asked"]];
  return <section className="value-strip" aria-label="Store benefits">{values.map(([index, title, description]) => <div key={index}><span className="value-index">{index}</span><p><strong>{title}</strong><small>{description}</small></p></div>)}</section>;
}
