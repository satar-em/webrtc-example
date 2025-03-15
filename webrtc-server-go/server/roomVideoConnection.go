package server

import (
	"github.com/gofiber/fiber/v2"
	"webrtc-server-go/database"
)

func getRoomVideoConnectionById(ctx *fiber.Ctx) error {
	idRoomVideoConnection, err := ctx.ParamsInt("id", 0)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id not granted",
		})
	}
	roomVideoConnection, err := database.GetRoomVideoConnectionById(uint(idRoomVideoConnection))
	if err != nil {
		return err
	}
	if roomVideoConnection == nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "not roomVideoConnection found",
		})
	}
	return ctx.JSON(roomVideoConnection)
}

type SetAnswerUserAnswerDataBody struct {
	IdRoomVideoConnection uint    `json:"idRoomVideoConnection"`
	AnswerUserAnswerData  *string `json:"answerUserAnswerData"`
}

func setAnswerUserAnswerData(ctx *fiber.Ctx) error {
	setAnswerUserAnswerDataBody := SetAnswerUserAnswerDataBody{}
	err := ctx.BodyParser(&setAnswerUserAnswerDataBody)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	roomVideoConnection, err := database.SetAnswerUserAnswerData(
		setAnswerUserAnswerDataBody.IdRoomVideoConnection,
		setAnswerUserAnswerDataBody.AnswerUserAnswerData,
	)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return ctx.JSON(roomVideoConnection)
}

type SetStartCallUserOfferDataBody struct {
	IdRoomVideoConnection  uint    `json:"idRoomVideoConnection"`
	StartCallUserOfferData *string `json:"startCallUserOfferData"`
}

func setStartCallUserOfferData(ctx *fiber.Ctx) error {
	setStartCallUserOfferDataBody := &SetStartCallUserOfferDataBody{}
	err := ctx.BodyParser(setStartCallUserOfferDataBody)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	roomVideoConnection, err := database.SetStartCallUserOfferData(
		setStartCallUserOfferDataBody.IdRoomVideoConnection,
		setStartCallUserOfferDataBody.StartCallUserOfferData,
	)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return ctx.JSON(roomVideoConnection)
}

type CreateRoomVideoConnectionBody struct {
	StartUser  uint `json:"startUser"`
	AnswerUser uint `json:"answerUser"`
	Room       uint `json:"room"`
}

func createRoomVideoConnection(ctx *fiber.Ctx) error {
	createRoomVideoConnectionBody := &CreateRoomVideoConnectionBody{}
	err := ctx.BodyParser(createRoomVideoConnectionBody)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	startCallUser, err := database.GetUserById(createRoomVideoConnectionBody.StartUser)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	answerUser, err := database.GetUserById(createRoomVideoConnectionBody.AnswerUser)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	room, err := database.GetRoomById(createRoomVideoConnectionBody.Room)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	roomVideoConnection, err := database.CreateRoomVideoConnection(startCallUser, answerUser, room)
	if err != nil {
		if roomVideoConnection != nil {
			return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error":     err.Error(),
				"emamiData": roomVideoConnection,
			})
		}
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return ctx.JSON(roomVideoConnection)
}
