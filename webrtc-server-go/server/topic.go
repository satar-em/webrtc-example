package server

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
	"webrtc-server-go/database"
)

func init() {
	_, err := database.CreateTopic("rooms")
	if err != nil {
		log.Fatalf("database.CreateTopic(\"rooms\") %s", err.Error())
	}
}

func getALlTopics(ctx *fiber.Ctx) error {
	return ctx.JSON(database.GetAllTopics())
}

func getTopic(ctx *fiber.Ctx) error {
	idTopic, err := ctx.ParamsInt("id", 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id not granted",
		})
	}
	topic, _ := database.GetTopicById(uint(idTopic))
	if topic == nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "not user found",
		})
	}
	return ctx.JSON(topic)
}

func createTopic(ctx *fiber.Ctx) error {
	topic := &database.Topic{}
	err := ctx.BodyParser(topic)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	topic, err = database.CreateTopic(topic.Name)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	toggleUiAction(fmt.Sprintf("topic %s created", topic.Name), "topic-list-refresh")
	return ctx.JSON(topic)
}
