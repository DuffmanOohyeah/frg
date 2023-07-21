import React, { useContext, useState } from 'react';
import { NextPage } from 'next';
import RestrictedErrorPage from '../components/templates/Errors/RestrictedError';
import UserContext from '../components/utils/WithAuth/UserContext';
import { Card, CardBody } from '../components/bits/Card/Card';
import Heading from '../components/bits/Headings/Headings';
import StyledContainer from '../components/utils/Container/Container';
import CVUpload from '../components/patterns/CVUpload/CVUpload';
import AuthContext from '../components/utils/WithAuth/AuthContext';
import frgI18n from '../i18n/frgI18n';
import { useTranslation } from 'react-i18next';
import postUploadCVFormHandler from '../pardot/formHandlers/uploadCV';

const ProfilePage: NextPage = () => {
    const { t } = useTranslation();
    const { candidateUserDetails } = useContext(UserContext);
    const { updateCandidateUserProfile } = useContext(AuthContext);
    const router = frgI18n.useRouter();
    const [file, setFile] = useState<File>();

    if (!candidateUserDetails) {
        return <RestrictedErrorPage />;
    }

    return (
        <StyledContainer size="medium" marginTop>
            <Heading size="beta">{t('candidate_upload_cv_header')}</Heading>
            <Card>
                <CardBody>
                    <CVUpload
                        candidateCV={file}
                        onFileChange={setFile}
                        finishUploadCallback={async (getUrl, cvFile): Promise<void> => {
                            postUploadCVFormHandler({
                                email: candidateUserDetails.email,
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                cv_indicator: cvFile.name,
                            });
                            await updateCandidateUserProfile({ cvFileUrl: getUrl, cvFile: cvFile.name });
                        }}
                        onUploadFinish={(): void => {
                            router.push({ pathname: '/profile' });
                        }}
                    />
                </CardBody>
            </Card>
        </StyledContainer>
    );
};

export default ProfilePage;
