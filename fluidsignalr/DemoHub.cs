using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace fluidsignalr
{
    public class DemoHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Clients.All.SendAsync("broadcastMessage", "system", $"{Context.ConnectionId} joined the conversation");
            return base.OnConnectedAsync();
        }

        public void Send(string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.SendAsync("broadcastMessage", Context.ConnectionId, message);
        }

        public void Splat(double x, double y, double dx, double dy, string color)
        {
            Clients.All.SendAsync("broadSplat", x, y, dx, dy, color);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Clients.All.SendAsync("broadcastMessage", "system", $"{Context.ConnectionId} left the conversation");
            return base.OnDisconnectedAsync(exception);
        }
    }
}