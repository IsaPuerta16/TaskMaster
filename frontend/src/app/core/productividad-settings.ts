export type ProductividadRange = '7' | '30';

export const PRODUCTIVIDAD_RANGE_KEY = 'taskmaster_productividad_range';

export const PRODUCTIVIDAD_PREFS_KEY = 'taskmaster_productividad_prefs';

export interface ProductividadPrefs {
  
  showInsights: boolean;
}

export const DEFAULT_PRODUCTIVIDAD_PREFS: ProductividadPrefs = {
  showInsights: true,
};
