using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;

namespace fluidsignalr
{
    public class FluidHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            Clients.Others.SendAsync("broadcastMessage",
                $"{Context.ConnectionId} joined from {Context.GetHttpContext().Connection.RemoteIpAddress}");
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Clients.Others.SendAsync("broadcastMessage",
                $"{Context.ConnectionId} from {Context.GetHttpContext().Connection.RemoteIpAddress} left!");
            return base.OnDisconnectedAsync(exception);
        }

        public void Splat(double x, double y, double dx, double dy, string color)
        {
            Clients.All.SendAsync("broadSplat", x, y, dx, dy, color);
        }

        public void Config(string jsonConfig)
        {
            Clients.All.SendAsync("broadConfig", jsonConfig);
        }
    }
}