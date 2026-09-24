'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Category = { id: string; name: string; status: string; sort_order: number }
type EquipmentImage = { image_url: string; alt_text: string | null; is_primary: boolean }
type Equipment = { id: string; category_id: string; name: string; short_description: string | null; equipment_type: string | null; capacity: string | null; height: string | null; load_capacity: string | null; status: string; availability_status: string; equipment_images?: EquipmentImage[] }

const industries = ['Infrastructure & Construction','Warehouse & Logistics','Manufacturing','Industrial Maintenance','Residential & Commercial','Events & Exhibitions']
const fallbackCategories = ['All','Access & Lifting','Material Handling','Power & Support','Earth Moving & Mining']
const LOGO = '/trident/trident-logo.jpg?v=3'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Equipment | null>(null)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitState, setSubmitState] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: items }] = await Promise.all([
        supabase.from('equipment_categories').select('id,name,status,sort_order').order('sort_order'),
        supabase.from('equipment').select('id,category_id,name,short_description,equipment_type,capacity,height,load_capacity,status,availability_status,equipment_images(image_url,alt_text,is_primary)').eq('status','active')
      ])
      setCategories(cats || [])
      setEquipment(items || [])
      setLoading(false)
    }
    load()
  }, [])

  const categoryNames = categories.length ? ['All', ...categories.map(c => c.name)] : fallbackCategories
  const categoryMap = new Map(categories.map(c => [c.id, c.name]))
  const visible = useMemo(() => equipment.filter(e => (filter === 'All' || categoryMap.get(e.category_id) === filter) && `${e.name} ${e.equipment_type || ''} ${e.capacity || ''} ${e.height || ''}`.toLowerCase().includes(search.toLowerCase())), [equipment, filter, search, categories])

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

  const openQuote = () => { setSubmitState(''); setQuoteOpen(true) }
  const goEquipment = (c = 'All') => { setFilter(c); document.getElementById('equipment')?.scrollIntoView({ behavior: 'smooth' }) }

  return <main>
    <header className="header">
      <a className="brand" href="#top" aria-label="TRIDENT home"><img src={LOGO} alt="Trident Trinity Assets - Partners in Progress"/><span>TRIDENT</span></a>
      <nav aria-label="Primary navigation">
        <a href="#top">Home</a>
        <div className="nav-drop"><a href="#equipment">Equipment ▾</a><div className="drop-menu"><b>Equipment</b>{categoryNames.slice(1).map(c => <button key={c} onClick={() => goEquipment(c)}>{c}</button>)}</div></div>
        <div className="nav-drop"><a href="#industries">Industries ▾</a><div className="drop-menu">{industries.map(x=><a key={x} href="#industries">{x}</a>)}</div></div>
        <div className="nav-drop"><a href="#solutions">Solutions ▾</a><div className="drop-menu"><a href="#solutions">Rental Solutions</a><a href="#solutions">Project Support</a><a href="#solutions">Fleet Support</a></div></div>
        <a href="#locations">Locations</a>
        <div className="nav-drop"><a href="#resources">Resources ▾</a><div className="drop-menu"><a href="#resources">Blog</a><a href="#resources">Brochures</a><a href="#resources">FAQs</a></div></div>
        <a href="#about">About Us</a>
      </nav>
      <button className="quote" onClick={openQuote}>Get a Quote</button>
    </header>

    <section id="top" className="hero"><div className="hero-copy"><p className="eyebrow">TRIDENT TRINITY ASSETS PRIVATE LIMITED</p><h1>Reliable Equipment.<br/><em>Ready for Progress.</em></h1><p>Dependable equipment rental solutions for construction, infrastructure, industrial and commercial projects.</p><div className="actions"><a className="primary" href="#equipment">Explore Equipment</a><button className="secondary" onClick={openQuote}>Request a Quote →</button></div></div><div className="hero-panel"><img src={LOGO} alt="Trident - Partners in Progress"/><p>PARTNERS IN PROGRESS</p><small>Equipment rental & project support</small></div></section>

    <section className="intro section"><div><p className="eyebrow">EQUIPMENT RENTAL</p><h2>Right equipment.<br/>Right project.</h2></div><p>From access platforms and lifting equipment to material handling solutions, Trident helps project teams source dependable equipment with responsive support. Availability is confirmed against your project location and rental dates.</p></section>

    <section id="equipment" className="section equipment-section"><p className="eyebrow">OUR FLEET</p><div className="section-head"><h2>Explore our equipment.</h2><span>{equipment.length || 20} equipment types</span></div><div className="toolbar"><input aria-label="Search equipment" placeholder="Search equipment..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="filters">{categoryNames.map(c=><button className={filter===c?'active':''} key={c} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>{loading ? <p>Loading fleet...</p> : <div className="grid">{visible.map(e=>{const cat=categoryMap.get(e.category_id) || ''; const soon=e.availability_status==='coming_soon'; const image=e.equipment_images?.find(i=>i.is_primary)?.image_url || e.equipment_images?.[0]?.image_url; return <article className="card" key={e.id}><div className="image-placeholder">{image ? <img src={image} alt={e.equipment_images?.[0]?.alt_text || e.name} loading="lazy"/> : <span>TRIDENT</span>}</div><p>{cat}</p><h3>{e.name}</h3><strong>{e.height || e.capacity || e.load_capacity || e.equipment_type || 'Equipment'}</strong><span className={`status ${soon?'soon':''}`}>{soon?'Coming Soon':'Available on request'}</span><button onClick={()=>setSelected(e)}>View Details <b>→</b></button></article>})}</div>}{!loading && visible.length===0 && <p>No equipment found.</p>}</section>

    <section id="solutions" className="band"><p className="eyebrow">OUR SOLUTIONS</p><h2>Support beyond the machine.</h2><div className="solution-grid"><article><span>01</span><h3>Equipment Rental</h3><p>Flexible rental support matched to project requirements and timelines.</p></article><article><span>02</span><h3>Project Support</h3><p>Requirement-led equipment selection and coordination for site teams.</p></article><article><span>03</span><h3>Fleet Support</h3><p>Planned service and equipment coordination for ongoing requirements.</p></article></div></section>

    <section id="industries" className="section"><p className="eyebrow">INDUSTRIES WE SERVE</p><h2>Built around project requirements.</h2><div className="industry-grid">{industries.map((x,i)=><a className="industry-item" href="#solutions" key={x}><small>0{i+1}</small><strong>{x}</strong><span>Explore solutions →</span></a>)}</div></section>

    <section id="locations" className="location-band"><div><p className="eyebrow">LOCATIONS</p><h2>Equipment support where your project needs it.</h2><p>Tell us your project location and requirement. Trident will confirm suitable equipment and deployment options.</p></div><button className="primary" onClick={openQuote}>Check Availability</button></section>

    <section id="about" className="section split"><div><p className="eyebrow">ABOUT TRIDENT</p><h2>Partners in Progress.</h2></div><div><p>Trident Trinity Assets Private Limited provides equipment rental and project support with a focus on dependable machines, responsive service and practical project solutions.</p><div className="stats"><div><b>20</b><span>Equipment types</span></div><div><b>2</b><span>Live categories</span></div><div><b>24/7</b><span>Requirement support</span></div></div></div></section>

    <section id="resources" className="band resources"><p className="eyebrow">RESOURCES</p><h2>Useful project information.</h2><div className="resource-grid"><article><small>GUIDE</small><h3>Equipment Selection</h3><p>Understand the key factors when choosing rental equipment.</p><a href="#equipment">Explore Equipment →</a></article><article><small>FAQ</small><h3>Rental FAQs</h3><p>Answers to common questions about equipment rental and enquiries.</p><a href="#contact">Ask a Question →</a></article><article><small>BROCHURE</small><h3>Trident Fleet</h3><p>Our equipment portfolio and rental capabilities.</p><a href="#contact">Request Brochure →</a></article></div></section>

    <section id="contact" className="contact"><div><p className="eyebrow">START A PROJECT</p><h2>Tell us what you need.</h2><p>Submit your requirement and our team will confirm equipment availability for your location and dates.</p></div><button className="primary" onClick={openQuote}>Request a Quote →</button></section>
    <footer><div><b>TRIDENT</b><p>Trident Trinity Assets Private Limited<br/>Partners in Progress.</p></div><div><b>QUICK LINKS</b><a href="#equipment">Equipment</a><a href="#industries">Industries</a><a href="#locations">Locations</a><a href="#contact">Contact</a></div><div><b>SUPPORT</b><a href="#resources">Resources</a><a href="#about">About Us</a><a href="#contact">Careers</a></div><small>© 2026 Trident Trinity Assets Private Limited.</small></footer>

    <div className="mobile-tabs" aria-label="Mobile navigation"><a href="#top">Home</a><a href="#equipment">Equipment</a><a href="#industries">Industries</a><button onClick={openQuote}>Quote</button><a href="#contact">Contact</a></div>

    {selected && <div className="modal" onClick={()=>setSelected(null)}><div className="modal-box detail-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><div className="detail-image">{selected.equipment_images?.[0]?.image_url ? <img src={selected.equipment_images[0].image_url} alt={selected.name}/> : <span>TRIDENT</span>}</div><p className="eyebrow">{categoryMap.get(selected.category_id)}</p><h2>{selected.name}</h2><p className="modal-spec">{selected.height || selected.capacity || selected.load_capacity || selected.equipment_type}</p><p>{selected.short_description || 'Equipment availability is subject to confirmation for your project location and dates.'}</p><div className="detail-specs"><div><span>Type</span><b>{selected.equipment_type || '—'}</b></div><div><span>Capacity</span><b>{selected.capacity || selected.load_capacity || '—'}</b></div><div><span>Height</span><b>{selected.height || '—'}</b></div></div><button className="primary" onClick={openQuote}>Request Quote</button></div></div>}
    {quoteOpen && <div className="modal" onClick={()=>setQuoteOpen(false)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setQuoteOpen(false)}>×</button><p className="eyebrow">GET A QUOTE</p><h2>Project requirement</h2><form onSubmit={submitQuote}><input name="name" required placeholder="Name"/><input name="company" required placeholder="Company"/><input name="email" required type="email" placeholder="Email"/><input name="phone" required placeholder="Phone"/><input name="location" placeholder="Project location"/><input name="quantity" type="number" min="1" defaultValue="1" placeholder="Quantity"/><input name="start_date" type="date"/><input name="duration" placeholder="Rental duration"/><textarea name="message" placeholder="Equipment and requirement" rows={4}/><button className="primary" type="submit">Submit Enquiry</button>{submitState && <p>{submitState}</p>}</form></div></div>}
  </main>
}
