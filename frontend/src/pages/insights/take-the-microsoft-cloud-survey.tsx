import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import NigelMsCloudSurveyPage from '../../components/pages/Nigel/take-the-microsoft-cloud-survey';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderMsCloudSurveyPage = () => {
    const { brand } = useContext(BrandContext);

    return cond<string, JSX.Element>([
        [equals('Nigel'), always(<NigelMsCloudSurveyPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderMsCloudSurveyPage;
