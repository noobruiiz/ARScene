import React, { useState } from 'react';
import useThreeScene from './useThreeScene';

const ThreeScene = () => {
  const [radius, setRadius] = useState(50);
  const [segments, setSegments] = useState(512);
  const [rings, setRings] = useState(512);
  const [intensity, setIntensity] = useState(0.5);
  const [imageUrl, setImageUrl] = useState('https://media.istockphoto.com/id/1214810768/es/vector/habitaci%C3%B3n-en-blanco-y-negro.jpg?s=612x612&w=0&k=20&c=u1ahthYn3pPGh-DkFH9Huh8itiqXEzSrEhKr2a0y6WI=');

  const mountRef = useThreeScene({
    radius,
    segments,
    rings,
    intensity,
    imageUrl
  });

  const handleImageUrlChange = (e) => {
    setImageUrl(e.target.value);
  };

  return (
    <div>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1 }}>
        <label>
          Radius:
          <input 
            type="number" 
            value={radius} 
            onChange={(e) => setRadius(parseFloat(e.target.value))} 
          />
        </label>
        <br />
        <label>
          Segments:
          <input 
            type="number" 
            value={segments} 
            onChange={(e) => setSegments(parseFloat(e.target.value))} 
          />
        </label>
        <br />
        <label>
          Rings:
          <input 
            type="number" 
            value={rings} 
            onChange={(e) => setRings(parseFloat(e.target.value))} 
          />
        </label>
        <br />
        <label>
          Intensity:
          <input 
            type="number" 
            step="0.01" 
            value={intensity} 
            onChange={(e) => setIntensity(parseFloat(e.target.value))} 
          />
        </label>
        <br />
        <label>
          Image URL:
          <input 
            type="text" 
            value={imageUrl} 
            onChange={handleImageUrlChange} 
          />
        </label>
      </div>
    </div>
  );
};

export default ThreeScene;
