using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace fluidsignalr
{
    public class Program
    {
        public static void Main(string[] args)
        {
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
                        serverOptions.ListenAnyIP(5001, options => { options.UseHttps(); });
                    });
                });
        }
    }
}