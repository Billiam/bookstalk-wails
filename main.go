package main

import (
	"net/http/httputil"
	"net/http"
  "net/url"

	"embed"
	_ "embed"
	"log"
	"time"
	"strings"

	"github.com/wailsapp/wails/v3/pkg/application"
  "github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.
	application.RegisterEvent[string]("time")
}

func setupDevelopmentMenu(app *application.App) {
    if !app.Env.Info().Debug {
        return // Only show in debug mode
    }

    menu := app.NewMenu()
    menu.AddRole(application.FileMenu)
    menu.AddRole(application.EditMenu)
    menu.AddRole(application.WindowMenu)
    menu.AddRole(application.HelpMenu)

//     menu := app.Menu.New()
    devMenu := menu.AddSubmenu("test")

    devMenu.Add("Open DevTools").OnClick(func(ctx *application.Context) {
        // This would open browser devtools if available
        window := app.Window.Current()
        if window != nil {
            window.OpenDevTools()
        }
    })

    devMenu.Add("View Source").OnClick(func(ctx *application.Context) {
        // Open source code repository
        app.Browser.OpenURL("https://github.com/youruser/yourapp")
    })

    devMenu.Add("API Documentation").OnClick(func(ctx *application.Context) {
        // Open local API docs
        app.Browser.OpenURL("http://localhost:8080/docs")
    })

    app.Menu.Set(menu)
}

func GinMiddleware(ginEngine *gin.Engine) application.Middleware {
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
//       log.Printf("[GIN] %s", r.URL.Path,)
//         log.Printf("[GIN] %s | %s | %d",
//             r.Method,
//             r.URL.Path,
//             w.Status(),
//                     )

      // Let wails handle everything except API route
      if !strings.HasPrefix(r.URL.Path, "/api") {
        next.ServeHTTP(w, r)
        return
      }
      // Let Gin handle everything else
      ginEngine.ServeHTTP(w, r)
    })
  }
}
func LoggingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Start timer
        startTime := time.Now()

        // Process request
        c.Next()

        // Calculate latency
        latency := time.Since(startTime)

        // Log request details
        log.Printf("[GIN] %s | %s | %s | %d | %s",
            c.Request.Method,
            c.Request.URL.Path,
            c.ClientIP(),
            c.Writer.Status(),
            latency,
        )
    }
}

// ginEngine.POST("/api", func(c *gin.Context) {
//     var newUser User
//     if err := c.ShouldBindJSON(&newUser); err != nil {
//         c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
//         return
//     }
//     // Process the new user...
//     c.JSON(http.StatusCreated, newUser)
// })

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

  ginEngine := gin.New() // Using New() instead of Default() to add custom middleware

  corsConfig := cors.DefaultConfig()
  corsConfig.AllowOrigins = []string{"wails://wails", "wails://localhost"}
  corsConfig.CustomSchemas = []string{"wails"}
  corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"}
  corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
  ginEngine.Use(cors.New(corsConfig))

  // Add middlewares
  ginEngine.Use(gin.Recovery())
//   ginEngine.Use(LoggingMiddleware()) // Your custom middleware

  // Define routes
//   ginEngine.GET("/", func(c *gin.Context) {
//       // Serve your main page
//   })

  target, _ := url.Parse("https://api.hardcover.app")
  proxy := httputil.NewSingleHostReverseProxy(target)
  ginEngine.POST("/api/*proxyPath", func(c *gin.Context) {
    proxy.Director = func(req *http.Request) {
      req.Header = c.Request.Header
      req.Host = target.Host
      req.Body = c.Request.Body
      req.URL.Host = target.Host
      req.URL.Scheme = target.Scheme
      req.URL.Path = c.Param("proxyPath")
    }
    proxy.ServeHTTP(c.Writer, c.Request)
  })

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        "bookstalk",
		Description: "Find Hardcover users by shared reads",
		Services: []application.Service{
			application.NewService(&GreetService{}),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
//       Handler:    ginEngine,
      Middleware: GinMiddleware(ginEngine),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "BookStalk",
		Width: 768,
		Height: 1024,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(27, 38, 54),
		URL:              "/",
	})

  setupDevelopmentMenu(app)

	// Create a goroutine that emits an event containing the current time every second.
	// The frontend can listen to this event and update the UI accordingly.
	go func() {
		for {
			now := time.Now().Format(time.RFC1123)
			app.Event.Emit("time", now)
			time.Sleep(time.Second)
		}
	}()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
