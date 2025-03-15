package server

import (
	"fmt"
	"webrtc-server-go/database"

	"github.com/gofiber/fiber/v2"
)

func getALlRooms(ctx *fiber.Ctx) error {
	return ctx.JSON(database.GetAllRooms())
}

func getRoom(ctx *fiber.Ctx) error {
	idRoom, err := ctx.ParamsInt("id", 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id not granted",
		})
	}
	room, _ := database.GetRoomById(uint(idRoom))
	if room == nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "not room found",
		})
	}
	return ctx.JSON(room)
}

func createRoom(ctx *fiber.Ctx) error {
	room := &database.Room{}
	err := ctx.BodyParser(room)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	room, err = database.CreateRoom(room.Name, room.Creator)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	toggleUiAction(fmt.Sprintf("room %s created by %s", room.Name, room.Creator.Name), "room-list-refresh")
	return ctx.JSON(room)
}
