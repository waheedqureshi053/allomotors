// types.ts
export interface SPAttribute {
  Title: string;
  InfoType: string;
}

export function getIt(jsonString: string, key: string): any | null {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed[key] ?? null;
  } catch (e) {
    console.error("Invalid JSON string:", e);
    return null;
  }
}

export function expandAttributes(
  jsonString: string,
  obj: Record<string, any>,
  infoType: string
): Record<string, any> {
  let designObj: Record<string, any> = {};

  try {
    designObj = JSON.parse(jsonString);
  } catch (e) {
    console.error("Attribute Error:", e);
    return obj;
  }

  for (const key in designObj) {
    const attribute = GlobalAttributesList.find(
      attr =>
        attr.Title.toLowerCase() === key.toLowerCase() &&
        (attr.InfoType === "*" || attr.InfoType.includes(infoType))
    );

    if (attribute) {
      obj[key] = designObj[key];
    }
  }

  return obj;
}
export function wrapAttributes(
  obj: Record<string, any>,
  infoType: string
): Record<string, any> {
  const xObj: Record<string, any> = {};

  // Try parsing existing Attributes if present
  if (obj.Attributes) {
    try {
      const parsed = JSON.parse(obj.Attributes);
      Object.assign(xObj, parsed);
    } catch (e) {
      console.warn("Failed to parse existing Attributes:", e);
    }
  }

  // Iterate over obj keys and selectively copy to xObj
  for (const key in obj) {
    const isMatch = GlobalAttributesList.some(attr =>
      attr.Title.toLowerCase() === key.toLowerCase() &&
      (attr.InfoType === "*" || attr.InfoType.includes(infoType))
    );

    if (isMatch) {
      xObj[key] = obj[key];
    }
  }

  // Update original object
  obj.Attributes = JSON.stringify(xObj);

  return obj;
}


export const GlobalAttributesList: SPAttribute[] = [
  //Company
  { Title: 'SellersCommission', InfoType: 'Company,AdvertRequest' },
  { Title: 'BuyersCommission', InfoType: 'Company, AdvertRequest' },
  { Title: 'SellersCommissionType', InfoType: 'Company,AdvertRequest' },
  { Title: 'BuyersCommissionType', InfoType: 'Company, AdvertRequest' },
  { Title: 'LogoURL', InfoType: 'Company' },

  { Title: 'AndroidVersion', InfoType: 'Company' },
  { Title: 'IOsVersion', InfoType: 'Company' },
    //All
    { Title: 'IconURL', InfoType: '*' },
  { Title: 'PhotoURL', InfoType: '*' },
  { Title: 'Color', InfoType: '*' },
  //Reminder
  { Title: 'URL', InfoType: 'Reminder' },
  //User
  { Title: 'Country', InfoType: 'User' },
  { Title: 'State', InfoType: 'User' },
  { Title: 'PostalCode', InfoType: 'User' },
  { Title: 'Address', InfoType: 'User' },
  { Title: 'City', InfoType: 'User' },
  { Title: 'BusinessSector', InfoType: 'User' },
  { Title: 'BusinessType', InfoType: 'User' },
  { Title: 'Gender', InfoType: 'User' },
  { Title: 'Phone', InfoType: 'User' },
  { Title: 'Title', InfoType: 'User' },
  { Title: 'RegNum', InfoType: 'User' },
  { Title: 'Terms', InfoType: 'User' },
  { Title: 'Newsletters', InfoType: 'User' },
  { Title: 'DOB', InfoType: 'User' },
  { Title: 'BGImageURL', InfoType: 'User' },
  { Title: 'WishList', InfoType: 'User' },
  { Title: 'AgentName', InfoType: 'User' },
  { Title: 'AgentPhone', InfoType: 'User' },
  { Title: 'AgentId', InfoType: 'User' },
  //Chat
  { Title: 'AdvertID', InfoType: 'Chat,AdvertRequest' },
  { Title: 'Attachments', InfoType: 'Chat' },
  //request
  { Title: 'CreditAmount', InfoType: 'AdvertRequest' },
  { Title: 'CashAmount', InfoType: 'AdvertRequest' },
  { Title: 'TotalAmount', InfoType: 'AdvertRequest' },
  { Title: 'RequiredAmount', InfoType: 'AdvertRequest' },
  { Title: 'SellingPriceFinal', InfoType: 'AdvertRequest' },
  { Title: 'SellingPrice', InfoType: 'AdvertRequest' },
  { Title: 'Duration', InfoType: 'AdvertRequest' },
  { Title: 'Fee', InfoType: 'AdvertRequest' },
  { Title: 'DurationPercentage', InfoType: 'AdvertRequest' },
  { Title: 'DurationAmount', InfoType: 'AdvertRequest' },
  //advert
  { Title: 'SaleArea', InfoType: 'Advert' },
  { Title: 'PricePin', InfoType: 'Advert' },
  { Title: 'TaxType', InfoType: 'Advert' },
  { Title: 'HidePrice', InfoType: 'Advert' },
  { Title: 'WishListCounter', InfoType: 'Advert' },
  { Title: 'SellerPhone', InfoType: 'Advert' },
  { Title: 'VehicleOrigion', InfoType: 'Advert' },
  { Title: 'IsVerified', InfoType: 'Advert' },

  ///Advert from api
  { "Title": "chassis", "InfoType": "Advert" },
  { "Title": "make", "InfoType": "Advert" },
  { "Title": "full_model", "InfoType": "Advert" },
  //{ "Title": "model", "InfoType": "Advert" },
  { "Title": "generation", "InfoType": "Advert" },
  { "Title": "additional_model", "InfoType": "Advert" },
  { "Title": "full_version", "InfoType": "Advert" },
  //{ "Title": "version", "InfoType": "Advert" },
  { "Title": "cylinder_in_litres", "InfoType": "Advert" },
  { "Title": "injection_label", "InfoType": "Advert" },
  { "Title": "nb_of_valves", "InfoType": "Advert" },
  { "Title": "cylinders_arrangement", "InfoType": "Advert" },
  { "Title": "nb_of_cylinders", "InfoType": "Advert" },
  { "Title": "nb_of_turbo", "InfoType": "Advert" },
  { "Title": "version_engine", "InfoType": "Advert" },
  { "Title": "additional_version", "InfoType": "Advert" },
  { "Title": "commercial_start_date", "InfoType": "Advert" },
  { "Title": "commercial_end_date", "InfoType": "Advert" },
  { "Title": "phase", "InfoType": "Advert" },
  { "Title": "bodywork", "InfoType": "Advert" },
  { "Title": "nb_of_doors", "InfoType": "Advert" },
  { "Title": "engine_code", "InfoType": "Advert" },
  { "Title": "energy", "InfoType": "Advert" },
  { "Title": "cubic_capacity", "InfoType": "Advert" },
  { "Title": "kw_power", "InfoType": "Advert" },
  { "Title": "commercial_horsepower", "InfoType": "Advert" },
  { "Title": "gearbox_code", "InfoType": "Advert" },
  { "Title": "gearbox_type", "InfoType": "Advert" },
  { "Title": "gears_type", "InfoType": "Advert" },
  { "Title": "nb_of_gears", "InfoType": "Advert" },
  { "Title": "transmission_type", "InfoType": "Advert" },
  { "Title": "adblue", "InfoType": "Advert" },
  { "Title": "wheel_drive", "InfoType": "Advert" },
  { "Title": "version_wheel_drive", "InfoType": "Advert" },
  { "Title": "tecdoc_engine_code", "InfoType": "Advert" },
  { "Title": "num_plaque", "InfoType": "Advert" },
  { "Title": "vin", "InfoType": "Advert" },
  { "Title": "additional_bodywork", "InfoType": "Advert" },
  { "Title": "additional_energy", "InfoType": "Advert" },
  { "Title": "euro_standard", "InfoType": "Advert" },
  { "Title": "particulate_filter", "InfoType": "Advert" },
  { "Title": "injection_type", "InfoType": "Advert" },
  { "Title": "maximum_weight", "InfoType": "Advert" },
  { "Title": "type", "InfoType": "Advert" },
  { "Title": "crit_air", "InfoType": "Advert" },
  { "Title": "max_length", "InfoType": "Advert" },
  { "Title": "urban_co2", "InfoType": "Advert" },
  { "Title": "extra_urban_co2", "InfoType": "Advert" },
  { "Title": "combined_co2", "InfoType": "Advert" },
  { "Title": "max_wheelbase", "InfoType": "Advert" },
  { "Title": "max_height", "InfoType": "Advert" },
  { "Title": "max_width", "InfoType": "Advert" },
  { "Title": "wltp_co2", "InfoType": "Advert" },
  { "Title": "combined_fuel_consumption", "InfoType": "Advert" },
  { "Title": "urban_fuel_consumption", "InfoType": "Advert" },
  { "Title": "extra_urban_fuel_consumption", "InfoType": "Advert" },
  { "Title": "trim", "InfoType": "Advert" },
  { "Title": "injection_system", "InfoType": "Advert" },
  { "Title": "dual_mass_flywheel", "InfoType": "Advert" },
  { "Title": "stt", "InfoType": "Advert" },
  { "Title": "combined_horsepower", "InfoType": "Advert" },
  { "Title": "voyant_moteur_ou_autres", "InfoType": "Advert" },
  { "Title": "revisee_ou_historique", "InfoType": "Advert" },
  { "Title": "climatisation", "InfoType": "Advert" },
  { "Title": "bruit_train_roulant_ou_autres", "InfoType": "Advert" },
  { "Title": "accident", "InfoType": "Advert" },
  { "Title": "rayure_ou_impacte", "InfoType": "Advert" },
  { "Title": "controle_technique", "InfoType": "Advert" },
  { "Title": "double_des_cles", "InfoType": "Advert" },
  { "Title": "FirstRegDate", "InfoType": "Advert" },
  { "Title": "LastRegDate", "InfoType": "Advert" }
  //{ "Title": "starter_battery_power", "InfoType": "Advert" },
  //{ "Title": "starter_battery_capacity", "InfoType": "Advert" },
  //{ "Title": "starter_battery_dimensions", "InfoType": "Advert" },
  //{ "Title": "rear_braking_system", "InfoType": "Advert" },
  //{ "Title": "wltp_combined_fuel_consumption", "InfoType": "Advert" },
  //{ "Title": "steering_type", "InfoType": "Advert" },
  //{ "Title": "front_axle_type", "InfoType": "Advert" },
  //{ "Title": "rear_axle_type", "InfoType": "Advert" },
  //{ "Title": "front_trunk_capacity_l", "InfoType": "Advert" },
  //{ "Title": "rear_trunk_capacity_l", "InfoType": "Advert" },
  //{ "Title": "extended_rear_trunk_capacity_l", "InfoType": "Advert" },
  //{ "Title": "combined_kw_power", "InfoType": "Advert" }
];