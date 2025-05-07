import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function Reprintables() {
  const [side, setSide] = useState('front');
  const [cardContent, setCardContent] = useState({
    front: '',
    back: ''
  });

  const handleChange = (e) => {
    setCardContent({
      ...cardContent,
      [side]: e.target.value
    });
  };

  const toggleSide = () => {
    setSide((prevSide) => (prevSide === 'front' ? 'back' : 'front'));
  };

  return (
    <div>
      <h1>Reprintables - Card Designer</h1>

      <div>
        <button onClick={toggleSide}>
          Switch to {side === 'front' ? 'Back' : 'Front'} Side
        </button>
      </div>

      <div>
        <h2>Editing {side.charAt(0).toUpperCase() + side.slice(1)} Side</h2>
        <textarea
          rows="6"
          cols="40"
          value={cardContent[side]}
          onChange={handleChange}
          placeholder={`Enter ${side} content here`}
        />
      </div>

      <hr />

      <div>
        <h2>Card Preview</h2>
        <div>
          <h3>Front Side</h3>
          <p>{cardContent.front || '[Empty]'}</p>
        </div>
        <div>
          <h3>Back Side</h3>
          <p>{cardContent.back || '[Empty]'}</p>
        </div>
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Reprintables />);
