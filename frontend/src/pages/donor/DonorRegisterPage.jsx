import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api.js'

const DISTRICTS = ['Bugesera','Burera','Gakenke','Gasabo','Gatsibo','Gicumbi','Gisagara','Huye','Kamonyi','Karongi','Kayonza','Kicukiro','Kirehe','Muhanga','Musanze','Ngoma','Ngororero','Nyabihu','Nyagatare','Nyamagabe','Nyamasheke','Nyanza','Nyarugenge','Nyaruguru','Rubavu','Ruhango','Rulindo','Rusizi','Rutsiro','Rwamagana']
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const INIT = { full_name: '', blood_type: '', phone: '', district: '', latitude: '', longitude: '' }

export default function DonorRegisterPage() {
  const [form, setForm]         = useState(INIT)
  const [errors, setErrors]     = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess]   = useState(false)
  const [loading, setLoading]   = useState(false)

  function change(f, v) { setForm(x => ({ ...x, [f]: v })); setErrors(e => ({ ...e, [f]: '' })) }

  function validate() {
    const e = {}
    if (!form.full_name.trim()) e.full_name  = 'Full name is required'
    if (!form.blood_type)       e.blood_type = 'Select your blood type'
    if (!form.phone.trim())     e.phone      = 'Phone number is required'
    if (!form.district)         e.district   = 'Select your district'
    if (!form.latitude)         e.latitude   = 'Latitude is required'
    if (!form.longitude)        e.longitude  = 'Longitude is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.post('/donors/register', { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) })
      setSuccess(true)
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 440, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🩸</div>
        <h2 style={{ marginBottom: 10, fontFamily: 'DM Serif Display, serif' }}>You're registered!</h2>
        <p style={{ color: '#5C5752', marginBottom: 28, lineHeight: 1.7 }}>
          Thank you, <strong>{form.full_name}</strong>! When a hospital near you needs <strong>{form.blood_type}</strong> blood, you'll receive an SMS on <strong>{form.phone}</strong>.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => { setForm(INIT); setSuccess(false) }} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E2DDD8', background: '#F0EDE8', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Register another</button>
          <Link to="/"><button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#C0272D', color: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Back to home</button></Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F5', padding: '48px 24px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <Link to="/" style={{ fontSize: '0.85rem', color: '#5C5752', textDecoration: 'none' }}>← Back to home</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 20, marginBottom: 28 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#C0272D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>🩸</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontFamily: 'DM Serif Display, serif', marginBottom: 2 }}>Become a Donor</h1>
            <p style={{ color: '#5C5752', fontSize: '0.85rem' }}>Join donors already saving lives across Rwanda</p>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {apiError && <div style={{ background: '#fff0f0', border: '1px solid #fcc', color: '#8b1a1f', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: '0.88rem' }}>⚠ {apiError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C0272D', paddingBottom: 10, borderBottom: '1px solid #E2DDD8', marginBottom: 18 }}>Personal Information</div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5C5752', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input type="text" value={form.full_name} onChange={e => change('full_name', e.target.value)} placeholder="Jean-Pierre Habimana" style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.full_name ? '#C0272D' : '#E2DDD8'}`, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' }} />
              {errors.full_name && <span style={{ fontSize: '0.75rem', color: '#C0272D' }}>{errors.full_name}</span>}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5C5752', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>Blood Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {BLOOD_TYPES.map(bt => (
                  <div key={bt} onClick={() => change('blood_type', bt)} style={{ padding: '10px 4px', border: `1.5px solid ${form.blood_type === bt ? '#C0272D' : '#E2DDD8'}`, borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', background: form.blood_type === bt ? '#C0272D' : 'white', color: form.blood_type === bt ? 'white' : '#8A8580', transition: 'all .15s' }}>{bt}</div>
                ))}
              </div>
              {errors.blood_type && <span style={{ fontSize: '0.75rem', color: '#C0272D', marginTop: 4, display: 'block' }}>{errors.blood_type}</span>}
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5C5752', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>MTN Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => change('phone', e.target.value)} placeholder="0781234567" style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.phone ? '#C0272D' : '#E2DDD8'}`, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' }} />
              {errors.phone && <span style={{ fontSize: '0.75rem', color: '#C0272D' }}>{errors.phone}</span>}
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#C0272D', paddingBottom: 10, borderBottom: '1px solid #E2DDD8', marginBottom: 18, marginTop: 8 }}>Location</div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5C5752', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>District</label>
              <select value={form.district} onChange={e => change('district', e.target.value)} style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.district ? '#C0272D' : '#E2DDD8'}`, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' }}>
                <option value="">Select your district...</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.district && <span style={{ fontSize: '0.75rem', color: '#C0272D' }}>{errors.district}</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5C5752', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={e => change('latitude', e.target.value)} placeholder="-1.9441" style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.latitude ? '#C0272D' : '#E2DDD8'}`, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' }} />
                {errors.latitude && <span style={{ fontSize: '0.75rem', color: '#C0272D' }}>{errors.latitude}</span>}
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#5C5752', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={e => change('longitude', e.target.value)} placeholder="30.0619" style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.longitude ? '#C0272D' : '#E2DDD8'}`, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem' }} />
                {errors.longitude && <span style={{ fontSize: '0.75rem', color: '#C0272D' }}>{errors.longitude}</span>}
              </div>
            </div>
            <div style={{ background: '#F0EDE8', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem', color: '#5C5752', marginBottom: 24 }}>
              💡 Open Google Maps → long-press your location → coordinates appear at the top.
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#ccc' : '#C0272D', color: 'white', border: 'none', borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Registering...' : '🩸 Register as Donor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}