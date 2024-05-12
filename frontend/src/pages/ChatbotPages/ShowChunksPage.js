import React, { useState, useEffect } from 'react';
import Card from './Card.js'; // We'll create this component next
import { useLocation } from 'react-router-dom';



const ShowChunksPage = () => {
  const [cards, setCards] = useState([]);

  let location = useLocation();
  let courseName = location.state;
  let offset = 0;
  let noOfChunks = 5;
  


  useEffect(() => {
    //console.log("HERE");
    const fetchData = async () => {
      const url = `http://localhost:3000/api/v1/chatbot/getChunks`;
      
    const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({courseName, offset, noOfChunks})
    });

    const chunkArr = await response.json();
    let newCards = [];
    for(let i = 0; i < chunkArr.length; i++){
        newCards.push({
            text: chunkArr[i].text,
            number: chunkArr[i].usageCount,
            sourceName: chunkArr[i].sourceName,
            pageNumber: chunkArr[i].pageNumber
        });

    }
    setCards([...cards, ...newCards]);
    offset = cards.length;
    
      
    };

    fetchData();
  }, [courseName]);

  const loadMoreCards = async () => {
    let offset = cards.length;
    const url = `http://localhost:3000/api/v1/chatbot/getChunks`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({courseName, offset, noOfChunks})
        });
        

    const chunkArr = await response.json();
    let newCards = [];
    for(let i = 0; i < chunkArr.length; i++){
        newCards.push({
            text: chunkArr[i].text,
            number: chunkArr[i].usageCount,
            sourceName: chunkArr[i].sourceName,
            pageNumber: chunkArr[i].pageNumber
    });

    }


      setCards([...cards, ...newCards]);
      offset = cards.length;
  };

  return (
    <div className="ShowChunks">
      {cards.map((card, index) => (
        <Card key={index} text={card.text} number={card.number} sourceName={card.sourceName} pageNumber={card.pageNumber} />
      ))}
      <button onClick={loadMoreCards}>Load More</button>
    </div>
  );
};

export default ShowChunksPage;











