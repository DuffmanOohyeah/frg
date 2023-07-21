import React from 'react';
import { always, cond, equals } from 'ramda';
import { useContext } from 'react';
import { BrandContext } from '../../components/utils/WithBrand';
import MasonCAHGPage from '../../components/pages/Mason/cahg';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderCAHGPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Anderson'), always(<CatchAllErrorPage />)],
        [equals('Mason'), always(<MasonCAHGPage />)],
        [equals('Nelson'), always(<CatchAllErrorPage />)],
        [equals('Nigel'), always(<CatchAllErrorPage />)],
        [equals('Jefferson'), always(<CatchAllErrorPage />)],
        [equals('Washington'), always(<CatchAllErrorPage />)],
        [equals('FrgTech'), always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderCAHGPage;
