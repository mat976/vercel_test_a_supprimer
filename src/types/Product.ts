export default interface Product {
  _id: string;
  name: string;
  description: string;
  price: number; // en centimes pour Stripe
  image: string;
  stockId: string;
  sold: boolean;
  createdAt: string;
}
