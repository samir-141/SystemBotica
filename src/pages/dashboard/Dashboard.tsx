// src/pages/dashboard/Dashboard.tsx
import React from 'react';

import DashboardVentas from '../../components/DashbordElements/GraficoVentas';
const Dashboard: React.FC = () => {

    return (
        <div className='bg-white'>
            <DashboardVentas />
        </div>
    );
};

export default Dashboard;