import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AskForInfoDialogProps {
  productId: string;
  productName: string;
  vendorId: string;
}

const FAQ_QUESTIONS = [
  "Is this item still available?",
  "Can you provide more photos?",
  "What is the condition of this item?",
  "Is the price negotiable?",
  "Do you offer delivery?",
  "How old is this item?",
  "Is there a warranty?",
  "Can I see this item in person before buying?",
];

const AskForInfoDialog = ({ productId, productName, vendorId }: AskForInfoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const { sendMessage } = useMessages();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendQuestion = (question: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === vendorId) {
      toast({
        title: "Cannot send message",
        description: "You cannot send a message to yourself.",
        variant: "destructive",
      });
      return;
    }

    sendMessage({
      receiverId: vendorId,
      productId: productId,
      content: `Question about "${productName}": ${question}`,
    });
    
    setOpen(false);
    setCustomQuestion("");
    setSelectedQuestion(null);
  };

  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question);
  };

  const handleSubmit = () => {
    const questionToSend = selectedQuestion || customQuestion;
    if (questionToSend.trim()) {
      handleSendQuestion(questionToSend);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="transition-all hover:scale-110"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Ask About This Product
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select a frequently asked question or type your own:
          </p>
          
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {FAQ_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant={selectedQuestion === question ? "default" : "outline"}
                className="justify-start text-left h-auto py-2 px-3 text-sm"
                onClick={() => handleSelectQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Or write your own question:</p>
            <Textarea
              placeholder="Type your question here..."
              value={customQuestion}
              onChange={(e) => {
                setCustomQuestion(e.target.value);
                setSelectedQuestion(null);
              }}
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full gap-2"
            disabled={!selectedQuestion && !customQuestion.trim()}
          >
            <Send className="w-4 h-4" />
            Send Question
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AskForInfoDialog;
