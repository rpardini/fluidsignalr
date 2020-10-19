using System;
using System.IO;
using System.Net;
using fluidsignalr;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

namespace fluidsignalr
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public static void ConfigureServices(IServiceCollection services)
        {
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardLimit = 3;
                options.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("0.0.0.0"), 0));
                options.ForwardedHeaders = ForwardedHeaders.All;
            });
            services.AddSignalR();
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientApp/dist"; });
        }

        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseRouting();
            app.UseEndpoints(endpoints => { endpoints.MapHub<FluidHub>("/fluidhub"); });

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(),
                    Path.Combine("ClientApp", "dist")))
            });

            app.UseSpa(spa =>
            {
                if (env.IsDevelopment())
                {
                    spa.Options.StartupTimeout = TimeSpan.FromMinutes(1);
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:4321");
                }
                else
                {
                    spa.Options.SourcePath = "ClientApp/dist";
                    spa.Options.DefaultPage = new PathString("/index.html");
                }
            });
        }
    }
}