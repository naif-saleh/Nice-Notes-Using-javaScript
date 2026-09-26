import React, { useState } from 'react';
import { Lock, Unlock, X, ShieldAlert, KeyRound } from 'lucide-react';

export default function LockModal({ isOpen, mode = 'unlock', targetNote, onUnlock, onSetLock, onClose }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (mode === 'set') {
      if (pin !== confirmPin) {
        setError('PINs do not match. Please re-enter.');
        return;
      }
      onSetLock(pin);
      onClose();
    } else {
      // Unlock mode
      if (targetNote?.pinCode && targetNote.pinCode !== pin) {
        setError('Incorrect PIN. Please try again.');
        return;
      }
      onUnlock(targetNote);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card lock-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge lock">
              {mode === 'set' ? <Lock size={20} /> : <KeyRound size={20} />}
            </div>
            <div>
              <h3>{mode === 'set' ? 'Protect Note with PIN' : 'Unlock Note'}</h3>
              <p className="modal-subtitle">
                {mode === 'set'
                  ? 'Set a 4-digit security PIN to keep this note private.'
                  : `Enter the PIN to view "${targetNote?.title || 'Locked Note'}"`}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="lock-modal-form">
          {error && (
            <div className="lock-error-banner">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label>{mode === 'set' ? 'Create 4-Digit PIN' : 'Enter Security PIN'}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="••••"
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="pin-input"
            />
          </div>

          {mode === 'set' && (
            <div className="form-group">
              <label>Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="pin-input"
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {mode === 'set' ? 'Set PIN & Lock' : 'Unlock Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
