import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  total: number;
  onSuccess: () => void;
}

const OrderForm = ({ total, onSuccess }: OrderFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '',
    comment: '',
    paymentMethod: 'card'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address || !formData.deliveryDate || !formData.deliveryTime) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Заказ оформлен!',
      description: 'Мы свяжемся с вами в ближайшее время',
    });

    onSuccess();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Имя *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ваше имя"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Телефон *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+7 (___) ___-__-__"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Адрес доставки *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Улица, дом, квартира"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryDate">Дата доставки *</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => handleChange('deliveryDate', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="deliveryTime">Время доставки *</Label>
            <Input
              id="deliveryTime"
              type="time"
              value={formData.deliveryTime}
              onChange={(e) => handleChange('deliveryTime', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="comment">Комментарий к заказу</Label>
          <Textarea
            id="comment"
            value={formData.comment}
            onChange={(e) => handleChange('comment', e.target.value)}
            placeholder="Пожелания к букету, текст открытки..."
            rows={3}
          />
        </div>

        <div>
          <Label className="mb-3 block">Способ оплаты</Label>
          <RadioGroup
            value={formData.paymentMethod}
            onValueChange={(value) => handleChange('paymentMethod', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="font-normal cursor-pointer">
                Картой онлайн
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="font-normal cursor-pointer">
                Наличными курьеру
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card-courier" id="card-courier" />
              <Label htmlFor="card-courier" className="font-normal cursor-pointer">
                Картой курьеру
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>К оплате:</span>
          <span>{total.toLocaleString()} ₽</span>
        </div>
        <Button type="submit" className="w-full" size="lg">
          Подтвердить заказ
        </Button>
      </div>
    </form>
  );
};

export default OrderForm;
