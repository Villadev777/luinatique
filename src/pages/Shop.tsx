import { Navigate } from 'react-router-dom';

export default function Shop() {
  // Redirección directa al catálogo de productos
  return <Navigate to="/collections" replace />;
}