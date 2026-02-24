
import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, RefreshCcw, Sparkles, ChevronRight, Info, Plus } from 'lucide-react';
import { STOA_PRODUCTS } from './constants';
import { Category, Product, VisualizerState } from './types';
import { processBedImage } from './services/gemini';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(STOA_PRODUCTS);
  const [state, setState] = useState<VisualizerState>({
    originalImage: null,
    processedImage: null,
    selectedProduct: STOA_PRODUCTS[0], // Set Velvet Wine as default
    isProcessing: false,
    error: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({ 
          ...prev, 
          originalImage: reader.result as string,
          processedImage: null,
          error: null 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newProduct: Product = {
          id: `custom-${Date.now()}`,
          name: `Custom Linen ${products.filter(p => p.isCustom).length + 1}`,
          category: Category.BEDSHEET,
          color: '#ffffff',
          description: 'User uploaded sample',
          thumbnail: reader.result as string,
          prompt: 'custom uploaded fabric style',
          isCustom: true
        };
        setProducts(prev => [newProduct, ...prev]);
        setState(prev => ({ ...prev, selectedProduct: newProduct }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyAI = async () => {
    if (!state.originalImage || !state.selectedProduct) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const result = await processBedImage(state.originalImage, state.selectedProduct);
      setState(prev => ({ 
        ...prev, 
        processedImage: result, 
        isProcessing: false 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: "Our AI styler is currently busy. Please try again." 
      }));
      console.error(err);
    }
  };

  const reset = () => {
    setState({
      originalImage: null,
      processedImage: null,
      selectedProduct: STOA_PRODUCTS[0],
      isProcessing: false,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-stoa-cream text-stoa-dark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stoa-surface px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-3xl stoa-logo-text leading-none text-stoa-dark text-[2.5rem]">stoa</h1>
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-stoa-dark ml-1">paris</span>
          </div>
          <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-stoa-dark/60">
            <a href="#" className="hover:text-stoa-gold transition-colors">Bedsheets</a>
            <a href="#" className="hover:text-stoa-gold transition-colors">Comforters</a>
            <a href="#" className="hover:text-stoa-gold transition-colors">Pillows</a>
            <a href="#" className="hover:text-stoa-gold transition-colors">Visualizer</a>
          </div>
          <button 
            onClick={reset}
            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 px-5 py-2 rounded-full border border-stoa-dark/10 hover:bg-stoa-dark hover:text-white transition-all"
          >
            <RefreshCcw size={12} />
            Reset Canvas
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Editor & Result */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-stoa-dark/5 border border-stoa-surface overflow-hidden relative min-h-[550px] flex items-center justify-center group/main">
            {!state.originalImage ? (
              <div className="text-center p-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-stoa-cream rounded-full flex items-center justify-center mb-8 text-stoa-gold shadow-inner group-hover/main:scale-110 transition-transform">
                  <Camera size={44} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-serif mb-4 font-bold text-stoa-dark">Your Space, Reimagined</h2>
                <p className="text-stoa-dark/60 max-w-sm mb-10 leading-relaxed font-medium">
                  Upload a photo of your current bed setup to witness the elegance of Stoa Paris linens in your room.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-stoa-dark text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all shadow-lg hover:shadow-stoa-dark/20 active:scale-95"
                  >
                    <Upload size={20} />
                    Upload Bed Image
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*"
                    capture="environment"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative bg-stoa-surface">
                <img 
                  src={state.processedImage || state.originalImage} 
                  className="w-full h-full object-cover" 
                  alt="Your Bed" 
                />
                
                {state.isProcessing && (
                  <div className="absolute inset-0 bg-stoa-dark/40 backdrop-blur-md flex flex-col items-center justify-center z-10 text-center px-6">
                    <div className="w-16 h-16 border-2 border-stoa-gold/20 border-t-stoa-gold rounded-full animate-spin mb-6"></div>
                    <p className="font-serif text-2xl text-white italic tracking-wide">Applying Stoa craftsmanship...</p>
                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] mt-3 font-bold">Rendering custom textures & lighting</p>
                  </div>
                )}

                {state.error && (
                  <div className="absolute bottom-6 left-6 right-6 bg-white text-stoa-red px-6 py-4 rounded-2xl border border-stoa-red/20 shadow-2xl text-sm flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-stoa-red/10 flex items-center justify-center flex-shrink-0">
                      <Info size={16} />
                    </div>
                    <span className="font-semibold">{state.error}</span>
                  </div>
                )}

                {!state.processedImage && !state.isProcessing && (
                  <div className="absolute top-6 left-6 bg-stoa-dark text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <Sparkles size={12} className="text-stoa-gold animate-pulse" /> IMAGE LOADED
                  </div>
                )}
                
                {state.processedImage && (
                  <div className="absolute top-6 right-6 bg-stoa-gold text-white px-6 py-2.5 rounded-full shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                    <Check size={12} /> VISUALIZATION READY
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-stoa-dark text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="flex flex-col">
              <span className="text-stoa-gold text-[10px] uppercase tracking-[0.3em] font-black mb-2">Selected Choice</span>
              <h3 className="text-2xl font-serif font-bold italic">
                {state.selectedProduct ? `${state.selectedProduct.name}` : "Pick a linen to begin"}
              </h3>
            </div>
            <button
              onClick={handleApplyAI}
              disabled={!state.originalImage || !state.selectedProduct || state.isProcessing}
              className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${
                !state.originalImage || !state.selectedProduct || state.isProcessing
                ? 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
                : 'bg-stoa-gold text-white hover:bg-[#d4a362] shadow-xl hover:shadow-stoa-gold/30 active:scale-95'
              }`}
            >
              <Sparkles size={18} />
              Process Render
            </button>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-stoa-dark/5 border border-stoa-surface flex flex-col max-h-[700px]">
            <div className="flex justify-between items-baseline mb-8">
              <h4 className="text-xl font-serif font-bold text-stoa-dark">The Collection</h4>
              <button 
                onClick={() => productInputRef.current?.click()}
                className="text-[10px] font-black text-stoa-gold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <Plus size={14} /> Add Your Photo
              </button>
              <input 
                type="file" 
                ref={productInputRef} 
                onChange={handleAddCustomProduct} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {products.map(product => (
                <div 
                  key={product.id}
                  onClick={() => setState(prev => ({ ...prev, selectedProduct: product }))}
                  className={`p-1 rounded-2xl border-2 transition-all cursor-pointer group flex gap-5 items-center ${
                    state.selectedProduct?.id === product.id 
                    ? 'border-stoa-gold bg-stoa-cream/30 ring-8 ring-stoa-gold/5 shadow-md shadow-stoa-gold/10' 
                    : 'border-transparent hover:bg-stoa-cream/20'
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-stoa-surface">
                    <img src={product.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    {product.isCustom && (
                      <div className="absolute top-0 right-0 bg-stoa-gold text-white p-0.5 rounded-bl-lg">
                        <Sparkles size={8} />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: product.color }}></div>
                  </div>
                  <div className="flex-1 pr-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[9px] font-black text-stoa-gold uppercase tracking-widest">{product.category}</span>
                      {state.selectedProduct?.id === product.id && <Check size={14} className="text-stoa-gold" />}
                    </div>
                    <h5 className="font-bold text-sm text-stoa-dark leading-tight line-clamp-1">{product.name}</h5>
                    <p className="text-[10px] text-stoa-dark/50 line-clamp-1 mt-1 font-medium">{product.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stoa-dark text-white p-8 rounded-[2rem] relative overflow-hidden group">
            <h4 className="font-serif font-bold text-lg mb-4 flex items-center gap-3">
              <Sparkles size={18} className="text-stoa-gold" />
              Demo Instructions
            </h4>
            <div className="space-y-4 text-xs font-medium text-white/70 leading-relaxed">
              <p>1. Upload a <span className="text-white font-bold">Room Photo</span> on the left.</p>
              <p>2. Upload <span className="text-stoa-gold font-bold">Your Bedsheet Photos</span> using the "+ Add Your Photo" button above.</p>
              <p>3. Select <span className="text-stoa-gold font-bold">Velvet Wine</span> or your custom sheet and hit <span className="text-white font-bold">Process Render</span>.</p>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-stoa-surface">
            <button className="w-full py-4 bg-white border border-stoa-dark text-stoa-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stoa-dark hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm">
              Contact Tech Support <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-16 bg-stoa-dark text-white text-center">
        <div className="mb-6 flex flex-col items-center">
           <h2 className="text-5xl stoa-logo-text leading-none text-white">stoa</h2>
           <span className="text-xs tracking-[0.5em] uppercase font-light text-stoa-gold mt-2">paris</span>
        </div>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1925133;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default App;
