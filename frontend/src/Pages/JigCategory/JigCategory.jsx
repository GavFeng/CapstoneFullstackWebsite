import React, { useContext } from 'react';
import { JigContext } from '../../Context/JigContext';
import Item from '../../Components/Item/Item';
import './JigCategory.css';

const JigCategory = () => {
  const { jigs, loading } = useContext(JigContext);

  if (loading) return <p className="loading-text">Loading jigs...</p>;
  if (!jigs.length) return <p className="loading-text">No jigs found</p>;

  return (
    <div className="jig-category-page">
      <p className="jig-count">
        Showing {jigs.length} products
      </p>

      <div className="jig-grid">
        {jigs.map((jig) => (
          <Item
            key={jig._id}
            id={jig._id}
            name={jig.name}
            price={jig.price}
            colors={jig.colors}
          />
        ))}
      </div>
    </div>
  )
}

export default JigCategory