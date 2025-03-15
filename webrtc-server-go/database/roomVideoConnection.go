package database

import (
	"errors"
	"fmt"
)

type RoomVideoConnection struct {
	Id                     uint    `json:"id"`
	Room                   *Room   `json:"room"`
	StartCallUser          *User   `json:"startCallUser"`
	StartCallUserOfferData *string `json:"startCallUserOfferData"`
	AnswerUser             *User   `json:"answerUser"`
	AnswerUserAnswerData   *string `json:"answerUserAnswerData"`
}

var RoomVideoConnectionCounter = uint(0)
var roomVideoConnectionRepository = []*RoomVideoConnection{}

func CreateRoomVideoConnection(startCallUser *User, answerUser *User, room *Room) (*RoomVideoConnection, error) {
	if startCallUser == nil {
		return nil, errors.New("startCallUser of roomVideoConnections cannot be empty")
	}
	for _, roomVideoConnection := range roomVideoConnectionRepository {
		if roomVideoConnection.StartCallUser.Id == answerUser.Id && roomVideoConnection.AnswerUser.Id == startCallUser.Id {
			//SendVideoConnectionStateForAnswerUser(roomVideoConnection)
			return roomVideoConnection, fmt.Errorf("user %s has been caling you before", startCallUser.Name)
		} else if roomVideoConnection.StartCallUser.Id == startCallUser.Id && roomVideoConnection.AnswerUser.Id == answerUser.Id {
			return roomVideoConnection, nil
		}
	}
	RoomVideoConnectionCounter++
	roomVideoConnections := &RoomVideoConnection{Id: RoomVideoConnectionCounter, StartCallUser: startCallUser, AnswerUser: answerUser, Room: room}
	roomVideoConnectionRepository = append(roomVideoConnectionRepository, roomVideoConnections)
	return roomVideoConnections, nil
}

func SendVideoConnectionStateForAnswerUser(connection *RoomVideoConnection) {
	WebSocketMessageChanel <- WebSocketMessageChanelStruct{
		Message: &WebSocketMessage{
			Type:   "room-message",
			Sender: connection.StartCallUser.Id,
			Data: map[string]interface{}{
				"roomId":                connection.Room.Id,
				"connectionID":          connection.Id,
				"startCallUser":         connection.StartCallUser,
				"answerUser":            connection.AnswerUser,
				"message":               connection.StartCallUserOfferData,
				"connectionMessageType": "offer",
			},
		},
	}
}
func SendVideoConnectionStateForStartCallUser(connection *RoomVideoConnection) {
	WebSocketMessageChanel <- WebSocketMessageChanelStruct{
		Message: &WebSocketMessage{
			Type:   "room-message",
			Sender: connection.AnswerUser.Id,
			Data: map[string]interface{}{
				"roomId":                connection.Room.Id,
				"connectionID":          connection.Id,
				"startCallUser":         connection.StartCallUser,
				"answerUser":            connection.AnswerUser,
				"message":               connection.AnswerUserAnswerData,
				"connectionMessageType": "answer",
			},
		},
	}
}

func GetAllRoomVideoConnections() []*RoomVideoConnection {
	return roomVideoConnectionRepository
}

func SetStartCallUserOfferData(idRoomVideoConnection uint, startCallUserOfferData *string) (*RoomVideoConnection, error) {
	var roomVideoConnections *RoomVideoConnection
	for _, emRoomVideoConnection := range roomVideoConnectionRepository {
		if emRoomVideoConnection.Id == idRoomVideoConnection {
			roomVideoConnections = emRoomVideoConnection
			break
		}
	}
	if roomVideoConnections == nil {
		return nil, errors.New("not roomVideoConnections found")
	}
	roomVideoConnections.StartCallUserOfferData = startCallUserOfferData
	SendVideoConnectionStateForAnswerUser(roomVideoConnections)
	return roomVideoConnections, nil
}
func SetAnswerUserAnswerData(idRoomVideoConnection uint, answerUserAnswerData *string) (*RoomVideoConnection, error) {
	var roomVideoConnections *RoomVideoConnection
	for _, emRoomVideoConnection := range roomVideoConnectionRepository {
		if emRoomVideoConnection.Id == idRoomVideoConnection {
			roomVideoConnections = emRoomVideoConnection
			break
		}
	}
	if roomVideoConnections == nil {
		return nil, errors.New("not roomVideoConnections found")
	}
	roomVideoConnections.AnswerUserAnswerData = answerUserAnswerData
	SendVideoConnectionStateForStartCallUser(roomVideoConnections)
	return roomVideoConnections, nil
}

func GetRoomVideoConnectionById(idRoomVideoConnection uint) (*RoomVideoConnection, error) {
	var roomVideoConnections *RoomVideoConnection
	for _, emRoomVideoConnection := range roomVideoConnectionRepository {
		if emRoomVideoConnection.Id == idRoomVideoConnection {
			roomVideoConnections = emRoomVideoConnection
			break
		}
	}
	if roomVideoConnections == nil {
		return nil, errors.New("not roomVideoConnections found")
	}
	return roomVideoConnections, nil
}

func DeleteRoomVideoConnectionByUser(user *User) {
	newDbRoomVideoConnections := []*RoomVideoConnection{}
	for _, roomVideoConnectionInDb := range roomVideoConnectionRepository {
		if roomVideoConnectionInDb.StartCallUser.Id != user.Id && roomVideoConnectionInDb.AnswerUser.Id != user.Id {
			newDbRoomVideoConnections = append(newDbRoomVideoConnections, roomVideoConnectionInDb)
		} else {
			// roomVideoConnectionInDb will be destroy
			sendCloseUserFromConnection(roomVideoConnectionInDb, user)
		}
	}
	roomVideoConnectionRepository = newDbRoomVideoConnections
}

func sendCloseUserFromConnection(connection *RoomVideoConnection, user *User) {
	connection.Room.MessageCounter++
	for _, subscriber := range connection.Room.Users {
		if subscriber.Id != user.Id {
			subscriber.SendMessage(map[string]interface{}{
				"messageCounter": connection.Room.MessageCounter,
				"type":           "room-message",
				"data": map[string]interface{}{
					"roomId":   connection.Room.Id,
					"roomName": connection.Room.Name,
					"user":     user,
					"extraData": map[string]interface{}{
						"roomId":                connection.Room.Id,
						"connectionID":          connection.Id,
						"startCallUser":         connection.StartCallUser,
						"answerUser":            connection.AnswerUser,
						"message":               user.Id,
						"connectionMessageType": "close-connction",
					},
				},
			})
		}
	}
}
