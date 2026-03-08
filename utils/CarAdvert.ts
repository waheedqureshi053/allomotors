export interface CarAdvert {
  ID: number;
  SaleArea: string;
 BuyersCommission: any; 
 AdvertType: any;
 HasApiMeta: any;

  Advert: string;
  AttributesArray: any[]; // You can define a more specific type if known
  CarPlateNum: string;
  Category: string;
  CategoryID: number;
  ConfirmMessage: string;
  Description: string;
  DriversIntURL: string;
  DriversIntURLFullPath: string;
  DriversIntURL_IsImage: boolean;
  FileNameTemp: string;
  FileSiezeTemp: number;
  Finishing: string;
  FrontLeftURL: string;
  FrontLeftURLFullPath: string;
  FrontLeftURL_IsImage: boolean;
  HidePrice: boolean;
  IconURL: string;
  IconURLFullPath: string;
  IconURL_IsImage: boolean;
  InfoType: string;
  IsLoading: boolean;
  IsPublic: boolean;
  LeftProfileURL: string;
  LeftProfileURLFullPath: string;
  LeftProfileURL_IsImage: boolean;
  Mileage: string;
  Model?: string; // Optional since it's `undefined`
  PassengersIntURL: string;
  PassengersIntURLFullPath: string;
  PassengersIntURL_IsImage: boolean;
  PricePin: string;
  RightProfileURL: string;
  RightProfileURLFullPath: string;
  RightProfileURL_IsImage: boolean;
  RightRearURL: string;
  RightRearURLFullPath: string;
  RightRearURL_IsImage: boolean;
  SellerPhone: string;
  SellingPrice: any;
  SellingPriceFinal: any;
  TaxType: number;
  Title: string;
  VehicleOrigion: string;
  accident: boolean;
  bruit_train_roulant_ou_autres: boolean;
  climatisation: boolean;
  controle_technique: boolean;
  double_des_cles: boolean;
  progress: number;
  rayure_ou_impacte: boolean;
  revisee_ou_historique: boolean;
  tblFiles: any[]; // You can refine this to a File interface if the structure is known
  voyant_moteur_ou_autres: boolean;
}
