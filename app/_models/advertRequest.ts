type CommissionType = 'Buyers' | 'Sellers';

interface Advert {
  SellingPrice: number;
  SellingPriceFinal: number;
}

interface DurationOption {
  Value: number;
  Percentage: number;
}

interface AdvertRequest {
// Advert? : any;
// AdvertOwner? : any;
// RequestOwner? : any;

  AdvertID: number;
  Disabled: boolean;
  BuyersCommission: number;
  SellersCommission: number;
  SellingPrice: number;
  SellingPriceFinal: number;
  CreditAmount: number;
  CashAmount: number;
  Duration: number;
  DurationPercentage: number;
  DurationAmount: number;
  TotalAmount: number;
  Remaining: number;
  RequestType: string; 
}

interface User {
  ScanBalance: number;
}

interface Services {
  GetCommission: (advert: Advert, type: CommissionType) => number;
  DurationAmounts: DurationOption[];
  User: User;
  showWarningToast: (title: string, message: string) => void;
}