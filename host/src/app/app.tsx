import * as React from 'react';
import { Route, Routes, Link } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';

const Remote = React.lazy(() => import('remote/Module'));

export function App() {
  return (
    <div>
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/remote">Remote</Link>
          </li>
        </ul>
      </div>
      <React.Suspense>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1>Home</h1>
                <p>This is the home page</p>
              </>
            }
          />
          <Route
            path="/remote"
            element={<Remote/>}
          />
        </Routes>
      </React.Suspense>
    </div>
  );
}

export default App;
