package server

import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"sync"
	"webrtc-server-go/database"

	"github.com/gofiber/contrib/websocket"
)

var routApiMutex = new(sync.Mutex)

//var routApiMutexId = 0

func channelMessageHandle() {
	for {
		msg := <-database.WebSocketMessageChanel
		routApiMutex.Lock()
		// routApiMutexId++
		// log.WithFields(log.Fields{
		// 	"routApiMutexId": routApiMutexId,
		// }).Warn("Lock messageHandling.go 24")
		switch msg.Message.Type {
		case "start-connection":
			handleConnectionStart(msg.Message.Data, msg.Message.Sender, msg.Connection)
		case "user-disconnect":
			handleUserDisconnect(msg.Message.Data.(map[string]interface{})["user"].(*database.User), msg.Message.Sender, msg.Connection)
		case "join-topic":
			handleJoinTopic(msg.Message.Data, msg.Message.Sender, msg.Connection)
		case "leave-topic":
			handleLeaveTopic(msg.Message.Data, msg.Message.Sender, msg.Connection)
		case "topic-message":
			handleSendTopic(msg.Message.Data, msg.Message.Sender, msg.Connection)
		case "join-room":
			handleJoinRoom(msg.Message.Data, msg.Message.Sender, msg.Connection)
		case "leave-room":
			handleLeaveRoom(msg.Message.Data, msg.Message.Sender, msg.Connection)
		case "room-message":
			handleSendRoom(msg.Message.Data, msg.Message.Sender, msg.Connection)
		}
		routApiMutex.Unlock()
		// log.WithFields(log.Fields{
		// 	"routApiMutexId": routApiMutexId,
		// }).Warn("Unlock messageHandling.go 46")
	}
}

func handleSendRoom(dataJson interface{}, sender uint, connection *websocket.Conn) {
	user, err := getUserBySender(sender, connection)
	binary.Size(user)
	if err != nil {
		return
	}
	dataJsonByte, err := json.Marshal(dataJson)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	dataStruct := struct {
		RoomId uint `json:"roomId"`
	}{}
	err = json.Unmarshal(dataJsonByte, &dataStruct)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	room, err := database.GetRoomById(dataStruct.RoomId)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	room.MessageCounter++
	for _, subscriber := range room.Users {
		if subscriber.Id != user.Id {
			subscriber.SendMessage(map[string]interface{}{
				"messageCounter": room.MessageCounter,
				"type":           "room-message",
				"data": map[string]interface{}{
					"roomId":    room.Id,
					"roomName":  room.Name,
					"user":      user,
					"extraData": dataJson,
				},
			})
		}
	}
}

func handleLeaveRoom(dataJson interface{}, sender uint, connection *websocket.Conn) {
	user, err := getUserBySender(sender, connection)
	if err != nil {
		return
	}
	dataJsonByte, err := json.Marshal(dataJson)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	dataStruct := struct {
		RoomId uint `json:"roomId"`
	}{}
	err = json.Unmarshal(dataJsonByte, &dataStruct)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	room, err := database.GetRoomById(dataStruct.RoomId)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-message", Data: map[string]interface{}{"message": "you leave room " + room.Name + ""}})
	deleteUserFromConnection(user)
	newRoomUsers := []*database.User{}
	for _, subscriber := range room.Users {
		if subscriber.Id != user.Id {
			subscriber.SendMessage(map[string]interface{}{
				"messageCounter": room.MessageCounter,
				"type":           "leave-room",
				"data": map[string]interface{}{
					"roomId":   room.Id,
					"roomName": room.Name,
					"message":  user.Name + " leave room",
					"user":     user,
				},
			})
			newRoomUsers = append(newRoomUsers, subscriber)
		}
	}
	room.Users = newRoomUsers
	toggleUiAction(fmt.Sprintf("user %s leave  %s", user.Name, room.Name), "room-list-refresh")
	toggleUiAction(fmt.Sprintf("user %s leave  %s", user.Name, room.Name), fmt.Sprintf("room-data-refresh-%d", room.Id))
}

func handleJoinRoom(dataJson interface{}, sender uint, connection *websocket.Conn) {
	user, err := getUserBySender(sender, connection)
	if err != nil {
		return
	}
	dataJsonByte, err := json.Marshal(dataJson)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	dataStruct := struct {
		RoomId uint `json:"roomId"`
	}{}
	err = json.Unmarshal(dataJsonByte, &dataStruct)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	room, err := database.GetRoomById(dataStruct.RoomId)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	if room.HasUser(user) {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-message", Data: map[string]interface{}{"message": "you already in room "}})
		return
	}
	room.Users = append(room.Users, user)
	room.MessageCounter++
	for _, subscriber := range room.Users {
		subscriber.SendMessage(map[string]interface{}{
			"messageCounter": room.MessageCounter,
			"type":           "join-room",
			"data": map[string]interface{}{
				"roomId":   room.Id,
				"roomName": room.Name,
				"message":  user.Name + " join room",
				"user":     user,
			},
		})
	}
	toggleUiAction(fmt.Sprintf("user %s join  %s", user.Name, room.Name), "room-list-refresh")
	toggleUiAction(fmt.Sprintf("user %s join  %s", user.Name, room.Name), fmt.Sprintf("room-data-refresh-%d", room.Id))
}

func handleConnectionStart(dataMessage interface{}, sender uint, connection *websocket.Conn) {
	binary.Size(dataMessage)
	user, err := getUserBySender(sender, connection)
	if err != nil {
		return
	}
	connection.Locals("user", fmt.Sprintf("(%s,%d)", user.Name, user.Id))
	user.SetSocketConnection(connection)
	user.SendMessage(map[string]interface{}{
		"type": "server-message",
		"data": map[string]interface{}{
			"message": "welcome " + user.Name,
		},
	})
}

func handleUserDisconnect(user *database.User, sender uint, connection *websocket.Conn) {
	binary.Size(connection)
	binary.Size(sender)
	deleteUserFromRooms(user)
	deleteUserFromTopics(user)
	deleteUserFromConnection(user)
	toggleUiAction(fmt.Sprintf("user %s left sever", user.Name), "room-list-refresh")
	user.CloseConnection()
}

func deleteUserFromConnection(user *database.User) {
	database.DeleteRoomVideoConnectionByUser(user)
}

func handleJoinTopic(dataJson interface{}, sender uint, connection *websocket.Conn) {
	user, err := getUserBySender(sender, connection)
	if err != nil {
		return
	}

	dataJsonByte, err := json.Marshal(dataJson)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	dataStruct := struct {
		TopicName string `json:"topicName"`
	}{}
	err = json.Unmarshal(dataJsonByte, &dataStruct)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}

	topic, err := database.GetTopicByName(dataStruct.TopicName)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	if topic.HasUser(user) {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-message", Data: map[string]interface{}{"message": "you already in topic "}})
		return
	}
	for _, subscriber := range topic.Subscribers {
		subscriber.SendMessage(map[string]interface{}{
			"type": "join-topic",
			"data": map[string]interface{}{
				"topicId":   topic.Id,
				"topicName": topic.Name,
				"message":   user.Name + " join topic",
				"user":      user,
			},
		})
	}
	topic.Subscribers = append(topic.Subscribers, user)
}
func handleLeaveTopic(dataJson interface{}, sender uint, connection *websocket.Conn) {
	user, err := getUserBySender(sender, connection)
	if err != nil {
		return
	}

	dataJsonByte, err := json.Marshal(dataJson)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	dataStruct := struct {
		TopicId uint `json:"topicId"`
	}{}
	err = json.Unmarshal(dataJsonByte, &dataStruct)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}

	topic, err := database.GetTopicById(dataStruct.TopicId)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-message", Data: map[string]interface{}{"message": "you leave " + topic.Name + " successfully"}})
	newSubscribers := []*database.User{}
	for _, subscriber := range topic.Subscribers {
		if subscriber.Id != user.Id {
			subscriber.SendMessage(map[string]interface{}{
				"type": "leave-topic",
				"data": map[string]interface{}{
					"topicId":   topic.Id,
					"topicName": topic.Name,
					"message":   user.Name + " leave topic",
					"user":      user,
				},
			})
			newSubscribers = append(newSubscribers, subscriber)
		}

	}
	topic.Subscribers = newSubscribers
}

func handleSendTopic(dataJson interface{}, sender uint, connection *websocket.Conn) {
	user, err := getUserBySender(sender, connection)
	if err != nil {
		return
	}

	dataJsonByte, err := json.Marshal(dataJson)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}
	dataStruct := struct {
		TopicId uint `json:"topicId"`
	}{}
	err = json.Unmarshal(dataJsonByte, &dataStruct)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}

	topic, err := database.GetTopicById(dataStruct.TopicId)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		return
	}

	for _, subscriber := range topic.Subscribers {
		if subscriber.Id != user.Id {
			subscriber.SendMessage(dataJson)
		}
	}

}

func getUserBySender(sender uint, connection *websocket.Conn) (*database.User, error) {
	user, err := database.GetUserById(sender)
	if err != nil {
		connection.WriteJSON(database.WebSocketMessage{Sender: 0, Type: "server-error", Data: map[string]interface{}{"message": err.Error()}})
		writer, err := connection.NextWriter(websocket.CloseMessage)
		if err == nil {
			writer.Close()
		}
		return nil, err
	}
	return user, nil
}
