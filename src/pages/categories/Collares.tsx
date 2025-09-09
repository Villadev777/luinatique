import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Heart, Star } from 'lucide-react';

const Collares = () => {
  const { subcategory } = useParams();
  const navigate = useNavigate();

  const subcategories = {
    'miyuki': {
      title: 'Collares Miyuki',
      description: 'Collares delicados con cuentas Miyuki que crean patrones únicos y coloridos.',
      products: []
    },
    'alambrismo': {
      title: 'Collares de Alambrismo',
      description: 'Collares artesanales con técnicas de alambrismo que crean formas orgánicas y naturales.',
      products: []
    },
    'bordados': {
      title: 'Collares Bordados',
      description: 'Collares con bordados tradicionales que celebran la riqueza cultural de nuestras tradiciones.',
      products: []
    },
    'soutache': {
      title: 'Collares Soutache',
      description: 'Collares elaborados con soutache, creando texturas y volúmenes únicos.',
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
              <span>Collares</span>
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
        <section className="py-20 bg-cream/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-foreground mb-6">
              {currentSubcategory ? currentSubcategory.title : 'Collares'}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {currentSubcategory 
                ? currentSubcategory.description
                : 'Collares que complementan tu estilo único. Desde piezas minimalistas hasta diseños elaborados que capturan la atención.'
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
                Estamos preparando una elegante colección de collares para ti.
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

export default Collares;