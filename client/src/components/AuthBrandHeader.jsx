import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthBrandHeader() {
  return (
    <Link to="/" className="inline-block text-center hover:opacity-90 transition-opacity">
      <span className="font-display font-light text-3xl sm:text-4xl tracking-[-0.04em] text-charcoal lowercase select-none">
        biizora
      </span>
    </Link>
  );
}
