using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace fluidsignalr.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            Response.Headers["Cache-Control"] = "max-age=0, no-store, no-cache";
            return View();
        }
    }
}