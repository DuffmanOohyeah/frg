const cleanTelephoneLink = (telephone: string) => {
    let rtnTelephone = telephone;
    rtnTelephone = rtnTelephone.replace(/[\s\(\)]/g, '');
    return rtnTelephone;
};

export default cleanTelephoneLink;
