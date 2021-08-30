import React, { useCallback } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';

import { newExchange } from './api';
import { destroy as destroyAll } from './store';

import Main from './Main';
import Communication from './Communication';
import Header from './Header';
import Footer from './Footer';

const App = () => {
  const history = useHistory();

  const createNewExchange = useCallback(async () => {
    const uuid = await newExchange();

    history.push(`/m/${uuid}`);
  }, [history]);

  const destroy = useCallback(async () => {
    await destroyAll();
    window.location.reload();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <Switch>
          <Route path="/m/:uuid" component={Communication} />
          <Route path="/" render={() => <Main newExchange={createNewExchange} destroy={destroy} />} />
        </Switch>
      </main>
      <Footer />
    </>
  );
};

export default App;
