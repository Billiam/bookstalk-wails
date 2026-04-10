package main

//wails:inject console.log('Hello from Wails!');
type GreetService struct{}

//wails:inject console.log('Hello from Wails!');
func (g *GreetService) Greet(name string) string {
	return "Hello " + name + "!"
}

