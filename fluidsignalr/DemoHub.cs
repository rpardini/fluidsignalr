using System;
using System.Threading.Channels;
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

        public void Send(string name, string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.SendAsync("broadcastMessage", name, message);
        }

        public void Splat(double x, double y, double dx, double dy, string color)
        {
            Clients.All.SendAsync("broadSplat", x,y,dx,dy,color);
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            Clients.All.SendAsync("broadcastMessage", "system", $"{Context.ConnectionId} left the conversation");
            return base.OnDisconnectedAsync(exception);
        }

        public void SendStreamInit()
        {
            Clients.All.SendAsync("streamStarted");
        }

        public ChannelReader<string> StartStreaming()
        {
            var channel = Channel.CreateUnbounded<string>();
            _ = WriteToChannel(channel);
            return channel.Reader;

            async Task WriteToChannel(ChannelWriter<string> writer)
            {
                for (var i = 0; i < 10; i++)
                {
                    await writer.WriteAsync($"sending... {i}");
                    await Task.Delay(1000);
                }

                writer.Complete();
            }
        }
    }
}