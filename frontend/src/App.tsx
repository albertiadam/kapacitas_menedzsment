import { useState, useEffect, use } from 'react'
import './App.css'

interface KalapResponse {
  kalap: string;
}

function App() {
  const [kalapId,setKalapId] = useState("");
  const [eredmeny, setEredmeny] = useState<KalapResponse | null>(null);
  const [szamolo, setSzamolo] = useState(0);

  const fetchData = async () => {
    try {
      if (kalapId === "asd") {
        setEredmeny({kalap: "Ez egy teszt kalap!"});
      }
      else{
        const response = await fetch(`http://127.0.0.1:8000/kalap/${kalapId}`);
        const data = await response.json();
        setEredmeny(data);
      }

    } catch (error) {
      console.error('Hiba a lekérés során:', error);
    }
  }

 
  return (
    <div>
      <p>Helloka!</p>
      <input 
        type="text" 
        id="kalap-id" 
        placeholder="Kalap ID" 
        value={kalapId}
        onChange={(e) => setKalapId(e.target.value)}
      />
      <button onClick={fetchData}>Adatok lekérése</button>

      {eredmeny && (
        <div>
          <h2>Eredmény:</h2>
          <p>{eredmeny.kalap}</p>
        </div>
      )}

      <button onClick={
        () => {setSzamolo(szamolo + 1)
        }
      }>asd</button>
      {szamolo != 0 && 
      <p>{szamolo}</p>}
    </div>
  )
}


export default App