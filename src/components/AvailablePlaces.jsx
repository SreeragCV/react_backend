import { useState } from 'react';
import Places from './Places.jsx';
import { useEffect } from 'react';

export default function AvailablePlaces({ onSelectPlace }) {

  const [data, setData] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/places')
    .then((response) => {
      return response.json();
    }).then((res) => {
      setData(res.places)
    })
  }, [])


  return (
    <Places
      title="Available Places"
      places={data}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
