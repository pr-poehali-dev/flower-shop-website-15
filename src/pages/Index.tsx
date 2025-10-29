import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import OrderForm from '@/components/OrderForm';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
  addons: {
    card: boolean;
    candy: boolean;
  };
}

const API_URL = 'https://functions.poehali.dev/b7ceafa2-0206-46d2-b757-6063a8f5d3c6';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const categories = ['all', 'Пионы', 'Розы', 'Композиции'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setProducts(data.map((p: any) => ({
          ...p,
          image: p.image_url
        })));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    let priceMatch = true;
    
    if (priceRange === 'low') priceMatch = product.price < 4000;
    if (priceRange === 'medium') priceMatch = product.price >= 4000 && product.price < 5000;
    if (priceRange === 'high') priceMatch = product.price >= 5000;
    
    return categoryMatch && priceMatch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, addons: { card: false, candy: false } }]);
    }
    setIsCartOpen(true);
  };

  const updateCartItem = (id: number, updates: Partial<CartItem>) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      let itemTotal = item.price * item.quantity;
      if (item.addons.card) itemTotal += 150;
      if (item.addons.candy) itemTotal += 500;
      return total + itemTotal;
    }, 0);
  };

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-pink-50/30">
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="https://cdn.poehali.dev/files/d720ddcf-556e-47a3-8bbb-06dc8b9ba8dd.png" 
                alt="Senti Flora" 
                className="h-12 w-auto"
              />
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              {[
                { id: 'home', label: 'О нас' },
                { id: 'catalog', label: 'Каталог' },
                { id: 'delivery', label: 'Доставка' },
                { id: 'contacts', label: 'Контакты' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm transition-colors hover:text-primary ${
                    activeSection === item.id ? 'text-primary font-medium' : 'text-foreground/70'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <a href="tel:+79151028882" className="hidden md:block text-sm font-medium">
                +7 (915) 102-88-82
              </a>
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Icon name="ShoppingCart" size={20} />
                    {cart.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                        {cart.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Корзина</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Корзина пуста</p>
                    ) : (
                      <>
                        {cart.map(item => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex gap-4">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">{item.price} ₽</p>
                                  
                                  <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={item.addons.card}
                                        onCheckedChange={(checked) =>
                                          updateCartItem(item.id, {
                                            addons: { ...item.addons, card: checked as boolean }
                                          })
                                        }
                                      />
                                      <span className="text-sm">Открытка (+150 ₽)</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        checked={item.addons.candy}
                                        onCheckedChange={(checked) =>
                                          updateCartItem(item.id, {
                                            addons: { ...item.addons, candy: checked as boolean }
                                          })
                                        }
                                      />
                                      <span className="text-sm">Конфеты (+500 ₽)</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        item.quantity > 1
                                          ? updateCartItem(item.id, { quantity: item.quantity - 1 })
                                          : removeFromCart(item.id)
                                      }
                                    >
                                      <Icon name="Minus" size={14} />
                                    </Button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        updateCartItem(item.id, { quantity: item.quantity + 1 })
                                      }
                                    >
                                      <Icon name="Plus" size={14} />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="ml-auto"
                                      onClick={() => removeFromCart(item.id)}
                                    >
                                      <Icon name="Trash2" size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Итого:</span>
                            <span>{calculateTotal().toLocaleString()} ₽</span>
                          </div>
                          <Button 
                            className="w-full mt-4" 
                            size="lg"
                            onClick={() => {
                              setIsCartOpen(false);
                              setIsOrderFormOpen(true);
                            }}
                          >
                            Оформить заказ
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <section id="home" className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Студия авторской флористики
              </h1>
              <p className="text-lg text-muted-foreground">
                Цветы | Букеты | Композиции<br />
                Доставка по Красноярску - 2 часа
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => scrollToSection('catalog')}
              >
                Заказать букет
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://cdn.poehali.dev/files/ac5302a3-c297-40e6-8134-b7c094fc0192.png"
                alt="Senti Flora"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="catalog" className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Каталог</h2>
          
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <div className="flex gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'Все' : category}
                </Button>
              ))}
            </div>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Цена" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все цены</SelectItem>
                <SelectItem value="low">До 4000 ₽</SelectItem>
                <SelectItem value="medium">4000-5000 ₽</SelectItem>
                <SelectItem value="high">От 5000 ₽</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{product.description}</p>
                  <p className="text-2xl font-bold">{product.price.toLocaleString()} ₽</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full" onClick={() => addToCart(product)}>
                    <Icon name="ShoppingCart" size={18} className="mr-2" />
                    В корзину
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="delivery" className="py-16 px-4 bg-pink-50/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center mb-12">Доставка</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <Icon name="Clock" size={32} className="mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
                <p className="text-muted-foreground">
                  Доставим ваш заказ по Красноярску в течение 2 часов
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <Icon name="MapPin" size={32} className="mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">По всему городу</h3>
                <p className="text-muted-foreground">
                  Работаем по всему Красноярску
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <Icon name="Heart" size={32} className="mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Свежие цветы</h3>
                <p className="text-muted-foreground">
                  Гарантируем свежесть букетов и качество композиций
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <Icon name="Gift" size={32} className="mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Подарочная упаковка</h3>
                <p className="text-muted-foreground">
                  Красивая упаковка и открытка в подарок
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="contacts" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold mb-8">Контакты</h2>
          <div className="space-y-6">
            <div>
              <Icon name="Phone" size={24} className="mx-auto mb-2 text-primary" />
              <a href="tel:+79151028882" className="text-xl font-semibold hover:text-primary transition-colors">
                +7 (915) 102-88-82
              </a>
            </div>
            <div>
              <Icon name="MapPin" size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Красноярск</p>
            </div>
            <div>
              <Icon name="Clock" size={24} className="mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Ежедневно с 9:00 до 21:00</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-foreground text-background py-8 px-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2024 Senti Flora. Студия авторской флористики</p>
        </div>
      </footer>

      <Dialog open={isOrderFormOpen} onOpenChange={setIsOrderFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Оформление заказа</DialogTitle>
          </DialogHeader>
          <OrderForm 
            total={calculateTotal()} 
            onSuccess={() => {
              setIsOrderFormOpen(false);
              setCart([]);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;