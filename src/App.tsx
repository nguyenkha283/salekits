import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { KhoiTaoDuAnPage } from './pages/KhoiTaoDuAnPage';
import { ProjectCreatedPage } from './pages/ProjectCreatedPage';
import { ProjectPreviewPage } from './pages/ProjectPreviewPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/khoi-tao-du-an" element={<KhoiTaoDuAnPage />} />
        <Route path="/hoan-tat" element={<ProjectCreatedPage />} />
        <Route path="/xem-truoc" element={<ProjectPreviewPage />} />
        <Route path="/chi-tiet-san-pham" element={<ProductDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>);

}