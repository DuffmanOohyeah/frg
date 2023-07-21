import React, { useContext } from 'react';
import { always, cond, equals, T } from 'ramda';
import { BrandContext } from '../../components/utils/WithBrand';
import JFIAwsSurveyPage from '../../components/pages/Jefferson/take-the-aws-survey';
import CatchAllErrorPage from '../../components/templates/Errors/CatchAllError';

const RenderAwsSurveyPage = () => {
    const { brand } = useContext(BrandContext);
    return cond<string, JSX.Element>([
        [equals('Jefferson'), always(<JFIAwsSurveyPage />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);
};

export default RenderAwsSurveyPage;
