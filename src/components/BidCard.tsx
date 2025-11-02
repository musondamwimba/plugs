import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useBids } from "@/hooks/useBids";
import { formatDistanceToNow } from "date-fns";

interface BidCardProps {
  productId: string;
  productName: string;
  startingBid: number;
  currentHighestBid?: number;
  bidEndTime: string;
}

const BidCard = ({ productId, productName, startingBid, currentHighestBid, bidEndTime }: BidCardProps) => {
  const { bids, placeBid } = useBids(productId);
  const [bidAmount, setBidAmount] = useState("");

  const handlePlaceBid = () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) return;
    placeBid({ productId, amount: parseFloat(bidAmount) });
    setBidAmount("");
  };

  const isExpired = new Date(bidEndTime) < new Date();
  const minBid = currentHighestBid ? currentHighestBid + 1 : startingBid;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bidding for {productName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Starting Bid:</span>
            <span className="font-semibold">{startingBid.toLocaleString()} MMK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Highest:</span>
            <span className="font-semibold text-primary">
              {currentHighestBid ? `${currentHighestBid.toLocaleString()} MMK` : "No bids yet"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ends:</span>
            <span className={isExpired ? "text-destructive" : "text-muted-foreground"}>
              {isExpired ? "Expired" : formatDistanceToNow(new Date(bidEndTime), { addSuffix: true })}
            </span>
          </div>
        </div>

        {!isExpired && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`Min: ${minBid} MMK`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              min={minBid}
            />
            <Button onClick={handlePlaceBid}>Place Bid</Button>
          </div>
        )}

        {bids && bids.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold">Recent Bids</h4>
            {bids.slice(0, 5).map((bid: any) => (
              <div key={bid.id} className="flex justify-between text-sm">
                <span>Anonymous Bidder</span>
                <span className="font-semibold">{bid.amount.toLocaleString()} ZMK</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidCard;
