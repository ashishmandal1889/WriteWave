import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/Loading/Loading';
import EmptyState from '../../components/EmptyState/EmptyState';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './Subscriptions.css';

export const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionService.getMySubscriptions();
      setSubscriptions(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (publicationId) => {
    if (!user?.email) return;
    try {
      await subscriptionService.unsubscribe(publicationId, user.email);
      setSubscriptions((prev) =>
        prev.filter((sub) => (sub.publication?._id || sub.publication) !== publicationId)
      );
      setActionMessage('Successfully unsubscribed from publication newsletters.');
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to unsubscribe.');
      setTimeout(() => setActionMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="subscriptions-loading">
        <Loading message="Loading your subscriptions..." size="lg" />
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <header className="subscriptions-header-section">
        <div className="container-narrow">
          <h1 className="subscriptions-heading headline-editorial">My Subscriptions</h1>
          <p className="subscriptions-subheading">
            Independent publications and newsletters you are actively subscribed to.
          </p>
        </div>
      </header>

      <main className="subscriptions-content-section">
        <div className="container-narrow">
          {actionMessage && (
            <div className="subscription-alert-notice">{actionMessage}</div>
          )}

          {error && <ErrorMessage message={error} onRetry={fetchSubscriptions} />}

          {subscriptions.length > 0 ? (
            <div className="subscriptions-list">
              {subscriptions.map((sub) => {
                const pub = sub.publication;
                if (!pub) return null;
                const pubId = pub._id || pub.id;

                return (
                  <div key={sub._id || sub.id} className="sub-item-card card">
                    <div className="sub-item-main">
                      <div className="sub-item-meta">
                        {pub.category && (
                          <span className="sub-badge-category">{pub.category}</span>
                        )}
                      </div>
                      <h3 className="sub-pub-name headline-editorial">
                        <Link to={`/publication/${pub.slug}`}>{pub.name}</Link>
                      </h3>
                      {pub.description && (
                        <p className="sub-pub-description">{pub.description}</p>
                      )}
                    </div>

                    <div className="sub-item-actions">
                      <Link to={`/publication/${pub.slug}`} className="btn btn-secondary btn-sm">
                        Visit Publication
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleUnsubscribe(pubId)}
                        className="btn btn-ghost btn-sm text-muted-action"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No active subscriptions"
              description="You have not subscribed to any publications yet. Explore independent newsletters to find writers you love."
              actionText="Explore Publications"
              actionLink="/publications"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Subscriptions;