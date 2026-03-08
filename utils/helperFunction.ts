
export const formatDecimal = (value : any) => {
  return Number(value).toFixed(2);
};
export const formatNODecimal = (value : any) => {
  return Number(value).toFixed(0);
};
export const getCommission = (advert: any, dealer: string, companyAttributes: string): number => {
        try {
            const attributes = JSON.parse(companyAttributes);
            const commission = parseFloat(attributes[`${dealer}Commission`]) || 0;
            const commissionType = attributes[`${dealer}CommissionType`];

            if (commissionType === "Percentage") {
                return (commission / 100) * (advert?.Attributes?.SellingPrice || 0);
            }
            return commission;
        } catch (error) {
            console.error('Commission calculation error:', error);
            return 0;
        }
    };
