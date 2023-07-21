import React from 'react';
import { NextPage } from 'next';
import ContactUsForm from '../components/patterns/PardotForms/ContactUsForm';
import { Card, CardBody } from '../components/bits/Card/Card';
import StyledContainer from '../components/utils/Container/Container';
import Heading from '../components/bits/Headings/Headings';
import ContactOffices from '../components/patterns/ContactOffices/ContactOffices';
import { useTranslation } from 'react-i18next';

const ContactPage: NextPage = () => {
    const { t } = useTranslation();

    return (
        <StyledContainer marginTop size="medium">
            <Heading size="beta">{t('contactPage_header')}</Heading>
            <Card>
                <CardBody>
                    <ContactUsForm />
                </CardBody>
            </Card>
            <ContactOffices />
        </StyledContainer>
    );
};

export default ContactPage;
