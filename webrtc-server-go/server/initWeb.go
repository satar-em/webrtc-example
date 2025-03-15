package server

import (
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

func InitWeb() {
	app := fiber.New()

	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.JSON(fiber.Map{
			"status":  200,
			"message": "app running successfully",
		})
	})
	api := app.Group("/api")
	initRoute(api)
	err := app.Listen(":8080")
	if err != nil {
		log.Fatal(err.Error())
	}
}

func initRoute(api fiber.Router) {
	api.Use(func(ctx *fiber.Ctx) error {
		routApiMutex.Lock()
		// routApiMutexId++
		// log.WithFields(log.Fields{
		// 	"routApiMutexId": routApiMutexId,
		// }).Warn("Lock initweb.go 31")
		defer func() {
			routApiMutex.Unlock()
			// log.WithFields(log.Fields{
			// 	"routApiMutexId": routApiMutexId,
			// }).Warn("Unlock initweb.go 36")
		}()
		return ctx.Next()
	})
	api.Get("/extra", extraData)
	api.Post("/register-user", registerUser)
	api.Get("/get-rooms", getALlRooms)
	api.Get("/get-room/:id", getRoom)
	api.Post("/create-room", createRoom)

	api.Get("/get-topics", getALlTopics)
	api.Get("/get-topic/:id", getTopic)
	api.Post("/create-topic", createTopic)

	api.Post("/create-room-video-connection", createRoomVideoConnection)
	api.Post("/set-start-call-user-offer-data", setStartCallUserOfferData)
	api.Post("/set-answer-user-answer-data", setAnswerUserAnswerData)
	api.Get("/get-room-video-connection-by-id/:id", getRoomVideoConnectionById)

	api.Delete("/delete-user/:id", deleteUser)
	api.Get("/get-user/:id", getUser)
	api.Use("/ws", websocketUpgrade)
	api.Get("/ws/subscribe", websocketHandle)
}
