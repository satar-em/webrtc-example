package server

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"webrtc-server-go/database"
)

func registerUser(ctx *fiber.Ctx) error {
	user := &database.User{}
	err := ctx.BodyParser(user)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	user, err = database.CreateUser(user.Name)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return ctx.JSON(user)
}

func getUser(ctx *fiber.Ctx) error {
	idUser, err := ctx.ParamsInt("id", 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	user, err := database.GetUserById(uint(idUser))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return ctx.JSON(user)
}

func deleteUser(ctx *fiber.Ctx) error {
	idUser, err := ctx.ParamsInt("id", 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	user, err := database.GetUserById(uint(idUser))
	if err != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	deleteUserFromTopics(user)
	deleteUserFromRooms(user)
	database.DeleteUserById(user.Id)
	return ctx.JSON(user)
}

func deleteUserFromRooms(user *database.User) {
	for _, room := range database.GetAllRooms() {
		newRoomUsers := []*database.User{}
		for _, userInRoom := range room.Users {
			if userInRoom.Id != user.Id {
				newRoomUsers = append(newRoomUsers, userInRoom)
			}
		}
		if len(room.Users) != len(newRoomUsers) {
			toggleUiAction(fmt.Sprintf("user %s leave  %s", user.Name, room.Name), fmt.Sprintf("room-data-refresh-%d", room.Id))
			room.MessageCounter++
			for _, userRoom := range newRoomUsers {
				userRoom.SendMessage(map[string]interface{}{
					"messageCounter": room.MessageCounter,
					"type":           "leave-room",
					"data": map[string]interface{}{
						"roomId":   room.Id,
						"roomName": room.Name,
						"message":  "" + user.Name + " leave server",
						"user":     user,
					},
				})
			}
			room.Users = newRoomUsers
		}
	}
}
func deleteUserFromTopics(user *database.User) {
	for _, topic := range database.GetAllTopics() {
		newRoomUsers := []*database.User{}
		for _, userInRoom := range topic.Subscribers {
			if userInRoom.Id != user.Id {
				newRoomUsers = append(newRoomUsers, userInRoom)
			}
		}
		if len(topic.Subscribers) != len(newRoomUsers) {
			for _, userRoom := range newRoomUsers {
				userRoom.SendMessage(map[string]interface{}{
					"type": "leave-topic",
					"data": map[string]interface{}{
						"topicId":   topic.Id,
						"topicName": topic.Name,
						"message":   "" + user.Name + " leave server",
						"user":      user,
					},
				})
			}
		}
		topic.Subscribers = newRoomUsers
	}
}
