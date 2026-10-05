import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div style={{ padding: '80px 1rem', textAlign: 'center', backgroundColor: '#f8fafc', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container-sm">
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#2563eb', marginBottom: '12px' }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.6rem', color: '#0f172a', marginBottom: '12px' }}>
          Página não encontrada
        </h2>
        <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto 28px' }}>
          O endereço que você tentou acessar não existe ou foi transferido.
        </p>
        <Link to="/">
          <Button variant="primary" icon={Home}>
            Voltar para a Página Inicial
          </Button>
        </Link>
      </div>
    </div>
  );
}
