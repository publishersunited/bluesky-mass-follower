import React, { useState } from 'react';
import './App.css';

function App() {
  const [identifier, setIdentifier] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [targetHandle, setTargetHandle] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Processing...');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/follow-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, appPassword, targetHandle })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Followed ${data.followedCount} users.`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Something went wrong.');
    }
  };

  return (
    <div className="App">
      <h2>Bluesky Mass Follower</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Bluesky handle" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <input type="password" placeholder="App Password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} required />
        <input type="text" placeholder="Target Bluesky handle" value={targetHandle} onChange={(e) => setTargetHandle(e.target.value)} required />
        <button type="submit">Follow All</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default App;
