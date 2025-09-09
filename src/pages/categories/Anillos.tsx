import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Star } from 'lucide-react';

const Anillos = () => {
  const { subcategory } = useParams();
  const navigate = useNavigate();

  const subcategories = {
    'miyuki': {
      title: 'Anillos Miyuki',
      description: 'Anillos delicados inspirados en la técnica japonesa Miyuki, con cuentas diminutas y diseños únicos.',
      products: []
    },
    'alambrismo': {
      title: 'Anillos de Alambrismo',
      description: 'Anillos artesanales creados con técnicas de alambrismo, cada pieza es única y hecha a mano.',
      products: []
    }
  };

  const currentSubcategory = subcategory ? subcategories[subcategory as keyof typeof subcategories] : null;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Breadcrumb */}
        <section className="py-6 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/shop')}
                className="p-0 h-auto hover:bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tienda
              </Button>
              <span>/</span>
              <span>Anillos</span>
              {currentSubcategory && (
                <>
                  <span>/</span>
                  <span className="text-foreground font-medium">{currentSubcategory.title}</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-20 bg-sage/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-6">
              {currentSubcategory ? currentSubcategory.title : 'Anillos'}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {currentSubcategory 
                ? currentSubcategory.description
                : 'Descubre nuestra exquisita colección de anillos, desde diseños minimalistas hasta piezas de declaración que capturan la esencia de la elegancia atemporal.'
              }
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl font-semibold mb-4">
                Próximamente
              </h2>
              <p className="text-muted-foreground mb-8">
                Estamos preparando una increíble selección de anillos para ti.
              </p>
              <Button onClick={() => navigate('/shop')}>
                Ver Todos los Productos
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Anillos;