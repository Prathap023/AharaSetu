import React from 'react';
import { useNavigate } from 'react-router-dom';

function AboutUs() {
  const navigate = useNavigate();

  const stats = [
    { val: '500+', lbl: 'Meals Saved' },
    { val: '50+', lbl: 'Restaurants' },
    { val: '200+', lbl: 'Volunteers' },
    { val: '10+', lbl: 'NGOs' },
  ];

  const values = [
    {
      title: 'Transparency',
      desc: 'Every listing is verified by our admin team before going live. No food goes unaccounted for.',
    },
    {
      title: 'Accountability',
      desc: 'Three-party acknowledgement ensures every transaction is confirmed by restaurant, volunteer and admin.',
    },
    {
      title: 'Accessibility',
      desc: 'Free for everyone. Restaurants, volunteers, NGOs and individuals can all participate at no cost.',
    },
    {
      title: 'Impact',
      desc: 'Every meal saved is a step toward reducing food waste and fighting hunger in Indian communities.',
    },
  ];

  const team = [
    {
      name: 'Bhanupratap Reddy',
      role: 'Full Stack Developer',
      desc: 'Built AharaSetu from scratch — backend API, React frontend, payments, emails and deployment.',
    },
  ];

  const howItWorks = [
    { step: '01', title: 'Restaurant Posts', desc: 'Restaurants list surplus food — free or at a reduced price per plate or kg.' },
    { step: '02', title: 'Admin Reviews', desc: 'Every listing is reviewed by our admin team before going live to ensure quality.' },
    { step: '03', title: 'Volunteer Claims', desc: 'Volunteers and NGOs browse listings, select quantity and claim food.' },
    { step: '04', title: 'Food Delivered', desc: 'Restaurant and volunteer both acknowledge. Admin completes the transaction.' },
  ];

  return (
    <div style={styles.page}>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroTag}>About AharaSetu</p>
          <h1 style={styles.heroTitle}>
            Bridging surplus food<br />with people in need
          </h1>
          <p style={styles.heroSub}>
            AharaSetu — meaning "Food Bridge" in Sanskrit — is a platform built to connect restaurants with surplus food to volunteers, NGOs and communities across India.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
              Join AharaSetu
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate('/contact')}>
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        {stats.map((s, i) => (
          <div key={i} style={styles.statItem}>
            <span style={styles.statVal}>{s.val}</span>
            <span style={styles.statLbl}>{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.missionGrid}>
            <div style={styles.missionLeft}>
              <p style={styles.sectionTag}>Our Mission</p>
              <h2 style={styles.sectionTitle}>
                Reducing food waste,<br />one meal at a time
              </h2>
              <p style={styles.sectionText}>
                Every day, restaurants across India discard enormous quantities of perfectly edible food while millions struggle to find even a single meal. AharaSetu was built to close this gap.
              </p>
              <p style={styles.sectionText}>
                We provide a structured, technology-driven platform that makes food sharing transparent, accountable and easy — for restaurants, volunteers, NGOs and administrators alike.
              </p>
            </div>
            <div style={styles.missionRight}>
              <div style={styles.missionCard}>
                <p style={styles.missionCardNum}>500+</p>
                <p style={styles.missionCardLbl}>Meals saved through the platform</p>
              </div>
              <div style={styles.missionCard}>
                <p style={styles.missionCardNum}>0</p>
                <p style={styles.missionCardLbl}>Cost to join and use AharaSetu</p>
              </div>
              <div style={styles.missionCard}>
                <p style={styles.missionCardNum}>100%</p>
                <p style={styles.missionCardLbl}>Admin-verified listings before going live</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div style={{ ...styles.section, background: '#F9FAFB' }}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionTag}>How it Works</p>
          <h2 style={styles.sectionTitle}>Simple. Transparent. Impactful.</h2>
          <div style={styles.stepsGrid}>
            {howItWorks.map((s, i) => (
              <div key={i} style={styles.stepCard}>
                <p style={styles.stepNum}>{s.step}</p>
                <h3 style={styles.stepTitle}>{s.title}</h3>
                <p style={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div style={styles.section}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionTag}>Our Values</p>
          <h2 style={styles.sectionTitle}>What we stand for</h2>
          <div style={styles.valuesGrid}>
            {values.map((v, i) => (
              <div key={i} style={styles.valueCard}>
                <div style={styles.valueDot} />
                <div>
                  <h3 style={styles.valueTitle}>{v.title}</h3>
                  <p style={styles.valueDesc}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div style={{ ...styles.section, background: '#F9FAFB' }}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionTag}>Built With</p>
          <h2 style={styles.sectionTitle}>Technology Stack</h2>
          <div style={styles.techGrid}>
            {[
              { name: 'React.js', desc: 'Frontend UI' },
              { name: 'Node.js + Express', desc: 'Backend API' },
              { name: 'MongoDB', desc: 'Database' },
              { name: 'Stripe', desc: 'Payments' },
              { name: 'Resend', desc: 'Email' },
              { name: 'Vercel', desc: 'Frontend Hosting' },
              { name: 'Render', desc: 'Backend Hosting' },
              { name: 'MongoDB Atlas', desc: 'Cloud Database' },
            ].map((t, i) => (
              <div key={i} style={styles.techCard}>
                <p style={styles.techName}>{t.name}</p>
                <p style={styles.techDesc}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={styles.section}>
        <div style={styles.sectionInner}>
          <p style={styles.sectionTag}>The Developer</p>
          <h2 style={styles.sectionTitle}>Built by one developer</h2>
          <div style={styles.teamGrid}>
            {team.map((t, i) => (
              <div key={i} style={styles.teamCard}>
                <div style={styles.teamAvatar}>
                  {t.name.charAt(0)}
                </div>
                <div style={styles.teamInfo}>
                  <h3 style={styles.teamName}>{t.name}</h3>
                  <p style={styles.teamRole}>{t.role}</p>
                  <p style={styles.teamDesc}>{t.desc}</p>
                  <div style={styles.teamTags}>
                    {['React', 'Node.js', 'MongoDB', 'Stripe', 'JWT'].map(tag => (
                      <span key={tag} style={styles.teamTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={styles.institutionText}>
            Ramaiah Institute of Technology · Department of MCA
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <div style={styles.ctaInner}>
          <h2 style={styles.ctaTitle}>Ready to make a difference?</h2>
          <p style={styles.ctaSub}>
            Join AharaSetu today — free for restaurants, volunteers, NGOs and individuals.
          </p>
          <div style={styles.ctaBtns}>
            <button style={styles.primaryBtn} onClick={() => navigate('/register')}>
              Create an Account
            </button>
            <button
              style={{ ...styles.secondaryBtn, borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }}
              onClick={() => navigate('/contact')}
            >
              Get in Touch
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'white', paddingTop: '58px' },
  hero: {
    background: 'linear-gradient(145deg, #1C1C1C 0%, #2D2D2D 100%)',
    padding: '72px 32px 64px',
  },
  heroInner: { maxWidth: '680px', margin: '0 auto', textAlign: 'center' },
  heroTag: {
    fontSize: '0.72rem', fontWeight: '700', color: '#FF5200',
    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px',
  },
  heroTitle: {
    fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '800',
    color: 'white', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '18px',
  },
  heroSub: {
    fontSize: '1rem', color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.75, marginBottom: '36px',
    maxWidth: '520px', margin: '0 auto 36px',
  },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    padding: '13px 28px', background: 'linear-gradient(135deg, #FF5200, #FF6B35)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(255,82,0,0.35)',
  },
  secondaryBtn: {
    padding: '13px 28px', background: 'transparent',
    color: 'rgba(255,255,255,0.65)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px', fontSize: '0.95rem',
    fontWeight: '500', cursor: 'pointer',
  },
  statsBar: {
    display: 'flex', justifyContent: 'center',
    background: 'white', borderBottom: '1px solid #F0F0F0',
    flexWrap: 'wrap',
  },
  statItem: {
    padding: '24px 48px', textAlign: 'center',
    borderRight: '1px solid #F0F0F0',
  },
  statVal: {
    display: 'block', fontSize: '2rem', fontWeight: '800',
    color: '#FF5200', letterSpacing: '-0.03em',
  },
  statLbl: {
    display: 'block', fontSize: '0.72rem', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px',
  },
  section: { padding: '72px 32px', background: 'white' },
  sectionInner: { maxWidth: '1080px', margin: '0 auto' },
  sectionTag: {
    fontSize: '0.72rem', fontWeight: '700', color: '#FF5200',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
    color: '#1C1C1C', letterSpacing: '-0.03em', marginBottom: '24px',
  },
  sectionText: {
    fontSize: '0.95rem', color: '#6B7280',
    lineHeight: 1.75, marginBottom: '14px',
  },
  missionGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '48px', alignItems: 'start',
  },
  missionLeft: {},
  missionRight: { display: 'flex', flexDirection: 'column', gap: '14px' },
  missionCard: {
    background: '#FAFAFA', border: '1px solid #F0F0F0',
    borderRadius: '12px', padding: '20px 22px',
    borderLeft: '3px solid #FF5200',
  },
  missionCardNum: {
    fontSize: '2rem', fontWeight: '800',
    color: '#FF5200', letterSpacing: '-0.03em', marginBottom: '4px',
  },
  missionCardLbl: { fontSize: '0.85rem', color: '#6B7280' },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px', marginTop: '8px',
  },
  stepCard: {
    background: 'white', border: '1px solid #F0F0F0',
    borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  stepNum: {
    fontSize: '2rem', fontWeight: '900', color: '#FF5200',
    opacity: 0.25, lineHeight: 1, marginBottom: '12px',
    letterSpacing: '-0.04em',
  },
  stepTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' },
  stepDesc: { fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.65 },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px', marginTop: '8px',
  },
  valueCard: {
    display: 'flex', gap: '14px',
    background: '#FAFAFA', border: '1px solid #F0F0F0',
    borderRadius: '12px', padding: '22px',
  },
  valueDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#FF5200', marginTop: '5px', flexShrink: 0,
  },
  valueTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px' },
  valueDesc: { fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.65 },
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px', marginTop: '8px',
  },
  techCard: {
    background: 'white', border: '1px solid #F0F0F0',
    borderRadius: '10px', padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  techName: { fontSize: '0.9rem', fontWeight: '700', color: '#1C1C1C', marginBottom: '3px' },
  techDesc: { fontSize: '0.78rem', color: '#9CA3AF' },
  teamGrid: { marginTop: '8px' },
  teamCard: {
    display: 'flex', gap: '22px',
    background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)',
    borderRadius: '16px', padding: '28px 32px',
    alignItems: 'flex-start', flexWrap: 'wrap',
  },
  teamAvatar: {
    width: '64px', height: '64px', borderRadius: '16px',
    background: 'linear-gradient(135deg, #FF5200, #FF8C00)',
    color: 'white', fontSize: '1.8rem', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 4px 16px rgba(255,82,0,0.35)',
  },
  teamInfo: { flex: 1 },
  teamName: { fontSize: '1.2rem', fontWeight: '800', color: 'white', marginBottom: '4px' },
  teamRole: { fontSize: '0.82rem', color: '#FF5200', fontWeight: '600', marginBottom: '10px' },
  teamDesc: { fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '14px' },
  teamTags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  teamTag: {
    fontSize: '0.7rem', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px',
    background: 'rgba(255,82,0,0.15)',
    color: '#FF8C00',
    border: '1px solid rgba(255,82,0,0.2)',
  },
  institutionText: {
    fontSize: '0.78rem', color: '#9CA3AF',
    textAlign: 'center', marginTop: '24px',
  },
  cta: {
    background: 'linear-gradient(145deg, #1C1C1C, #2D2D2D)',
    padding: '72px 32px', textAlign: 'center',
  },
  ctaInner: { maxWidth: '560px', margin: '0 auto' },
  ctaTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800',
    color: 'white', letterSpacing: '-0.03em', marginBottom: '10px',
  },
  ctaSub: { fontSize: '0.95rem', color: 'rgba(255,255,255,0.45)', marginBottom: '32px' },
  ctaBtns: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
};

export default AboutUs;