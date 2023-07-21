import React, { useContext } from 'react';
import { cond, equals, always, T } from 'ramda';
import { BrandContext } from '../components/utils/WithBrand';
import { getConfigServer, Config } from '../client';
import { GetContentPageQueryData } from '../queries';
import WFIEpicorSalarySurvey from '../components/pages/Washington/epicorSalarySurvey';
import CatchAllErrorPage from '../components/templates/Errors/CatchAllError';

interface ConfigProps {
    config: Config;
}

interface SalarySurveyProps extends ConfigProps {
    page: GetContentPageQueryData;
}

const getRenderPage = (brand: string, props: SalarySurveyProps) =>
    cond<string, JSX.Element>([
        [equals('Washington'), always(<WFIEpicorSalarySurvey {...props} />)],
        [T, always(<CatchAllErrorPage />)],
    ])(brand);

const ComponentToRender = (props: SalarySurveyProps) => {
    const { brand } = useContext(BrandContext);
    return getRenderPage(brand, props);
};

ComponentToRender.getInitialProps = async () => {
    const config = await getConfigServer();
    const { brand } = config;

    return cond<string, Promise<SalarySurveyProps> | SalarySurveyProps | ConfigProps | undefined | null>([
        [equals('Washington'), always({ config: config })],
        [T, always(null)],
    ])(brand);
};

export default ComponentToRender;
