const equipment = [
  ['Boom Lift','60 FT (18.3 M)','Access & Lifting'],
  ['Boom Lift','80 FT (24.4 M)','Access & Lifting'],
  ['Boom Lift','100 FT (30.5 M)','Access & Lifting'],
  ['Scissor Lift','12 M (Electric)','Access & Lifting'],
  ['Scissor Lift','16 M (Electric)','Access & Lifting'],
  ['Truck Mounted Boom Lift','28 M','Access & Lifting'],
  ['Spider Lift','18 M','Access & Lifting'],
  ['Telehandler','17 M Lift / 4.5 Ton','Access & Lifting'],
  ['Forklift','3 Ton Diesel','Material Handling'],
  ['Forklift','5 Ton Diesel','Material Handling'],
]

export default function Home() {
  return <main>
    <header className="header"><div className="brand">TRIDENT</div><nav><a href="#equipment">Equipment</a><a href="#industries">Industries</a><a href="#about">About Us</a><a href="#contact">Contact</a></nav><a className="quote" href="#contact">Get a Quote</a></header>
    <section className="hero"><div><p className="eyebrow">TRIDENT TRINITY ASSETS PVT. LTD.</p><h1>Elevating Projects.<br/>Empowering Growth.</h1><p>Reliable equipment rental solutions for construction, industrial and infrastructure projects.</p><div className="actions"><a className="primary" href="#equipment">Explore Equipment</a><a className="secondary" href="#contact">Request a Quote</a></div></div></section>
    <section id="equipment" className="section"><p className="eyebrow">OUR FLEET</p><h2>Equipment for the job.</h2><div className="grid">{equipment.map(([name,spec,cat])=><article className="card" key={name+spec}><div className="image-placeholder">TRIDENT</div><p>{cat}</p><h3>{name}</h3><strong>{spec}</strong><button>View Details</button></article>)}</div></section>
    <section id="industries" className="band"><p className="eyebrow">INDUSTRIES</p><h2>Built around project requirements.</h2><div className="industry-grid">{['Construction','Infrastructure','Industrial Maintenance','Warehousing','Manufacturing','Facility Maintenance'].map(x=><div key={x}>{x}</div>)}</div></section>
    <section id="about" className="section split"><div><p className="eyebrow">ABOUT TRIDENT</p><h2>Partners in Progress.</h2></div><p>Trident Trinity Assets Private Limited provides equipment rental and project support with a focus on dependable machines, responsive service and practical project solutions.</p></section>
    <section id="contact" className="contact"><p className="eyebrow">START A PROJECT</p><h2>Tell us what you need.</h2><p>Submit your requirement and our team will confirm equipment availability.</p><a className="primary" href="mailto:Sales@tridenttrinity.com">Email Sales</a></section>
    <footer>© 2026 Trident Trinity Assets Private Limited.</footer>
  </main>
}