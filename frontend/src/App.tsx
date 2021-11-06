import React, { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import { newExchange } from './api';
import { destroy as destroyAll } from './store';

import { LiveUpdatesProvider } from './LiveUpdates';
import Main from './Main';
import Communication from './Communication';
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const navigate = useNavigate();

  const createNewExchange = useCallback(async () => {
    const uuid = await newExchange();

    navigate(`/m/${uuid}`);
  }, [navigate]);

  const destroy = useCallback(async () => {
    await destroyAll();
    window.location.reload();
  }, []);

  return (
    <LiveUpdatesProvider>
      <Header />
      <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <Routes>
          <Route path="/m/:uuid" element={<Communication />} />
          <Route path="/" element={<Main newExchange={createNewExchange} destroy={destroy} />} />
        </Routes>
      </main>
      <Footer />
    </LiveUpdatesProvider>
  );
};

export default App;
