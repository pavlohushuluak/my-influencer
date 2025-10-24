import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import config from "@/config/config";
import { cn } from "@/lib/utils";
import { RootState } from "@/store/store";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

interface Product {
  id: number;
  html_heading: string;
  html_hero: string;
  html_body: string;
  price: number;
  recurring: boolean;
}

interface CreditPurchaseProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreditPurchase({ onSuccess, onCancel }: CreditPurchaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingPaymentLink, setCreatingPaymentLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const userData = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${config.supabase_server_url}/products?recurring=eq.false`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer WeInfl3nc3withAI`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCreatePaymentLink = async () => {
    if (!selectedProduct || !userData.id) return;

    try {
      setCreatingPaymentLink(true);

      const response = await fetch(
        "https://webhooks.nymia.io/webhook/v1/create_purchase_link",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_uuid: userData.id,
            prod_id: selectedProduct,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment link");
      }

      const data = await response.json();
      setPaymentLink(data.url);

      // Open payment link in new tab
      window.open(data.url, "_blank");

      toast.success("Payment link created! Opening payment page...");
    } catch (error) {
      console.error("Error creating payment link:", error);
      toast.error("Failed to create payment link");
    } finally {
      setCreatingPaymentLink(false);
    }
  };

  const handlePaymentSuccess = async () => {
    // This will be called when payment is successful via webhook
    // For now, we'll just close the dialog
    onSuccess();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  if (paymentLink) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold">Payment Link Created</h2>
          <p className="text-muted-foreground">
            Your payment link has been opened in a new tab. Complete your
            payment there.
          </p>
          <p className="text-sm text-muted-foreground">
            Once payment is completed, your gems will be automatically added to
            your account.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.open(paymentLink, "_blank")}
            className="w-full"
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Payment Link Again
          </Button>

          <Button onClick={onSuccess} className="w-full">
            I've Completed Payment
          </Button>

          <Button
            onClick={() => {
              setPaymentLink(null);
              setSelectedProduct(null);
            }}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Purchase Gems</h2>
        <p className="text-muted-foreground">
          Choose a gem package that suits your needs
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No products available at the moment.
          </p>
        </div>
      ) : (
        <RadioGroup
          value={selectedProduct?.toString() || ""}
          onValueChange={(value) => setSelectedProduct(parseInt(value))}
          className="grid gap-4"
        >
          {products.map((product) => (
            <Label
              key={product.id}
              htmlFor={`product-${product.id}`}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-accent"
              )}
            >
              <div className="flex items-center gap-4">
                <RadioGroupItem
                  value={product.id.toString()}
                  id={`product-${product.id}`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.html_heading}</p>
                  </div>
                  {product.html_hero && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.html_hero}
                    </p>
                  )}
                  {product.html_body && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.html_body}
                    </p>
                  )}
                  <p className="text-lg font-semibold text-green-600 mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      )}

      <div className="space-y-3">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
          onClick={handleCreatePaymentLink}
          disabled={!selectedProduct || creatingPaymentLink}
        >
          {creatingPaymentLink ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Payment Link...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Purchase Gems
            </>
          )}
        </Button>

        <Button onClick={onCancel} variant="ghost" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
