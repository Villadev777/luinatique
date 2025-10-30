import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Shop() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirigir al catálogo principal (Collections) automáticamente
    navigate('/collections', { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo al catálogo...</p>
      </div>
    </div>
  );
}