import React from 'react';
import { CatalogList } from './features/catalog';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1 className="app-title">EventDrivenStore Catalog</h1>
      <CatalogList />
    </div>
  );
};

export default App;

