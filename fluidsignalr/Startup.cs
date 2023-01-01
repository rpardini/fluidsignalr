using System;
using System.IO;
using System.Net;
using fluidsignalr;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;

namespace fluidsignalr
{
    public class Startup
    {
        const string ClientAppRootPath = "ClientApp/dist";
        const string IndexHtmlPath = "/index.html";
        const string WebManifestPath = "/manifest.webmanifest";
        const string BrowserConfigPath = "/browserconfig.xml";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public static void ConfigureServices(IServiceCollection services)
        {
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardLimit = 1;
                options.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("0.0.0.0"), 0));
                options.ForwardedHeaders = ForwardedHeaders.All;
            });
            services.AddSignalR();
            services.AddSpaStaticFiles(configuration => { configuration.RootPath = ClientAppRootPath; });
        }

        public static void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();
            app.UseRouting();
            app.UseEndpoints(endpoints => { endpoints.MapHub<FluidHub>("/fluidhub"); });

            var provider = new FileExtensionContentTypeProvider();
            provider.Mappings[".webmanifest"] = "application/manifest+json";

            app.UseSpaStaticFiles(new StaticFileOptions()
            {
                ContentTypeProvider = provider,
                OnPrepareResponse = ctx =>
                {
                    if (ctx.Context.Request.Path.StartsWithSegments(IndexHtmlPath, StringComparison.InvariantCulture) ||
                        ctx.Context.Request.Path.StartsWithSegments(WebManifestPath,
                            StringComparison.InvariantCulture) ||
                        ctx.Context.Request.Path.StartsWithSegments(BrowserConfigPath,
                            StringComparison.InvariantCulture))
                    {
                        // Do not cache explicit `/index.html` See also: `DefaultPageStaticFileOptions` below for implicit "/index.html"
                        var headers = ctx.Context.Response.GetTypedHeaders();
                        headers.CacheControl = new CacheControlHeaderValue
                            { Public = true, MaxAge = TimeSpan.FromDays(0) };
                    }
                    else
                    {
                        // Cache all static resources for 1 year (versioned filenames), unless Development mode.
                        var headers = ctx.Context.Response.GetTypedHeaders();
                        headers.CacheControl = new CacheControlHeaderValue
                        {
                            Public = true,
                            MaxAge = (env.IsDevelopment()) ? TimeSpan.FromDays(0) : TimeSpan.FromDays(365)
                        };
                    }
                }
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
                    spa.Options.SourcePath = ClientAppRootPath;
                    spa.Options.DefaultPage = new PathString(IndexHtmlPath);
                    spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions()
                    {
                        OnPrepareResponse = ctx =>
                        {
                            // Do not cache implicit `/index.html` at the root.  See also: `UseSpaStaticFiles` above
                            var headers = ctx.Context.Response.GetTypedHeaders();
                            headers.CacheControl = new CacheControlHeaderValue
                                { Public = true, MaxAge = TimeSpan.FromDays(0) };
                        }
                    };
                }
            });
        }
    }
}