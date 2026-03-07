import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../utils/api.js'

export default function DonorRespondPage() {
  const [params]   = useSearchParams()
  const donor_id   = params.get('donor_id')
  const request_id = params.get('request_id')
  const [status,  setStatus]  = useState('idle')
  const [choice,  setChoice]  = useState(null)
  const [message, setMessage] = useState('')

  async function respond(answer) {
    setStatus('loading'); setChoice(answer)
    try {
      await api.post('/donors/respond', { donor_id: parseInt(donor_id), request_id: parseInt(request_id), response: answer })
      setStatus('success')
      setMessage(answer === 'accepted' ? 'Thank you! The hospital has been notified. Please make your way there as soon as possible.' : 'Understood. Your response has been recorded. Thank you for being a registered donor.')
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.error || 'Something went wrong.')
    }
  }

  if (!donor_id || !request_id) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F5', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 380, textAlign: 'center' }}>
        <p style={{ color: '#5C5752' }}>Invalid response link. Please use the link from your SMS.</p>
      </div>
    </div>
  )

  if (status === 'success') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1714', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 14 }}>{choice === 'accepted' ? '❤️' : '🙏'}</div>
        <h2 style={{ marginBottom: 10, fontFamily: 'DM Serif Display, serif' }}>{choice === 'accepted' ? 'Response Confirmed!' : 'Response Recorded'}</h2>
        <p style={{ color: '#5C5752', lineHeight: 1.7 }}>{message}</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A1714', padding: 24 }}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 400, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background: '#C0272D', padding: '28px', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>🩸</div>
          <h2 style={{ color: 'white', marginBottom: 6, fontFamily: 'DM Serif Display, serif' }}>Blood Donation Request</h2>
          <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>A hospital needs your blood type urgently</p>
        </div>
        <div style={{ padding: 28 }}>
          {status === 'error' && <div style={{ background: '#fff0f0', border: '1px solid #fcc', color: '#8b1a1f', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: '0.88rem' }}>{message}</div>}
          <p style={{ fontSize: '0.85rem', color: '#5C5752', textAlign: 'center', marginBottom: 20 }}>Can you donate today?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button onClick={() => respond('accepted')} disabled={status === 'loading'} style={{ background: '#16A34A', color: 'white', border: 'none', padding: 13, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer' }}>✓ Yes, I Can Donate</button>
            <button onClick={() => respond('declined')} disabled={status === 'loading'} style={{ background: '#F0EDE8', color: '#5C5752', border: '1.5px solid #E2DDD8', padding: 13, borderRadius: 10, fontFamily: 'DM Sans, sans-serif', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer' }}>✗ Not Available</button>
          </div>
        </div>
      </div>
    </div>
  )
}