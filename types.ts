
export enum Category {
  BEDSHEET = 'Bedsheet',
  PILLOW = 'Pillow',
  COMFORTER = 'Comforter'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  color: string;
  description: string;
  thumbnail: string;
  prompt: string;
  isCustom?: boolean;
}

export interface VisualizerState {
  originalImage: string | null;
  processedImage: string | null;
  selectedProduct: Product | null;
  isProcessing: boolean;
  error: string | null;
}
