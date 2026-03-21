import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import TopNav from './components_TopNav';
import PageHeader from './components_PageHeader';
import ProductTabs from './components_ProductTabs';
import FilterBar from './components_FilterBar';
import ProductTable from './components_ProductTable';
import { useProducts } from './hooks_useProducts';
import AddItemModal from './AddItemModal';

const MenuItemScreen: React.FC = () => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, filteredProducts } = useProducts();
   const [modalOpen, setModalOpen] = useState(false);
   
  return (
    <Box sx={{ minHeight: '100vh',display: 'flex', flexDirection: 'column',p:1}}>
     
        {/* <PageHeader onAddNew={() => setModalOpen(true)} /> */}
        <ProductTabs value={activeTab} onChange={setActiveTab} />
        <FilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddNew={() => setModalOpen(true)} />
        <ProductTable products={filteredProducts} />
       <AddItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(values, imageFile) => {
          console.log('New item:', values, imageFile);
          setModalOpen(false);
        }}
      />
    </Box>
  );
};

export default MenuItemScreen;
