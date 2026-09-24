'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Category = { id: string; name: string; status: string; sort_order: number }
type Equipment = { id: string; category_id: string; name: string; short_description: string | null; equipment_type: string | null; capacity: string | null; height: string | null; load_capacity: string | null; status: string; availability_status: string }

const industries = ['Construction','Infrastructure','Industrial Maintenance','Warehousing','Manufacturing','Facility Maintenance']
const fallbackCategories = ['All','Access & Lifting','Material Handling','Power & Support','Earth Moving & Mining']

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
        supabase.from('equipment').select('id,category_id,name,short_description,equipment_type,capacity,height,load_capacity,status,availability_status').eq('status','active')
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

  return <main>
    <header className="header"><a className="brand" href="#top">TRIDENT</a><nav><a href="#equipment">Equipment</a><a href="#industries">Industries</a><a href="#about">About Us</a><a href="#contact">Contact</a></nav><button className="quote" onClick={() => setQuoteOpen(true)}>Get a Quote</button></header>
    <section id="top" className="hero"><div><p className="eyebrow">TRIDENT TRINITY ASSETS PVT. LTD.</p><h1>Elevating Projects.<br/>Empowering Growth.</h1><p>Equipment rental solutions for construction, industrial and infrastructure projects.</p><div className="actions"><a className="primary" href="#equipment">Explore Equipment</a><button className="secondary" onClick={() => setQuoteOpen(true)}>Request a Quote</button></div></div></section>
    <section id="equipment" className="section"><p className="eyebrow">OUR FLEET</p><h2>Equipment for the job.</h2><div className="toolbar"><input aria-label="Search equipment" placeholder="Search equipment..." value={search} onChange={e=>setSearch(e.target.value)}/><div className="filters">{categoryNames.map(c=><button className={filter===c?'active':''} key={c} onClick={()=>setFilter(c)}>{c}</button>)}</div></div>{loading ? <p>Loading fleet...</p> : <div className="grid">{visible.map(e=>{const cat=categoryMap.get(e.category_id) || ''; const soon=e.availability_status==='coming_soon'; return <article className="card" key={e.id}><div className="image-placeholder">TRIDENT</div><p>{cat}</p><h3>{e.name}</h3><strong>{e.height || e.capacity || e.load_capacity || e.equipment_type || 'Equipment'}</strong><span className={`status ${soon?'soon':''}`}>{soon?'Coming Soon':'Available'}</span><button onClick={()=>setSelected(e)}>View Details →</button></article>})}</div>}{!loading && visible.length===0 && <p>No equipment found.</p>}</section>
    <section id="industries" className="band"><p className="eyebrow">INDUSTRIES</p><h2>Built around project requirements.</h2><div className="industry-grid">{industries.map(x=><div key={x}>{x}</div>)}</div></section>
    <section id="about" className="section split"><div><p className="eyebrow">ABOUT TRIDENT</p><h2>Partners in Progress.</h2></div><p>Trident Trinity Assets Private Limited provides equipment rental and project support with a focus on dependable machines, responsive service and practical project solutions.</p></section>
    <section id="contact" className="contact"><p className="eyebrow">START A PROJECT</p><h2>Tell us what you need.</h2><p>Submit your requirement and our team will confirm equipment availability.</p><button className="primary" onClick={()=>setQuoteOpen(true)}>Request a Quote</button></section><footer>© 2026 Trident Trinity Assets Private Limited.</footer>
    {selected && <div className="modal" onClick={()=>setSelected(null)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><p className="eyebrow">{categoryMap.get(selected.category_id)}</p><h2>{selected.name}</h2><p className="modal-spec">{selected.height || selected.capacity || selected.load_capacity || selected.equipment_type}</p><p>{selected.short_description || 'Availability is subject to confirmation for your project location and dates.'}</p><button className="primary" onClick={()=>{setSelected(selected);setQuoteOpen(true)}}>Request Quote</button></div></div>}
    {quoteOpen && <div className="modal" onClick={()=>setQuoteOpen(false)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setQuoteOpen(false)}>×</button><p className="eyebrow">GET A QUOTE</p><h2>Project requirement</h2><form onSubmit={submitQuote}><input name="name" required placeholder="Name"/><input name="company" required placeholder="Company"/><input name="email" required type="email" placeholder="Email"/><input name="phone" required placeholder="Phone"/><input name="location" placeholder="Project location"/><input name="quantity" type="number" min="1" defaultValue="1" placeholder="Quantity"/><input name="start_date" type="date"/><input name="duration" placeholder="Rental duration"/><textarea name="message" placeholder="Equipment and requirement" rows={4}/><button className="primary" type="submit">Submit Enquiry</button>{submitState && <p>{submitState}</p>}</form></div></div>}
  </main>
}
