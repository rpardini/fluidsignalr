using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Logging;

namespace fluidsignalr
{
    public static class Program
    {
        public static void Main(string[] args)
        {
            IdentityModelEventSource.ShowPII = true;
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                    webBuilder.UseKestrel(serverOptions =>
                    {
                        serverOptions.ListenAnyIP(5000);
                        try
                        {
                            serverOptions.ListenAnyIP(5001, options => { options.UseHttps(); });
                        }
                        catch (InvalidOperationException ignored)
                        {
                            Console.Out.WriteLine("Could not bind 5001: " + ignored.GetType().Name + ":" +
                                                  ignored.Message);
                        }
                    });
                });
        }
    }
}