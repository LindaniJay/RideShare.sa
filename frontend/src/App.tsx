import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CorporateSite from './pages/CorporateSite';
import './styles/corporate.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CorporateSite page="home" />} />
        <Route path="/products" element={<CorporateSite page="products" />} />
        <Route path="/business" element={<CorporateSite page="business" />} />
        <Route path="/safety" element={<CorporateSite page="safety" />} />
        <Route path="/about" element={<CorporateSite page="about" />} />
        <Route path="/contact" element={<CorporateSite page="contact" />} />
        <Route path="/careers" element={<CorporateSite page="careers" />} />
        <Route path="/investors" element={<CorporateSite page="investors" />} />
        <Route path="/insights" element={<CorporateSite page="insights" />} />
        <Route
          path="/insights/:slug"
          element={<CorporateSite page="article" />}
        />
        <Route
          path="/rent"
          element={
            <ExternalRedirect href="https://www.ridesharesaplatform.co.za/listings" />
          }
        />
        <Route
          path="/host"
          element={
            <ExternalRedirect href="https://www.ridesharesaplatform.co.za/host/listings/new" />
          }
        />
        <Route
          path="/app/*"
          element={
            <ExternalRedirect href="https://www.ridesharesaplatform.co.za" />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function ExternalRedirect({ href }: { href: string }) {
  window.location.replace(href);
  return <main className="redirect-state">Opening RideShare Rent…</main>;
}
