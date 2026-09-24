'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Category = { id: string; name: string; status: string; sort_order: number }
type EquipmentImage = { image_url: string; alt_text: string | null; is_primary: boolean }
type Equipment = { id: string; category_id: string; name: string; short_description: string | null; equipment_type: string | null; capacity: string | null; height: string | null; load_capacity: string | null; total_quantity: number | null; application: string | null; status: string; availability_status: string; equipment_images?: EquipmentImage[] }

const industries = ['Infrastructure & Construction','Warehouse & Logistics','Manufacturing','Industrial Maintenance','Residential & Commercial','Events & Exhibitions']
const fallbackCategories = ['All','Access & Lifting','Material Handling','Power & Support','Earth Moving & Mining']
const imageMap: Record<string,string> = {
  'Boom Lift 60 ft (18.3 m)': 'https://sudhirrentals.in/wp-content/uploads/2025/08/articulated-boom-lift.webp',
  'Boom Lift 80 ft (24.4 m)': 'https://sudhirrentals.in/wp-content/uploads/2025/08/articulated-boom-lift.webp',
  'Boom Lift 100 ft (30.5 m)': 'https://sudhirrentals.in/wp-content/uploads/2025/08/articulated-boom-lift.webp',
  'Scissor Lift 12 m Electric': 'https://sudhirrentals.in/wp-content/uploads/2025/08/scissor-lift.webp',
  'Scissor Lift 16 m Electric': 'https://sudhirrentals.in/wp-content/uploads/2025/08/scissor-lift.webp',
  'Truck Mounted Boom Lift 28 m': 'https://sudhirrentals.in/wp-content/uploads/2025/08/truck-mounted-img.webp',
  'Spider Lift 18 m': 'https://sudhirrentals.in/wp-content/uploads/2025/08/articulated-boom-lift.webp',
  'Telehandler 17 m / 4.5 ton': 'https://sudhirrentals.in/wp-content/uploads/2025/11/Telehandler-1.jpg',
  'Forklift 3 ton Diesel': 'https://sudhirrentals.in/wp-content/uploads/2025/10/diesel-forklift.webp',
  'Forklift 5 ton Diesel': 'https://sudhirrentals.in/wp-content/uploads/2025/10/diesel-forklift.webp',
  'Diesel Generator Set 125 KVA': 'https://sudhirrentals.in/wp-content/uploads/2025/08/genrato-delhi.webp',
  'Diesel Generator Set 250 KVA': 'https://sudhirrentals.in/wp-content/uploads/2025/08/genrato-delhi.webp',
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Equipment | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeIndustry, setActiveIndustry] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitState, setSubmitState] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: items }] = await Promise.all([
        supabase.from('equipment_categories').select('id,name,status,sort_order').order('sort_order'),
        supabase.from('equipment').select('id,category_id,name,short_description,equipment_type,capacity,height,load_capacity,total_quantity,application,status,availability_status,equipment_images(image_url,alt_text,is_primary)').eq('status','active').order('name')
      ])
      setCategories(cats || [])
      setEquipment(items || [])
      setLoading(false)
    }
    load()
  }, [])

  const categoryNames = categories.length ? ['All', ...categories.map(c => c.name)] : fallbackCategories
  const categoryMap = new Map(categories.map(c => [c.id, c.name]))
  const visible = useMemo(() => equipment.filter(e => (filter === 'All' || categoryMap.get(e.category_id) === filter) && `${e.name} ${e.equipment_type || ''} ${e.capacity || ''} ${e.height || ''} ${e.application || ''}`.toLowerCase().includes(search.toLowerCase())), [equipment, filter, search, categories])
  const available = equipment.filter(e => e.availability_status !== 'coming_soon')
  const comingSoon = equipment.filter(e => e.availability_status === 'coming_soon')
  const totalUnits = equipment.reduce((n,e) => n + (e.total_quantity || 0), 0)

  async function submitQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitState('Submitting...')
    const f = new FormData(e.currentTarget)
    const { error } = await supabase.from('enquiries').insert({
      name: String(f.get('name')), company_name: String(f.get('company')), email: String(f.get('email')), phone: String(f.get('phone')),
      project_location: String(f.get('location') || ''), quantity: Number(f.get('quantity') || 1), start_date: String(f.get('start_date') || '') || null,
      rental_duration: String(f.get('duration') || ''), message: String(f.get('message') || ''), equipment_id: selected?.id || null,
      category_id: selected?.category_id || null, source: 'website'
    })
    if (error) { setSubmitState(`Error: ${error.message}`); return }
    setSubmitState('Enquiry submitted successfully. Our team will contact you.')
    e.currentTarget.reset()
  }

  const openQuote = (item?: Equipment | null) => { setSelected(item || null); setSubmitState(''); setQuoteOpen(true); setMenuOpen(false) }
  const goEquipment = (c = 'All') => { setFilter(c); setMenuOpen(false); document.getElementById('equipment')?.scrollIntoView({ behavior: 'smooth' }) }
  const goIndustry = (x: string) => { setActiveIndustry(x); setMenuOpen(false); document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' }) }
  const getImage = (e: Equipment) => e.equipment_images?.find(i => i.is_primary)?.image_url || e.equipment_images?.[0]?.image_url || imageMap[e.name]

  return <main id="top">
    <header className="header">
      <a className="brand" href="#top" aria-label="TRIDENT home"><img src="/trident/trident-logo.jpg?v=4" alt="Trident Trinity Assets - Partners in Progress"/><span>TRIDENT</span></a>
      <nav aria-label="Primary navigation">
        <a href="#top">Home</a>
        <div className="nav-drop"><button className="nav-link" onClick={() => goEquipment('All')}>Equipment <span>⌄</span></button><div className="drop-menu"><b>Equipment</b>{categoryNames.slice(1).map(c => <button key={c} onClick={() => goEquipment(c)}>{c}</button>)}</div></div>
        <div className="nav-drop"><button className="nav-link" onClick={() => document.getElementById('industries')?.scrollIntoView({behavior:'smooth'})}>Industries <span>⌄</span></button><div className="drop-menu">{industries.map(x=><button key={x} onClick={() => goIndustry(x)}>{x}</button>)}</div></div>
        <div className="nav-drop"><button className="nav-link" onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})}>Solutions <span>⌄</span></button><div className="drop-menu"><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})}>Rental Solutions</button><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})}>Project Support</button><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})}>Fleet Support</button></div></div>
        <a href="#locations">Locations</a><a href="#resources">Resources</a><a href="#about">About Us</a><a href="#contact">Contact</a>
      </nav>
      <div className="header-actions"><button className="quote" onClick={() => openQuote()}>Get a Quote</button><button className="hamburger" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><i></i><i></i><i></i></button></div>
    </header>

    {menuOpen && <div className="mobile-menu"><div className="mobile-menu-head"><b>TRIDENT</b><button onClick={()=>setMenuOpen(false)}>×</button></div><a href="#top" onClick={()=>setMenuOpen(false)}>Home</a><button onClick={()=>goEquipment('All')}>Equipment</button>{categoryNames.slice(1).map(c=><button className="sub" key={c} onClick={()=>goEquipment(c)}>{c}</button>)}<button onClick={()=>document.getElementById('industries')?.scrollIntoView({behavior:'smooth'})}>Industries</button>{industries.map(x=><button className="sub" key={x} onClick={()=>goIndustry(x)}>{x}</button>)}<button onClick={()=>{setMenuOpen(false);document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})}}>Solutions</button><a href="#locations" onClick={()=>setMenuOpen(false)}>Locations</a><a href="#resources" onClick={()=>setMenuOpen(false)}>Resources</a><a href="#about" onClick={()=>setMenuOpen(false)}>About Us</a><a href="#contact" onClick={()=>setMenuOpen(false)}>Contact</a><button className="mobile-menu-quote" onClick={()=>openQuote()}>Request a Quote →</button></div>}

    <section className="hero"><div className="hero-copy"><p className="eyebrow">TRIDENT TRINITY ASSETS PRIVATE LIMITED</p><h1>Reliable equipment.<br/><em>Ready for progress.</em></h1><p>Equipment rental solutions built around access, lifting, material handling and project requirements.</p><div className="actions"><a className="primary" href="#equipment">Explore Equipment</a><button className="secondary" onClick={()=>openQuote()}>Request a Quote →</button></div></div><div className="hero-visual"><div className="hero-photo"><img src="https://sudhirrentals.in/wp-content/uploads/2025/09/Empowering-Projects2.webp" alt="Industrial equipment project"/></div><div className="hero-brand"><img src="/trident/trident-logo.jpg?v=4" alt="Trident Partners in Progress"/><strong>PARTNERS IN PROGRESS</strong><span>Equipment rental & project support</span></div></div></section>

    <section className="metrics"><div><b>{equipment.length || 20}</b><span>Equipment Types</span></div><div><b>{totalUnits || 54}</b><span>Total Units</span></div><div><b>{available.length || 10}</b><span>Currently Available</span></div><div><b>{comingSoon.length || 10}</b><span>Coming Soon</span></div></section>

    <section className="section intro"><div><p className="eyebrow">SMART RENTAL SOLUTIONS</p><h2>Right equipment.<br/>Right project.</h2></div><p>Trident brings together dependable equipment and project-focused support. Browse the fleet, compare specifications, tell us your site requirements and request a quotation directly from the website.</p></section>

    <section id="equipment" className="section equipment-section"><p className="eyebrow">OUR EQUIPMENT</p><div className="section-head"><div><h2>Explore our fleet.</h2><p>All 20 equipment types are listed below. Availability is confirmed against project location and rental dates.</p></div><span>{visible.length} shown / {equipment.length || 20} total</span></div><div className="toolbar"><input aria-label="Search equipment" placeholder="Search equipment, capacity, application..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="filters">{categoryNames.map(c=><button className={filter===c?'active':''} key={c} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>{loading ? <p>Loading fleet...</p> : <><div className="fleet-label"><b>Available Equipment</b><span>{available.length} types</span></div><div className="grid">{visible.filter(e=>e.availability_status!=='coming_soon').map(e=>{const cat=categoryMap.get(e.category_id) || ''; const image=getImage(e); return <article className="card" key={e.id}><div className="image-placeholder">{image ? <img src={image} alt={e.name} loading="lazy"/> : <span>TRIDENT</span>}</div><div className="card-body"><p>{cat}</p><h3>{e.name}</h3><strong>{e.height || e.capacity || e.load_capacity || e.equipment_type || 'Equipment'}</strong><small>{e.application || 'Project applications'}</small><span className="status">Available on request</span><button onClick={()=>setSelected(e)}>View Details <b>→</b></button></div></article>})}</div><div className="fleet-label coming"><b>Coming Soon</b><span>{comingSoon.length} types</span></div><div className="grid">{visible.filter(e=>e.availability_status==='coming_soon').map(e=>{const cat=categoryMap.get(e.category_id) || ''; const image=getImage(e); return <article className="card coming-card" key={e.id}><div className="image-placeholder">{image ? <img src={image} alt={e.name} loading="lazy"/> : <div className="soon-mark">TRIDENT<span>COMING SOON</span></div>}</div><div className="card-body"><p>{cat}</p><h3>{e.name}</h3><strong>{e.height || e.capacity || e.load_capacity || e.equipment_type || 'Equipment'}</strong><small>{e.application || 'Project applications'}</small><span className="status soon">Coming Soon</span><button onClick={()=>setSelected(e)}>View Details <b>→</b></button></div></article>})}</div></>}{!loading && visible.length===0 && <p>No equipment found.</p>}</section>

    <section id="solutions" className="band"><p className="eyebrow">OUR SOLUTIONS</p><div className="section-head"><div><h2>{activeIndustry ? `${activeIndustry} solutions.` : 'Support beyond the machine.'}</h2><p>{activeIndustry ? `Equipment planning and rental support for ${activeIndustry.toLowerCase()} projects.` : 'A simple rental journey from requirement to deployment and ongoing support.'}</p></div></div><div className="solution-grid"><article><span>01</span><h3>Requirement & Selection</h3><p>Share height, load, application, site and rental duration so the right equipment can be identified.</p></article><article><span>02</span><h3>Quotation & Planning</h3><p>Receive a project-focused quotation and coordinate delivery requirements with the Trident team.</p></article><article><span>03</span><h3>Deployment & Support</h3><p>Equipment deployment, maintenance coordination and rental-period support around your project.</p></article></div></section>

    <section id="industries" className="section"><p className="eyebrow">INDUSTRIES WE SERVE</p><h2>Built around project requirements.</h2><div className="industry-grid">{industries.map((x,i)=><button className={`industry-item ${activeIndustry===x?'selected':''}`} onClick={()=>goIndustry(x)} key={x}><small>0{i+1}</small><strong>{x}</strong><span>Explore solutions →</span></button>)}</div></section>

    <section id="locations" className="location-band"><div><p className="eyebrow">PROJECT LOCATIONS</p><h2>Equipment support where your project needs it.</h2><p>Tell us your project location, equipment requirement and rental dates. Trident will confirm suitable equipment and deployment options.</p></div><button className="primary" onClick={()=>openQuote()}>Check Availability</button></section>

    <section id="about" className="section split"><div><p className="eyebrow">ABOUT TRIDENT</p><h2>Partners in Progress.</h2><p className="about-lead">Trident Trinity Assets Private Limited is building an equipment rental platform around dependable machines, responsive service and practical project support.</p></div><div><p>Our current fleet covers Access & Lifting and Material Handling. Power & Support and Earth Moving & Mining are being presented as upcoming equipment divisions.</p><div className="stats"><div><b>20</b><span>Equipment types</span></div><div><b>54</b><span>Total units</span></div><div><b>10</b><span>Available now</span></div><div><b>10</b><span>Coming soon</span></div></div></div></section>

    <section id="resources" className="band resources"><p className="eyebrow">RESOURCES</p><h2>Useful project information.</h2><div className="resource-grid"><article><small>FLEET</small><h3>Equipment Selection</h3><p>Compare equipment by category, height, capacity, application and project need.</p><a href="#equipment">Explore Equipment →</a></article><article><small>FAQ</small><h3>Rental FAQs</h3><p>Ask about rental duration, delivery, site requirements and equipment suitability.</p><a href="#contact">Ask a Question →</a></article><article><small>CONTACT</small><h3>Project Requirement</h3><p>Send your project details and the Trident team can confirm suitable equipment.</p><a href="#contact">Start an Enquiry →</a></article></div></section>

    <section id="contact" className="contact"><div><p className="eyebrow">START A PROJECT</p><h2>Tell us what you need.</h2><p>Submit your requirement and our team will confirm equipment availability for your location and dates.</p></div><button className="primary" onClick={()=>openQuote()}>Request a Quote →</button></section>

    <footer><div className="footer-brand"><img src="/trident/trident-logo.jpg?v=4" alt="Trident"/><b>TRIDENT</b><p>Trident Trinity Assets Private Limited<br/>Partners in Progress.</p></div><div><b>QUICK LINKS</b><a href="#equipment">Equipment</a><a href="#industries">Industries</a><a href="#locations">Locations</a><a href="#contact">Contact</a></div><div><b>SUPPORT</b><a href="#resources">Resources</a><a href="#about">About Us</a><a href="#contact">Careers</a></div><div><b>FLEET</b><a href="#equipment" onClick={()=>setFilter('Access & Lifting')}>Access & Lifting</a><a href="#equipment" onClick={()=>setFilter('Material Handling')}>Material Handling</a><a href="#equipment" onClick={()=>setFilter('Power & Support')}>Power & Support</a><a href="#equipment" onClick={()=>setFilter('Earth Moving & Mining')}>Earth Moving & Mining</a></div><small>© 2026 Trident Trinity Assets Private Limited.</small></footer>

    <div className="mobile-tabs" aria-label="Mobile navigation"><a href="#top">Home</a><a href="#equipment">Equipment</a><a href="#industries">Industries</a><button onClick={()=>openQuote()}>Quote</button><a href="#contact">Contact</a></div>

    {selected && <div className="modal" onClick={()=>setSelected(null)}><div className="modal-box detail-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><div className="detail-image">{getImage(selected) ? <img src={getImage(selected)} alt={selected.name}/> : <div className="soon-mark">TRIDENT<span>COMING SOON</span></div>}</div><p className="eyebrow">{categoryMap.get(selected.category_id)}</p><h2>{selected.name}</h2><p className="modal-spec">{selected.height || selected.capacity || selected.load_capacity || selected.equipment_type}</p><p>{selected.short_description || 'Equipment availability is subject to confirmation for your project location and dates.'}</p><div className="detail-specs"><div><span>Type</span><b>{selected.equipment_type || '—'}</b></div><div><span>Quantity</span><b>{selected.total_quantity ? `${selected.total_quantity} Nos.` : '—'}</b></div><div><span>Status</span><b>{selected.availability_status==='coming_soon'?'Coming Soon':'Available on request'}</b></div></div><p className="application"><b>Application:</b> {selected.application || 'Project-specific'}</p><button className="primary" onClick={()=>openQuote(selected)}>Request Quote</button></div></div>}
    {quoteOpen && <div className="modal" onClick={()=>setQuoteOpen(false)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setQuoteOpen(false)}>×</button><p className="eyebrow">GET A QUOTE</p><h2>{selected ? selected.name : 'Project requirement'}</h2><p className="form-note">Tell us the site, quantity and rental period. Availability is confirmed by the Trident team.</p><form onSubmit={submitQuote}><input name="name" required placeholder="Full name"/><input name="company" required placeholder="Company"/><input name="email" required type="email" placeholder="Business email"/><input name="phone" required placeholder="Phone number"/><input name="location" required placeholder="Project location"/><input name="quantity" type="number" min="1" defaultValue="1" placeholder="Quantity"/><input name="start_date" type="date"/><input name="duration" placeholder="Rental duration"/><textarea name="message" placeholder="Equipment, height/capacity, application and other requirements" rows={5}/><button className="primary" type="submit">Submit Enquiry</button>{submitState && <p className={submitState.startsWith('Error')?'error':'success'}>{submitState}</p>}</form></div></div>}
  </main>
}
