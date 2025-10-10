import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageLayout.css';
import './AboutUs.css'; // We will create this file next

const AboutUs = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-container">
        <h1 className="page-title">About AutoHub</h1>
        <section className="section">
          <h2 className="section-title">Our Story</h2>
          <div className="section-content">
            <p>Welcome to AutoHub, your premier destination for everything automotive. Founded in 2025, AutoHub was created with a passion for cars and a vision to build a vibrant, interconnected community for enthusiasts, buyers, and sellers alike. We believe in the power of connection and the thrill of discovery, whether you're showcasing your prized possession, finding your next dream vehicle, or connecting with fellow car lovers.</p>
            <p>Our journey began with a simple idea: to combine the dynamic social features of platforms like Instagram with the robust marketplace capabilities of Facebook Marketplace, all tailored for the automotive world. We observed a gap where car enthusiasts could truly engage, share their experiences, and conduct transactions in a specialized environment. AutoHub fills that gap, offering a unique blend of community interaction and commercial opportunity.</p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Our Mission</h2>
          <div className="section-content">
            <p>At AutoHub, our mission is to empower the global automotive community. We strive to provide an intuitive, secure, and engaging platform where:</p>
            <ul>
              <li>Users can easily list vehicles, parts, and events for sale or showcase.</li>
              <li>Enthusiasts can connect, follow each other, and share their automotive journeys.</li>
              <li>Buyers can discover unique vehicles and connect directly with sellers.</li>
              <li>Everyone can stay informed about the latest trends, events, and news in the automotive world.</li>
            </ul>
            <p>We are committed to fostering a respectful and passionate community, ensuring every member feels valued and heard. Join us in driving the future of automotive interaction!</p>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Meet the Team</h2>
          <div className="section-content grid team-grid">
            {/* Placeholder for team members */}
            <div className="card team-member-card">
              <img src="https://i.pravatar.cc/150?img=68" alt="Team Member 1" className="team-member-avatar" />
              <h3>Jane Doe</h3>
              <p className="muted">Founder & CEO</p>
              <p>Passionate about classic cars and community building.</p>
            </div>
            <div className="card team-member-card">
              <img src="https://i.pravatar.cc/150?img=69" alt="Team Member 2" className="team-member-avatar" />
              <h3>John Smith</h3>
              <p className="muted">Lead Developer</p>
              <p>Expert in scalable web applications and automotive tech.</p>
            </div>
            <div className="card team-member-card">
              <img src="https://i.pravatar.cc/150?img=70" alt="Team Member 3" className="team-member-avatar" />
              <h3>Emily White</h3>
              <p className="muted">Community Manager</p>
              <p>Connects enthusiasts and fosters a thriving AutoHub environment.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
