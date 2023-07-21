import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import NelsonBusAppsServiceNowPage from '../../components/pages/Nelson/servicenow-careers-and-hiring-guide';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderServiceNowPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Nelson'), always(<NelsonBusAppsServiceNowPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderServiceNowPage;
