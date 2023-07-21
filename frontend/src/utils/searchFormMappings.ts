// this maps the display value of the products and segments with the value
// stored in the database. In elastic search under key product / segment
// in s3 under the key industry_id / segment_id,

export const productMappingDisplayToDatabase: Record<string, string> = {
    Azure: 'Azure data platform',
    DevOps: 'DevOps',
    Infrastructure: 'Infrastructure',
    Security: 'Security',
    'Microsoft 365': 'MS365',
    SharePoint: 'Sharepoint',
    'Office 365': 'Office 365',
    Teams: 'Teams',
    PowerApps: 'PowerApps',
    'Dynamics 365 Finance & Operation': 'MS Dynamics 365 Finance &amp; Operation',
    'Dynamics 365 Business Central': 'MS Dynamics 365 Business Central',
    'Dynamics 365 Sales and Marketing': 'MS Dynamics 365 Sales and Marketing',
    'Dynamics GP': 'MS Dynamics GP',
    'Dynamics / Dynamics 365': 'Dynamics/D365',
    '.NET': 'Platform (.NET)',
    'Power Platform': 'Power Platform',
    Other: 'Other',
    Choose: '',
};

export const segmentMappingDisplayToDatabase = {
    'Intelligent Cloud': 'Intelligent Cloud',
    'Modern Workplace': 'Modern Workplace',
    'Business Applications': 'Business Applications',
    Other: 'Other',
    Choose: '',
};
