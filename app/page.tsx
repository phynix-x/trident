'use client'

import { useMemo, useState } from 'react'

type Equipment = { name: string; spec: string; category: string; status: 'Available' | 'Coming Soon' }

const equipment: Equipment[] = [
  { name:'Boom Lift', spec:'60 FT (18.3 M)', category:'Access & Lifting', status:'Available' },
  { name:'Boom Lift', spec:'80 FT (24.4 M)', category:'Access & Lifting', status:'Available' },
  { name:'Boom Lift', spec:'100 FT (30.5 M)', category:'Access & Lifting', status:'Available' },
  { name:'Scissor Lift', spec:'12 M Electric', category:'Access & Lifting', status:'Available' },
  { name:'Scissor Lift', spec:'16 M Electric', category:'Access & Lifting', status:'Available' },
  { name:'Truck Mounted Boom Lift', spec:'28 M', category:'Access & Lifting', status:'Available' },
  { name:'Spider Lift', spec:'18 M', category:'Access & Lifting', status:'Available' },
  { name:'Telehandler', spec:'17 M Lift / 4.5 Ton', category:'Access & Lifting', status:'Available' },
  { name:'Forklift', spec:'3 Ton Diesel', category:'Material Handling', status:'Available' },
  { name:'Forklift', spec:'5 Ton Diesel', category:'Material Handling', status:'Available' },
  { name:'Diesel Generator Set', spec:'125 KVA', category:'Power & Support', status:'Coming Soon' },
  { name:'Diesel Generator Set', spec:'250 KVA', category:'Power & Support', status:'Coming Soon' },
  { name:'Air Compressor', spec:'750 CFM', category:'Power & Support', status:'Coming Soon' },
  { name:'Tower Light', spec:'9 M LED', category:'Power & Support', status:'Coming Soon' },
  { name:'Welding Machine', spec:'500 AMP', category:'Power & Support', status:'Coming Soon' },
  { name:'Excavator', spec:'20 Ton', category:'Earth Moving & Mining', status:'Coming Soon' },
  { name:'Mobile Stone Crusher', spec:'100 TPH', category:'Earth Moving & Mining', status:'Coming Soon' },
  { name:'Tipper / Dump Truck', spec:'16 Cum', category:'Earth Moving & Mining', status:'Coming Soon' },
  { name:'Rock Body (Tipper)', spec:'16 Cum', category:'Earth Moving & Mining', status:'Coming Soon' },
  { name:'Wheel Loader', spec:'3.5 Cum', category:'Earth Moving & Mining', status:'Coming Soon' },
]

const industries = ['Construction','Infrastructure','Industrial Maintenance','Warehousing','Manufacturing','Facility Maintenance']

export default function Home() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Equipment | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const categories = ['All','Access & Lifting','Material Handling','Power & Support','Earth Moving & Mining']
  const visible = useMemo(() => equipment.filter(e => (filter === 'All' || e.category === filter) && `${e.name} ${e.spec}`.toLowerCase().includes(search.toLowerCase())), [filter, search])

  return <main>
    <header className="header">
      <a className="brand" href="#top">TRIDENT</a>
      <nav><a href="#equipment">Equipment</a><a href="#industries">Industries</a><a href="#about">About Us</a><a href="#contact">Contact</a></nav>
      <button className="quote" onClick={() => setQuoteOpen(true)}>Get a Quote</button>
    </header>

    <section id="top" className="hero"><div>
      <p className="eyebrow">TRIDENT TRINITY ASSETS PVT. LTD.</p>
      <h1>Elevating Projects.<br/>Empowering Growth.</h1>
      <p>Equipment rental solutions for construction, industrial and infrastructure projects.</p>
      <div className="actions"><a className="primary" href="#equipment">Explore Equipment</a><button className="secondary" onClick={() => setQuoteOpen(true)}>Request a Quote</button></div>
    </div></section>

    <section id="equipment" className="section">
      <p className="eyebrow">OUR FLEET</p><h2>Equipment for the job.</h2>
      <div className="toolbar"><input aria-label="Search equipment" placeholder="Search equipment..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="filters">{categories.map(c=><button className={filter===c?'active':''} key={c} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>
      <div className="grid">{visible.map(e=><article className="card" key={e.name+e.spec}>
        <div className="image-placeholder">TRIDENT</div><p>{e.category}</p><h3>{e.name}</h3><strong>{e.spec}</strong><span className={`status ${e.status==='Coming Soon'?'soon':''}`}>{e.status}</span>
        <button onClick={()=>setSelected(e)}>View Details →</button>
      </article>)}</div>
    </section>

    <section id="industries" className="band"><p className="eyebrow">INDUSTRIES</p><h2>Built around project requirements.</h2><div className="industry-grid">{industries.map(x=><div key={x}>{x}</div>)}</div></section>
    <section id="about" className="section split"><div><p className="eyebrow">ABOUT TRIDENT</p><h2>Partners in Progress.</h2></div><p>Trident Trinity Assets Private Limited provides equipment rental and project support with a focus on dependable machines, responsive service and practical project solutions.</p></section>
    <section id="contact" className="contact"><p className="eyebrow">START A PROJECT</p><h2>Tell us what you need.</h2><p>Submit your requirement and our team will confirm equipment availability.</p><button className="primary" onClick={()=>setQuoteOpen(true)}>Request a Quote</button></section>
    <footer>© 2026 Trident Trinity Assets Private Limited.</footer>

    {selected && <div className="modal" onClick={()=>setSelected(null)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">{selected.category}</p><h2>{selected.name}</h2><p className="modal-spec">{selected.spec}</p><p>Availability is subject to confirmation for your project location and dates.</p><button className="primary" onClick={()=>{setSelected(null);setQuoteOpen(true)}}>Request Quote</button></div></div>}
    {quoteOpen && <div className="modal" onClick={()=>setQuoteOpen(false)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setQuoteOpen(false)}>×</button><p className="eyebrow">GET A QUOTE</p><h2>Project requirement</h2><form onSubmit={e=>{e.preventDefault();setQuoteOpen(false);alert('Thank you. Your requirement has been captured for follow-up.')}}><input required placeholder="Name"/><input required placeholder="Company"/><input required type="email" placeholder="Email"/><input required placeholder="Phone"/><input placeholder="Project location"/><textarea placeholder="Equipment and requirement" rows={4}/><button className="primary" type="submit">Submit Enquiry</button></form></div></div>}
  </main>
}
