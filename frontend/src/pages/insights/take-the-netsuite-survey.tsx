import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import AndersonNetsuiteSurveyPage from '../../components/pages/Anderson/take-the-netsuite-survey';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderNetsuiteSurveyPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Anderson'), always(<AndersonNetsuiteSurveyPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderNetsuiteSurveyPage;
