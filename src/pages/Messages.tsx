import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Messages = () => {
  const messages = [
    { id: 1, sender: "John Doe", message: "Hey, is this item still available?", time: "2 min ago" },
    { id: 2, sender: "Jane Smith", message: "Can you ship to my location?", time: "1 hour ago" },
    { id: 3, sender: "Bob Wilson", message: "Thanks for the quick response!", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      <div className="space-y-4">
        {messages.map((msg) => (
          <Card key={msg.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{msg.sender}</CardTitle>
                <span className="text-sm text-muted-foreground">{msg.time}</span>
              </div>
              <CardDescription>{msg.message}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Messages;
