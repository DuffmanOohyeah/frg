import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import NigelAzureCAHGPage from '../../components/pages/Nigel/azure-cahg';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderCAHGPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Nigel'), always(<NigelAzureCAHGPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderCAHGPage;
