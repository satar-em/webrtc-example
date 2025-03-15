package server

import (
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
	"webrtc-server-go/database"
)

func extraData(ctx *fiber.Ctx) error {
	return ctx.JSON(fiber.Map{
		"name": "emami",
		"age":  26,
	})
}

func init() {
	_, err := database.CreateTopic("ui-actions")
	if err != nil {
		log.Fatalf("database.CreateTopic(\"ui-actions\") %s", err.Error())
	}
}

func toggleUiAction(message string, action string) {
	topic, ok := database.GetTopicByName("ui-actions")
	if ok == nil {
		for _, subscriber := range topic.Subscribers {
			subscriber.SendMessage(map[string]interface{}{
				"type": "ui-action-toggle",
				"data": map[string]interface{}{
					"message":   message,
					"appAction": action,
				},
			})

		}
	}
}
