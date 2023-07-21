import React from 'react';
import { NextPage } from 'next';
import JobByEmail from '../components/patterns/JobsByEmail/JobsByEmail';
import Container from '../components/utils/Container/Container';
import { Card, CardBody } from '../components/bits/Card/Card';

const JobsByEmailPage: NextPage = () => {
    return (
        <Container>
            <Card>
                <CardBody>
                    <JobByEmail />
                </CardBody>
            </Card>
        </Container>
    );
};

export default JobsByEmailPage;
