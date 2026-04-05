export type ProductividadRange = '7' | '30';

export const PRODUCTIVIDAD_RANGE_KEY = 'taskmaster_productividad_range';

export const PRODUCTIVIDAD_PREFS_KEY = 'taskmaster_productividad_prefs';

export interface ProductividadPrefs {
  /** Mostrar bloque "Insights rápidos" en la vista de productividad */
  showInsights: boolean;
}

export const DEFAULT_PRODUCTIVIDAD_PREFS: ProductividadPrefs = {
  showInsights: true,
};
