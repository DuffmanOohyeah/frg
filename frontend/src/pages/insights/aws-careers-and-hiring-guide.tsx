import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import JeffersonCAHGPage from '../../components/pages/Jefferson/cahg';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderCAHGPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Jefferson'), always(<JeffersonCAHGPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderCAHGPage;
