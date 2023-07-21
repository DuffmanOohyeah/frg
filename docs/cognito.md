# Cognito

## Identity providers

### Google

Connected directly from Cognito to Google.

### Github

Cognito requires [OIDC](https://en.wikipedia.org/wiki/OpenID_Connect),
but Github only provides OAuth 2.0. This gap is bridge by
[github-cognito-openid-wrapper](https://github.com/TimothyJones/github-cognito-openid-wrapper/)
which authenticates using OAuth 2.0, then makes calls to the Github
API to gather the other data. This is deployed on Lambda and uses
APIGateway (The original project makes use of SAM, but have
incorporated it into the CDK deployment).

### LinkedIn

LinkedIn is in much the same boat as Github, but with no open source
project to do the bridging. Hence,
[linkedin-cognito-openid-wrapper](https://github.com/isotoma/linkedin-cognito-openid-wrapper),
which is a reworking of github-cognito-openid-wrapper, but for
LinkedIn.

### FRG Active Directory

Connected directly from Cognito to FRG's Azure AD Connect, using
Cognito's SAML connector.
