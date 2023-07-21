import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import MasonSalesforceSurveyPage from '../../components/pages/Mason/take-the-salesforce-survey';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderSalesforceSurveyPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Mason'), always(<MasonSalesforceSurveyPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderSalesforceSurveyPage;
