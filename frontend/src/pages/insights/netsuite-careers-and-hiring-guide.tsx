import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import AndersonCAHGPage from '../../components/pages/Anderson/cahg';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderCAHGPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Anderson'), always(<AndersonCAHGPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderCAHGPage;
