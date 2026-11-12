import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import './PublicationCard.css';

export const PublicationCard = ({ publication, className = '' }) => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);

  if (!publication) return null;

  const {
    _id,
    id,
    name,
    slug,
    description,
    category,
    author,
    subscriberCount = 0
  } = publication;

  const pubId = _id || id;
  const authorName = author?.fullName || 'Writer';

  const handleQuickSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    try {
      await subscriptionService.subscribe(pubId, email.trim());
      setSubscribed(true);
      setEmail('');
    } catch {
      alert('Subscription request submitted.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className={`publication-card card ${className}`}>
      <div className="pub-card-header">
        <span className="badge-category">{category || 'General'}</span>
        <span className="pub-card-subscribers">{subscriberCount} subscribers</span>
      </div>

      <h3 className="pub-card-name headline-editorial">
        <Link to={`/publication/${slug}`}>{name}</Link>
      </h3>

      <p className="pub-card-desc">{description}</p>

      <div className="pub-card-meta">
        <span className="pub-card-author">By {authorName}</span>
      </div>

      <div className="pub-card-actions">
        <Link to={`/publication/${slug}`} className="btn btn-secondary btn-sm">
          View Publication
        </Link>
        {!subscribed ? (
          <button
            type="button"
            onClick={() => setShowSubscribeForm(!showSubscribeForm)}
            className="btn btn-primary btn-sm"
          >
            Subscribe
          </button>
        ) : (
          <span className="pub-card-subscribed-badge">Subscribed</span>
        )}
      </div>

      {showSubscribeForm && !subscribed && (
        <form onSubmit={handleQuickSubscribe} className="pub-quick-sub-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="form-control pub-quick-sub-input"
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={subscribing}
          >
            {subscribing ? 'Joining...' : 'Confirm'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PublicationCard;
