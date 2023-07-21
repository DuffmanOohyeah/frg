import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import NigelBusAppsCAHGPage from '../../components/pages/Nigel/business-apps-cahg';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderCAHGPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Nigel'), always(<NigelBusAppsCAHGPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderCAHGPage;
