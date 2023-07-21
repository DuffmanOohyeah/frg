const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export default formatDate;
