import React from 'react';
import PayPalEdgeFunctionTester from '../components/PayPalEdgeFunctionTester';

const PayPalTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <PayPalEdgeFunctionTester />
    </div>
  );
};

export default PayPalTestPage;