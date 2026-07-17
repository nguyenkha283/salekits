import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { CategoryCards } from '../components/CategoryCards';
export function HomePage() {
  return (
    <div className="min-h-full w-full bg-white font-sans text-neutral-900">
      <Header />
      <main>
        <Hero />
        <CategoryCards />
      </main>
    </div>);

}